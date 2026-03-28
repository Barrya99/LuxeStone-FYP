# diamond-backend/rings/auth_views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from .models import User
from .serializers import UserSerializer
import secrets


def generate_token():
    """Generate a secure random token"""
    return secrets.token_hex(20)


def get_user_from_token(request):
    """Extract user from Authorization header: Token <token>"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Token '):
        return None
    token = auth_header.split(' ', 1)[1].strip()
    try:
        from .models import UserToken
        user_token = UserToken.objects.select_related('user').get(token=token)
        return user_token.user
    except Exception:
        return None


class AuthViewSet(viewsets.ViewSet):
    """
    Authentication endpoints:
    POST /api/auth/register/
    POST /api/auth/login/
    POST /api/auth/logout/
    GET  /api/auth/me/
    PUT  /api/auth/update_profile/
    POST /api/auth/change_password/
    """

    def get_permissions(self):
        if self.action in ['register', 'login']:
            return [AllowAny()]
        return [AllowAny()]  # We do manual auth checks below

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        try:
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            phone = request.data.get('phone', '').strip()

            if not email or not password:
                return Response({
                    'success': False,
                    'error': 'Email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if len(password) < 6:
                return Response({
                    'success': False,
                    'error': 'Password must be at least 6 characters'
                }, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create(
                email=email,
                password_hash=make_password(password),
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                is_active=True,
                created_at=timezone.now()
            )

            # Create token manually
            from .models import UserToken
            token_value = generate_token()
            UserToken.objects.create(user=user, token=token_value)

            return Response({
                'success': True,
                'message': 'Registration successful',
                'user': UserSerializer(user).data,
                'token': token_value
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        try:
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()

            if not email or not password:
                return Response({
                    'success': False,
                    'error': 'Email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)

            if not check_password(password, user.password_hash):
                return Response({
                    'success': False,
                    'error': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_active:
                return Response({
                    'success': False,
                    'error': 'Account is deactivated'
                }, status=status.HTTP_401_UNAUTHORIZED)

            user.last_login = timezone.now()
            user.save()

            # Get or create token manually
            from .models import UserToken
            user_token, created = UserToken.objects.get_or_create(user=user)
            if not created and not user_token.token:
                user_token.token = generate_token()
                user_token.save()

            return Response({
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'token': user_token.token
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def logout(self, request):
        try:
            user = get_user_from_token(request)
            if user:
                from .models import UserToken
                UserToken.objects.filter(user=user).delete()
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def me(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({
                'success': False,
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'success': True,
            'user': UserSerializer(user).data
        })

    @action(detail=False, methods=['put'], permission_classes=[AllowAny])
    def update_profile(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({
                'success': False,
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        try:
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.phone = request.data.get('phone', user.phone)
            user.save()
            return Response({
                'success': True,
                'message': 'Profile updated',
                'user': UserSerializer(user).data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def change_password(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({
                'success': False,
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        try:
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')

            if not old_password or not new_password:
                return Response({
                    'success': False,
                    'error': 'Both passwords required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not check_password(old_password, user.password_hash):
                return Response({
                    'success': False,
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_401_UNAUTHORIZED)

            user.password_hash = make_password(new_password)
            user.save()
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)