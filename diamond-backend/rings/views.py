# rings/views.py

from urllib import request
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from .services.pricing import PricingEngine
from .models import Diamond, Setting
from .models import (
    User, Diamond, Setting, RingConfiguration,
    Favorite, Review, Order, OrderItem, UserInteraction
)
from .serializers import (
    UserSerializer, DiamondListSerializer, DiamondDetailSerializer,
    SettingListSerializer, SettingDetailSerializer,
    RingConfigurationListSerializer, RingConfigurationDetailSerializer,
    RingConfigurationCreateSerializer, FavoriteSerializer, FavoriteCreateSerializer,
    ReviewSerializer, ReviewCreateSerializer, OrderListSerializer,
    OrderDetailSerializer, OrderCreateSerializer, UserInteractionSerializer,
    UserInteractionCreateSerializer
)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .recommendation_engine import RecommendationEngine, get_recommendations

from rest_framework.permissions import IsAuthenticated, AllowAny




# ============================================
# USER VIEWSET
# ============================================
class PricingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for diamond and ring price calculations
    """
    queryset = Diamond.objects.all()
    serializer_class = DiamondListSerializer
    
    @action(detail=False, methods=['post'], url_path='calculate-diamond-price')
    def calculate_diamond_price(self, request):
        """
        Calculate real-time diamond price based on 4Cs
        
        Request body:
        {
            "diamond_id": 123
        }
        
        Response:
        {
            "diamond_id": 123,
            "base_price_per_carat": 3500.00,
            "carat": 1.5,
            "cut": "Excellent",
            "color": "D",
            "clarity": "VS1",
            "quality_multiplier": 1.13,
            "clarity_adjustment": 1.01,
            "size_premium": 1.0,
            "calculated_price": 5954.25,
            "success": true
        }
        """
        try:
            diamond_id = request.data.get('diamond_id')
            
            if not diamond_id:
                return Response(
                    {'error': 'diamond_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Fetch diamond
            diamond = Diamond.objects.get(diamond_id=diamond_id)
            
            # Calculate price
            calculated_price = PricingEngine.calculate_diamond_price(diamond)
            
            # Get multipliers for response
            quality_mult = PricingEngine.get_quality_multiplier(
                diamond.cut, diamond.color
            )
            clarity_adj = PricingEngine.get_clarity_adjustment(diamond.clarity)
            size_premium = PricingEngine.get_size_premium(diamond.carat, diamond.shape)
            
            return Response({
                'diamond_id': diamond.diamond_id,
                'sku': diamond.sku,
                'base_price_per_carat': float(diamond.base_price),
                'carat': float(diamond.carat),
                'cut': diamond.cut,
                'color': diamond.color,
                'clarity': diamond.clarity,
                'shape': diamond.shape,
                'quality_multiplier': float(quality_mult),
                'clarity_adjustment': float(clarity_adj),
                'size_premium': float(size_premium),
                'calculated_price': float(calculated_price),
                'success': True
            })
            
        except Diamond.DoesNotExist:
            return Response(
                {'error': 'Diamond not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='calculate-ring-price')
    def calculate_ring_price(self, request):
        """
        Calculate complete ring price (diamond + setting + customizations)
        
        Request body:
        {
            "diamond_id": 123,
            "setting_id": 45,
            "ring_size": "7",
            "customizations": {
                "engraving": 100,
                "band_upgrade": 200
            }
        }
        
        Response:
        {
            "diamond_price": 5954.25,
            "setting_price": 1200.00,
            "ring_size_surcharge": 50.00,
            "customization_total": 300.00,
            "subtotal": 7504.25,
            "total": 7504.25,
            "success": true
        }
        """
        try:
            diamond_id = request.data.get('diamond_id')
            setting_id = request.data.get('setting_id')
            ring_size = request.data.get('ring_size')
            customizations = request.data.get('customizations', {})
            
            if not diamond_id or not setting_id:
                return Response(
                    {'error': 'diamond_id and setting_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Fetch models
            diamond = Diamond.objects.get(diamond_id=diamond_id)
            setting = Setting.objects.get(setting_id=setting_id)
            
            # Get multipliers for response
            quality_mult = PricingEngine.get_quality_multiplier(diamond.cut, diamond.color)
            clarity_adj = PricingEngine.get_clarity_adjustment(diamond.clarity)
            size_premium = PricingEngine.get_size_premium(diamond.carat, diamond.shape)
            
            # Calculate price
            pricing = PricingEngine.calculate_ring_price(
                diamond, setting, ring_size, customizations
            )
            
            return Response({
                'diamond_id': diamond.diamond_id,
                'setting_id': setting.setting_id,
                'ring_size': ring_size,
                'diamond_price': float(pricing['diamond_price']),
                'setting_price': float(pricing['setting_price']),
                'ring_size_surcharge': float(pricing['ring_size_surcharge']),
                'customization_total': float(pricing['customization_total']),
                'subtotal': float(pricing['subtotal']),
                'total': float(pricing['total']),
                'quality_multiplier': float(quality_mult),
                'clarity_adjustment': float(clarity_adj),
                'size_premium': float(size_premium),
                'success': True
            })
            
        except Diamond.DoesNotExist:
            return Response(
                {'error': 'Diamond not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Setting.DoesNotExist:
            return Response(
                {'error': 'Setting not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='get-price-breakdown')
    def get_price_breakdown(self, request):
        """
        Get human-readable price breakdown for UI display
        
        Request body:
        {
            "diamond_id": 123,
            "setting_id": 45,
            "ring_size": "7"
        }
        
        Response:
        {
            "items": [
                {
                    "name": "1.5ct Round Diamond",
                    "description": "Excellent Cut, D Color, VS1 Clarity",
                    "price": 5954.25
                },
                {
                    "name": "Solitaire Setting",
                    "description": "18K White Gold Setting",
                    "price": 1200.00
                }
            ],
            "surcharges": [
                {
                    "name": "Ring Size Surcharge (Size 7)",
                    "price": 0.00
                }
            ],
            "subtotal": 7154.25,
            "total": 7154.25,
            "success": true
        }
        """
        try:
            diamond_id = request.data.get('diamond_id')
            setting_id = request.data.get('setting_id')
            ring_size = request.data.get('ring_size')
            
            if not diamond_id or not setting_id:
                return Response(
                    {'error': 'diamond_id and setting_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Fetch models
            diamond = Diamond.objects.get(diamond_id=diamond_id)
            setting = Setting.objects.get(setting_id=setting_id)
            
            # Get breakdown
            breakdown = PricingEngine.get_price_breakdown(
                diamond, setting, ring_size
            )
            
            # Add surcharges to response
            surcharges = []
            ring_surcharge = PricingEngine.calculate_ring_size_surcharge(ring_size)
            if ring_surcharge > 0:
                surcharges.append({
                    'name': f'Ring Size Surcharge (Size {ring_size})',
                    'price': float(ring_surcharge)
                })
            
            breakdown['surcharges'] = surcharges
            breakdown['success'] = True
            
            return Response(breakdown)
            
        except Diamond.DoesNotExist:
            return Response(
                {'error': 'Diamond not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Setting.DoesNotExist:
            return Response(
                {'error': 'Setting not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']


# ============================================
# DIAMOND VIEWSET
# ============================================

class DiamondViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for diamonds
    List, retrieve, and filter diamonds
    """
    queryset = Diamond.objects.filter(is_available=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cut', 'color', 'clarity', 'shape']
    search_fields = ['sku']
    ordering_fields = ['carat', 'base_price', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DiamondDetailSerializer
        return DiamondListSerializer
    
    def get_queryset(self):
        """
        Custom filtering for budget and 4Cs
        """
        queryset = super().get_queryset()
        
        # Filter by carat range
        min_carat = self.request.query_params.get('min_carat')
        max_carat = self.request.query_params.get('max_carat')
        if min_carat:
            queryset = queryset.filter(carat__gte=min_carat)
        if max_carat:
            queryset = queryset.filter(carat__lte=max_carat)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get diamond statistics for filters"""
        queryset = self.get_queryset()
        
        stats = {
            'total_count': queryset.count(),
            'carat_range': {
                'min': queryset.order_by('carat').first().carat if queryset.exists() else 0,
                'max': queryset.order_by('-carat').first().carat if queryset.exists() else 0,
            },
            'price_range': {
                'min': queryset.order_by('base_price').first().base_price if queryset.exists() else 0,
                'max': queryset.order_by('-base_price').first().base_price if queryset.exists() else 0,
            },
            'shapes': queryset.values('shape').annotate(count=Count('shape')),
            'cuts': queryset.values('cut').annotate(count=Count('cut')),
        }
        
        return Response(stats)


# ============================================
# SETTING VIEWSET
# ============================================

class SettingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for settings
    List, retrieve, and filter settings
    """
    queryset = Setting.objects.filter(is_available=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['style_type', 'metal_type']
    search_fields = ['name', 'sku']
    ordering_fields = ['base_price', 'popularity_score', 'created_at']
    ordering = ['-popularity_score']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SettingDetailSerializer
        return SettingListSerializer
    
    def get_queryset(self):
        """
        Custom filtering for price
        """
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        return queryset


# ============================================
# RING CONFIGURATION VIEWSET
# ============================================

class RingConfigurationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for ring configurations
    Create, list, retrieve, update ring configurations
    """
    queryset = RingConfiguration.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'is_saved', 'is_ordered']
    ordering_fields = ['total_price', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return RingConfigurationCreateSerializer
        elif self.action == 'retrieve':
            return RingConfigurationDetailSerializer
        return RingConfigurationListSerializer
    
    @action(detail=False, methods=['get'])
    def my_configurations(self, request):
        """Get configurations for current user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        configs = self.queryset.filter(user_id=user_id)
        serializer = self.get_serializer(configs, many=True)
        return Response(serializer.data)


# ============================================
# FAVORITE VIEWSET
# ============================================

class FavoriteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for favorites/wishlist
    """
    queryset = Favorite.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FavoriteCreateSerializer
        return FavoriteSerializer
    
    @action(detail=False, methods=['get'])
    def my_favorites(self, request):
        """Get favorites for current user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        favorites = self.queryset.filter(user_id=user_id)
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)


# ============================================
# REVIEW VIEWSET
# ============================================

class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for reviews
    """
    queryset = Review.objects.filter(is_approved=True)
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['diamond', 'setting', 'config', 'rating']
    ordering_fields = ['rating', 'helpful_count', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark review as helpful"""
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})
    
    @action(detail=False, methods=['get'])
    def product_reviews(self, request):
        """Get reviews for a specific product"""
        diamond_id = request.query_params.get('diamond_id')
        setting_id = request.query_params.get('setting_id')
        
        queryset = self.queryset
        
        if diamond_id:
            queryset = queryset.filter(diamond_id=diamond_id)
        if setting_id:
            queryset = queryset.filter(setting_id=setting_id)
        
        # Calculate average rating
        avg_rating = queryset.aggregate(Avg('rating'))['rating__avg']
        total_reviews = queryset.count()
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'reviews': serializer.data,
            'average_rating': round(avg_rating, 1) if avg_rating else 0,
            'total_reviews': total_reviews
        })


