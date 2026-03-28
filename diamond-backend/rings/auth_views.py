# diamond-backend/rings/auth_views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from .models import User
from .serializers import UserSerializer
import uuid

class AuthViewSet(viewsets.ViewSet):
    """
    Authentication endpoints:
    POST /api/auth/register/     - Register new user
    POST /api/auth/login/        - Login and get token
    POST /api/auth/logout/       - Logout (requires token)
    GET  /api/auth/me/           - Get current user (requires token)
    PUT  /api/auth/update-profile/ - Update profile (requires token)
    POST /api/auth/change-password/ - Change password (requires token)
    """
    
    def get_permissions(self):
        if self.action in ['register', 'login']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register new user"""
        try:
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            phone = request.data.get('phone', '').strip()

            # Validation
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

            # Check if user exists
            if User.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create user
            user = User.objects.create(
                email=email,
                password_hash=make_password(password),
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                is_active=True,
                created_at=timezone.now()
            )

            # Create token
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'success': True,
                'message': 'Registration successful',
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Login user and get token"""
        try:
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()

            if not email or not password:
                return Response({
                    'success': False,
                    'error': 'Email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Check password
            if not check_password(password, user.password_hash):
                return Response({
                    'success': False,
                    'error': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Check if active
            if not user.is_active:
                return Response({
                    'success': False,
                    'error': 'Account is deactivated'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Update last login
            user.last_login = timezone.now()
            user.save()

            # Get or create token
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """Logout user"""
        try:
            request.user.auth_token.delete()
            Token.objects.create(user=request.user)  # Create new token for next login
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data
        })

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update user profile"""
        try:
            user = request.user
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

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change user password"""
        try:
            user = request.user
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