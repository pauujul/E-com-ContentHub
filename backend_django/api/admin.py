"""
api/admin.py - Panel Dashboard Admin Otomatis Django
=====================================================
Ibarat "Ruang Kontrol Manajer":
Ini adalah fitur legendaris bawaan Django yang paling disukai developer!
Tanpa membuat frontend admin baru, Django secara otomatis menyediakan
dashboard CRUD (Create, Read, Update, Delete) yang super canggih di /admin/.
"""

from django.contrib import admin
from .models import User, SubscriptionPlan, Order, OrderItem

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'role', 'phone', 'business_name', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('name', 'email', 'phone', 'business_name')
    ordering = ('id',)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'sku', 'name', 'price', 'billing_cycle', 'is_hero', 'badge')
    list_filter = ('billing_cycle', 'is_hero')
    search_fields = ('sku', 'name', 'description')
    ordering = ('price',)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('item_name', 'price', 'quantity', 'subtotal')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'plan', 'total_amount', 'status', 'payment_channel', 'paid_at', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'user__name', 'user__email')
    ordering = ('-created_at',)
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'plan', 'item_name', 'price', 'quantity', 'subtotal')
    search_fields = ('item_name', 'order__order_number')
