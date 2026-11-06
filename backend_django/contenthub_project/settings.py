"""
settings.py - Buku Pedoman & Pengaturan Utama Django
=====================================================
Ibarat "Buku Aturan Rumah":
Di sini kita mengatur siapa yang boleh masuk (CORS),
di mana gudang penyimpanan berada (Database PostgreSQL),
dan modul apa saja yang diaktifkan (Apps & Plugins).
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# 1. Jalur Direktori Proyek
BASE_DIR = Path(__file__).resolve().parent.parent

# Muat file konfigurasi .env
load_dotenv(os.path.join(BASE_DIR, '.env'))

# 2. Kunci Keamanan & Mode Debug
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-contenthub-amigos-secret-key-2026')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Host yang diizinkan mengakses backend
ALLOWED_HOSTS = ['*']

# 3. Aplikasi yang Terpasang (Installed Apps)
INSTALLED_APPS = [
    # Bawaan Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Pustaka Pihak Ketiga (Third-Party)
    'corsheaders',            # Izin komunikasi silang domain (React <-> Django)
    'rest_framework',         # Alat pembuat API RESTful modern

    # Aplikasi Lokal Kita
    'api',                    # Modul bisnis ContentHub kita
]

# 4. Middleware (Satpam Penjaga Pintu Setiap Request)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Satpam CORS ditaruh paling atas
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # Matikan CSRF middleware bawaan untuk REST API berbasis token agar tidak bentrok dengan React POST/PATCH
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'contenthub_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'contenthub_project.wsgi.application'

# 5. Konfigurasi Database (Gudang Data)
# Prioritas: DATABASE_URL (Neon Cloud / Heroku / Supabase), lalu fallback ke Docker/Lokal
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'ecommerce_db'),
            'USER': os.getenv('DB_USER', 'admin'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'password123'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# 6. Internasionalisasi & Waktu
LANGUAGE_CODE = 'id-id'
TIME_ZONE = 'Asia/Makassar' # Sesuai zona waktu tim di WITA / WIB
USE_I18N = True
USE_TZ = True

# 7. File Statis
STATIC_URL = 'static/'

# Tipe auto increment primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# 8. Pengaturan CORS (Cross-Origin Resource Sharing)
# Mengizinkan frontend React Vite (port 5173 / localhost) melakukan request ke Django
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'authorization',
    'content-type',
    'accept',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Matikan pemaksaan penambahan garis miring (trailing slash) otomatis di akhir URL
# Agar '/api/products' tidak dipaksa redirect 301 ke '/api/products/' yang bisa membatalkan request POST frontend
APPEND_SLASH = False

# 9. Pengaturan Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [], # Bebaskan dari CSRF cookie session untuk REST API
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer', # Panel API interaktif di browser
    ],
    'UNAUTHENTICATED_USER': None,
}
