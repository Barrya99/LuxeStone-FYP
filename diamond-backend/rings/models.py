# rings/models.py
# Cleaned up models from inspectdb

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(models.Model):
    """User accounts"""
    user_id = models.AutoField(primary_key=True)
    email = models.CharField(unique=True, max_length=255)
    password_hash = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'

    def __str__(self):
        return self.email


class Diamond(models.Model):
    """Lab-grown diamonds"""
    diamond_id = models.AutoField(primary_key=True)
    sku = models.CharField(unique=True, max_length=50)
    carat = models.DecimalField(max_digits=4, decimal_places=2)
    cut = models.CharField(max_length=20)
    color = models.CharField(max_length=5)
    clarity = models.CharField(max_length=10)
    shape = models.CharField(max_length=20)
    length_mm = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    width_mm = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    depth_mm = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    table_percent = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    depth_percent = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    certificate_type = models.CharField(max_length=50, blank=True, null=True)
    certificate_number = models.CharField(max_length=100, blank=True, null=True)
    polish = models.CharField(max_length=20, blank=True, null=True)
    symmetry = models.CharField(max_length=20, blank=True, null=True)
    fluorescence = models.CharField(max_length=20, blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    video_url = models.CharField(max_length=500, blank=True, null=True)
    is_available = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'diamonds'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.carat}ct {self.shape} - {self.sku}"


class Setting(models.Model):
    """Ring settings/styles"""
    setting_id = models.AutoField(primary_key=True)
    sku = models.CharField(unique=True, max_length=50)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    style_type = models.CharField(max_length=50)
    metal_type = models.CharField(max_length=30)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    compatible_shapes = models.TextField(blank=True, null=True)
    min_carat = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    max_carat = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    thumbnail_url = models.CharField(max_length=500, blank=True, null=True)
    is_available = models.BooleanField(blank=True, null=True)
    popularity_score = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'settings'
        ordering = ['-popularity_score']

    def __str__(self):
        return f"{self.name} - {self.metal_type}"


class RingConfiguration(models.Model):
    """Complete ring designs"""
    config_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True, db_column='user_id')
    diamond = models.ForeignKey(Diamond, models.DO_NOTHING, blank=True, null=True, db_column='diamond_id')
    setting = models.ForeignKey(Setting, models.DO_NOTHING, blank=True, null=True, db_column='setting_id')
    ring_size = models.CharField(max_length=10, blank=True, null=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    diamond_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    setting_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    config_name = models.CharField(max_length=200, blank=True, null=True)
    is_saved = models.BooleanField(blank=True, null=True)
    is_ordered = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ring_configurations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Config {self.config_id} - {self.config_name or 'Unnamed'}"


class Favorite(models.Model):
    """User favorites/wishlist"""
    favorite_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True, db_column='user_id')
    diamond = models.ForeignKey(Diamond, models.DO_NOTHING, blank=True, null=True, db_column='diamond_id')
    setting = models.ForeignKey(Setting, models.DO_NOTHING, blank=True, null=True, db_column='setting_id')
    config = models.ForeignKey(RingConfiguration, models.DO_NOTHING, blank=True, null=True, db_column='config_id')
    user_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'favorites'

    def __str__(self):
        return f"Favorite {self.favorite_id}"


class Review(models.Model):
    """Product reviews"""
    review_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True, db_column='user_id')
    diamond = models.ForeignKey(Diamond, models.DO_NOTHING, blank=True, null=True, db_column='diamond_id')
    setting = models.ForeignKey(Setting, models.DO_NOTHING, blank=True, null=True, db_column='setting_id')
    config = models.ForeignKey(RingConfiguration, models.DO_NOTHING, blank=True, null=True, db_column='config_id')
    rating = models.IntegerField()
    title = models.CharField(max_length=200, blank=True, null=True)
    review_text = models.TextField(blank=True, null=True)
    is_verified_purchase = models.BooleanField(blank=True, null=True)
    helpful_count = models.IntegerField(blank=True, null=True)
    is_approved = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}★ Review {self.review_id}"


class Order(models.Model):
    """Customer orders"""
    order_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True, db_column='user_id')
    order_number = models.CharField(unique=True, max_length=50)
    customer_email = models.CharField(max_length=255)
    customer_first_name = models.CharField(max_length=100, blank=True, null=True)
    customer_last_name = models.CharField(max_length=100, blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    shipping_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    shipping_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, blank=True, null=True)
    billing_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    billing_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    billing_city = models.CharField(max_length=100, blank=True, null=True)
    billing_state = models.CharField(max_length=100, blank=True, null=True)
    billing_postal_code = models.CharField(max_length=20, blank=True, null=True)
    billing_country = models.CharField(max_length=100, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=50, blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    """Items in orders"""
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, models.DO_NOTHING, blank=True, null=True, related_name='items', db_column='order_id')
    config = models.ForeignKey(RingConfiguration, models.DO_NOTHING, blank=True, null=True, db_column='config_id')
    diamond_sku = models.CharField(max_length=50, blank=True, null=True)
    setting_sku = models.CharField(max_length=50, blank=True, null=True)
    ring_size = models.CharField(max_length=10, blank=True, null=True)
    diamond_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    setting_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    item_total = models.DecimalField(max_digits=10, decimal_places=2)
    item_description = models.TextField(blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'order_items'

    def __str__(self):
        return f"Item {self.order_item_id}"


class UserInteraction(models.Model):
    """Analytics tracking"""
    interaction_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, models.DO_NOTHING, blank=True, null=True, db_column='user_id')
    session_id = models.CharField(max_length=100, blank=True, null=True)
    interaction_type = models.CharField(max_length=50)
    diamond = models.ForeignKey(Diamond, models.DO_NOTHING, blank=True, null=True, db_column='diamond_id')
    setting = models.ForeignKey(Setting, models.DO_NOTHING, blank=True, null=True, db_column='setting_id')
    config = models.ForeignKey(RingConfiguration, models.DO_NOTHING, blank=True, null=True, db_column='config_id')
    interaction_data = models.JSONField(blank=True, null=True)
    page_url = models.CharField(max_length=500, blank=True, null=True)
    device_type = models.CharField(max_length=50, blank=True, null=True)
    browser = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user_interactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.interaction_type} - {self.interaction_id}"