# ============================================
# ORDER VIEWSET
# ============================================

# ============================================
# ORDER VIEWSET - FIXED
# ============================================
 
class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for orders
    
    Endpoints:
    - GET /api/orders/ - Get current user's orders (requires auth)
    - GET /api/orders/{order_id}/ - Get order details (requires auth)
    - POST /api/orders/ - Create new order (requires auth)
    - GET /api/orders/my_orders/?user_id=1 - Get specific user's orders (no auth needed for demo)
    """
    
    # FIX 1: Add permission_classes
    permission_classes = [AllowAny]  # Changed from default to AllowAny for demo
    
    queryset = Order.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'status', 'payment_status']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer
    
    def get_queryset(self):
        """
        FIX 2: Return all orders (no filtering by user for demo)
        In production, filter by current user:
        return Order.objects.filter(user=self.request.user)
        """
        return Order.objects.all().prefetch_related('items').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Get orders for current user
        
        FIX 3: Support both authenticated and query parameter approach
        - If user is authenticated: filter by request.user
        - If user_id in query params: filter by user_id
        """
        # Try to filter by authenticated user first
        if request.user and request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
        else:
            # Fall back to user_id parameter for demo/testing
            user_id = request.query_params.get('user_id')
            if user_id:
                orders = Order.objects.filter(user_id=user_id).prefetch_related('items').order_by('-created_at')
            else:
                # Return all orders for demo
                orders = Order.objects.all().prefetch_related('items').order_by('-created_at')
        
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(orders, many=True)
        return Response({
            'count': orders.count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']:
            order.status = new_status
            order.save()
            return Response({'status': order.status})
        
        return Response(
            {"error": "Invalid status"}, 
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================
# USER INTERACTION VIEWSET
# ============================================

class UserInteractionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user interactions (analytics)
    """
    queryset = UserInteraction.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'interaction_type', 'device_type']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserInteractionCreateSerializer
        return UserInteractionSerializer
    
    @action(detail=False, methods=['get'])
    def analytics_summary(self, request):
        """Get analytics summary"""
        queryset = self.queryset
        
        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        summary = {
            'total_interactions': queryset.count(),
            'by_type': queryset.values('interaction_type').annotate(count=Count('interaction_type')),
            'by_device': queryset.values('device_type').annotate(count=Count('device_type')),
            'unique_sessions': queryset.values('session_id').distinct().count(),
        }
        
        return Response(summary)

class RecommendationViewSet(viewsets.ViewSet):
    """
    API endpoints for AI-powered recommendations
    
    Endpoints:
    - GET /api/recommendations/personalized/ - Get all personalized recommendations
    - GET /api/recommendations/trending/ - Get trending diamonds
    - GET /api/recommendations/budget/ - Get budget-friendly diamonds
    - GET /api/recommendations/similar/ - Get similar diamonds
    - GET /api/recommendations/settings/ - Get recommended settings
    - GET /api/recommendations/combinations/ - Get diamond+setting combinations
    - GET /api/recommendations/next-step/ - Get next step recommendations in configurator
    """
    
    permission_classes = [AllowAny]
    def list(self, request):
        return Response({
            'success': True,
            'message': 'Recommendation API - Available Endpoints',
            'endpoints': {
                'personalized': request.build_absolute_uri('personalized/'),
                'trending': request.build_absolute_uri('trending/'),
                'budget': request.build_absolute_uri('budget/?max_price=5000'),
                'similar': request.build_absolute_uri('similar/?diamond_id=1'),
                'settings': request.build_absolute_uri('settings/'),
                'combinations': request.build_absolute_uri('combinations/'),
                'next_step': request.build_absolute_uri('next_step/?diamond_id=1'),
            }
        })
    
    @action(detail=False, methods=['get'])
    def personalized(self, request):
        """
        Get personalized recommendations for user
        
        GET /api/recommendations/personalized/
        
        Query Parameters:
        - limit: number of recommendations (default: 10)
        
        Response:
        {
          "diamonds": [...],
          "settings": [...],
          "combinations": [...]
        }
        """
        try:
            user = request.user if request.user.is_authenticated else None
            engine = RecommendationEngine(user=user)
            
            diamonds = engine.get_personalized_diamonds(10)
            settings = engine.get_personalized_settings(10)
            combinations = engine.get_recommended_combinations(5)
            
            diamond_serializer = DiamondListSerializer(diamonds, many=True)
            setting_serializer = SettingListSerializer(settings, many=True)
            
            return Response({
                'success': True,
                'diamonds': diamond_serializer.data,
                'settings': setting_serializer.data,
                'combinations': [{
                    'diamond': DiamondListSerializer(c['diamond']).data,
                    'setting': SettingListSerializer(c['setting']).data,
                    'total_price': float(c['total_price']),
                    'popularity': c['popularity']
                } for c in combinations],
                'message': 'Personalized recommendations based on your preferences'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """
        Get trending diamonds
        
        GET /api/recommendations/trending/
        
        Query Parameters:
        - limit: number of recommendations (default: 10)
        
        Response:
        {
          "success": true,
          "diamonds": [...]
        }
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            engine = RecommendationEngine()
            diamonds = engine.get_trending_diamonds(limit)
            serializer = DiamondListSerializer(diamonds, many=True)
            
            return Response({
                'success': True,
                'diamonds': serializer.data,
                'message': 'Currently trending diamonds based on popularity'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def budget(self, request):
        """
        Get budget-friendly diamonds
        
        GET /api/recommendations/budget/?max_price=5000
        
        Query Parameters:
        - max_price: maximum price (required)
        - limit: number of recommendations (default: 10)
        
        Response:
        {
          "success": true,
          "diamonds": [...],
          "budget": 5000
        }
        """
        try:
            max_price = float(request.query_params.get('max_price'))
            limit = int(request.query_params.get('limit', 10))
            
            engine = RecommendationEngine()
            diamonds = engine.get_budget_friendly_diamonds(max_price, limit)
            serializer = DiamondListSerializer(diamonds, many=True)
            
            return Response({
                'success': True,
                'diamonds': serializer.data,
                'budget': max_price,
                'message': f'Best quality diamonds within ${max_price:,.2f} budget'
            })
        except ValueError:
            return Response({
                'success': False,
                'error': 'max_price parameter is required and must be a number'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def similar(self, request):
        """
        Get similar diamonds
        
        GET /api/recommendations/similar/?diamond_id=1
        
        Query Parameters:
        - diamond_id: id of reference diamond (required)
        - limit: number of recommendations (default: 5)
        
        Response:
        {
          "success": true,
          "similar_diamonds": [...],
          "reference_diamond": {...}
        }
        """
        try:
            diamond_id = int(request.query_params.get('diamond_id'))
            limit = int(request.query_params.get('limit', 5))
            
            engine = RecommendationEngine()
            similar = engine.get_similar_diamonds(diamond_id, limit)
            serializer = DiamondListSerializer(similar, many=True)
            
            return Response({
                'success': True,
                'similar_diamonds': serializer.data,
                'reference_diamond_id': diamond_id,
                'message': 'Diamonds similar to your selection'
            })
        except ValueError:
            return Response({
                'success': False,
                'error': 'diamond_id parameter is required and must be a number'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='settings')
    def ring_settings(self, request):
        """
        Get recommended settings
        
        GET /api/recommendations/settings/
        
        Query Parameters:
        - limit: number of recommendations (default: 10)
        - diamond_id: if specified, get settings for this diamond
        
        Response:
        {
          "success": true,
          "settings": [...]
        }
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            diamond_id = request.query_params.get('diamond_id')
            
            engine = RecommendationEngine(
                user=request.user if request.user.is_authenticated else None
            )
            
            if diamond_id:
                settings = engine.get_settings_for_diamond(int(diamond_id), limit)
                message = 'Settings recommended for this diamond'
            else:
                settings = engine.get_personalized_settings(limit)
                message = 'Personalized setting recommendations'
            
            serializer = SettingListSerializer(settings, many=True)
            
            return Response({
                'success': True,
                'settings': serializer.data,
                'message': message
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def combinations(self, request):
        """
        Get recommended diamond + setting combinations
        
        GET /api/recommendations/combinations/
        
        Query Parameters:
        - limit: number of recommendations (default: 10)
        
        Response:
        {
          "success": true,
          "combinations": [
            {
              "diamond": {...},
              "setting": {...},
              "total_price": 7237.50,
              "popularity": 3
            }
          ]
        }
        """
        try:
            limit = int(request.query_params.get('limit', 10))
            engine = RecommendationEngine()
            
            combinations = engine.get_recommended_combinations(limit)
            
            result = []
            for combo in combinations:
                result.append({
                    'diamond': DiamondListSerializer(combo['diamond']).data,
                    'setting': SettingListSerializer(combo['setting']).data,
                    'total_price': float(combo['total_price']),
                    'popularity': combo['popularity']
                })
            
            return Response({
                'success': True,
                'combinations': result,
                'message': 'Popular diamond + setting combinations'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def next_step(self, request):
        """
        Get smart next-step recommendations for configurator
        
        GET /api/recommendations/next-step/?diamond_id=1&setting_id=2
        
        Query Parameters:
        - diamond_id: if user selected a diamond
        - setting_id: if user selected a setting
        
        Response:
        {
          "success": true,
          "type": "setting",
          "message": "Complete your ring by choosing a setting",
          "recommendations": [...]
        }
        """
        try:
            diamond_id = request.query_params.get('diamond_id')
            setting_id = request.query_params.get('setting_id')
            
            engine = RecommendationEngine()
            
            # Get the actual objects
            from .models import Diamond, Setting
            diamond = Diamond.objects.get(diamond_id=diamond_id) if diamond_id else None
            setting = Setting.objects.get(setting_id=setting_id) if setting_id else None
            
            recs = engine.get_next_step_recommendations(diamond, setting)
            
            recs_data = []
            if recs['recommendations']:
                if recs['type'] == 'setting':
                    recs_data = SettingListSerializer(recs['recommendations'], many=True).data
                else:
                    recs_data = DiamondListSerializer(recs['recommendations'], many=True).data
            
            return Response({
                'success': True,
                'type': recs['type'],
                'message': recs['message'],
                'recommendations': recs_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
 



from rest_framework.permissions import IsAuthenticated

class FavoriteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for favorites/wishlist with user authentication
    
    Endpoints:
    GET    /api/favorites/                    - List user's favorites (token required)
    POST   /api/favorites/                    - Create favorite (token required)
    DELETE /api/favorites/{id}/               - Delete favorite (token required)
    GET    /api/favorites/my_favorites/       - Get current user's all favorites (token required)
    POST   /api/favorites/add_diamond/        - Quick add diamond (token required)
    POST   /api/favorites/add_setting/        - Quick add setting (token required)
    POST   /api/favorites/remove_diamond/     - Quick remove diamond (token required)
    POST   /api/favorites/remove_setting/     - Quick remove setting (token required)
    GET    /api/favorites/check_diamond/      - Check if diamond is favorited (token required)
    """
    
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']

    def get_queryset(self):
        """Only return favorites for currently authenticated user"""
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return FavoriteCreateSerializer
        return FavoriteSerializer

    def create(self, request, *args, **kwargs):
        """Create favorite with automatic user assignment"""
        try:
            data = request.data.copy()
            data['user'] = request.user.user_id

            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                favorite = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Added to favorites',
                    'favorite_id': favorite.favorite_id,
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        """Delete favorite with ownership check"""
        try:
            favorite = self.get_object()
            
            if favorite.user_id != request.user.user_id:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            favorite.delete()
            return Response({
                'success': True,
                'message': 'Removed from favorites'
            }, status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Favorite not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_favorites(self, request):
        """Get all current user's favorites organized by type"""
        try:
            favorites = self.get_queryset()
            
            diamond_favs = []
            setting_favs = []
            config_favs = []

            for fav in favorites:
                fav_data = FavoriteSerializer(fav).data
                if fav.diamond_id:
                    diamond_favs.append({
                        'favorite_id': fav.favorite_id,
                        'diamond_id': fav.diamond_id,
                        'diamond': fav_data.get('diamond')
                    })
                elif fav.setting_id:
                    setting_favs.append({
                        'favorite_id': fav.favorite_id,
                        'setting_id': fav.setting_id,
                        'setting': fav_data.get('setting')
                    })
                elif fav.config_id:
                    config_favs.append({
                        'favorite_id': fav.favorite_id,
                        'config_id': fav.config_id,
                        'config': fav_data.get('config')
                    })

            return Response({
                'success': True,
                'count': favorites.count(),
                'diamonds': diamond_favs,
                'settings': setting_favs,
                'configurations': config_favs
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def add_diamond(self, request):
        """Quick add diamond to favorites"""
        try:
            diamond_id = request.data.get('diamond_id')
            
            if not diamond_id:
                return Response({
                    'success': False,
                    'error': 'diamond_id required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if already favorited
            if Favorite.objects.filter(user=request.user, diamond_id=diamond_id).exists():
                return Response({
                    'success': False,
                    'error': 'Already favorited'
                }, status=status.HTTP_400_BAD_REQUEST)

            favorite = Favorite.objects.create(
                user=request.user,
                diamond_id=diamond_id,
                created_at=timezone.now()
            )

            return Response({
                'success': True,
                'message': 'Added to favorites',
                'favorite_id': favorite.favorite_id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def add_setting(self, request):
        """Quick add setting to favorites"""
        try:
            setting_id = request.data.get('setting_id')
            
            if not setting_id:
                return Response({
                    'success': False,
                    'error': 'setting_id required'
                }, status=status.HTTP_400_BAD_REQUEST)

            if Favorite.objects.filter(user=request.user, setting_id=setting_id).exists():
                return Response({
                    'success': False,
                    'error': 'Already favorited'
                }, status=status.HTTP_400_BAD_REQUEST)

            favorite = Favorite.objects.create(
                user=request.user,
                setting_id=setting_id,
                created_at=timezone.now()
            )

            return Response({
                'success': True,
                'message': 'Added to favorites',
                'favorite_id': favorite.favorite_id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def remove_diamond(self, request):
        """Quick remove diamond from favorites"""
        try:
            diamond_id = request.data.get('diamond_id')
            
            if not diamond_id:
                return Response({
                    'success': False,
                    'error': 'diamond_id required'
                }, status=status.HTTP_400_BAD_REQUEST)

            favorite = Favorite.objects.filter(
                user=request.user,
                diamond_id=diamond_id
            ).first()

            if not favorite:
                return Response({
                    'success': False,
                    'error': 'Not in favorites'
                }, status=status.HTTP_404_NOT_FOUND)

            favorite.delete()
            return Response({
                'success': True,
                'message': 'Removed from favorites'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def remove_setting(self, request):
        """Quick remove setting from favorites"""
        try:
            setting_id = request.data.get('setting_id')
            
            if not setting_id:
                return Response({
                    'success': False,
                    'error': 'setting_id required'
                }, status=status.HTTP_400_BAD_REQUEST)

            favorite = Favorite.objects.filter(
                user=request.user,
                setting_id=setting_id
            ).first()

            if not favorite:
                return Response({
                    'success': False,
                    'error': 'Not in favorites'
                }, status=status.HTTP_404_NOT_FOUND)

            favorite.delete()
            return Response({
                'success': True,
                'message': 'Removed from favorites'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def check_diamond(self, request):
        """Check if diamond is favorited"""
        try:
            diamond_id = request.query_params.get('diamond_id')
            
            if not diamond_id:
                return Response({
                    'success': False,
                    'error': 'diamond_id required'
                }, status=status.HTTP_400_BAD_REQUEST)

            is_favorited = Favorite.objects.filter(
                user=request.user,
                diamond_id=diamond_id
            ).exists()

            return Response({
                'success': True,
                'diamond_id': int(diamond_id),
                'is_favorited': is_favorited
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def check_setting(self, request):
        """Check if setting is favorited"""
        try:
            setting_id = request.query_params.get('setting_id')
            
            if not setting_id:
                return Response({
                    'success': False,
                    'error': 'setting_id required'
                }, status=status.HTTP_400_BAD_REQUEST)

            is_favorited = Favorite.objects.filter(
                user=request.user,
                setting_id=setting_id
            ).exists()

            return Response({
                'success': True,
                'setting_id': int(setting_id),
                'is_favorited': is_favorited
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)