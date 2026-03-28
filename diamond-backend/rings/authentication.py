# rings/authentication.py
# Custom DRF authentication that validates our UserToken model
# and returns a user that DRF's IsAuthenticated can accept.

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission


# ── Thin wrapper so DRF's is_authenticated check passes ──────────
class AuthenticatedUser:
    """
    Wraps our custom User model so that DRF's IsAuthenticated
    permission (which calls request.user.is_authenticated) works.
    """
    def __init__(self, user):
        self._user = user
        self.is_authenticated = True          # DRF checks this attribute
        self.is_active = bool(user.is_active)

    # Proxy every attribute access to the real user object
    def __getattr__(self, name):
        return getattr(self._user, name)

    # Make the wrapper behave like the real user for comparisons
    def __eq__(self, other):
        if isinstance(other, AuthenticatedUser):
            return self._user == other._user
        return self._user == other

    def __hash__(self):
        return hash(self._user.pk)

    def __repr__(self):
        return f"<AuthenticatedUser: {self._user.email}>"


# ── DRF Authentication Class ──────────────────────────────────────
class CustomTokenAuthentication(BaseAuthentication):
    """
    Authenticates requests with the header:
        Authorization: Token <token>

    On success returns (AuthenticatedUser, token_string).
    On failure raises AuthenticationFailed.
    If no Authorization header is present returns None
    (allowing other authenticators / anonymous access).
    """

    keyword = "Token"

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header:
            return None                       # No header → anonymous

        parts = auth_header.split()

        if len(parts) == 0 or parts[0].lower() != self.keyword.lower():
            return None                       # Different scheme → skip

        if len(parts) == 1:
            raise AuthenticationFailed("Invalid token header: no token provided.")

        if len(parts) > 2:
            raise AuthenticationFailed("Invalid token header: token string should not contain spaces.")

        token_key = parts[1]
        return self._authenticate_token(token_key)

    def _authenticate_token(self, token_key):
        from .models import UserToken

        try:
            user_token = UserToken.objects.select_related("user").get(token=token_key)
        except UserToken.DoesNotExist:
            raise AuthenticationFailed("Invalid or expired token.")

        user = user_token.user
        if not user.is_active:
            raise AuthenticationFailed("User account is disabled.")

        return (AuthenticatedUser(user), token_key)

    def authenticate_header(self, request):
        return self.keyword


# ── Custom Permission ─────────────────────────────────────────────
class IsCustomAuthenticated(BasePermission):
    """
    Allows access only to requests whose user was authenticated
    by CustomTokenAuthentication (i.e., is an AuthenticatedUser
    instance with is_authenticated == True).
    """

    message = "Authentication credentials were not provided or are invalid."

    def has_permission(self, request, view):
        return (
            request.user is not None
            and isinstance(request.user, AuthenticatedUser)
            and request.user.is_authenticated
        )