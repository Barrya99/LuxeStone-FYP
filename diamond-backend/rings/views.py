# rings/views.py

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

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for orders
    """
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
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get orders for current user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = self.queryset.filter(user_id=user_id)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
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