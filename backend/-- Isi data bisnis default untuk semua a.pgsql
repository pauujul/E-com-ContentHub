-- Isi data bisnis default untuk semua akun lama yang masih NULL
UPDATE users 
SET 
  business_name = 'UMKM Mitra ContentHub',
  industry = 'Kuliner',
  phone = COALESCE(phone, '081234567890')
WHERE business_name IS NULL OR industry IS NULL;

-- Cek hasilnya kembali
SELECT id, name, email, password, phone, business_name, industry, role 
FROM users 
ORDER BY id DESC 
LIMIT 10;