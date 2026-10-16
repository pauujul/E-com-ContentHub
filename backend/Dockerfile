# Gunakan image resmi Node.js LTS berbasis Alpine Linux (Ringan & Cepat)
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin manifest dependensi terlebih dahulu untuk optimasi caching Docker layer
COPY package*.json ./

# Install dependensi aplikasi
RUN npm install --production=false

# Salin seluruh kode backend ke dalam direktori kerja
COPY . .

# Ekspos port 5000 untuk diakses host atau reverse proxy
EXPOSE 5000

# Jalankan server
CMD ["node", "server.js"]
