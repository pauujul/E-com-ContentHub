# Gunakan image resmi Python 3.11 berbasis Debian Slim (Stabil, Ringan, & Cepat)
FROM python:3.11-slim

# Menghindari buffering log agar output print langsung muncul di terminal/Docker log
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set direktori kerja di dalam container
WORKDIR /app

# Install dependensi sistem dasar untuk kompilasi library jika diperlukan
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Salin manifest kebutuhan library Python terlebih dahulu (memaksimalkan Docker cache)
COPY requirements.txt .

# Install pustaka Python
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode proyek Django ke dalam container
COPY . .

# Ekspos port 5000 agar sesuai dengan port backend sebelumnya
EXPOSE 5000

# Jalankan server menggunakan Gunicorn (Production-ready) atau development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:5000"]
