"""
urls.py - Pintu Utama Masuknya Request
======================================
Ibarat "Papan Penunjuk Arah / Kasir Depan":
- Jika tamu mencari ruang kerja admin -> diarahkan ke admin Django.
- Jika tamu memanggil API (/api/...) -> diarahkan ke urls milik aplikasi 'api'.
- Jika tamu membuka alamat utama (/) -> disambut dengan pesan status sistem.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def root_status_view(request):
    """
    Menampilkan status server saat mengakses root URL (http://localhost:5000/)
    Sama persis seperti app.get('/') di Express.js sebelumnya!
    """
    return Response({
        'status': 'success',
        'message': 'ContentHub Backend API (Django + DRF) berjalan aktif!',
        'framework': 'Python 3 / Django 5',
        'version': '2.0.0-django',
        'tim': 'Amigos Team',
        'endpoints': [
            'GET /api/health',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/users',
            'GET /api/auth/me',
            'GET /api/products',
            'GET /api/orders',
            'GET /api/orders/<id>',
            'POST /api/orders',
            'PATCH /api/orders/<id>/status',
            'GET /api/admin/stats',
        ]
    })

urlpatterns = [
    # Panel Admin bawaan Django
    path('admin/', admin.site.urls),

    # Halaman Selamat Datang di Root (/)
    path('', root_status_view, name='root-status'),

    # Semua rute API diawali dengan 'api/'
    path('api/', include('api.urls')),
]
