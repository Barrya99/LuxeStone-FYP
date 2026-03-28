from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .auth_views import AuthViewSet
from .views import (
    UserViewSet, DiamondViewSet, SettingViewSet,
    RingConfigurationViewSet, FavoriteViewSet, ReviewViewSet,
    OrderViewSet, UserInteractionViewSet, PricingViewSet,
    RecommendationViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'diamonds', DiamondViewSet, basename='diamond')
router.register(r'settings', SettingViewSet, basename='setting')
router.register(r'configurations', RingConfigurationViewSet, basename='configuration')
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'interactions', UserInteractionViewSet, basename='interaction')
router.register(r'pricing', PricingViewSet, basename='pricing')
router.register(r'recommendations', RecommendationViewSet, basename='recommendation')

urlpatterns = [
    path('', include(router.urls)),
]