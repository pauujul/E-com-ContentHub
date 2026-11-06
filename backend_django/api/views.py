"""
views.py - Koki Utama & Pengendali Logika Bisnis (The Chef)
============================================================
Ibarat "Dapur Restoran":
Setiap fungsi di sini adalah seorang Koki yang bertugas membuat hidangan tertentu:
1. auth_login        -> Koki yang memeriksa kunci masuk pelanggan.
2. auth_register     -> Koki yang mencatat member baru ke buku pelanggan.
3. get_products      -> Koki yang menyajikan daftar menu / paket langganan.
4. orders_handler    -> Koki transaksi yang membuat nota tagihan dan nomor Virtual Account.
5. admin_stats       -> Koki akuntan yang menghitung pemasukan dan jumlah pesanan.
"""

import time
import random
import hashlib
import json
import base64
from datetime import datetime

from django.db import connection, transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import User, SubscriptionPlan, Order, OrderItem
from .serializers import (
    UserSerializer,
    SubscriptionPlanSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
    OrderItemSerializer
)


# =====================================================================
# FUNGSI PEMBANTU (HELPERS) - PERALATAN DAPUR KECIL
# =====================================================================

def hash_sha256(plain_text: str) -> str:
    """Mengubah teks password biasa menjadi kode hash acak SHA-256 (satu arah)."""
    return hashlib.sha256(plain_text.encode('utf-8')).hexdigest()

def verify_user_password(raw_password: str, stored_password: str) -> bool:
    """
    Memeriksa apakah password yang diketik user cocok dengan yang ada di database.
    Mendukung hash SHA-256 baru maupun teks biasa (akun lama sebelum enkripsi).
    """
    input_hashed = hash_sha256(raw_password)
    return stored_password == input_hashed or stored_password == raw_password

def generate_base64_token(user: User) -> str:
    """
    Membuat token otorisasi sederhana (Base64 JSON) persis seperti server.js Express.
    Token ini disimpan oleh Frontend React di localStorage browser.
    """
    payload = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'issuedAt': int(time.time() * 1000)
    }
    json_str = json.dumps(payload)
    return base64.b64encode(json_str.encode('utf-8')).decode('utf-8')


# =====================================================================
# 1. ENDPOINT KESEHATAN SISTEM (GET /api/health)
# =====================================================================

