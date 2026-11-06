# 🐍 ContentHub Backend API - Versi Python & Django 5

Backend RESTful API untuk platform SaaS E-Commerce ContentHub (Amigos Team), ditulis menggunakan **Python 3**, **Django**, dan **Django REST Framework (DRF)**.

---

## 🌟 Mengapa Beralih ke Django? (Analogi Dapur Restoran)

| Komponen | Di Node.js (Sebelumnya) | Di Django (Sekarang) | Analogi Sederhana |
| :--- | :--- | :--- | :--- |
| **Pintu Masuk** | `server.js` (560 baris bercampur) | `contenthub_project/urls.py` & `api/urls.py` | **Buku Menu / Kasir**: Mengarahkan pesanan tamu ke koki yang tepat |
| **Koki Masak** | Route handler `app.get()` & SQL mentah | `api/views.py` | **Koki Dapur**: Memasak logika bisnis (login, buat order, hitung omset) |
| **Piring Kemasan** | Manual `res.json({...})` | `api/serializers.py` | **Packaging / Plating**: Mengemas data objek Python menjadi format JSON rapi |
| **Gudang Data** | Kueri SQL string manual (`pg.Pool`) | `api/models.py` (Django ORM) | **Buku Resep & Gudang**: Cetak biru tabel database tanpa ketik SQL rumit |
| **Dashboard Admin** | Harus dibuat manual dari nol | `api/admin.py` (Bawaan Django) | **Ruang Manajer**: Dashboard instan untuk kelola user, produk, & order |

---

## 🚀 Cara Menjalankan Backend Django

### Opsi 1: Menggunakan Docker Compose (Paling Mudah & Otomatis)
Jika ingin menjalankan backend Django bersama database dan frontend React:
1. Ubah bagian `backend:` di `docker-compose.yml` agar menunjuk ke `./backend_django`:
   ```yaml
   backend:
     build:
       context: ./backend_django
       dockerfile: Dockerfile
   ```
2. Jalankan perintah:
   ```bash
   docker compose up --build
   ```

---

### Opsi 2: Menjalankan Secara Lokal (Python di Komputer Anda)

1. **Buka Terminal di folder ini:**
   ```bash
   cd backend_django
   ```

2. **Buat Virtual Environment Python:**
   ```bash
   python -m venv venv
   ```
   *Aktifkan di Windows:*
   ```bash
   .\venv\Scripts\activate
   ```

3. **Install Dependensi:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Sinkronkan Database:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **(Opsional) Buat Akun Superuser untuk Akses Admin:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Nyalakan Server Django:**
   ```bash
   python manage.py runserver 0.0.0.0:5000
   ```
   Akses di browser Anda: `http://localhost:5000/` atau admin di `http://localhost:5000/admin/`.

---

## 📡 Daftar Endpoint API yang Tersedia

Semua format respons JSON, status code, dan parameter dibuat **100% identik** dengan backend sebelumnya, sehingga **Frontend React Anda tidak akan mengalami error atau perubahan kode apa pun!**

- `GET  /` : Status aktif backend
- `GET  /api/health` : Pemeriksaan koneksi PostgreSQL
- `POST /api/auth/login` : Masuk akun pengguna
- `POST /api/auth/register` : Mendaftar akun UMKM baru
- `GET  /api/auth/users` : Menampilkan semua pengguna
- `GET  /api/auth/me` : Mendapatkan sesi profil user yang sedang aktif
- `GET  /api/products` : Katalog paket langganan (Free, Starter, Pro)
- `POST /api/orders` : Membuat pesanan langganan baru (termasuk nomor VA otomatis)
- `GET  /api/orders` : Mengambil riwayat daftar pesanan (opsional `?user_id=X`)
- `GET  /api/orders/<id>` : Mengambil rincian detail pesanan
- `PATCH /api/orders/<id>/status` : Mengubah status pembayaran (Pending, Paid, Cancelled)
- `GET  /api/admin/stats` : Rekap analitik total revenue, order, & user untuk Dashboard Admin
