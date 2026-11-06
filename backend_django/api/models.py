"""
models.py - Cetak Biru Database (Lemari Data)
==============================================
Ibarat "Buku Formulir & Formulir Data":
Setiap class di sini mewakili 1 TABEL di Database PostgreSQL.
Setiap variabel di dalam class mewakili 1 KOLOM di dalam tabel tersebut.

Dengan Django ORM, kita TIDAK PERLU lagi mengetik 'CREATE TABLE' atau 'SELECT * FROM'!
Cukup panggil nama Model dalam bahasa Python yang sangat mudah dibaca.
"""

from django.db import models

class User(models.Model):
    """
    Tabel: users
    Fungsi: Menyimpan identitas pengguna (UMKM, Admin, dan Editor).
    """
    ROLE_CHOICES = [
        ('customer', 'Customer / Pelaku UMKM'),
        ('admin', 'Administrator'),
        ('editor', 'Editor Konten'),
    ]

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=150, verbose_name="Nama Lengkap")
    email = models.EmailField(max_length=150, unique=True, verbose_name="Alamat Email")
    password = models.CharField(max_length=255, verbose_name="Kata Sandi Hash")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='customer', verbose_name="Peran Pengguna")
    phone = models.CharField(max_length=30, blank=True, null=True, verbose_name="Nomor WhatsApp/HP")
    business_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Nama Bisnis / Toko UMKM")
    industry = models.CharField(max_length=100, blank=True, null=True, verbose_name="Bidang Industri")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Waktu Pendaftaran")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Terakhir Diperbarui")

    class Meta:
        db_table = 'users'  # Menghubungkan langsung ke tabel 'users' di PostgreSQL
        verbose_name = 'Pengguna'
        verbose_name_plural = 'Daftar Pengguna'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"


class SubscriptionPlan(models.Model):
    """
    Tabel: subscription_plans
    Fungsi: Menyimpan katalog paket langganan ContentHub (Free, Starter, Pro).
    """
    BILLING_CHOICES = [
        ('Free', 'Free / Gratis'),
        ('Bulanan', 'Bulanan'),
        ('Tahunan', 'Tahunan'),
    ]

    id = models.BigAutoField(primary_key=True)
    sku = models.CharField(max_length=50, unique=True, verbose_name="Kode SKU Paket")
    name = models.CharField(max_length=150, verbose_name="Nama Paket Langganan")
    description = models.TextField(verbose_name="Deskripsi Lengkap")
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Harga (Rp)")
    billing_cycle = models.CharField(max_length=50, choices=BILLING_CHOICES, verbose_name="Siklus Tagihan")
    features = models.JSONField(default=list, verbose_name="Fitur-fitur Paket (JSON)")
    badge = models.CharField(max_length=50, blank=True, null=True, verbose_name="Label Badge Promosi")
    is_hero = models.BooleanField(default=False, verbose_name="Apakah Paket Unggulan (Hero)?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Dibuat Pada")

    class Meta:
        db_table = 'subscription_plans'
        verbose_name = 'Paket Langganan'
        verbose_name_plural = 'Katalog Paket Langganan'

    def __str__(self):
        return f"{self.name} - Rp {self.price:,.0f} ({self.billing_cycle})"


class Order(models.Model):
    """
    Tabel: orders
    Fungsi: Mencatat invoice pembelian paket langganan oleh pengguna.
    """
    STATUS_CHOICES = [
        ('Pending', 'Menunggu Pembayaran'),
        ('Paid', 'Lunas / Aktif'),
        ('Cancelled', 'Dibatalkan'),
    ]

    id = models.BigAutoField(primary_key=True)
    order_number = models.CharField(max_length=60, unique=True, verbose_name="Nomor Pesanan (Order ID)")
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        db_column='user_id', 
        related_name='orders',
        verbose_name="Pengguna Pembeli"
    )
    plan = models.ForeignKey(
        SubscriptionPlan, 
        on_delete=models.RESTRICT, 
        db_column='plan_id', 
        related_name='orders',
        verbose_name="Paket yang Dibeli"
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total Tagihan")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending', verbose_name="Status Transaksi")
    payment_method = models.CharField(max_length=50, default='Virtual Account', verbose_name="Metode Pembayaran")
    payment_channel = models.CharField(max_length=50, default='BCA Virtual Account', verbose_name="Kanal Pembayaran")
    paid_at = models.DateTimeField(blank=True, null=True, verbose_name="Waktu Lunas")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Waktu Dibuat")

    class Meta:
        db_table = 'orders'
        verbose_name = 'Pesanan'
        verbose_name_plural = 'Daftar Pesanan'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.user.name} ({self.status})"


class OrderItem(models.Model):
    """
    Tabel: order_items
    Fungsi: Menyimpan rincian item atau detail baris dari setiap pesanan.
    """
    id = models.BigAutoField(primary_key=True)
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        db_column='order_id', 
        related_name='items',
        verbose_name="Pesanan Induk"
    )
    plan = models.ForeignKey(
        SubscriptionPlan, 
        on_delete=models.RESTRICT, 
        db_column='plan_id', 
        related_name='order_items',
        verbose_name="Paket Terkait"
    )
    item_name = models.CharField(max_length=150, verbose_name="Nama Item")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Harga Satuan")
    quantity = models.IntegerField(default=1, verbose_name="Jumlah / Kuantitas")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Subtotal Harga")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Dibuat Pada")

    class Meta:
        db_table = 'order_items'
        verbose_name = 'Rincian Item Pesanan'
        verbose_name_plural = 'Rincian Item Pesanan'

    def __str__(self):
        return f"{self.item_name} x {self.quantity} (Order #{self.order_id})"
