# rings/serializers.py

from rest_framework import serializers
from .models import (
    User, Diamond, Setting, RingConfiguration,
    Favorite, Review, Order, OrderItem, UserInteraction
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id', 'email', 'first_name', 'last_name',
            'phone', 'created_at', 'last_login', 'is_active'
        ]
        read_only_fields = ['user_id', 'created_at']


class DiamondListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diamond
        fields = [
            'diamond_id', 'sku', 'carat', 'cut', 'color',
            'clarity', 'shape', 'base_price', 'image_url', 'is_available'
        ]


class DiamondDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diamond
        fields = '__all__'


class SettingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = [
            'setting_id', 'sku', 'name', 'style_type',
            'metal_type', 'base_price', 'thumbnail_url', 'is_available'
        ]


class SettingDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'


class RingConfigurationListSerializer(serializers.ModelSerializer):
    diamond = DiamondListSerializer(read_only=True)
    setting = SettingListSerializer(read_only=True)

    class Meta:
        model = RingConfiguration
        fields = [
            'config_id', 'config_name', 'ring_size', 'total_price',
            'diamond', 'setting', 'is_saved', 'created_at'
        ]


class RingConfigurationDetailSerializer(serializers.ModelSerializer):
    diamond = DiamondDetailSerializer(read_only=True)
    setting = SettingDetailSerializer(read_only=True)

    class Meta:
        model = RingConfiguration
        fields = '__all__'


class RingConfigurationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RingConfiguration
        fields = [
            'user', 'diamond', 'setting', 'ring_size',
            'config_name', 'total_price', 'diamond_price',
            'setting_price', 'is_saved'
        ]


class FavoriteSerializer(serializers.ModelSerializer):
    diamond = DiamondListSerializer(read_only=True)
    setting = SettingListSerializer(read_only=True)
    config = RingConfigurationListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = '__all__'


class FavoriteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['user', 'diamond', 'setting', 'config', 'user_notes']


class ReviewSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = Review
        fields = [
            'user', 'diamond', 'setting', 'config',
            'rating', 'title', 'review_text'
        ]


# ── Order Item serializer ─────────────────────────────────────────────────────
# Used for READING order items (nested inside OrderDetailSerializer)
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'order_item_id', 'config', 'diamond_sku', 'setting_sku',
            'ring_size', 'diamond_price', 'setting_price',
            'item_total', 'quantity', 'item_description'
        ]


# ── Flat item dict used in OrderCreateSerializer ──────────────────────────────
# We accept raw dicts from the frontend, not DRF nested serializer instances,
# so we handle validation manually in OrderCreateSerializer.create().
class OrderItemCreateSerializer(serializers.Serializer):
    """
    Flat representation of an order item sent by the frontend.
    All FK fields (config_id) are optional so null values are harmless.
    """
    config_id       = serializers.IntegerField(required=False, allow_null=True)
    diamond_sku     = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')
    setting_sku     = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')
    ring_size       = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')
    diamond_price   = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, default=0)
    setting_price   = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, default=0)
    item_total      = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity        = serializers.IntegerField(required=False, default=1)
    item_description = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'order_id', 'order_number', 'customer_email',
            'total_amount', 'status', 'payment_status', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Creates an Order + its OrderItems in one shot.
    Items are validated with OrderItemCreateSerializer so null FKs
    are safely stripped before the DB insert.
    """
    # Accept a raw list of dicts — we validate them ourselves in create()
    items = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = Order
        fields = [
            'user',
            'order_number', 'customer_email', 'customer_first_name',
            'customer_last_name', 'customer_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code',
            'shipping_country',
            'billing_address_line1', 'billing_address_line2',
            'billing_city', 'billing_state', 'billing_postal_code',
            'billing_country',
            'subtotal', 'tax_amount', 'shipping_cost', 'total_amount',
            'payment_method', 'payment_status', 'status',
            'special_instructions',
            'items',
        ]
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        from django.utils import timezone

        # Pop items list before creating the order
        items_data = validated_data.pop('items', [])

        # Set timestamps (unmanaged model — Django won't do this automatically)
        validated_data.setdefault('created_at', timezone.now())
        validated_data.setdefault('updated_at', timezone.now())
        validated_data.setdefault('status', 'confirmed')
        validated_data.setdefault('payment_status', 'completed')

        # Create the order row
        order = Order.objects.create(**validated_data)

        # Validate and create each item
        for raw_item in items_data:
            item_ser = OrderItemCreateSerializer(data=raw_item)
            if item_ser.is_valid():
                item_data = item_ser.validated_data

                # Only set config FK if a real integer was supplied
                config_id = item_data.pop('config_id', None)

                OrderItem.objects.create(
                    order=order,
                    config_id=config_id,          # None → NULL in DB (allowed)
                    diamond_sku=item_data.get('diamond_sku') or '',
                    setting_sku=item_data.get('setting_sku') or '',
                    ring_size=item_data.get('ring_size') or '',
                    diamond_price=item_data.get('diamond_price') or 0,
                    setting_price=item_data.get('setting_price') or 0,
                    item_total=item_data['item_total'],
                    quantity=item_data.get('quantity') or 1,
                    item_description=item_data.get('item_description') or '',
                    created_at=timezone.now(),
                )
            else:
                # Log validation errors but don't abort the whole order
                import logging
                logging.getLogger(__name__).warning(
                    "Skipping invalid order item: %s — errors: %s",
                    raw_item, item_ser.errors
                )

        return order


class UserInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInteraction
        fields = '__all__'


class UserInteractionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInteraction
        fields = [
            'user', 'session_id', 'interaction_type', 'diamond',
            'setting', 'config', 'interaction_data', 'page_url',
            'device_type', 'browser', 'created_at'
        ]
        extra_kwargs = {
            'created_at': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        from django.utils import timezone
        if not validated_data.get('created_at'):
            validated_data['created_at'] = timezone.now()
        return UserInteraction.objects.create(**validated_data)