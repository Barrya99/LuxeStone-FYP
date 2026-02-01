# rings/serializers.py

from rest_framework import serializers
from .models import (
    User, Diamond, Setting, RingConfiguration, 
    Favorite, Review, Order, OrderItem, UserInteraction
)


# ============================================
# USER SERIALIZER
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'user_id', 'email', 'first_name', 'last_name',
            'phone', 'created_at', 'last_login', 'is_active'
        ]
        read_only_fields = ['user_id', 'created_at']


# ============================================
# DIAMOND SERIALIZERS
# ============================================

class DiamondListSerializer(serializers.ModelSerializer):
    """Serializer for listing diamonds (minimal fields)"""
    
    class Meta:
        model = Diamond
        fields = [
            'diamond_id', 'sku', 'carat', 'cut', 'color', 
            'clarity', 'shape', 'base_price', 'image_url', 'is_available'
        ]


class DiamondDetailSerializer(serializers.ModelSerializer):
    """Serializer for diamond details (all fields)"""
    
    class Meta:
        model = Diamond
        fields = '__all__'


# ============================================
# SETTING SERIALIZERS
# ============================================

class SettingListSerializer(serializers.ModelSerializer):
    """Serializer for listing settings (minimal fields)"""
    
    class Meta:
        model = Setting
        fields = [
            'setting_id', 'sku', 'name', 'style_type', 
            'metal_type', 'base_price', 'thumbnail_url', 'is_available'
        ]


class SettingDetailSerializer(serializers.ModelSerializer):
    """Serializer for setting details (all fields)"""
    
    class Meta:
        model = Setting
        fields = '__all__'


# ============================================
# RING CONFIGURATION SERIALIZERS
# ============================================

class RingConfigurationListSerializer(serializers.ModelSerializer):
    """Serializer for listing ring configurations"""
    
    diamond = DiamondListSerializer(read_only=True)
    setting = SettingListSerializer(read_only=True)
    
    class Meta:
        model = RingConfiguration
        fields = [
            'config_id', 'config_name', 'ring_size', 'total_price',
            'diamond', 'setting', 'is_saved', 'created_at'
        ]


class RingConfigurationDetailSerializer(serializers.ModelSerializer):
    """Serializer for ring configuration details"""
    
    diamond = DiamondDetailSerializer(read_only=True)
    setting = SettingDetailSerializer(read_only=True)
    
    class Meta:
        model = RingConfiguration
        fields = '__all__'


class RingConfigurationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ring configurations"""
    
    class Meta:
        model = RingConfiguration
        fields = [
            'user', 'diamond', 'setting', 'ring_size', 
            'config_name', 'total_price', 'diamond_price', 
            'setting_price', 'is_saved'
        ]


# ============================================
# FAVORITE SERIALIZER
# ============================================

class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for favorites"""
    
    diamond = DiamondListSerializer(read_only=True)
    setting = SettingListSerializer(read_only=True)
    config = RingConfigurationListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = '__all__'


class FavoriteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating favorites"""
    
    class Meta:
        model = Favorite
        fields = ['user', 'diamond', 'setting', 'config', 'user_notes']


# ============================================
# REVIEW SERIALIZERS
# ============================================

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews"""
    
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'review_id', 'user', 'user_name', 'diamond', 'setting', 
            'config', 'rating', 'title', 'review_text', 
            'is_verified_purchase', 'helpful_count', 'is_approved', 
            'created_at'
        ]
        read_only_fields = ['review_id', 'created_at', 'helpful_count']
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or "Anonymous"
        return "Anonymous"


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = [
            'user', 'diamond', 'setting', 'config', 
            'rating', 'title', 'review_text'
        ]


# ============================================
# ORDER SERIALIZERS
# ============================================

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    
    class Meta:
        model = OrderItem
        fields = [
            'order_item_id', 'config', 'diamond_sku', 'setting_sku',
            'ring_size', 'diamond_price', 'setting_price', 
            'item_total', 'quantity', 'item_description'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders"""
    
    class Meta:
        model = Order
        fields = [
            'order_id', 'order_number', 'customer_email',
            'total_amount', 'status', 'payment_status', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order details with items"""
    
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'user', 'order_number', 'customer_email', 'customer_first_name',
            'customer_last_name', 'customer_phone', 'shipping_address_line1',
            'shipping_address_line2', 'shipping_city', 'shipping_state',
            'shipping_postal_code', 'shipping_country', 'billing_address_line1',
            'billing_address_line2', 'billing_city', 'billing_state',
            'billing_postal_code', 'billing_country', 'subtotal', 'tax_amount',
            'shipping_cost', 'total_amount', 'payment_method', 'special_instructions',
            'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


# ============================================
# USER INTERACTION SERIALIZER
# ============================================

class UserInteractionSerializer(serializers.ModelSerializer):
    """Serializer for user interactions (analytics)"""
    
    class Meta:
        model = UserInteraction
        fields = '__all__'


class UserInteractionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user interactions"""
    
    class Meta:
        model = UserInteraction
        fields = [
            'user', 'session_id', 'interaction_type', 'diamond',
            'setting', 'config', 'interaction_data', 'page_url',
            'device_type', 'browser'
        ]