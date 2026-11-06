"""
api/urls.py - Peta Alamat Khusus Modul API
==========================================
Ibarat "Daftar Menu Khusus Pesanan Restoran":
Setiap URL diarahkan ke Koki (Views) yang tepat.
Kami menggunakan format ekspresi reguler (re_path) dengan '/?$'
agar URL bisa diakses baik dengan garis miring penutup ('/api/products/')
maupun tanpa garis miring ('/api/products'), persis seperti tingkah laku Express.js!
"""

from django.urls import re_path
from . import views

urlpatterns = [
    # 1. Cek Koneksi & Kesehatan Database
    re_path(r'^health/?$', views.health_check, name='health-check'),

    # 2. Autentikasi & Akun Pengguna
    re_path(r'^auth/login/?$', views.auth_login, name='auth-login'),
    re_path(r'^auth/register/?$', views.auth_register, name='auth-register'),
    re_path(r'^auth/users/?$', views.auth_users, name='auth-users'),
    re_path(r'^auth/me/?$', views.auth_me, name='auth-me'),

    # 3. Katalog Produk & Paket Langganan (CRUD Lengkap)
    re_path(r'^products/?$', views.products_handler, name='products-handler'),
    re_path(r'^products/(?P<pk>\d+)/?$', views.product_manage, name='product-manage'),

    # 4. Transaksi & Riwayat Pesanan
    re_path(r'^orders/?$', views.orders_handler, name='orders-handler'),
    re_path(r'^orders/(?P<pk>[^/]+)/?$', views.order_detail, name='order-detail'),
    re_path(r'^orders/(?P<pk>[^/]+)/status/?$', views.order_status_update, name='order-status-update'),

    # 5. Statistik Dashboard Admin & Manajemen User
    re_path(r'^admin/stats/?$', views.admin_stats, name='admin-stats'),
    re_path(r'^admin/users/(?P<pk>\d+)/?$', views.admin_manage_user, name='admin-manage-user'),
]