@api_view(['GET'])
def health_check(request):
    """
    Memeriksa apakah koneksi database PostgreSQL aktif dan berfungsi.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT NOW() AS current_time")
            row = cursor.fetchone()
            current_time = row[0] if row else None

        return Response({
            'status': 'healthy',
            'database': 'connected',
            'db_time': current_time
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================================
# 2. ENDPOINT AUTENTIKASI: LOGIN & REGISTER
# =====================================================================

@api_view(['POST'])
def auth_login(request):
    """
    POST /api/auth/login
    Menerima email & password dari user, memvalidasi kecocokan, dan mengembalikan Token.
    """
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    # Langkah 1: Validasi kelengkapan data
    if not email or not password:
        return Response({
            'success': False,
            'message': 'Email dan password wajib diisi.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Langkah 2: Cari pengguna berdasarkan email (tidak peduli huruf besar/kecil)
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response({
                'success': False,
                'message': 'Akun dengan email tersebut tidak ditemukan.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Langkah 3: Periksa kecocokan password
        if not verify_user_password(password, user.password):
            return Response({
                'success': False,
                'message': 'Password yang Anda masukkan salah.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Langkah 4: Perbarui waktu terakhir aktif (updated_at)
        user.save(update_fields=['updated_at'])

        # Langkah 5: Buat token otorisasi
        token = generate_base64_token(user)

        return Response({
            'success': True,
            'message': f"Login berhasil! Selamat datang, {user.name}.",
            'data': {
                'user': UserSerializer(user).data,
                'token': token
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Terjadi kesalahan pada server saat proses autentikasi.',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def auth_register(request):
    """
    POST /api/auth/register
    Mendaftarkan pengguna baru (UMKM) ke sistem dan database ContentHub.
    """
    data = request.data
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    phone = (data.get('phone') or '').strip()
    role = data.get('role') or 'customer'
    business_name = (data.get('business_name') or '').strip() or None
    industry = (data.get('industry') or '').strip() or None

    # Langkah 1: Validasi input wajib
    if not name or not email or not password:
        return Response({
            'success': False,
            'message': 'Nama lengkap, email, dan kata sandi wajib diisi.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Langkah 2: Cek apakah email sudah terdaftar sebelumnya
    if User.objects.filter(email__iexact=email).exists():
        return Response({
            'success': False,
            'message': 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.'
        }, status=status.HTTP_409_CONFLICT)

    valid_roles = ['customer', 'admin', 'editor']
    assigned_role = role if role in valid_roles else 'customer'

    try:
        # Langkah 3: Enkripsi password menggunakan SHA-256
        hashed_password = hash_sha256(password)

        # Langkah 4: Simpan ke tabel database 'users' via Django ORM
        new_user = User.objects.create(
            name=name,
            email=email,
            password=hashed_password,
            role=assigned_role,
            phone=phone if phone else None,
            business_name=business_name,
            industry=industry
        )

        # Langkah 5: Buat token otorisasi langsung
        token = generate_base64_token(new_user)

        return Response({
            'success': True,
            'message': f"Pendaftaran berhasil! Selamat datang di ContentHub, {new_user.name}.",
            'data': {
                'user': UserSerializer(new_user).data,
                'token': token
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Gagal memproses pendaftaran pengguna.',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def auth_users(request):
    """
    GET /api/auth/users
    Mengambil seluruh daftar pengguna yang terdaftar di ContentHub.
    """
    try:
        users = User.objects.all().order_by('id')
        serializer = UserSerializer(users, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Gagal mengambil daftar pengguna',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def auth_me(request):
    """
    GET /api/auth/me
    Mengambil data profil pengguna yang sedang login saat ini.
    Mendukung parameter query ?id=... atau header Authorization: Bearer <token>.
    """
    try:
        target_id = request.query_params.get('id')

        # Jika tidak ada di query param, coba baca dari Header Authorization
        if not target_id:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                try:
                    token_str = auth_header.split(' ')[1]
                    decoded = json.loads(base64.b64decode(token_str.encode('utf-8')).decode('utf-8'))
                    target_id = decoded.get('id')
                except Exception:
                    pass

        if not target_id:
            return Response({
                'success': False,
                'message': 'Parameter id atau token authorization diperlukan.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(id=target_id).first()
        if not user:
            return Response({
                'success': False,
                'message': 'Pengguna tidak ditemukan.'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'success': True,
            'data': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Gagal memeriksa data pengguna',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================================
# 3. ENDPOINT KATALOG PAKET PRODUK (CRUD LENGKAP UNTUK ADMIN)
# =====================================================================

@api_view(['GET', 'POST'])
def products_handler(request):
    """
    GET /api/products  -> Menampilkan seluruh paket langganan.
    POST /api/products -> Admin menambah paket baru langsung ke Database!
    """
    if request.method == 'GET':
        try:
            plans = SubscriptionPlan.objects.all().order_by('price')
            serializer = SubscriptionPlanSerializer(plans, many=True)
            return Response({
                'success': True,
                'count': len(serializer.data),
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Gagal mengambil katalog produk dari database',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        # Admin membuat paket baru langsung ke database tanpa sentuh syntax!
        data = request.data
        sku = data.get('sku') or f"CH-{int(time.time())}"
        name = data.get('name')
        description = data.get('description', '')
        price = data.get('price', 0)
        billing_cycle = data.get('billing_cycle', 'Bulanan')
        features = data.get('features', [])
        badge = data.get('badge')
        is_hero = data.get('is_hero', False)

        if not name:
            return Response({'success': False, 'message': 'Nama paket wajib diisi.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.create(
                sku=sku,
                name=name,
                description=description,
                price=price,
                billing_cycle=billing_cycle,
                features=features,
                badge=badge,
                is_hero=is_hero
            )
            return Response({
                'success': True,
                'message': f"Paket '{plan.name}' berhasil ditambahkan ke Database!",
                'data': SubscriptionPlanSerializer(plan).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Gagal menambahkan paket baru',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PATCH', 'DELETE'])
def product_manage(request, pk):
    """
    PATCH /api/products/<id>  -> Admin mengedit harga/nama paket (langsung simpan ke Database).
    DELETE /api/products/<id> -> Admin menghapus paket dari Database.
    """
    plan = SubscriptionPlan.objects.filter(id=pk).first()
    if not plan:
        return Response({'success': False, 'message': 'Paket tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({'success': True, 'data': SubscriptionPlanSerializer(plan).data})

    elif request.method == 'PATCH':
        data = request.data
        if 'name' in data:
            plan.name = data['name']
        if 'price' in data:
            plan.price = data['price']
        if 'description' in data:
            plan.description = data['description']
        if 'billing_cycle' in data:
            plan.billing_cycle = data['billing_cycle']
        if 'badge' in data:
            plan.badge = data['badge']
        if 'is_hero' in data:
            plan.is_hero = data['is_hero']
        if 'features' in data:
            plan.features = data['features']

        plan.save()
        return Response({
            'success': True,
            'message': f"Paket '{plan.name}' berhasil diperbarui di Database!",
            'data': SubscriptionPlanSerializer(plan).data
        })

    elif request.method == 'DELETE':
        plan_name = plan.name
        plan.delete()
        return Response({
            'success': True,
            'message': f"Paket '{plan_name}' berhasil dihapus dari Database!"
        })


@api_view(['PATCH', 'DELETE'])
def admin_manage_user(request, pk):
    """
    PATCH /api/admin/users/<id>  -> Mengubah role user (misal: customer <-> admin).
    DELETE /api/admin/users/<id> -> Menghapus user dari Database.
    """
    user = User.objects.filter(id=pk).first()
    if not user:
        return Response({'success': False, 'message': 'Pengguna tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        new_role = request.data.get('role')
        if new_role and new_role in ['customer', 'admin', 'editor']:
            user.role = new_role
            user.save(update_fields=['role'])
            return Response({
                'success': True,
                'message': f"Role pengguna {user.name} berhasil diubah menjadi '{new_role}'.",
                'data': UserSerializer(user).data
            })
        return Response({'success': False, 'message': 'Role tidak valid.'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user_name = user.name
        user.delete()
        return Response({
            'success': True,
            'message': f"Pengguna '{user_name}' berhasil dihapus dari Database!"
        })


# =====================================================================
# 4. ENDPOINT TRANSAKSI PESANAN (ORDERS)
# =====================================================================

@api_view(['GET', 'POST'])
def orders_handler(request):
    """
    Endpoint serbaguna untuk Pesanan:
    - POST: Membuat transaksi pesanan langganan baru.
    - GET: Mengambil riwayat daftar pesanan.
    """
    # -------------------------------------------------------------
    # POST /api/orders : PEMBUATAN TRANSAKSI PESANAN BARU
    # -------------------------------------------------------------
    if request.method == 'POST':
        user_id = request.data.get('user_id', 2)
        plan_id = request.data.get('plan_id')
        payment_method = request.data.get('payment_method', 'Virtual Account')
        payment_channel = request.data.get('payment_channel', 'BCA Virtual Account')

        if not plan_id:
            return Response({
                'success': False,
                'message': 'Parameter plan_id wajib disertakan.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Cari paket yang dipilih
        plan = SubscriptionPlan.objects.filter(id=plan_id).first()
        if not plan:
            return Response({
                'success': False,
                'message': 'Paket langganan tidak ditemukan.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Cari user pembuat pesanan
        user = User.objects.filter(id=user_id).first()
        if not user:
            # Fallback jika user id default belum ada di database
            user = User.objects.first()

        total_amount = float(plan.price)
        order_number = f"ORD-{int(time.time() * 1000)}-{random.randint(1000, 9999)}"

        is_free_plan = (total_amount == 0)
        initial_status = 'Paid' if is_free_plan else 'Pending'
        paid_at = timezone.now() if is_free_plan else None

        # Gunakan Database Transaction Atomic (seperti BEGIN & COMMIT di Express)
        # Jika salah satu gagal, semuanya otomatis dibatalkan (Rollback aman)
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    order_number=order_number,
                    user=user,
                    plan=plan,
                    total_amount=total_amount,
                    status=initial_status,
                    payment_method=payment_method,
                    payment_channel=payment_channel,
                    paid_at=paid_at
                )

                item = OrderItem.objects.create(
                    order=order,
                    plan=plan,
                    item_name=f"{plan.name} ({plan.billing_cycle})",
                    price=total_amount,
                    quantity=1,
                    subtotal=total_amount
                )

            # Susun instruksi pembayaran jika bukan paket gratis
            payment_instructions = None
            if not is_free_plan:
                payment_instructions = {
                    'method': payment_method,
                    'channel': payment_channel,
                    'virtual_account_number': '8801' + str(random.randint(1000000000, 9999999999)),
                    'expired_in': '24 Jam'
                }

            return Response({
                'success': True,
                'message': 'Aktivasi paket Free ContentHub berhasil!' if is_free_plan else 'Pesanan langganan berhasil dibuat. Silakan selesaikan pembayaran.',
                'data': {
                    'order': OrderListSerializer(order).data,
                    'items': OrderItemSerializer([item], many=True).data,
                    'payment_instructions': payment_instructions
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'message': 'Gagal memproses transaksi pembuatan order',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # -------------------------------------------------------------
    # GET /api/orders : MENGAMBIL DAFTAR PESANAN
    # -------------------------------------------------------------
    elif request.method == 'GET':
        try:
            user_id = request.query_params.get('user_id')
            query = Order.objects.select_related('user', 'plan').all()

            if user_id:
                query = query.filter(user_id=user_id)

            orders = query.order_by('-created_at')
            serializer = OrderListSerializer(orders, many=True)

            return Response({
                'success': True,
                'count': len(serializer.data),
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Gagal mengambil riwayat pesanan',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def order_detail(request, pk):
    """
    GET /api/orders/:id
    Mengambil rincian detail pesanan berdasarkan ID angka atau Order Number (misal 'ORD-12345').
    """
    try:
        # Cek apakah pk berupa angka ID atau kode Order Number
        if pk.isdigit():
            order = Order.objects.select_related('user', 'plan').prefetch_related('items').filter(
                Q(id=int(pk)) | Q(order_number=pk)
            ).first()
        else:
            order = Order.objects.select_related('user', 'plan').prefetch_related('items').filter(
                order_number=pk
            ).first()

        if not order:
            return Response({
                'success': False,
                'message': 'Pesanan tidak ditemukan'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderDetailSerializer(order)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Gagal mengambil detail pesanan',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
def order_status_update(request, pk):
    """
    PATCH /api/orders/:id/status
    Memperbarui status pembayaran pesanan (Pending -> Paid atau Cancelled).
    """
    status_input = request.data.get('status')
    valid_statuses = ['Pending', 'Paid', 'Cancelled']

    if not status_input or status_input not in valid_statuses:
        return Response({
            'success': False,
            'message': f"Status tidak valid. Harus salah satu dari: {', '.join(valid_statuses)}"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Cari order berdasarkan ID atau Order Number
        if str(pk).isdigit():
            order = Order.objects.filter(Q(id=int(pk)) | Q(order_number=pk)).first()
        else:
            order = Order.objects.filter(order_number=pk).first()

        if not order:
            return Response({
                'success': False,
                'message': 'Order tidak ditemukan'
            }, status=status.HTTP_404_NOT_FOUND)

        order.status = status_input
        order.paid_at = timezone.now() if status_input == 'Paid' else None
        order.save(update_fields=['status', 'paid_at'])

        return Response({
            'success': True,
            'message': f"Status pesanan #{order.order_number} berhasil diubah menjadi {order.status}.",
            'data': {
                'id': order.id,
                'order_number': order.order_number,
                'user_id': order.user_id,
                'status': order.status,
                'paid_at': order.paid_at
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Gagal mengubah status pesanan',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================================
# 5. ENDPOINT ADMIN: STATISTIK DASHBOARD (GET /api/admin/stats)
# =====================================================================

@api_view(['GET'])
def admin_stats(request):
    """
    GET /api/admin/stats
    Menghitung metrik analitik dashboard: Total Pemasukan, Total Pesanan, Pelanggan, dll.
    """
    try:
        # 1. Total Pendapatan dari pesanan yang berstatus 'Paid'
        revenue_data = Order.objects.filter(status='Paid').aggregate(total_revenue=Sum('total_amount'))
        total_revenue = float(revenue_data['total_revenue'] or 0.0)

        # 2. Total Pesanan Keseluruhan, Lunas, dan Menunggu Pembayaran
        total_orders = Order.objects.count()
        paid_orders = Order.objects.filter(status='Paid').count()
        pending_orders = Order.objects.filter(status='Pending').count()

        # 3. Total Pengguna dan Total Pelanggan UMKM
        total_users = User.objects.count()
        total_customers = User.objects.filter(role='customer').count()

        return Response({
            'success': True,
            'data': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'paid_orders': paid_orders,
                'pending_orders': pending_orders,
                'total_users': total_users,
                'total_customers': total_customers
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'message': 'Gagal mengambil data statistik admin',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
