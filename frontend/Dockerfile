# Gunakan image resmi Node.js LTS berbasis Alpine Linux
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json untuk caching layer
COPY package*.json ./

# Install seluruh dependensi frontend
RUN npm install

# Salin source code frontend ke container
COPY . .

# Ekspos port default Vite
EXPOSE 5173

# Jalankan Vite server dengan mode development host binding
CMD ["npm", "run", "dev"]
