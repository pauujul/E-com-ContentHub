"""
serializers.py - Sang Penerjemah (Python Objects <--> JSON)
=============================================================
Ibarat "Mesin Pembungkus & Penerjemah Bahasa":
- Browser / Frontend React hanya memahami format JSON (teks bertanda kutip dan kurung kurawal).
- Database & Django memproses data dalam bentuk Objek Python (Model Instances).
- Serializer bertugas:
  1. Mengubah Objek Database menjadi JSON cantik untuk dikirim ke Frontend (Serializing).
  2. Memeriksa validitas data JSON yang dikirim Frontend sebelum disimpan ke Database (Deserializing & Validation).
"""

from rest_framework import serializers
from .models import User, SubscriptionPlan, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Pengguna (User).
    Data sensitif seperti password kita sembunyikan agar tidak bocor ke publik.
    """
    class Meta:
        model = User
        fields = [
            'id', 
            'name', 
            'email', 
            'role', 
            'phone', 
            'business_name', 
            'industry', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Katalog Paket Produk SaaS.
    """
    # Pastikan harga dikembalikan dalam format angka desimal/float yang rapi
    price = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 
            'sku', 
            'name', 
            'description', 
            'price', 
            'billing_cycle', 
            'features', 
            'badge', 
            'is_hero',
            'created_at'
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Rincian Item di dalam sebuah Pesanan.
    """
    price = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = OrderItem
        fields = [
            'id', 
            'plan_id', 
            'item_name', 
            'price', 
            'quantity', 
            'subtotal'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Daftar Pesanan (GET /api/orders).
    Menggabungkan relasi nama pembeli dan nama paket agar sama persis
    dengan hasil SQL JOIN di server.js sebelumnya!
    """
    customer_name = serializers.CharField(source='user.name', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    billing_cycle = serializers.CharField(source='plan.billing_cycle', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'user_id',
            'customer_name',
            'customer_email',
            'plan_name',
            'billing_cycle',
            'total_amount',
            'status',
            'payment_method',
            'payment_channel',
            'paid_at',
            'created_at',
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """
    Serializer untuk Detail Lengkap Pesanan (GET /api/orders/:id).
    Menyertakan rincian data pembeli, data paket lengkap, serta daftar item pesanan.
    """
    customer_name = serializers.CharField(source='user.name', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone', read_only=True)
    
    plan_id = serializers.IntegerField(source='plan.id', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_sku = serializers.CharField(source='plan.sku', read_only=True)
    plan_price = serializers.DecimalField(source='plan.price', max_digits=12, decimal_places=2, coerce_to_string=False, read_only=True)
    billing_cycle = serializers.CharField(source='plan.billing_cycle', read_only=True)
    features = serializers.JSONField(source='plan.features', read_only=True)
    
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, coerce_to_string=False)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'user_id',
            'customer_name',
            'customer_email',
            'customer_phone',
            'plan_id',
            'plan_name',
            'plan_sku',
            'plan_price',
            'billing_cycle',
            'features',
            'total_amount',
            'status',
            'payment_method',
            'payment_channel',
            'paid_at',
            'created_at',
            'items',
        ]
