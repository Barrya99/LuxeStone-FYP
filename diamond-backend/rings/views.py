# rings/views.py
# KEY CHANGES vs previous version:
#   • Import IsCustomAuthenticated from rings.authentication
#   • FavoriteViewSet  → permission_classes = [IsCustomAuthenticated]
#   • OrderViewSet     → permission_classes = [IsCustomAuthenticated]
#   • get_queryset() on both viewsets uses request.user (the AuthenticatedUser wrapper)
#   • All other viewsets are unchanged

from urllib import request as _urllib_request   # avoid name collision
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count

from .authentication import IsCustomAuthenticated   # ← our custom permission
from .services.pricing import PricingEngine
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
from .recommendation_engine import RecommendationEngine, get_recommendations


# ============================================================
# PRICING VIEWSET
# ============================================================

class PricingViewSet(viewsets.ModelViewSet):
    queryset = Diamond.objects.all()
    serializer_class = DiamondListSerializer

    @action(detail=False, methods=['post'], url_path='calculate-diamond-price')
    def calculate_diamond_price(self, request):
        try:
            diamond_id = request.data.get('diamond_id')
            if not diamond_id:
                return Response({'error': 'diamond_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            diamond = Diamond.objects.get(diamond_id=diamond_id)
            calculated_price = PricingEngine.calculate_diamond_price(diamond)
            quality_mult = PricingEngine.get_quality_multiplier(diamond.cut, diamond.color)
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
                'success': True,
            })
        except Diamond.DoesNotExist:
            return Response({'error': 'Diamond not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='calculate-ring-price')
    def calculate_ring_price(self, request):
        try:
            diamond_id = request.data.get('diamond_id')
            setting_id = request.data.get('setting_id')
            ring_size = request.data.get('ring_size')
            customizations = request.data.get('customizations', {})

            if not diamond_id or not setting_id:
                return Response({'error': 'diamond_id and setting_id are required'}, status=status.HTTP_400_BAD_REQUEST)

            diamond = Diamond.objects.get(diamond_id=diamond_id)
            setting = Setting.objects.get(setting_id=setting_id)
            quality_mult = PricingEngine.get_quality_multiplier(diamond.cut, diamond.color)
            clarity_adj = PricingEngine.get_clarity_adjustment(diamond.clarity)
            size_premium = PricingEngine.get_size_premium(diamond.carat, diamond.shape)
            pricing = PricingEngine.calculate_ring_price(diamond, setting, ring_size, customizations)

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
                'success': True,
            })
        except Diamond.DoesNotExist:
            return Response({'error': 'Diamond not found'}, status=status.HTTP_404_NOT_FOUND)
        except Setting.DoesNotExist:
            return Response({'error': 'Setting not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='get-price-breakdown')
    def get_price_breakdown(self, request):
        try:
            diamond_id = request.data.get('diamond_id')
            setting_id = request.data.get('setting_id')
            ring_size = request.data.get('ring_size')

            if not diamond_id or not setting_id:
                return Response({'error': 'diamond_id and setting_id are required'}, status=status.HTTP_400_BAD_REQUEST)

            diamond = Diamond.objects.get(diamond_id=diamond_id)
            setting = Setting.objects.get(setting_id=setting_id)
            breakdown = PricingEngine.get_price_breakdown(diamond, setting, ring_size)
            ring_surcharge = PricingEngine.calculate_ring_size_surcharge(ring_size)
            surcharges = []
            if ring_surcharge > 0:
                surcharges.append({'name': f'Ring Size Surcharge (Size {ring_size})', 'price': float(ring_surcharge)})

            breakdown['surcharges'] = surcharges
            breakdown['success'] = True
            return Response(breakdown)
        except Diamond.DoesNotExist:
            return Response({'error': 'Diamond not found'}, status=status.HTTP_404_NOT_FOUND)
        except Setting.DoesNotExist:
            return Response({'error': 'Setting not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================
# USER VIEWSET
# ============================================================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']


# ============================================================
# DIAMOND VIEWSET
# ============================================================

class DiamondViewSet(viewsets.ReadOnlyModelViewSet):
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
        queryset = super().get_queryset()
        min_carat = self.request.query_params.get('min_carat')
        max_carat = self.request.query_params.get('max_carat')
        if min_carat:
            queryset = queryset.filter(carat__gte=min_carat)
        if max_carat:
            queryset = queryset.filter(carat__lte=max_carat)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        return queryset

    @action(detail=False, methods=['get'])
    def statistics(self, request):
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


# ============================================================
# SETTING VIEWSET
# ============================================================

class SettingViewSet(viewsets.ReadOnlyModelViewSet):
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
        queryset = super().get_queryset()
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        return queryset


# ============================================================
# RING CONFIGURATION VIEWSET
# ============================================================

class RingConfigurationViewSet(viewsets.ModelViewSet):
    queryset = RingConfiguration.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'is_saved', 'is_ordered']
    ordering_fields = ['total_price', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update'):
            return RingConfigurationCreateSerializer
        elif self.action == 'retrieve':
            return RingConfigurationDetailSerializer
        return RingConfigurationListSerializer

    @action(detail=False, methods=['get'])
    def my_configurations(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        configs = self.queryset.filter(user_id=user_id)
        serializer = self.get_serializer(configs, many=True)
        return Response(serializer.data)


# ============================================================
# REVIEW VIEWSET
# ============================================================

class ReviewViewSet(viewsets.ModelViewSet):
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
        review = self.get_object()
        review.helpful_count = (review.helpful_count or 0) + 1
        review.save()
        return Response({'helpful_count': review.helpful_count})

    @action(detail=False, methods=['get'])
    def product_reviews(self, request):
        diamond_id = request.query_params.get('diamond_id')
        setting_id = request.query_params.get('setting_id')
        queryset = self.queryset
        if diamond_id:
            queryset = queryset.filter(diamond_id=diamond_id)
        if setting_id:
            queryset = queryset.filter(setting_id=setting_id)
        avg_rating = queryset.aggregate(Avg('rating'))['rating__avg']
        total_reviews = queryset.count()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'reviews': serializer.data,
            'average_rating': round(avg_rating, 1) if avg_rating else 0,
            'total_reviews': total_reviews,
        })


# ============================================================
# ORDER VIEWSET  ← uses IsCustomAuthenticated
# ============================================================

class OrderViewSet(viewsets.ModelViewSet):
    """
    All order endpoints require a valid Token header.
    Users can only see / create their own orders.
    """
    permission_classes = [IsCustomAuthenticated]   # ← custom, not IsAuthenticated
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer

    def get_queryset(self):
        """Return only the authenticated user's orders."""
        # request.user is an AuthenticatedUser wrapper; .user_id is the PK
        return (
            Order.objects
            .filter(user_id=self.request.user.user_id)
            .prefetch_related('items')
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
            from django.utils import timezone
            import logging
            logger = logging.getLogger(__name__)

            real_user = getattr(self.request.user, '_user', self.request.user)

            try:
                order = serializer.save(
                    user=real_user,
                    created_at=timezone.now(),
                    updated_at=timezone.now(),
                )
            except Exception as exc:
                logger.error("Order creation failed: %s", exc, exc_info=True)
                raise  # re-raise so DRF returns proper 400/500

            # Email is completely fire-and-forget — NEVER raises
            try:
                from .email_service import send_order_confirmation
                send_order_confirmation(order)
            except Exception as exc:
                logger.error(
                    "Confirmation email failed for order %s: %s",
                    getattr(order, 'order_number', '?'), exc,
                    exc_info=True,
                )
            # Order was already saved successfully — return normally regardless

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response({'status': order.status})


# ============================================================
# USER INTERACTION VIEWSET
# ============================================================

class UserInteractionViewSet(viewsets.ModelViewSet):
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
        queryset = self.queryset
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


# ============================================================
# RECOMMENDATION VIEWSET
# ============================================================

class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        return Response({
            'success': True,
            'message': 'Recommendation API',
            'endpoints': {
                'personalized': request.build_absolute_uri('personalized/'),
                'trending': request.build_absolute_uri('trending/'),
                'budget': request.build_absolute_uri('budget/?max_price=5000'),
                'similar': request.build_absolute_uri('similar/?diamond_id=1'),
                'settings': request.build_absolute_uri('settings/'),
                'combinations': request.build_absolute_uri('combinations/'),
            },
        })

    @action(detail=False, methods=['get'])
    def personalized(self, request):
        try:
            user = getattr(request.user, '_user', None)
            engine = RecommendationEngine(user=user)
            diamonds = engine.get_personalized_diamonds(10)
            settings = engine.get_personalized_settings(10)
            combinations = engine.get_recommended_combinations(5)
            return Response({
                'success': True,
                'diamonds': DiamondListSerializer(diamonds, many=True).data,
                'settings': SettingListSerializer(settings, many=True).data,
                'combinations': [{
                    'diamond': DiamondListSerializer(c['diamond']).data,
                    'setting': SettingListSerializer(c['setting']).data,
                    'total_price': float(c['total_price']),
                    'popularity': c['popularity'],
                } for c in combinations],
                'message': 'Personalized recommendations',
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            engine = RecommendationEngine()
            diamonds = engine.get_trending_diamonds(limit)
            return Response({
                'success': True,
                'diamonds': DiamondListSerializer(diamonds, many=True).data,
                'message': 'Trending diamonds',
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def budget(self, request):
        try:
            max_price = float(request.query_params.get('max_price'))
            limit = int(request.query_params.get('limit', 10))
            engine = RecommendationEngine()
            diamonds = engine.get_budget_friendly_diamonds(max_price, limit)
            return Response({
                'success': True,
                'diamonds': DiamondListSerializer(diamonds, many=True).data,
                'budget': max_price,
                'message': f'Best quality diamonds within ${max_price:,.2f}',
            })
        except (ValueError, TypeError):
            return Response({'success': False, 'error': 'max_price is required and must be a number'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def similar(self, request):
        try:
            diamond_id = int(request.query_params.get('diamond_id'))
            limit = int(request.query_params.get('limit', 5))
            engine = RecommendationEngine()
            similar = engine.get_similar_diamonds(diamond_id, limit)
            return Response({
                'success': True,
                'diamonds': DiamondListSerializer(similar, many=True).data,
                'reference_diamond_id': diamond_id,
                'message': 'Similar diamonds',
            })
        except (ValueError, TypeError):
            return Response({'success': False, 'error': 'diamond_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='settings')
    def ring_settings(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            diamond_id = request.query_params.get('diamond_id')
            user = getattr(request.user, '_user', None)
            engine = RecommendationEngine(user=user)
            if diamond_id:
                settings = engine.get_settings_for_diamond(int(diamond_id), limit)
                message = 'Settings for this diamond'
            else:
                settings = engine.get_personalized_settings(limit)
                message = 'Recommended settings'
            return Response({'success': True, 'settings': SettingListSerializer(settings, many=True).data, 'message': message})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def combinations(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            engine = RecommendationEngine()
            combinations = engine.get_recommended_combinations(limit)
            result = [{
                'diamond': DiamondListSerializer(c['diamond']).data,
                'setting': SettingListSerializer(c['setting']).data,
                'total_price': float(c['total_price']),
                'popularity': c['popularity'],
            } for c in combinations]
            return Response({'success': True, 'combinations': result, 'message': 'Popular combinations'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def next_step(self, request):
        try:
            diamond_id = request.query_params.get('diamond_id')
            setting_id = request.query_params.get('setting_id')
            engine = RecommendationEngine()
            diamond = Diamond.objects.get(diamond_id=diamond_id) if diamond_id else None
            setting = Setting.objects.get(setting_id=setting_id) if setting_id else None
            recs = engine.get_next_step_recommendations(diamond, setting)
            recs_data = []
            if recs['recommendations']:
                if recs['type'] == 'setting':
                    recs_data = SettingListSerializer(recs['recommendations'], many=True).data
                else:
                    recs_data = DiamondListSerializer(recs['recommendations'], many=True).data
            return Response({'success': True, 'type': recs['type'], 'message': recs['message'], 'recommendations': recs_data})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# FAVORITE VIEWSET  ← uses IsCustomAuthenticated
# ============================================================

class FavoriteViewSet(viewsets.ModelViewSet):
    """
    All favorite endpoints require a valid Token header.
    Users can only see / modify their own favorites.
    """
    serializer_class = FavoriteSerializer
    permission_classes = [IsCustomAuthenticated]   # ← custom, not IsAuthenticated
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']

    def _real_user(self):
        """Return the underlying User model instance (not the wrapper)."""
        return self.request.user._user

    def get_queryset(self):
        return Favorite.objects.filter(user_id=self._real_user().user_id).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return FavoriteCreateSerializer
        return FavoriteSerializer

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            data['user'] = self._real_user().user_id
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                favorite = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Added to favorites',
                    'favorite_id': favorite.favorite_id,
                    'data': serializer.data,
                }, status=status.HTTP_201_CREATED)
            return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        try:
            favorite = self.get_object()
            if favorite.user_id != self._real_user().user_id:
                return Response({'success': False, 'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            favorite.delete()
            return Response({'success': True, 'message': 'Removed from favorites'}, status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response({'success': False, 'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)

    # ── /my_favorites/ ────────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def my_favorites(self, request):
        try:
            favorites = self.get_queryset()
            diamond_favs, setting_favs, config_favs = [], [], []
            for fav in favorites:
                fav_data = FavoriteSerializer(fav).data
                if fav.diamond_id:
                    diamond_favs.append({'favorite_id': fav.favorite_id, 'diamond_id': fav.diamond_id, 'diamond': fav_data.get('diamond')})
                elif fav.setting_id:
                    setting_favs.append({'favorite_id': fav.favorite_id, 'setting_id': fav.setting_id, 'setting': fav_data.get('setting')})
                elif fav.config_id:
                    config_favs.append({'favorite_id': fav.favorite_id, 'config_id': fav.config_id, 'config': fav_data.get('config')})
            return Response({
                'success': True,
                'count': favorites.count(),
                'diamonds': diamond_favs,
                'settings': setting_favs,
                'configurations': config_favs,
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── /add_diamond/ ─────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def add_diamond(self, request):
        try:
            diamond_id = request.data.get('diamond_id')
            if not diamond_id:
                return Response({'success': False, 'error': 'diamond_id required'}, status=status.HTTP_400_BAD_REQUEST)
            real_user = self._real_user()
            if Favorite.objects.filter(user_id=real_user.user_id, diamond_id=diamond_id).exists():
                return Response({'success': False, 'error': 'Already favorited'}, status=status.HTTP_400_BAD_REQUEST)
            favorite = Favorite.objects.create(user=real_user, diamond_id=diamond_id, created_at=timezone.now())
            return Response({'success': True, 'message': 'Added to favorites', 'favorite_id': favorite.favorite_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── /add_setting/ ─────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def add_setting(self, request):
        try:
            setting_id = request.data.get('setting_id')
            if not setting_id:
                return Response({'success': False, 'error': 'setting_id required'}, status=status.HTTP_400_BAD_REQUEST)
            real_user = self._real_user()
            if Favorite.objects.filter(user_id=real_user.user_id, setting_id=setting_id).exists():
                return Response({'success': False, 'error': 'Already favorited'}, status=status.HTTP_400_BAD_REQUEST)
            favorite = Favorite.objects.create(user=real_user, setting_id=setting_id, created_at=timezone.now())
            return Response({'success': True, 'message': 'Added to favorites', 'favorite_id': favorite.favorite_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── /remove_diamond/ ──────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def remove_diamond(self, request):
        try:
            diamond_id = request.data.get('diamond_id')
            if not diamond_id:
                return Response({'success': False, 'error': 'diamond_id required'}, status=status.HTTP_400_BAD_REQUEST)
            favorite = Favorite.objects.filter(user_id=self._real_user().user_id, diamond_id=diamond_id).first()
            if not favorite:
                return Response({'success': False, 'error': 'Not in favorites'}, status=status.HTTP_404_NOT_FOUND)
            favorite.delete()
            return Response({'success': True, 'message': 'Removed from favorites'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── /remove_setting/ ──────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def remove_setting(self, request):
        try:
            setting_id = request.data.get('setting_id')
            if not setting_id:
                return Response({'success': False, 'error': 'setting_id required'}, status=status.HTTP_400_BAD_REQUEST)
            favorite = Favorite.objects.filter(user_id=self._real_user().user_id, setting_id=setting_id).first()
            if not favorite:
                return Response({'success': False, 'error': 'Not in favorites'}, status=status.HTTP_404_NOT_FOUND)
            favorite.delete()
            return Response({'success': True, 'message': 'Removed from favorites'})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── /check_diamond/ ───────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def check_diamond(self, request):
        try:
            diamond_id = request.query_params.get('diamond_id')
            if not diamond_id:
                return Response({'success': False, 'error': 'diamond_id required'}, status=status.HTTP_400_BAD_REQUEST)
            is_favorited = Favorite.objects.filter(user_id=self._real_user().user_id, diamond_id=diamond_id).exists()
            return Response({'success': True, 'diamond_id': int(diamond_id), 'is_favorited': is_favorited})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ── /check_setting/ ───────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def check_setting(self, request):
        try:
            setting_id = request.query_params.get('setting_id')
            if not setting_id:
                return Response({'success': False, 'error': 'setting_id required'}, status=status.HTTP_400_BAD_REQUEST)
            is_favorited = Favorite.objects.filter(user_id=self._real_user().user_id, setting_id=setting_id).exists()
            return Response({'success': True, 'setting_id': int(setting_id), 'is_favorited': is_favorited})
        except Exception as e: 
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)