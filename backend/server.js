const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./db');

// ==========================================
// INISIALISASI MIDTRANS
// ==========================================
const midtransClient = require('midtrans-client');
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});
// ==========================================

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Setup upload folder & static serving
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: SHA-256 Hash
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper: Template Desain Email HTML Profesional ContentHub
function generateEmailHtml({ title, subtitle = '', name = '', bodyContent, otpCode = null, footerNote = '' }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
          <!-- Header Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">ContentHub</div>
                    <div style="color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px;">Platform Manajemen Konten Terpadu</div>
                  </td>
                  <td align="right">
                    <span style="background: rgba(255,255,255,0.22); color: #ffffff; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                      Pusat Keamanan
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">${title}</h2>
              ${subtitle ? `<p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">${subtitle}</p>` : ''}
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 18px 0;">Halo <strong>${name || 'Pengguna ContentHub'}</strong>,</p>
              
              <div style="font-size: 14px; color: #334155; line-height: 1.6;">${bodyContent}</div>

              ${otpCode ? `
              <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 14px; padding: 24px; text-align: center; margin: 26px 0;">
                <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">KODE VERIFIKASI RESET KATA SANDI (OTP)</div>
                <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: monospace; padding: 4px 0;">${otpCode}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 10px;">Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan pernah memberikan kode ini kepada orang lain.</div>
              </div>
              ` : ''}

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; line-height: 1.6;">
                ${footerNote || 'Jika Anda tidak pernah merasa melakukan permintaan ini, abaikan email ini atau segera ganti kata sandi akun Anda untuk menjaga keamanan.'}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
                © 2024-2026 ContentHub by Amigos Team. Email dikirim secara otomatis via Google Gmail SMTP Resmi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Helper: Email Notification Service (using SMTP settings or console logger simulation)
async function sendEmailNotification(to, subject, bodyText, templateType = 'general', htmlContent = null) {
  console.log(`\n📧 [EMAIL DISPATCH - ${templateType.toUpperCase()}]`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);

  try {
    // 1. Cek konfigurasi SMTP dari .env terlebih dahulu (Prioritas Utama untuk Gmail SMTP)
    const envUser = process.env.SMTP_USER;
    const envPass = process.env.SMTP_PASS;
    const envHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const envPort = parseInt(process.env.SMTP_PORT, 10) || 465;
    const envSecure = process.env.SMTP_SECURE === 'true' || envPort === 465;
    const envFrom = process.env.SMTP_FROM || (envUser ? `ContentHub Security <${envUser}>` : null);

    let smtpConfig = null;

    if (envUser && envPass && envPass !== '••••••••••••••••') {
      smtpConfig = {
        host: envHost,
        port: envPort,
        secure: envSecure,
        user: envUser,
        pass: envPass,
        from: envFrom || `ContentHub Security <${envUser}>`,
      };
    } else {
      // 2. Fallback cek konfigurasi di database web_settings
      let emailConfig = null;
      if (db.isPostgres && db.isPostgres()) {
        const emailRes = await db.query("SELECT value FROM web_settings WHERE key = 'email'");
        if (emailRes.rows.length > 0) emailConfig = emailRes.rows[0].value;
      } else {
        const store = db.getStore ? db.getStore() : null;
        emailConfig = store?.web_settings?.email;
      }

      if (emailConfig && emailConfig.smtp_user && emailConfig.smtp_pass && emailConfig.smtp_pass !== '••••••••••••••••') {
        const dbHost = emailConfig.smtp_host || 'smtp.gmail.com';
        const dbPort = parseInt(emailConfig.smtp_port, 10) || 465;
        smtpConfig = {
          host: dbHost,
          port: dbPort,
          secure: emailConfig.smtp_secure !== undefined ? emailConfig.smtp_secure : dbPort === 465,
          user: emailConfig.smtp_user,
          pass: emailConfig.smtp_pass,
          from: emailConfig.smtp_from || `ContentHub Security <${emailConfig.smtp_user}>`,
        };
      }
    }

    if (smtpConfig) {
      const isGmail = smtpConfig.host.includes('gmail.com');
      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
              },
            }
          : {
              host: smtpConfig.host,
              port: smtpConfig.port,
              secure: smtpConfig.secure,
              auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
              },
            }
      );

      const mailOptions = {
        from: smtpConfig.from,
        to,
        subject,
        text: bodyText,
      };

      if (htmlContent) {
        mailOptions.html = htmlContent;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log('   ✅ Email BERHASIL TERKIRIM via Gmail SMTP ke:', to, '| Message ID:', info.messageId);
      return { success: true, messageId: info.messageId, delivered: true };
    } else {
      console.log('   ℹ️  [SMTP SIMULATED] Kredensial Gmail SMTP belum diisi di backend/.env (SMTP_USER & SMTP_PASS).');
      console.log(`   Simulasi Body:\n${bodyText}\n`);
      return { success: true, simulated: true };
    }
  } catch (err) {
    console.error('   ❌ GAGAL Mengirim Email via SMTP:', err.message);
    throw err;
  }
}

// ==========================================
// ROOT & HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'ContentHub Backend API berjalan aktif!',
    version: '2.0.0',
    tim: 'Amigos Team',
    database_mode: db.isPostgres ? (db.isPostgres() ? 'PostgreSQL Neon Cloud' : 'Resilient Local Store') : 'Active',
    endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me',
      '/api/auth/users',
      '/api/auth/profile',
      '/api/auth/change-email',
      '/api/auth/change-password',
      '/api/products',
      '/api/orders',
      '/api/posts',
      '/api/content/terms',
      '/api/content/privacy',
      '/api/content/partnerships',
      '/api/content/articles',
      '/api/content/about',
      '/api/settings',
      '/api/admin/stats',
      '/api/upload',
    ],
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() AS current_time');
    res.json({
      status: 'healthy',
      database: db.isPostgres ? (db.isPostgres() ? 'Neon PostgreSQL Connected' : 'Local Fallback Storage') : 'connected',
      db_time: dbTest.rows[0]?.current_time || new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// ==========================================
// 1. FILE UPLOAD ENDPOINT
// ==========================================
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah.' });
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Gambar berhasil diunggah.',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengunggah file', error: error.message });
  }
});

// ==========================================
// 2. AUTENTIKASI, PROFIL & KEAMANAN AKUN
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const query = `
      SELECT id, name, email, password, role, phone, business_name, industry, avatar_url, email_verified, COALESCE(email_notifications_enabled, TRUE) AS email_notifications_enabled 
      FROM users 
      WHERE LOWER(email) = LOWER($1)
    `;
    const result = await db.query(query, [email.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Akun dengan email tersebut tidak ditemukan.' });
    }

    const user = result.rows[0];
    const inputHash = hashPassword(password);
    // Mendukung hash sha256, plain, serta alias default demo ('admin123' / '123' / 'password123')
    const isPasswordValid = 
      user.password === inputHash || 
      user.password === password ||
      (user.password === 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' && 
        (password === 'admin123' || password === '123' || password === 'password123'));

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Password yang Anda masukkan salah.' });
    }

    await db.query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      issuedAt: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.json({
      success: true,
      message: `Login berhasil! Selamat datang, ${user.name}.`,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          business_name: user.business_name,
          industry: user.industry,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
          email_notifications_enabled: user.email_notifications_enabled !== false,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses login.', error: error.message });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone = '', role = 'customer', business_name = 'UMKM Mitra ContentHub', industry = 'Kuliner & F&B', avatar_url = null, email_notifications_enabled = true } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama lengkap, email, dan kata sandi wajib diisi.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.' });
    }

    const hashedPassword = hashPassword(password);
    const defaultAvatar = avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop';
    const notificationsAllowed = email_notifications_enabled !== false;

    const insertResult = await db.query(
      `INSERT INTO users (name, email, password, role, phone, business_name, industry, avatar_url, email_verified, email_notifications_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9, NOW(), NOW())
       RETURNING id, name, email, role, phone, business_name, industry, avatar_url, email_notifications_enabled, created_at`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, role, phone.trim(), business_name.trim(), industry.trim(), defaultAvatar, notificationsAllowed]
    );

    const newUser = insertResult.rows[0];

    // Trigger Welcome Email Notification via SMTP service
    const welcomeSubject = `Selamat Datang di ContentHub, ${newUser.name}!`;
    const welcomeBody = `Halo ${newUser.name},\n\nSelamat datang di ContentHub! Akun Anda untuk bisnis "${newUser.business_name}" telah aktif.\nNikmati kalender konten interaktif, puluhan template Canva siap pakai, dan otomatisasi penjadwalan konten sekarang juga.\n\nSalam,\nTim ContentHub (Amigos Team)`;
    sendEmailNotification(newUser.email, welcomeSubject, welcomeBody, 'welcome');

    const tokenPayload = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, issuedAt: Date.now() };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.status(201).json({
      success: true,
      message: `Pendaftaran berhasil! Selamat datang di ContentHub, ${newUser.name}.`,
      data: { user: newUser, token },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses pendaftaran pengguna.', error: error.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let targetId = req.query.id;

    if (!targetId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = JSON.parse(Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii'));
        targetId = decoded.id;
      } catch (e) {}
    }

    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Parameter id atau token authorization diperlukan.' });
    }

    const result = await db.query('SELECT id, name, email, role, phone, business_name, industry, avatar_url, email_verified, COALESCE(email_notifications_enabled, TRUE) AS email_notifications_enabled, created_at FROM users WHERE id = $1', [targetId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memeriksa sesi pengguna', error: error.message });
  }
});

// PUT /api/auth/profile (Update Profile Pengguna: Nama, Telepon, Nama Usaha, Industri, Foto Profil, Izin Notifikasi)
app.put('/api/auth/profile', async (req, res) => {
  try {
    const { id, name, phone, business_name, industry, avatar_url, email_notifications_enabled } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID pengguna diperlukan.' });
    }

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const uIndex = store.users.findIndex((u) => u.id === parseInt(id, 10));
      if (uIndex !== -1) {
        if (name) store.users[uIndex].name = name.trim();
        if (phone !== undefined) store.users[uIndex].phone = phone.trim();
        if (business_name) store.users[uIndex].business_name = business_name.trim();
        if (industry) store.users[uIndex].industry = industry.trim();
        if (avatar_url) store.users[uIndex].avatar_url = avatar_url;
        if (email_notifications_enabled !== undefined) store.users[uIndex].email_notifications_enabled = email_notifications_enabled !== false;
        store.users[uIndex].updated_at = new Date().toISOString();
        db.saveStore();

        return res.json({
          success: true,
          message: 'Profil berhasil diperbarui.',
          data: store.users[uIndex],
        });
      }
    }

    const updateQuery = `
      UPDATE users 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          business_name = COALESCE($3, business_name),
          industry = COALESCE($4, industry),
          avatar_url = COALESCE($5, avatar_url),
          email_notifications_enabled = COALESCE($6, email_notifications_enabled),
          updated_at = NOW()
      WHERE id = $7
      RETURNING id, name, email, role, phone, business_name, industry, avatar_url, email_notifications_enabled, updated_at;
    `;
    const result = await db.query(updateQuery, [
      name || null,
      phone !== undefined ? phone : null,
      business_name || null,
      industry || null,
      avatar_url || null,
      email_notifications_enabled !== undefined ? (email_notifications_enabled !== false) : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.', error: error.message });
  }
});

// PUT /api/auth/change-email (Ganti Email Aman disertai konfirmasi email)
app.put('/api/auth/change-email', async (req, res) => {
  try {
    const { id, current_password, new_email } = req.body;

    if (!id || !current_password || !new_email) {
      return res.status(400).json({ success: false, message: 'ID pengguna, password saat ini, dan email baru wajib diisi.' });
    }

    const cleanNewEmail = new_email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanNewEmail)) {
      return res.status(400).json({ success: false, message: 'Format alamat email baru tidak valid.' });
    }

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }
    const user = userRes.rows[0];

    const inputHash = hashPassword(current_password);
    if (user.password !== inputHash && user.password !== current_password) {
      return res.status(401).json({ success: false, message: 'Password saat ini yang Anda masukkan salah.' });
    }

    const checkExisting = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2', [cleanNewEmail, id]);
    if (checkExisting.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Alamat email baru tersebut sudah digunakan oleh akun lain.' });
    }

    const oldEmail = user.email;

    // Update in store or database
    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const uIndex = store.users.findIndex((u) => u.id === parseInt(id, 10));
      if (uIndex !== -1) {
        store.users[uIndex].email = cleanNewEmail;
        store.users[uIndex].updated_at = new Date().toISOString();
        db.saveStore();
      }
    } else {
      await db.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [cleanNewEmail, id]);
    }

    // Send confirmation email
    const emailBody = `Halo ${user.name},\n\nAlamat email akun ContentHub Anda berhasil diubah dari ${oldEmail} menjadi ${cleanNewEmail}.\nJika Anda tidak melakukan perubahan ini, segera hubungi customer support kami.\n\nSalam,\nTim Keamanan ContentHub`;
    sendEmailNotification(cleanNewEmail, 'Konfirmasi Perubahan Email Akun ContentHub', emailBody, 'reset_password');

    res.json({
      success: true,
      message: `Email berhasil diubah ke ${cleanNewEmail}. Notifikasi konfirmasi telah dikirimkan.`,
      data: { id: user.id, email: cleanNewEmail },
    });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui alamat email.', error: error.message });
  }
});

// PUT /api/auth/change-password (Ganti Kata Sandi dengan Enkripsi & Notifikasi Email via Gmail SMTP)
app.put('/api/auth/change-password', async (req, res) => {
  try {
    const { id, current_password, new_password, confirm_password } = req.body;

    if (!id || !current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'ID pengguna, password lama, dan password baru wajib diisi.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal harus terdiri dari 6 karakter.' });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Konfirmasi password baru tidak cocok.' });
    }

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }
    const user = userRes.rows[0];

    const inputHash = hashPassword(current_password);
    if (user.password !== inputHash && user.password !== current_password) {
      return res.status(401).json({ success: false, message: 'Password lama yang Anda masukkan salah.' });
    }

    const newHashed = hashPassword(new_password);

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const uIndex = store.users.findIndex((u) => u.id === parseInt(id, 10));
      if (uIndex !== -1) {
        store.users[uIndex].password = newHashed;
        store.users[uIndex].updated_at = new Date().toISOString();
        db.saveStore();
      }
    } else {
      await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [newHashed, id]);
    }

    // Kirim notifikasi konfirmasi pergantian password ke email pengguna via Gmail SMTP
    const updateTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const subject = '[ContentHub] Keamanan Akun: Kata Sandi Berhasil Diperbarui';
    const bodyContent = `Kata sandi akun ContentHub Anda (<strong>${user.email}</strong>) telah berhasil diperbarui pada <strong>${updateTime} WIB</strong> melalui menu Pengaturan Profil.<br><br>Jika ini adalah Anda, tidak ada tindakan lebih lanjut yang diperlukan.`;
    const plainText = `Halo ${user.name},\n\nKata sandi akun ContentHub Anda (${user.email}) telah berhasil diperbarui pada ${updateTime} WIB.\nJika Anda tidak merasa melakukan perubahan ini, segera hubungi tim customer service ContentHub.\n\nSalam hangat,\nTim Keamanan ContentHub`;

    const htmlContent = generateEmailHtml({
      title: 'Pemberitahuan Keamanan Akun',
      subtitle: 'Konfirmasi perubahan kata sandi berhasil diproses.',
      name: user.name,
      bodyContent,
      footerNote: 'Jika Anda TIDAK merasa melakukan perubahan ini, akun Anda kemungkinan telah diakses tanpa izin. Segera hubungi customer support atau lakukan reset kata sandi.',
    });

    try {
      await sendEmailNotification(user.email, subject, plainText, 'change_password', htmlContent);
    } catch (mailErr) {
      console.warn('⚠️  Peringatan pengiriman email ganti password:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui dengan aman. Notifikasi konfirmasi telah dikirim ke alamat email Gmail Anda.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi.', error: error.message });
  }
});

// POST /api/auth/forgot-password (Kirim Kode OTP Verifikasi ke Gmail Terdaftar via Gmail SMTP)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Alamat email wajib diisi.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Cek apakah pengguna terdaftar di database
    let user = null;
    if (db.isPostgres && db.isPostgres()) {
      const userRes = await db.query('SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (userRes.rows.length > 0) user = userRes.rows[0];
    } else {
      const store = db.getStore ? db.getStore() : null;
      user = store?.users?.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Alamat email tidak terdaftar di sistem ContentHub. Harap periksa ejaan atau daftar akun baru.',
      });
    }

    // 2. Generate 6-digit OTP code & Token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Berlaku 15 menit

    // 3. Simpan ke database password_resets
    if (db.isPostgres && db.isPostgres()) {
      await db.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(10) NOT NULL,
          token VARCHAR(255),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Nonaktifkan token lama yang belum digunakan untuk email ini
      await db.query('UPDATE password_resets SET used = TRUE WHERE LOWER(email) = LOWER($1) AND used = FALSE', [cleanEmail]);

      // Masukkan token baru
      await db.query(
        'INSERT INTO password_resets (email, otp, token, expires_at) VALUES ($1, $2, $3, $4)',
        [cleanEmail, otp, token, expiresAt]
      );
    } else {
      const store = db.getStore ? db.getStore() : null;
      if (store) {
        if (!store.password_resets) store.password_resets = [];
        store.password_resets.push({
          id: store.password_resets.length + 1,
          email: cleanEmail,
          otp,
          token,
          expires_at: expiresAt.toISOString(),
          used: false,
          created_at: new Date().toISOString(),
        });
        db.saveStore();
      }
    }

    // 4. Kirim email notifikasi kode OTP via Gmail SMTP
    const subject = `[ContentHub] Kode Verifikasi Reset Kata Sandi: ${otp}`;
    const bodyContent = `Kami menerima permintaan untuk mereset kata sandi akun ContentHub Anda (<strong>${user.email}</strong>).<br><br>Gunakan kode verifikasi 6 digit di bawah ini untuk mengonfirmasi dan membuat kata sandi baru Anda:`;
    const plainText = `Halo ${user.name},\n\nKami menerima permintaan untuk mereset kata sandi akun ContentHub Anda (${user.email}).\n\nKode Verifikasi Reset Sandi (OTP): ${otp}\n\nKode ini hanya berlaku selama 15 menit.\nJika Anda tidak pernah meminta reset kata sandi, abaikan email ini.\n\nSalam hangat,\nTim Keamanan ContentHub`;

    const htmlContent = generateEmailHtml({
      title: 'Permintaan Reset Kata Sandi',
      subtitle: 'Verifikasi identitas akun Anda untuk membuat kata sandi baru.',
      name: user.name,
      bodyContent,
      otpCode: otp,
      footerNote: 'Jika Anda tidak pernah meminta kode reset kata sandi ini, abaikan pesan ini. Akun Anda tetap terlindungi dan aman.',
    });

    try {
      await sendEmailNotification(cleanEmail, subject, plainText, 'forgot_password', htmlContent);
    } catch (mailErr) {
      console.warn('⚠️  Pemberitahuan: Email tidak terkirim via SMTP (kemungkinan akun samaran/domain tidak aktif):', mailErr.message);
      // Akun samaran tetap diizinkan terdaftar dan login, namun secara alami tidak akan menerima kode OTP di Gmail
    }

    res.json({
      success: true,
      message: `Permintaan reset sandi diproses. Jika ${cleanEmail} adalah akun Gmail asli yang aktif di Google, kode verifikasi 6 digit telah dikirimkan ke kotak masuk Gmail Anda.`,
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses permintaan reset kata sandi.', error: error.message });
  }
});

// POST /api/auth/reset-password (Verifikasi Kode OTP dan Terapkan Kata Sandi Baru)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, new_password, confirm_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ success: false, message: 'Alamat email, kode verifikasi OTP, dan kata sandi baru wajib diisi.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Kata sandi baru minimal harus terdiri dari 6 karakter.' });
    }

    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Konfirmasi kata sandi baru tidak cocok.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // 1. Verifikasi kode OTP di database
    let resetRecord = null;
    if (db.isPostgres && db.isPostgres()) {
      const resOtp = await db.query(
        'SELECT * FROM password_resets WHERE LOWER(email) = LOWER($1) AND otp = $2 AND used = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
        [cleanEmail, cleanOtp]
      );
      if (resOtp.rows.length > 0) resetRecord = resOtp.rows[0];
    } else {
      const store = db.getStore ? db.getStore() : null;
      resetRecord = store?.password_resets?.find(
        (r) => r.email.toLowerCase() === cleanEmail && r.otp === cleanOtp && !r.used && new Date(r.expires_at) > new Date()
      );
    }

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Kode verifikasi OTP salah atau sudah kedaluwarsa (berlaku 15 menit). Silakan minta kode baru.',
      });
    }

    // 2. Hash kata sandi baru dan perbarui di tabel users
    const newHashed = hashPassword(new_password);
    let updatedUser = null;

    if (db.isPostgres && db.isPostgres()) {
      const userRes = await db.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2) RETURNING id, name, email',
        [newHashed, cleanEmail]
      );
      if (userRes.rows.length > 0) updatedUser = userRes.rows[0];

      // Tandai OTP telah digunakan
      await db.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetRecord.id]);
    } else {
      const store = db.getStore ? db.getStore() : null;
      if (store) {
        const uIndex = store.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
        if (uIndex !== -1) {
          store.users[uIndex].password = newHashed;
          store.users[uIndex].updated_at = new Date().toISOString();
          updatedUser = store.users[uIndex];
        }
        resetRecord.used = true;
        db.saveStore();
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Akun pengguna tidak ditemukan di database.' });
    }

    // 3. Kirim email notifikasi bahwa reset sandi berhasil via Gmail SMTP
    const resetTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const subject = '[ContentHub] Berhasil: Kata Sandi Akun Anda Telah Diperbarui';
    const bodyContent = `Kata sandi akun ContentHub Anda (<strong>${cleanEmail}</strong>) telah berhasil diperbarui pada <strong>${resetTime} WIB</strong>.<br><br>Sekarang Anda sudah dapat masuk kembali ke dashboard ContentHub dengan kata sandi baru Anda.`;
    const plainText = `Halo ${updatedUser.name},\n\nKata sandi akun ContentHub Anda (${cleanEmail}) telah berhasil direset pada ${resetTime} WIB.\n\nSekarang Anda sudah dapat masuk dengan kata sandi baru Anda.\n\nSalam hangat,\nTim Keamanan ContentHub`;

    const htmlContent = generateEmailHtml({
      title: 'Kata Sandi Berhasil Diperbarui',
      subtitle: 'Akun Anda telah diamankan dengan kata sandi baru.',
      name: updatedUser.name,
      bodyContent,
      footerNote: 'Jika bukan Anda yang melakukan reset kata sandi ini, segera hubungi customer service ContentHub.',
    });

    try {
      await sendEmailNotification(cleanEmail, subject, plainText, 'reset_password_success', htmlContent);
    } catch (e) {
      console.warn('⚠️  Peringatan pengiriman email konfirmasi reset password:', e.message);
    }

    res.json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui kata sandi.', error: error.message });
  }
});

// GET /api/auth/users (Admin: Kelola Pengguna)
app.get('/api/auth/users', async (req, res) => {
  try {
    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const list = store.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        business_name: u.business_name,
        industry: u.industry,
        avatar_url: u.avatar_url,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }));
      return res.json({ success: true, count: list.length, data: list });
    }

    const result = await db.query('SELECT id, name, email, role, phone, business_name, industry, avatar_url, created_at, updated_at FROM users ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar pengguna', error: error.message });
  }
});

// POST /api/auth/users (Admin: Tambah Pengguna Baru)
app.post('/api/auth/users', async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone = '', business_name = 'UMKM Mitra ContentHub', industry = 'Kuliner & F&B', avatar_url = null } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
    }

    const hashedPassword = hashPassword(password);
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      const existing = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
      }
      const newId = store.users.length ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        phone: phone.trim(),
        business_name: business_name.trim(),
        industry: industry.trim(),
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.users.push(newUser);
      db.saveStore();

      return res.status(201).json({ success: true, message: 'Pengguna baru berhasil ditambahkan.', data: newUser });
    }

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, phone, business_name, industry, avatar_url, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW(), NOW())
       RETURNING id, name, email, role, phone, business_name, industry, avatar_url, created_at`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, role, phone.trim(), business_name.trim(), industry.trim(), avatar_url]
    );

    res.status(201).json({ success: true, message: 'Pengguna baru berhasil ditambahkan.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan pengguna.', error: error.message });
  }
});

// PUT /api/auth/users/:id (Admin: Edit Data Pengguna)
app.put('/api/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, business_name, industry, avatar_url, password } = req.body;

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const uIndex = store.users.findIndex((u) => u.id === parseInt(id, 10));
      if (uIndex === -1) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      if (name) store.users[uIndex].name = name.trim();
      if (email) store.users[uIndex].email = email.trim().toLowerCase();
      if (role) store.users[uIndex].role = role;
      if (phone !== undefined) store.users[uIndex].phone = phone.trim();
      if (business_name) store.users[uIndex].business_name = business_name.trim();
      if (industry) store.users[uIndex].industry = industry.trim();
      if (avatar_url) store.users[uIndex].avatar_url = avatar_url;
      if (password) store.users[uIndex].password = hashPassword(password);
      store.users[uIndex].updated_at = new Date().toISOString();
      db.saveStore();

      return res.json({ success: true, message: 'Data pengguna berhasil diperbarui.', data: store.users[uIndex] });
    }

    let query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          phone = COALESCE($4, phone),
          business_name = COALESCE($5, business_name),
          industry = COALESCE($6, industry),
          avatar_url = COALESCE($7, avatar_url),
          updated_at = NOW()
    `;
    const params = [name, email, role, phone, business_name, industry, avatar_url];

    if (password) {
      query += `, password = $${params.length + 1}`;
      params.push(hashPassword(password));
    }
    query += ` WHERE id = $${params.length + 1} RETURNING id, name, email, role, phone, business_name, industry, avatar_url, updated_at;`;
    params.push(id);

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Data pengguna berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengguna.', error: error.message });
  }
});

// DELETE /api/auth/users/:id (Admin: Hapus Pengguna)
app.delete('/api/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const uIndex = store.users.findIndex((u) => u.id === parseInt(id, 10));
      if (uIndex === -1) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }
      const deleted = store.users.splice(uIndex, 1)[0];
      // Cascade delete orders and posts
      store.orders = store.orders.filter((o) => o.user_id !== parseInt(id, 10));
      store.content_posts = store.content_posts.filter((p) => p.user_id !== parseInt(id, 10));
      db.saveStore();

      return res.json({ success: true, message: `Akun pengguna ${deleted.name} berhasil dihapus.` });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, message: `Akun pengguna ${result.rows[0].name} berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus pengguna.', error: error.message });
  }
});

// ==========================================
// 3. KATALOG PAKET SUBSCRIPTION (CRUD)
// ==========================================

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const activeOnly = req.query.all !== 'true';
    const store = db.getStore ? db.getStore() : null;
    if (store) {
      let plans = [...store.subscription_plans];
      if (activeOnly) plans = plans.filter((p) => p.is_active !== false && p.sku !== 'CH-ENT-Y');
      plans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      return res.json({ success: true, count: plans.length, data: plans });
    }

    let query = 'SELECT * FROM subscription_plans';
    if (activeOnly) {
      query += " WHERE is_active = true AND sku != 'CH-ENT-Y'";
    }
    query += ' ORDER BY price ASC';
    const result = await db.query(query);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil katalog produk', error: error.message });
  }
});

// POST /api/products (Admin Create Tier)
app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, description, price, billing_cycle = 'Bulanan', features = [], badge = null, is_hero = false, is_active = true } = req.body;

    if (!sku || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'SKU, nama paket, dan harga wajib diisi.' });
    }

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const newId = store.subscription_plans.length ? Math.max(...store.subscription_plans.map((p) => p.id)) + 1 : 1;
      const planObj = {
        id: newId,
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        description: description || '',
        price: parseFloat(price).toFixed(2),
        billing_cycle,
        features: Array.isArray(features) ? features : [features],
        badge,
        is_hero: Boolean(is_hero),
        is_active: Boolean(is_active),
        created_at: new Date().toISOString(),
      };
      store.subscription_plans.push(planObj);
      db.saveStore();

      return res.status(201).json({ success: true, message: 'Paket langganan baru berhasil ditambahkan.', data: planObj });
    }

    const insertQuery = `
      INSERT INTO subscription_plans (sku, name, description, price, billing_cycle, features, badge, is_hero, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [sku.trim().toUpperCase(), name.trim(), description, price, billing_cycle, JSON.stringify(features), badge, is_hero, is_active]);

    res.status(201).json({ success: true, message: 'Paket langganan baru berhasil ditambahkan.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan paket langganan.', error: error.message });
  }
});

// PUT /api/products/:id (Admin Update Tier)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, description, price, billing_cycle, features, badge, is_hero, is_active } = req.body;

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const pIndex = store.subscription_plans.findIndex((p) => p.id === parseInt(id, 10));
      if (pIndex === -1) {
        return res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' });
      }
      if (sku) store.subscription_plans[pIndex].sku = sku.trim().toUpperCase();
      if (name) store.subscription_plans[pIndex].name = name.trim();
      if (description !== undefined) store.subscription_plans[pIndex].description = description;
      if (price !== undefined) store.subscription_plans[pIndex].price = parseFloat(price).toFixed(2);
      if (billing_cycle) store.subscription_plans[pIndex].billing_cycle = billing_cycle;
      if (features) store.subscription_plans[pIndex].features = Array.isArray(features) ? features : [features];
      if (badge !== undefined) store.subscription_plans[pIndex].badge = badge;
      if (is_hero !== undefined) store.subscription_plans[pIndex].is_hero = Boolean(is_hero);
      if (is_active !== undefined) store.subscription_plans[pIndex].is_active = Boolean(is_active);
      db.saveStore();

      return res.json({ success: true, message: 'Paket langganan berhasil diperbarui.', data: store.subscription_plans[pIndex] });
    }

    const query = `
      UPDATE subscription_plans
      SET sku = COALESCE($1, sku),
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          price = COALESCE($4, price),
          billing_cycle = COALESCE($5, billing_cycle),
          features = COALESCE($6, features),
          badge = COALESCE($7, badge),
          is_hero = COALESCE($8, is_hero),
          is_active = COALESCE($9, is_active),
          updated_at = NOW()
      WHERE id = $10
      RETURNING *;
    `;
    const result = await db.query(query, [
      sku,
      name,
      description,
      price,
      billing_cycle,
      features ? JSON.stringify(features) : null,
      badge,
      is_hero,
      is_active,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paket langganan tidak ditemukan.' });
    }

    res.json({ success: true, message: 'Paket langganan berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui paket langganan.', error: error.message });
  }
});

// DELETE /api/products/:id (Admin Delete Tier)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const pIndex = store.subscription_plans.findIndex((p) => p.id === parseInt(id, 10));
      if (pIndex === -1) {
        return res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' });
      }
      const deleted = store.subscription_plans.splice(pIndex, 1)[0];
      db.saveStore();
      return res.json({ success: true, message: `Paket ${deleted.name} berhasil dihapus.` });
    }

    const result = await db.query('DELETE FROM subscription_plans WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' });
    }
    res.json({ success: true, message: `Paket ${result.rows[0].name} berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus paket langganan.', error: error.message });
  }
});

// ==========================================
// 4. TRANSAKSI & PEMBUATAN ORDER (ORDERS)
// ==========================================

// POST /api/orders (Buat Pesanan Baru)
app.post('/api/orders', async (req, res) => {
  try {
    const { user_id = 1, plan_id, payment_method = 'Virtual Account', payment_channel = 'BCA Virtual Account', customer_name, customer_email } = req.body;

    if (!plan_id) {
      return res.status(400).json({ success: false, message: 'Parameter plan_id wajib disertakan.' });
    }

    // Resolusi user_id yang valid untuk foreign key orders
    let resolvedUserId = parseInt(user_id, 10);
    if (!resolvedUserId || isNaN(resolvedUserId)) {
      resolvedUserId = 1;
    }
    if (db.isPostgres && db.isPostgres()) {
      try {
        const uCheck = await db.query('SELECT id FROM users WHERE id = $1', [resolvedUserId]);
        if (uCheck.rows.length === 0) {
          const firstU = await db.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
          resolvedUserId = firstU.rows.length ? firstU.rows[0].id : 1;
        }
      } catch (e) {
        resolvedUserId = 1;
      }
    }

    const store = db.getStore ? db.getStore() : null;
    let plan = null;
    let user = null;

    if (store) {
      plan = store.subscription_plans.find((p) => p.id === parseInt(plan_id, 10));
      user = store.users.find((u) => u.id === resolvedUserId);
    } else {
      const planRes = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [plan_id]);
      if (planRes.rows.length > 0) plan = planRes.rows[0];
      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [resolvedUserId]);
      if (userRes.rows.length > 0) user = userRes.rows[0];
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Paket langganan tidak ditemukan.' });
    }

    const finalCustomerName = customer_name || user?.name || 'Customer UMKM';
    const finalCustomerEmail = customer_email || user?.email || 'customer@contenthub.id';
    const totalAmount = parseFloat(plan.price);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialStatus = totalAmount === 0 ? 'Paid' : 'Pending';
    const paidAt = totalAmount === 0 ? new Date().toISOString() : null;

    if (store) {
      const newOrderId = store.orders.length ? Math.max(...store.orders.map((o) => o.id)) + 1 : 1;
      const orderObj = {
        id: newOrderId,
        order_number: orderNumber,
        user_id: resolvedUserId,
        customer_name: finalCustomerName,
        customer_email: finalCustomerEmail,
        plan_id: plan.id,
        total_amount: totalAmount.toFixed(2),
        status: initialStatus,
        payment_method,
        payment_channel,
        paid_at: paidAt,
        created_at: new Date().toISOString(),
      };
      store.orders.unshift(orderObj);

      const newItemId = store.order_items.length ? Math.max(...store.order_items.map((i) => i.id)) + 1 : 1;
      const itemObj = {
        id: newItemId,
        order_id: newOrderId,
        plan_id: plan.id,
        item_name: `${plan.name} (${plan.billing_cycle})`,
        price: totalAmount.toFixed(2),
        quantity: 1,
        subtotal: totalAmount.toFixed(2),
        created_at: new Date().toISOString(),
      };
      store.order_items.push(itemObj);
      db.saveStore();

      // Send invoice email notification
      const invoiceSubject = `Invoice Pemesanan #${orderNumber} - Paket ${plan.name}`;
      const invoiceBody = `Halo ${finalCustomerName},\n\nPesanan langganan Anda telah berhasil dibuat!\n\nNo. Pesanan: #${orderNumber}\nPaket: ${plan.name} (${plan.billing_cycle})\nTotal Pembayaran: Rp ${totalAmount.toLocaleString('id-ID')}\nMetode: ${payment_channel}\nStatus: ${initialStatus}\n\nTerima kasih telah menggunakan ContentHub!\nTim Keuangan ContentHub`;
      sendEmailNotification(finalCustomerEmail, invoiceSubject, invoiceBody, 'invoice');

      return res.status(201).json({
        success: true,
        message: totalAmount === 0 ? 'Aktivasi paket Free ContentHub berhasil!' : 'Pesanan langganan berhasil dibuat. Silakan selesaikan pembayaran.',
        data: {
          order: orderObj,
          items: [itemObj],
          payment_instructions:
            totalAmount === 0
              ? null
              : {
                  method: payment_method,
                  channel: payment_channel,
                  virtual_account_number: '8801' + Math.floor(1000000000 + Math.random() * 9000000000),
                  expired_in: '24 Jam',
                },
        },
      });
    }

    const insertOrderQuery = `
      INSERT INTO orders (order_number, user_id, customer_name, customer_email, plan_id, total_amount, status, payment_method, payment_channel, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const orderRes = await db.query(insertOrderQuery, [
      orderNumber,
      resolvedUserId,
      finalCustomerName,
      finalCustomerEmail,
      plan.id,
      totalAmount,
      initialStatus,
      payment_method,
      payment_channel,
      paidAt,
    ]);
    const createdOrder = orderRes.rows[0];

    const insertItemQuery = `
      INSERT INTO order_items (order_id, plan_id, item_name, price, quantity, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const itemRes = await db.query(insertItemQuery, [createdOrder.id, plan.id, `${plan.name} (${plan.billing_cycle})`, totalAmount, 1, totalAmount]);

    res.status(201).json({
      success: true,
      message: totalAmount === 0 ? 'Aktivasi paket Free ContentHub berhasil!' : 'Pesanan langganan berhasil dibuat.',
      data: {
        order: createdOrder,
        items: itemRes.rows,
        payment_instructions:
          totalAmount === 0
            ? null
            : {
                method: payment_method,
                channel: payment_channel,
                virtual_account_number: '8801' + Math.floor(1000000000 + Math.random() * 9000000000),
                expired_in: '24 Jam',
              },
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan.', error: error.message });
  }
});

// ==========================================
// ENDPOINT MIDTRANS (SISIPAN BARU)
// ==========================================

// POST /api/payment/midtrans/create (Buat Snap Token)
app.post('/api/payment/midtrans/create', async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id wajib dikirim.' });
    }

    let order = null;
    const store = db.getStore ? db.getStore() : null;

    // 1. Ambil data order dari Database / Memory
    if (store) {
      order = store.orders.find(o => o.order_number === order_id || o.id === parseInt(order_id, 10));
    } else {
      const isNumeric = !isNaN(parseInt(order_id, 10));
      const query = `SELECT * FROM orders WHERE ${isNumeric ? 'id = $1 OR order_number = $1' : 'order_number = $1'}`;
      const result = await db.query(query, [order_id]);
      if (result.rows.length > 0) order = result.rows[0];
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan.' });
    if (order.status === 'Paid') return res.status(400).json({ success: false, message: 'Order ini sudah dibayar.' });

    // 2. Minta Token ke Midtrans
    const parameter = {
      transaction_details: {
        order_id: order.order_number, // Gunakan order_number (string unik)
        gross_amount: Math.round(parseFloat(order.total_amount)), // Midtrans butuh integer
      },
      customer_details: {
        first_name: order.customer_name,
        email: order.customer_email,
      }
    };

    const transaction = await snap.createTransaction(parameter);
    
    // 3. Kirim token ke frontend
    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });

  } catch (error) {
    console.error('Midtrans Create Error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi Midtrans', error: error.message });
  }
});

// POST /api/payment/midtrans/notification (Webhook Midtrans)
app.post('/api/payment/midtrans/notification', async (req, res) => {
  try {
    const notification = req.body;
    
    // 1. Verifikasi Signature (SHA512)
    const signatureInput = notification.order_id + notification.status_code + notification.gross_amount + process.env.MIDTRANS_SERVER_KEY;
    const expectedSignature = crypto.createHash('sha512').update(signatureInput).digest('hex');

    if (notification.signature_key !== expectedSignature) {
      console.warn('Midtrans Webhook: Signature tidak valid!');
      return res.status(403).json({ message: 'Invalid signature' });
    }

    // 2. Cek Status Transaksi
    if (notification.transaction_status === 'settlement' || 
       (notification.transaction_status === 'capture' && notification.fraud_status === 'accept')) {
        
        // Panggil logika update status yang sudah ada di server.js
        const orderId = notification.order_id;
        const paidAt = new Date().toISOString();
        const store = db.getStore ? db.getStore() : null;

        if (store) {
          const oIndex = store.orders.findIndex((o) => o.order_number === orderId || o.id === parseInt(orderId, 10));
          if (oIndex !== -1) {
            store.orders[oIndex].status = 'Paid';
            store.orders[oIndex].paid_at = paidAt;
            db.saveStore();
          }
        } else {
          await db.query(`UPDATE orders SET status = 'Paid', paid_at = $1 WHERE order_number = $2 OR id::text = $2`, [paidAt, orderId]);
        }
        console.log(`[Midtrans] Order #${orderId} BERHASIL DIBAYAR.`);
    }

    // 3. Selalu balas 200 OK agar Midtrans tidak mengirim ulang notifikasi
    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('Midtrans Webhook Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================

// GET /api/orders (Riwayat Pesanan)
app.get('/api/orders', async (req, res) => {
  try {
    const { user_id } = req.query;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      let orders = [...store.orders];
      if (user_id) {
        orders = orders.filter((o) => o.user_id === parseInt(user_id, 10));
      }
      const mapped = orders.map((o) => {
        const user = store.users.find((u) => u.id === o.user_id) || {};
        const plan = store.subscription_plans.find((p) => p.id === o.plan_id) || {};
        return {
          ...o,
          customer_name: o.customer_name || user.name || 'Pelanggan',
          customer_email: o.customer_email || user.email || '',
          plan_name: plan.name || 'ContentHub Package',
          billing_cycle: plan.billing_cycle || 'Bulanan',
        };
      });
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    let query = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email, sp.name AS plan_name, sp.billing_cycle
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN subscription_plans sp ON o.plan_id = sp.id
    `;
    const params = [];
    const parsedUserId = user_id && user_id !== 'undefined' && user_id !== 'null' && !isNaN(parseInt(user_id, 10)) ? parseInt(user_id, 10) : null;
    if (parsedUserId) {
      query += ` WHERE o.user_id = $1`;
      params.push(parsedUserId);
    }
    query += ` ORDER BY o.created_at DESC;`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesanan', error: error.message });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      const order = store.orders.find((o) => o.id === parseInt(id, 10) || o.order_number === id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
      }
      const user = store.users.find((u) => u.id === order.user_id) || {};
      const plan = store.subscription_plans.find((p) => p.id === order.plan_id) || {};
      const items = store.order_items.filter((i) => i.order_id === order.id);

      return res.json({
        success: true,
        data: {
          ...order,
          customer_name: order.customer_name || user.name,
          customer_email: order.customer_email || user.email,
          customer_phone: user.phone || '085299887766',
          plan_name: plan.name,
          plan_sku: plan.sku,
          plan_price: plan.price,
          billing_cycle: plan.billing_cycle,
          features: plan.features,
          items,
        },
      });
    }

    const isNumeric = /^\d+$/.test(id);
    const query = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             sp.id AS plan_id, sp.name AS plan_name, sp.sku AS plan_sku, sp.price AS plan_price, sp.billing_cycle, sp.features
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN subscription_plans sp ON o.plan_id = sp.id
      WHERE ${isNumeric ? 'o.id = $1 OR o.order_number = $1' : 'o.order_number = $1'}
    `;
    const orderRes = await db.query(query, [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    const order = orderRes.rows[0];
    const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

    res.json({ success: true, data: { ...order, items: itemsRes.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan', error: error.message });
  }
});

// PATCH /api/orders/:id/status (Admin Update Status)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Paid', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status tidak valid. Pilih dari: ${validStatuses.join(', ')}` });
    }

    const paidAt = status === 'Paid' ? new Date().toISOString() : null;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      const oIndex = store.orders.findIndex((o) => o.id === parseInt(id, 10) || o.order_number === id);
      if (oIndex === -1) {
        return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
      }
      store.orders[oIndex].status = status;
      store.orders[oIndex].paid_at = paidAt;
      db.saveStore();

      return res.json({
        success: true,
        message: `Status pesanan #${store.orders[oIndex].order_number} berhasil diubah menjadi ${status}.`,
        data: store.orders[oIndex],
      });
    }

    const query = `
      UPDATE orders 
      SET status = $1, paid_at = $2
      WHERE id = $3 OR order_number = $3
      RETURNING *;
    `;
    const result = await db.query(query, [status, paidAt, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    res.json({
      success: true,
      message: `Status pesanan #${result.rows[0].order_number} berhasil diubah menjadi ${status}.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status pesanan', error: error.message });
  }
});

// ==========================================
// TIER MANAGEMENT & ACCESS VALIDATION HELPERS
// (Free, Pro, Plus, Admin)
// ==========================================

async function getUserSubscriptionTier(userId) {
  const resolvedId = parseInt(userId, 10);
  if (!resolvedId) return 'free';

  try {
    // 1. Cek role admin
    let user = null;
    if (db.isPostgres && db.isPostgres()) {
      const uRes = await db.query('SELECT role, email_notifications_enabled FROM users WHERE id = $1', [resolvedId]);
      if (uRes.rows.length > 0) user = uRes.rows[0];
    } else {
      const store = db.getStore ? db.getStore() : null;
      user = store?.users?.find((u) => u.id === resolvedId);
    }

    if (user && user.role === 'admin') {
      return 'admin';
    }

    // 2. Cek transaksi Paid paling baru
    let paidOrder = null;
    if (db.isPostgres && db.isPostgres()) {
      const oRes = await db.query(
        `SELECT o.plan_id, sp.name, sp.sku, sp.billing_cycle
         FROM orders o
         JOIN subscription_plans sp ON o.plan_id = sp.id
         WHERE o.user_id = $1 AND o.status = 'Paid'
         ORDER BY o.id DESC
         LIMIT 1`,
        [resolvedId]
      );
      if (oRes.rows.length > 0) paidOrder = oRes.rows[0];
    } else {
      const store = db.getStore ? db.getStore() : null;
      if (store && store.orders) {
        const o = store.orders.find((ord) => ord.user_id === resolvedId && ord.status === 'Paid');
        if (o) {
          const p = store.subscription_plans?.find((pl) => pl.id === o.plan_id);
          paidOrder = { plan_id: o.plan_id, name: p?.name, sku: p?.sku, billing_cycle: p?.billing_cycle };
        }
      }
    }

    if (!paidOrder) return 'free';

    const pName = (paidOrder.name || '').toLowerCase();
    const pSku = (paidOrder.sku || '').toLowerCase();
    const pCycle = (paidOrder.billing_cycle || '').toLowerCase();

    // Plus tier (Masa aktif 1 tahun, notifikasi otomatis aktif)
    if (paidOrder.plan_id === 3 || pName.includes('plus') || pSku.includes('plus') || pCycle.includes('tahun')) {
      return 'plus';
    }

    // Pro tier (Masa aktif 3 bulan / bulanan, kalender unlimited + drag-drop + all templates)
    if (paidOrder.plan_id === 2 || pName.includes('pro') || pSku.includes('pro') || pName.includes('starter') || pCycle.includes('bulan')) {
      return 'pro';
    }

    return 'free';
  } catch (err) {
    console.error('Error determining user tier:', err.message);
    return 'free';
  }
}

// Menghitung jumlah agenda pengguna pada minggu yang bersangkutan (Senin s/d Minggu)
async function getWeeklyAgendaCountForUser(userId, targetDate = new Date()) {
  const resolvedId = parseInt(userId, 10);
  if (!resolvedId) return 0;

  try {
    const d = new Date(targetDate);
    const day = d.getDay(); // 0 = Minggu
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    const startIso = monday.toISOString();
    const endIso = sunday.toISOString();

    let count = 0;
    if (db.isPostgres && db.isPostgres()) {
      const qPosts = await db.query(
        'SELECT COUNT(*)::int AS count FROM content_posts WHERE user_id = $1 AND scheduled_at >= $2 AND scheduled_at < $3',
        [resolvedId, startIso, endIso]
      );
      const qSched = await db.query(
        'SELECT COUNT(*)::int AS count FROM schedules WHERE user_id = $1 AND start_time >= $2 AND start_time < $3',
        [resolvedId, startIso, endIso]
      );
      count = Math.max(qPosts.rows[0]?.count || 0, qSched.rows[0]?.count || 0);
    } else {
      const store = db.getStore ? db.getStore() : null;
      const postsCount = (store?.content_posts || []).filter((p) => p.user_id === resolvedId && p.scheduled_at >= startIso && p.scheduled_at < endIso).length;
      const schedCount = (store?.schedules || []).filter((s) => s.user_id === resolvedId && s.start_time >= startIso && s.start_time < endIso).length;
      count = Math.max(postsCount, schedCount);
    }
    return count;
  } catch (err) {
    console.error('Error counting weekly agendas:', err.message);
    return 0;
  }
}

// GET /api/auth/user-tier (Mendapatkan Status Tier & Hak Akses Fitur)
app.get('/api/auth/user-tier', async (req, res) => {
  try {
    const userId = req.query.user_id || req.query.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Parameter user_id diperlukan' });
    }
    const resolvedId = parseInt(userId, 10);
    const tier = await getUserSubscriptionTier(resolvedId);
    const weeklyCount = await getWeeklyAgendaCountForUser(resolvedId);

    const isFree = tier === 'free';
    const isPro = tier === 'pro';
    const isPlus = tier === 'plus' || tier === 'admin';
    const isAdmin = tier === 'admin';

    res.json({
      success: true,
      data: {
        tier,
        is_free: isFree,
        is_pro: isPro,
        is_plus: isPlus,
        is_admin: isAdmin,
        weekly_agenda_count: weeklyCount,
        weekly_agenda_limit: isFree ? 3 : null,
        limit_reached: isFree && weeklyCount >= 3,
        permissions: {
          calendar_unlimited: !isFree,
          drag_drop_planner: isPro || isPlus || isAdmin,
          all_templates: isPro || isPlus || isAdmin,
          automatic_notifications: isPlus || isAdmin,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil informasi tier', error: error.message });
  }
});

// GET /api/notifications/unsubscribe (Pencabutan Izin Notifikasi Email Pengguna)
app.get('/api/notifications/unsubscribe', async (req, res) => {
  try {
    const { email, userId } = req.query;
    if (!email && !userId) {
      return res.status(400).send('Parameter email atau userId diperlukan.');
    }

    if (db.isPostgres && db.isPostgres()) {
      if (email) {
        await db.query('UPDATE users SET email_notifications_enabled = FALSE, updated_at = NOW() WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      } else if (userId) {
        await db.query('UPDATE users SET email_notifications_enabled = FALSE, updated_at = NOW() WHERE id = $1', [parseInt(userId, 10)]);
      }
    }

    const store = db.getStore ? db.getStore() : null;
    if (store && store.users) {
      const u = store.users.find(
        (usr) => (email && usr.email.toLowerCase() === email.trim().toLowerCase()) || (userId && usr.id === parseInt(userId, 10))
      );
      if (u) {
        u.email_notifications_enabled = false;
        db.saveStore();
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Berhasil Berhenti Berlangganan - ContentHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: white; max-width: 480px; width: 100%; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; border: 1px solid #e2e8f0; }
          .icon { width: 64px; height: 64px; border-radius: 50%; background: #ecfdf5; color: #059669; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px; font-weight: bold; }
          h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #0f172a; }
          p { font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px; }
          .btn { display: inline-block; background: #005da7; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✓</div>
          <h1>Izin Notifikasi Berhasil Dicabut</h1>
          <p>Anda telah berhasil berhenti berlangganan pengingat jadwal otomatis dari ContentHub. Anda dapat mengaktifkannya kembali kapan saja melalui menu <strong>Pengaturan Profil</strong> di dalam Workspace.</p>
          <a href="/" class="btn">Kembali ke ContentHub</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Gagal memproses permohonan berhenti berlangganan: ' + err.message);
  }
});

// ==========================================
// BACKGROUND NOTIFICATION SCHEDULER (GMAIL)
// Presisi Menit: * * * * *
// ==========================================

async function sendScheduledReminders() {
  try {
    const now = new Date();
    let dueSchedules = [];

    if (db.isPostgres && db.isPostgres()) {
      // 1. Scan tabel schedules
      const querySched = `
        SELECT 
          s.id,
          s.user_id,
          s.title,
          s.description,
          s.platform,
          s.start_time,
          'schedules' AS source_table,
          u.name AS user_name,
          u.email AS user_email,
          u.role AS user_role,
          COALESCE(u.email_notifications_enabled, TRUE) AS email_notifications_enabled
        FROM schedules s
        JOIN users u ON s.user_id = u.id
        WHERE (s.notification_sent IS FALSE OR s.notification_sent IS NULL)
          AND s.start_time <= NOW()
          AND s.start_time >= NOW() - INTERVAL '5 minutes'
        ORDER BY s.start_time ASC;
      `;
      const resSched = await db.query(querySched);
      if (resSched.rows && resSched.rows.length > 0) {
        dueSchedules = [...dueSchedules, ...resSched.rows];
      }

      // 2. Scan tabel content_posts
      const queryPosts = `
        SELECT 
          cp.id,
          cp.user_id,
          cp.judul AS title,
          cp.caption AS description,
          cp.platform,
          cp.scheduled_at AS start_time,
          'content_posts' AS source_table,
          u.name AS user_name,
          u.email AS user_email,
          u.role AS user_role,
          COALESCE(u.email_notifications_enabled, TRUE) AS email_notifications_enabled
        FROM content_posts cp
        JOIN users u ON cp.user_id = u.id
        WHERE (cp.notification_sent IS FALSE OR cp.notification_sent IS NULL)
          AND cp.scheduled_at <= NOW()
          AND cp.scheduled_at >= NOW() - INTERVAL '5 minutes'
        ORDER BY cp.scheduled_at ASC;
      `;
      const resPosts = await db.query(queryPosts);
      if (resPosts.rows && resPosts.rows.length > 0) {
        dueSchedules = [...dueSchedules, ...resPosts.rows];
      }
    } else {
      const store = db.getStore ? db.getStore() : null;
      if (store) {
        const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        const nowIso = now.toISOString();

        (store.schedules || []).forEach((s) => {
          if (!s.notification_sent && s.start_time <= nowIso && s.start_time >= fiveMinAgo) {
            const u = store.users.find((usr) => usr.id === s.user_id);
            if (u) {
              dueSchedules.push({
                ...s,
                source_table: 'schedules',
                user_name: u.name,
                user_email: u.email,
                user_role: u.role,
                email_notifications_enabled: u.email_notifications_enabled !== false,
              });
            }
          }
        });

        (store.content_posts || []).forEach((p) => {
          if (!p.notification_sent && p.scheduled_at <= nowIso && p.scheduled_at >= fiveMinAgo) {
            const u = store.users.find((usr) => usr.id === p.user_id);
            if (u) {
              dueSchedules.push({
                id: p.id,
                user_id: p.user_id,
                title: p.judul,
                description: p.caption,
                platform: p.platform,
                start_time: p.scheduled_at,
                source_table: 'content_posts',
                user_name: u.name,
                user_email: u.email,
                user_role: u.role,
                email_notifications_enabled: u.email_notifications_enabled !== false,
              });
            }
          }
        });
      }
    }

    if (dueSchedules.length === 0) return;

    console.log(`\n🔔 [SCHEDULER] Terdeteksi ${dueSchedules.length} agenda jatuh tempo untuk diproses...`);

    for (const item of dueSchedules) {
      // Validasi 1: Izin User Consent
      if (item.email_notifications_enabled === false) {
        console.log(`   ⏭️  Lewati agenda '${item.title}': User (${item.user_email}) menonaktifkan notifikasi email.`);
        continue;
      }

      // Validasi 2: Paket Plus atau Admin
      const tier = await getUserSubscriptionTier(item.user_id);
      if (tier !== 'plus' && tier !== 'admin') {
        console.log(`   ⏭️  Lewati agenda '${item.title}': User (${item.user_email}) berada pada paket '${tier}'. Fitur notifikasi eksklusif Paket Plus.`);
        continue;
      }

      const scheduleTitle = item.title || 'Agenda Konten';
      const scheduleDesc = item.description || 'Tidak ada catatan tambahan.';
      const schedulePlatform = item.platform || 'Instagram';
      const formattedDate = new Date(item.start_time).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      const serverBase = process.env.BASE_URL || `http://localhost:${PORT}`;
      const unsubscribeUrl = `${serverBase}/api/notifications/unsubscribe?email=${encodeURIComponent(item.user_email)}&userId=${item.user_id}`;

      const subject = `🔔 [Pengingat Posting] ${scheduleTitle} (${schedulePlatform})`;
      const textBody = `Halo ${item.user_name},\n\nWaktunya posting! Agenda konten Anda "${scheduleTitle}" dijadwalkan sekarang (${formattedDate}) untuk platform ${schedulePlatform}.\n\nCatatan:\n${scheduleDesc}\n\nBerhenti Berlangganan (Unsubscribe): ${unsubscribeUrl}\n\nSalam,\nContentHub Automated Notifier`;

      const htmlBody = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #005da7 0%, #0284c7 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
            .badge-plus { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
            .content { padding: 32px 28px; }
            .card-agenda { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #005da7; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
            .btn { display: inline-block; background: #005da7; color: #ffffff !important; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,93,167,0.25); }
            .footer { padding: 24px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; }
            .unsub-link { color: #ef4444; text-decoration: underline; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge-plus">⭐ Eksklusif Paket Plus</span>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Waktunya Posting Konten!</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Pengingat jadwal otomatis real-time ContentHub</p>
            </div>
            <div class="content">
              <p style="margin-top: 0; font-size: 15px;">Halo <strong>${item.user_name}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                Agenda konten Anda telah mencapai waktu tayang yang ditentukan. Segera buka aplikasi dan publikasikan konten Anda untuk menjangkau audiens secara konsisten!
              </p>
              <div class="card-agenda">
                <div class="title">${scheduleTitle}</div>
                <div style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>⏰ Waktu Tayang:</strong> ${formattedDate}</div>
                <div style="font-size: 13px; color: #334155; margin-bottom: 12px;"><strong>📱 Platform:</strong> ${schedulePlatform}</div>
                <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Naskah / Catatan:</div>
                <div style="font-size: 13px; color: #1e293b; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${scheduleDesc}</div>
              </div>
              <div style="text-align: center;">
                <a href="http://localhost:5173/calendar" class="btn">Buka Kalender ContentHub</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px;">
                Anda menerima email ini karena akun Anda terdaftar pada <strong>Paket Plus</strong> dan memberikan persetujuan (consent) untuk pengingat jadwal otomatis.
              </p>
              <p style="margin: 0;">
                Ingin berhenti menerima pengingat jadwal via email? <a href="${unsubscribeUrl}" class="unsub-link">Klik di sini untuk Unsubscribe</a>.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await sendEmailNotification(item.user_email, subject, textBody, 'reminder', htmlBody);

        // Update notification_sent = TRUE
        if (db.isPostgres && db.isPostgres()) {
          if (item.source_table === 'schedules') {
            await db.query('UPDATE schedules SET notification_sent = TRUE, updated_at = NOW() WHERE id = $1', [item.id]);
          } else {
            await db.query('UPDATE content_posts SET notification_sent = TRUE, updated_at = NOW() WHERE id = $1', [item.id]);
          }
        } else {
          const store = db.getStore ? db.getStore() : null;
          if (store) {
            if (item.source_table === 'schedules') {
              const sc = (store.schedules || []).find((s) => s.id === item.id);
              if (sc) sc.notification_sent = true;
            } else {
              const cp = (store.content_posts || []).find((p) => p.id === item.id);
              if (cp) cp.notification_sent = true;
            }
            db.saveStore();
          }
        }
        console.log(`   ✅ Notifikasi pengingat agenda '${scheduleTitle}' berhasil dikirim ke ${item.user_email}`);
      } catch (errSend) {
        console.error(`   ❌ Gagal mengirim email notifikasi ke ${item.user_email}:`, errSend.message);
      }
    }
  } catch (err) {
    console.error('Error in sendScheduledReminders:', err.message);
  }
}

let cronJobInstance = null;
function initNotificationScheduler() {
  if (cronJobInstance) return;
  console.log('⏰ Mengaktifkan Background Notification Scheduler (node-cron presisi 1 menit)...');

  // Jalankan setiap 1 menit (* * * * *)
  cronJobInstance = cron.schedule('* * * * *', async () => {
    try {
      await sendScheduledReminders();
    } catch (err) {
      console.error('❌ Scheduler interval error:', err.message);
    }
  });

  // Eksekusi pemeriksaan perdana saat server baru menyala
  setTimeout(() => {
    sendScheduledReminders().catch((e) => console.warn('Pemeriksaan notifikasi awal:', e.message));
  }, 3000);
}

// ==========================================
// 5. CONTENT POSTS (CALENDAR & KANBAN PLANNER)
// SINKRONISASI API PENUH KE DATABASE POSTGRESQL/NEON
// ==========================================

// GET /api/posts (Mendukung join users agar admin dapat memantau jadwal konten seluruh pengguna)
app.get('/api/posts', async (req, res) => {
  try {
    const { user_id, stage, status, month, year } = req.query;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      let posts = [...store.content_posts].map((p) => {
        const u = store.users?.find((usr) => usr.id === p.user_id);
        return {
          ...p,
          user_name: u ? u.name : 'Pengguna ContentHub',
          user_email: u ? u.email : '',
          user_business_name: u ? u.business_name : 'UMKM Mitra',
          user_avatar: u ? u.avatar_url : null,
        };
      });
      if (user_id) posts = posts.filter((p) => p.user_id === parseInt(user_id, 10));
      if (stage) posts = posts.filter((p) => p.stage === stage);
      if (status) posts = posts.filter((p) => p.status === status);

      posts.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
      return res.json({ success: true, count: posts.length, data: posts });
    }

    let query = `
      SELECT 
        cp.*,
        u.name AS user_name,
        u.email AS user_email,
        u.business_name AS user_business_name,
        u.avatar_url AS user_avatar
      FROM content_posts cp
      LEFT JOIN users u ON cp.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    const parsedUserId = user_id && user_id !== 'undefined' && user_id !== 'null' && !isNaN(parseInt(user_id, 10)) ? parseInt(user_id, 10) : null;
    if (parsedUserId) {
      params.push(parsedUserId);
      query += ` AND cp.user_id = $${params.length}`;
    }
    if (stage) {
      params.push(stage);
      query += ` AND cp.stage = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND cp.status = $${params.length}`;
    }
    query += ` ORDER BY cp.scheduled_at ASC, cp.order_position ASC;`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat jadwal konten', error: error.message });
  }
});

// GET /api/posts/:id
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      const post = store.content_posts.find((p) => p.id === parseInt(id, 10));
      if (!post) return res.status(404).json({ success: false, message: 'Konten tidak ditemukan' });
      return res.json({ success: true, data: post });
    }

    const result = await db.query('SELECT * FROM content_posts WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Konten tidak ditemukan' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail jadwal', error: error.message });
  }
});

// POST /api/posts (Buat Jadwal / Ide Baru)
app.post('/api/posts', async (req, res) => {
  try {
    const {
      user_id = 2,
      judul,
      caption = '',
      platform = 'Instagram',
      category = 'Umum',
      color_label = 'bg-blue-100 text-blue-700 border-blue-300',
      scheduled_at = new Date().toISOString(),
      status = 'Draft',
      stage = 'backlog',
      order_position = 0,
      thumbnail_url = null,
      media_url = null,
    } = req.body;

    if (!judul) {
      return res.status(400).json({ success: false, message: 'Judul postingan wajib diisi.' });
    }

    // Resolusi user_id yang valid untuk mencegah error foreign key
    let resolvedUserId = parseInt(user_id, 10);
    if (!resolvedUserId || isNaN(resolvedUserId)) {
      resolvedUserId = 1;
    }
    if (db.isPostgres && db.isPostgres()) {
      try {
        const uCheck = await db.query('SELECT id FROM users WHERE id = $1', [resolvedUserId]);
        if (uCheck.rows.length === 0) {
          const firstU = await db.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
          resolvedUserId = firstU.rows.length ? firstU.rows[0].id : 1;
        }
      } catch (e) {
        resolvedUserId = 1;
      }
    }

    // VALIDASI TIER: Batasan kuota kalender Paket Free (Maksimal 3 agenda per minggu)
    const userTier = await getUserSubscriptionTier(resolvedUserId);
    if (userTier === 'free') {
      const weeklyCount = await getWeeklyAgendaCountForUser(resolvedUserId, scheduled_at);
      if (weeklyCount >= 3) {
        return res.status(403).json({
          success: false,
          code: 'FREE_WEEKLY_LIMIT_REACHED',
          message: 'Batas kuota tercapai! Paket Free hanya dapat menjadwalkan maksimal 3 agenda per minggu. Silakan upgrade ke Paket Pro atau Plus untuk menjadwalkan konten tanpa batas.',
          limit: 3,
          current_count: weeklyCount,
        });
      }
    }

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const newId = store.content_posts.length ? Math.max(...store.content_posts.map((p) => p.id)) + 1 : 1;
      const newPost = {
        id: newId,
        user_id: resolvedUserId,
        judul: judul.trim(),
        caption: caption.trim(),
        platform,
        category,
        color_label,
        scheduled_at: new Date(scheduled_at).toISOString(),
        status,
        stage,
        order_position: parseInt(order_position, 10) || 0,
        thumbnail_url,
        media_url,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.content_posts.push(newPost);
      db.saveStore();

      return res.status(201).json({ success: true, message: 'Postingan baru berhasil dijadwalkan.', data: newPost });
    }

    const insertQuery = `
      INSERT INTO content_posts (user_id, judul, caption, platform, category, color_label, scheduled_at, status, stage, order_position, thumbnail_url, media_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [
      resolvedUserId,
      judul.trim(),
      caption.trim(),
      platform,
      category,
      color_label,
      scheduled_at,
      status,
      stage,
      order_position,
      thumbnail_url,
      media_url,
    ]);

    res.status(201).json({ success: true, message: 'Postingan baru berhasil dijadwalkan.', data: result.rows[0] });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat jadwal konten.', error: error.message });
  }
});

// PUT /api/posts/:id (Edit Jadwal Konten)
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, caption, platform, category, color_label, scheduled_at, status, stage, thumbnail_url, media_url } = req.body;

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const pIndex = store.content_posts.findIndex((p) => p.id === parseInt(id, 10));
      if (pIndex === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });

      if (judul) store.content_posts[pIndex].judul = judul.trim();
      if (caption !== undefined) store.content_posts[pIndex].caption = caption;
      if (platform) store.content_posts[pIndex].platform = platform;
      if (category) store.content_posts[pIndex].category = category;
      if (color_label) store.content_posts[pIndex].color_label = color_label;
      if (scheduled_at) store.content_posts[pIndex].scheduled_at = new Date(scheduled_at).toISOString();
      if (status) store.content_posts[pIndex].status = status;
      if (stage) store.content_posts[pIndex].stage = stage;
      if (thumbnail_url !== undefined) store.content_posts[pIndex].thumbnail_url = thumbnail_url;
      if (media_url !== undefined) store.content_posts[pIndex].media_url = media_url;
      store.content_posts[pIndex].updated_at = new Date().toISOString();
      db.saveStore();

      return res.json({ success: true, message: 'Jadwal konten berhasil diperbarui.', data: store.content_posts[pIndex] });
    }

    const query = `
      UPDATE content_posts
      SET judul = COALESCE($1, judul),
          caption = COALESCE($2, caption),
          platform = COALESCE($3, platform),
          category = COALESCE($4, category),
          color_label = COALESCE($5, color_label),
          scheduled_at = COALESCE($6, scheduled_at),
          status = COALESCE($7, status),
          stage = COALESCE($8, stage),
          thumbnail_url = COALESCE($9, thumbnail_url),
          media_url = COALESCE($10, media_url),
          updated_at = NOW()
      WHERE id = $11
      RETURNING *;
    `;
    const result = await db.query(query, [judul, caption, platform, category, color_label, scheduled_at, status, stage, thumbnail_url, media_url, id]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    res.json({ success: true, message: 'Jadwal konten berhasil diperbarui.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal konten.', error: error.message });
  }
});

// PATCH /api/posts/:id/stage (UPDATE STAGE KANBAN DRAG & DROP - TERSIMPAN PERMANEN)
app.patch('/api/posts/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, order_position } = req.body;

    const validStages = ['backlog', 'design', 'ready', 'scheduled'];
    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: `Tahap tidak valid. Pilih dari: ${validStages.join(', ')}` });
    }

    // VALIDASI TIER: Drag & Drop Planner dikunci total untuk Paket Free
    let postUserId = 1;
    if (db.isPostgres && db.isPostgres()) {
      const pCheck = await db.query('SELECT user_id FROM content_posts WHERE id = $1', [id]);
      if (pCheck.rows.length > 0) postUserId = pCheck.rows[0].user_id;
    } else {
      const store = db.getStore ? db.getStore() : null;
      const p = store?.content_posts?.find((x) => x.id === parseInt(id, 10));
      if (p) postUserId = p.user_id;
    }
    const tier = await getUserSubscriptionTier(postUserId);
    if (tier === 'free') {
      return res.status(403).json({
        success: false,
        code: 'FEATURE_LOCKED_DRAG_DROP',
        message: 'Fitur Drag & Drop Planner terkunci pada Paket Free. Silakan upgrade ke Paket Pro atau Plus untuk membuka akses penuh.',
      });
    }

    const store = db.getStore ? db.getStore() : null;
    if (store) {
      const pIndex = store.content_posts.findIndex((p) => p.id === parseInt(id, 10));
      if (pIndex === -1) return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });

      store.content_posts[pIndex].stage = stage;
      if (order_position !== undefined) store.content_posts[pIndex].order_position = parseInt(order_position, 10);
      store.content_posts[pIndex].updated_at = new Date().toISOString();
      db.saveStore();

      return res.json({
        success: true,
        message: `Posisi kartu berhasil dipindahkan ke tahapan '${stage}' dan tersimpan permanen di database.`,
        data: store.content_posts[pIndex],
      });
    }

    const query = `
      UPDATE content_posts 
      SET stage = $1, 
          order_position = COALESCE($2, order_position),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    const result = await db.query(query, [stage, order_position, id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Post tidak ditemukan' });

    res.json({
      success: true,
      message: `Posisi kartu berhasil dipindahkan ke tahapan '${stage}' dan tersimpan permanen di database.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memindahkan kartu planner', error: error.message });
  }
});

// DELETE /api/posts/:id (Hapus Postingan)
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      const pIndex = store.content_posts.findIndex((p) => p.id === parseInt(id, 10));
      if (pIndex === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      const deleted = store.content_posts.splice(pIndex, 1)[0];
      db.saveStore();
      return res.json({ success: true, message: `Jadwal '${deleted.judul}' berhasil dihapus.` });
    }

    const result = await db.query('DELETE FROM content_posts WHERE id = $1 RETURNING id, judul', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    res.json({ success: true, message: `Jadwal '${result.rows[0].judul}' berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal', error: error.message });
  }
});

// ==========================================
// 5B. SCHEDULES API (TABEL SCHEDULES NEON)
// Sinkronisasi jadwal, validasi tier, dan notification tracking
// ==========================================

// GET /api/schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT * FROM schedules';
    const params = [];
    if (user_id) {
      query += ' WHERE user_id = $1';
      params.push(parseInt(user_id, 10));
    }
    query += ' ORDER BY start_time ASC';

    if (db.isPostgres && db.isPostgres()) {
      const result = await db.query(query, params);
      return res.json({ success: true, count: result.rows.length, data: result.rows });
    }

    const store = db.getStore ? db.getStore() : null;
    let scheds = store?.schedules || [];
    if (user_id) {
      scheds = scheds.filter((s) => s.user_id === parseInt(user_id, 10));
    }
    res.json({ success: true, count: scheds.length, data: scheds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat jadwal', error: error.message });
  }
});

// GET /api/schedules/:id
app.get('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isPostgres && db.isPostgres()) {
      const result = await db.query('SELECT * FROM schedules WHERE id = $1', [id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      return res.json({ success: true, data: result.rows[0] });
    }
    const store = db.getStore ? db.getStore() : null;
    const item = (store?.schedules || []).find((s) => s.id === parseInt(id, 10));
    if (!item) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail jadwal', error: error.message });
  }
});

// POST /api/schedules
app.post('/api/schedules', async (req, res) => {
  try {
    const {
      user_id = 1,
      title,
      description = '',
      platform = 'Instagram',
      category = 'Promosi',
      start_time = new Date().toISOString(),
      end_time = null,
      kanban_column = 'backlog',
      color_label = 'bg-blue-50 text-blue-700 border-blue-200',
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Judul agenda wajib diisi.' });
    }

    const resolvedUserId = parseInt(user_id, 10) || 1;

    // VALIDASI TIER: Jika Paket Free, batasi maksimal 3 agenda per minggu
    const tier = await getUserSubscriptionTier(resolvedUserId);
    if (tier === 'free') {
      const weeklyCount = await getWeeklyAgendaCountForUser(resolvedUserId, start_time);
      if (weeklyCount >= 3) {
        return res.status(403).json({
          success: false,
          code: 'FREE_WEEKLY_LIMIT_REACHED',
          message: 'Batas kuota tercapai! Paket Free hanya dapat menjadwalkan maksimal 3 agenda per minggu. Silakan upgrade ke Paket Pro atau Plus untuk menjadwalkan konten tanpa batas.',
          limit: 3,
          current_count: weeklyCount,
        });
      }
    }

    const startIso = new Date(start_time).toISOString();
    const endIso = end_time ? new Date(end_time).toISOString() : null;

    if (db.isPostgres && db.isPostgres()) {
      const insertQuery = `
        INSERT INTO schedules (user_id, title, description, platform, category, start_time, end_time, kanban_column, color_label, notification_sent, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, NOW(), NOW())
        RETURNING *;
      `;
      const result = await db.query(insertQuery, [
        resolvedUserId,
        title.trim(),
        description.trim(),
        platform,
        category,
        startIso,
        endIso,
        kanban_column,
        color_label,
      ]);

      // Mirror ke content_posts agar kalender dan drag-drop kanban tetap konsisten
      try {
        await db.query(`
          INSERT INTO content_posts (user_id, judul, caption, platform, category, color_label, scheduled_at, status, stage, order_position, notification_sent, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'Scheduled', $8, 0, FALSE, NOW(), NOW())
        `, [resolvedUserId, title.trim(), description.trim(), platform, category, color_label, startIso, kanban_column]);
      } catch (e) {
        console.warn('Sync to content_posts warning:', e.message);
      }

      return res.status(201).json({ success: true, message: 'Agenda baru berhasil dijadwalkan.', data: result.rows[0] });
    }

    // Local fallback store
    const store = db.getStore ? db.getStore() : null;
    if (store) {
      if (!store.schedules) store.schedules = [];
      const newId = store.schedules.length ? Math.max(...store.schedules.map((s) => s.id)) + 1 : 1;
      const newSched = {
        id: newId,
        user_id: resolvedUserId,
        title: title.trim(),
        description: description.trim(),
        platform,
        category,
        start_time: startIso,
        end_time: endIso,
        kanban_column,
        color_label,
        notification_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.schedules.push(newSched);
      db.saveStore();
      return res.status(201).json({ success: true, message: 'Agenda baru berhasil dijadwalkan.', data: newSched });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal membuat agenda jadwal', error: error.message });
  }
});

// PUT /api/schedules/:id
app.put('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, platform, category, start_time, end_time, kanban_column, color_label } = req.body;

    if (db.isPostgres && db.isPostgres()) {
      const updateQuery = `
        UPDATE schedules
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            platform = COALESCE($3, platform),
            category = COALESCE($4, category),
            start_time = COALESCE($5, start_time),
            end_time = COALESCE($6, end_time),
            kanban_column = COALESCE($7, kanban_column),
            color_label = COALESCE($8, color_label),
            updated_at = NOW()
        WHERE id = $9
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [
        title ? title.trim() : null,
        description !== undefined ? description.trim() : null,
        platform,
        category,
        start_time ? new Date(start_time).toISOString() : null,
        end_time ? new Date(end_time).toISOString() : null,
        kanban_column,
        color_label,
        id,
      ]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      return res.json({ success: true, message: 'Jadwal berhasil diperbarui.', data: result.rows[0] });
    }

    const store = db.getStore ? db.getStore() : null;
    if (store && store.schedules) {
      const idx = store.schedules.findIndex((s) => s.id === parseInt(id, 10));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      if (title) store.schedules[idx].title = title.trim();
      if (description !== undefined) store.schedules[idx].description = description.trim();
      if (platform) store.schedules[idx].platform = platform;
      if (category) store.schedules[idx].category = category;
      if (start_time) store.schedules[idx].start_time = new Date(start_time).toISOString();
      if (end_time !== undefined) store.schedules[idx].end_time = end_time ? new Date(end_time).toISOString() : null;
      if (kanban_column) store.schedules[idx].kanban_column = kanban_column;
      if (color_label) store.schedules[idx].color_label = color_label;
      store.schedules[idx].updated_at = new Date().toISOString();
      db.saveStore();
      return res.json({ success: true, message: 'Jadwal berhasil diperbarui.', data: store.schedules[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal', error: error.message });
  }
});

// PATCH /api/schedules/:id
app.patch('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { kanban_column, start_time } = req.body;

    // Cek tier user jika memindahkan kolom kanban
    if (kanban_column) {
      let schedUserId = 1;
      if (db.isPostgres && db.isPostgres()) {
        const sCheck = await db.query('SELECT user_id FROM schedules WHERE id = $1', [id]);
        if (sCheck.rows.length > 0) schedUserId = sCheck.rows[0].user_id;
      }
      const tier = await getUserSubscriptionTier(schedUserId);
      if (tier === 'free') {
        return res.status(403).json({
          success: false,
          code: 'FEATURE_LOCKED_DRAG_DROP',
          message: 'Fitur Drag & Drop Planner terkunci pada Paket Free. Silakan upgrade ke Paket Pro atau Plus untuk membuka akses penuh.',
        });
      }
    }

    if (db.isPostgres && db.isPostgres()) {
      const result = await db.query(
        `UPDATE schedules 
         SET kanban_column = COALESCE($1, kanban_column),
             start_time = COALESCE($2, start_time),
             updated_at = NOW()
         WHERE id = $3
         RETURNING *;`,
        [kanban_column || null, start_time ? new Date(start_time).toISOString() : null, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      return res.json({ success: true, message: 'Jadwal berhasil diperbarui.', data: result.rows[0] });
    }

    const store = db.getStore ? db.getStore() : null;
    if (store && store.schedules) {
      const idx = store.schedules.findIndex((s) => s.id === parseInt(id, 10));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      if (kanban_column) store.schedules[idx].kanban_column = kanban_column;
      if (start_time) store.schedules[idx].start_time = new Date(start_time).toISOString();
      store.schedules[idx].updated_at = new Date().toISOString();
      db.saveStore();
      return res.json({ success: true, message: 'Jadwal berhasil diperbarui.', data: store.schedules[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal', error: error.message });
  }
});

// DELETE /api/schedules/:id
app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (db.isPostgres && db.isPostgres()) {
      const result = await db.query('DELETE FROM schedules WHERE id = $1 RETURNING id, title', [id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      return res.json({ success: true, message: `Jadwal '${result.rows[0].title}' berhasil dihapus.` });
    }
    const store = db.getStore ? db.getStore() : null;
    if (store && store.schedules) {
      const idx = store.schedules.findIndex((s) => s.id === parseInt(id, 10));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan' });
      const del = store.schedules.splice(idx, 1)[0];
      db.saveStore();
      return res.json({ success: true, message: `Jadwal '${del.title}' berhasil dihapus.` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal', error: error.message });
  }
});

// ==========================================
// 6. KONTEN UNIVERSAL & HALAMAN STATIS
// Syarat & Ketentuan, Kebijakan & Privasi, Kerja Sama (Canva), Blog, About
// ==========================================

// Helper universal CRUD generator
function registerUniversalContentRoutes(endpointPath, tableName, entityName) {
  // GET ALL
  app.get(`/api/content/${endpointPath}`, async (req, res) => {
    try {
      const store = db.getStore ? db.getStore() : null;
      if (store && store[tableName]) {
        return res.json({ success: true, count: store[tableName].length, data: store[tableName] });
      }
      const result = await db.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      res.status(500).json({ success: false, message: `Gagal memuat ${entityName}`, error: error.message });
    }
  });

  // GET ONE BY SLUG OR ID
  app.get(`/api/content/${endpointPath}/:slugOrId`, async (req, res) => {
    try {
      const { slugOrId } = req.params;
      const isNum = /^\d+$/.test(slugOrId);
      const store = db.getStore ? db.getStore() : null;

      if (store && store[tableName]) {
        const item = store[tableName].find((x) => (isNum && x.id === parseInt(slugOrId, 10)) || x.slug === slugOrId);
        if (!item) return res.status(404).json({ success: false, message: `${entityName} tidak ditemukan` });
        return res.json({ success: true, data: item });
      }

      const query = `SELECT * FROM ${tableName} WHERE ${isNum ? 'id = $1 OR slug = $1' : 'slug = $1'}`;
      const result = await db.query(query, [slugOrId]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: `${entityName} tidak ditemukan` });
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: `Gagal memuat detail ${entityName}`, error: error.message });
    }
  });

  // POST (CREATE)
  app.post(`/api/content/${endpointPath}`, async (req, res) => {
    try {
      const { title, slug, description, image_url, author = 'ContentHub Team', category = 'Umum' } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Judul dan konten wajib diisi.' });
      }

      const generatedSlug = slug ? slug.trim().toLowerCase().replace(/\s+/g, '-') : title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const store = db.getStore ? db.getStore() : null;

      if (store && store[tableName]) {
        const newId = store[tableName].length ? Math.max(...store[tableName].map((x) => x.id)) + 1 : 1;
        const newObj = {
          id: newId,
          title: title.trim(),
          slug: generatedSlug,
          description,
          image_url: image_url || null,
          author,
          category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        store[tableName].push(newObj);
        if (tableName === 'articles') {
          store.article_logs = store.article_logs || [];
          store.article_logs.unshift({
            id: store.article_logs.length + 1,
            article_id: newObj.id,
            article_title: newObj.title,
            admin_name: author || 'Admin ContentHub',
            action: 'CREATE',
            created_at: new Date().toISOString()
          });
        }
        db.saveStore();
        return res.status(201).json({ success: true, message: `${entityName} berhasil ditambahkan.`, data: newObj });
      }

      const query = `
        INSERT INTO ${tableName} (title, slug, description, image_url, author, category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *;
      `;
      const result = await db.query(query, [title.trim(), generatedSlug, description, image_url, author, category]);
      if (tableName === 'articles' && result.rows[0]) {
        db.query(
          'INSERT INTO article_logs (article_id, article_title, admin_name, action) VALUES ($1, $2, $3, $4)',
          [result.rows[0].id, result.rows[0].title, author || 'Admin ContentHub', 'CREATE']
        ).catch((e) => console.warn('Gagal mencatat log create artikel:', e.message));
      }
      res.status(201).json({ success: true, message: `${entityName} berhasil ditambahkan.`, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: `Gagal menambahkan ${entityName}`, error: error.message });
    }
  });

  // PUT (UPDATE)
  app.put(`/api/content/${endpointPath}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, slug, description, image_url, author, category } = req.body;

      const store = db.getStore ? db.getStore() : null;
      if (store && store[tableName]) {
        const index = store[tableName].findIndex((x) => x.id === parseInt(id, 10));
        if (index === -1) return res.status(404).json({ success: false, message: `${entityName} tidak ditemukan` });

        if (title) store[tableName][index].title = title.trim();
        if (slug) store[tableName][index].slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
        if (description !== undefined) store[tableName][index].description = description;
        if (image_url !== undefined) store[tableName][index].image_url = image_url;
        if (author) store[tableName][index].author = author;
        if (category) store[tableName][index].category = category;
        store[tableName][index].updated_at = new Date().toISOString();
        if (tableName === 'articles') {
          store.article_logs = store.article_logs || [];
          store.article_logs.unshift({
            id: store.article_logs.length + 1,
            article_id: parseInt(id, 10),
            article_title: store[tableName][index].title,
            admin_name: author || 'Admin ContentHub',
            action: 'UPDATE',
            created_at: new Date().toISOString()
          });
        }
        db.saveStore();

        return res.json({ success: true, message: `${entityName} berhasil diperbarui.`, data: store[tableName][index] });
      }

      const query = `
        UPDATE ${tableName}
        SET title = COALESCE($1, title),
            slug = COALESCE($2, slug),
            description = COALESCE($3, description),
            image_url = COALESCE($4, image_url),
            author = COALESCE($5, author),
            category = COALESCE($6, category),
            updated_at = NOW()
        WHERE id = $7
        RETURNING *;
      `;
      const result = await db.query(query, [title, slug, description, image_url, author, category, id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: `${entityName} tidak ditemukan` });

      if (tableName === 'articles') {
        db.query(
          'INSERT INTO article_logs (article_id, article_title, admin_name, action) VALUES ($1, $2, $3, $4)',
          [id, result.rows[0].title, author || 'Admin ContentHub', 'UPDATE']
        ).catch((e) => console.warn('Gagal mencatat log update artikel:', e.message));
      }

      res.json({ success: true, message: `${entityName} berhasil diperbarui.`, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: `Gagal memperbarui ${entityName}`, error: error.message });
    }
  });

  // DELETE
  app.delete(`/api/content/${endpointPath}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const adminName = req.headers['x-admin-name'] || 'Admin ContentHub';
      const store = db.getStore ? db.getStore() : null;

      if (store && store[tableName]) {
        const index = store[tableName].findIndex((x) => x.id === parseInt(id, 10));
        if (index === -1) return res.status(404).json({ success: false, message: `${entityName} tidak ditemukan` });
        const deleted = store[tableName].splice(index, 1)[0];
        if (tableName === 'articles') {
          store.article_logs = store.article_logs || [];
          store.article_logs.unshift({
            id: store.article_logs.length + 1,
            article_id: parseInt(id, 10),
            article_title: deleted.title,
            admin_name: adminName,
            action: 'DELETE',
            created_at: new Date().toISOString()
          });
        }
        db.saveStore();
        return res.json({ success: true, message: `${entityName} '${deleted.title}' berhasil dihapus.` });
      }

      const result = await db.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING id, title`, [id]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: `${entityName} tidak ditemukan` });

      if (tableName === 'articles') {
        db.query(
          'INSERT INTO article_logs (article_id, article_title, admin_name, action) VALUES ($1, $2, $3, $4)',
          [id, result.rows[0].title, adminName, 'DELETE']
        ).catch((e) => console.warn('Gagal mencatat log delete artikel:', e.message));
      }

      res.json({ success: true, message: `${entityName} '${result.rows[0].title}' berhasil dihapus.` });
    } catch (error) {
      res.status(500).json({ success: false, message: `Gagal menghapus ${entityName}`, error: error.message });
    }
  });
}

// Daftarkan route universal untuk masing-masing konten dinamis
registerUniversalContentRoutes('terms', 'terms_conditions', 'Syarat & Ketentuan');
registerUniversalContentRoutes('privacy', 'privacy_policies', 'Kebijakan & Privasi');
registerUniversalContentRoutes('partnerships', 'partnerships', 'Kerja Sama & Integrasi Canva');
registerUniversalContentRoutes('articles', 'articles', 'Artikel Blog');
registerUniversalContentRoutes('about', 'about_content', 'Konten Halaman About');

// Endpoint Audit Log Artikel (Mencatat semua aksi Admin)
app.get('/api/article-logs', async (req, res) => {
  try {
    const store = db.getStore ? db.getStore() : null;
    if (store && store.article_logs) {
      return res.json({ success: true, count: store.article_logs.length, data: store.article_logs });
    }
    const r = await db.query('SELECT * FROM article_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, count: r.rows.length, data: r.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat log artikel', error: err.message });
  }
});

// ==========================================
// 7. PENGATURAN WEB (WEB SETTINGS)
// General, Email System (SMTP & Templates), Payment Gateway
// ==========================================

// GET /api/settings
app.get('/api/settings', async (req, res) => {
  try {
    const store = db.getStore ? db.getStore() : null;
    if (store && store.web_settings) {
      return res.json({ success: true, data: store.web_settings });
    }

    const result = await db.query('SELECT key, value FROM web_settings');
    const settings = {};
    result.rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat pengaturan web', error: error.message });
  }
});

// PUT /api/settings/general (General Settings: Tagline, Deskripsi, Logo, Favicon, Kontak)
app.put('/api/settings/general', async (req, res) => {
  try {
    const payload = req.body;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      store.web_settings.general = { ...store.web_settings.general, ...payload };
      db.saveStore();
      return res.json({ success: true, message: 'Pengaturan umum website berhasil disimpan.', data: store.web_settings.general });
    }

    await db.query(
      `INSERT INTO web_settings (key, value, updated_at) VALUES ('general', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW();`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, message: 'Pengaturan umum website berhasil disimpan.', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan umum', error: error.message });
  }
});

// PUT /api/settings/email (Email System: SMTP & Templates)
app.put('/api/settings/email', async (req, res) => {
  try {
    const payload = req.body;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      store.web_settings.email = { ...store.web_settings.email, ...payload };
      db.saveStore();
      return res.json({ success: true, message: 'Konfigurasi SMTP dan Template Email berhasil disimpan.', data: store.web_settings.email });
    }

    await db.query(
      `INSERT INTO web_settings (key, value, updated_at) VALUES ('email', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW();`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, message: 'Konfigurasi SMTP dan Template Email berhasil disimpan.', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan konfigurasi email', error: error.message });
  }
});

// POST /api/settings/email/test (Kirim Test Email SMTP)
app.post('/api/settings/email/test', async (req, res) => {
  try {
    const { test_email = 'customer@example.com' } = req.body;
    const subject = 'Test Pengiriman Email Sistem ContentHub';
    const bodyText = `Halo!\n\nIni adalah email uji coba dari panel Admin Pengaturan Email ContentHub.\nKredensial SMTP dan sistem pengiriman notifikasi berfungsi secara normal.\n\nSalam,\nTim Pengembang Amigos`;

    await sendEmailNotification(test_email, subject, bodyText, 'general');
    res.json({ success: true, message: `Email uji coba berhasil dikirim ke ${test_email}. Cek log server atau kotak masuk Anda.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengirim test email', error: error.message });
  }
});

// PUT /api/settings/payment-gateway (Payment Gateway: Mode & Credentials)
app.put('/api/settings/payment-gateway', async (req, res) => {
  try {
    const payload = req.body;
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      store.web_settings.payment_gateway = { ...store.web_settings.payment_gateway, ...payload };
      db.saveStore();
      return res.json({ success: true, message: 'Kredensial Payment Gateway & Transaksi berhasil disimpan.', data: store.web_settings.payment_gateway });
    }

    await db.query(
      `INSERT INTO web_settings (key, value, updated_at) VALUES ('payment_gateway', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW();`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, message: 'Kredensial Payment Gateway & Transaksi berhasil disimpan.', data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan kredensial payment gateway', error: error.message });
  }
});

// ==========================================
// 8. ADMIN STATISTIK (DASHBOARD STATS)
// ==========================================
app.get('/api/admin/stats', async (req, res) => {
  try {
    const store = db.getStore ? db.getStore() : null;

    if (store) {
      const paidOrders = store.orders.filter((o) => o.status === 'Paid');
      const pendingOrders = store.orders.filter((o) => o.status === 'Pending');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const totalUsers = store.users.length;
      const totalCustomers = store.users.filter((u) => u.role === 'customer').length;
      const scheduledPosts = store.content_posts.filter((p) => p.status === 'Scheduled').length;

      return res.json({
        success: true,
        data: {
          total_revenue: totalRevenue,
          total_orders: store.orders.length,
          paid_orders: paidOrders.length,
          pending_orders: pendingOrders.length,
          total_users: totalUsers,
          total_customers: totalCustomers,
          scheduled_posts: scheduledPosts,
        },
      });
    }

    const revenueQuery = `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status = 'Paid';`;
    const ordersCountQuery = `SELECT COUNT(*) AS total_orders, COUNT(CASE WHEN status = 'Paid' THEN 1 END) AS paid_orders, COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_orders FROM orders;`;
    const usersCountQuery = `SELECT COUNT(*) AS total_users, COUNT(CASE WHEN role = 'customer' THEN 1 END) AS total_customers FROM users;`;

    const [revenueRes, ordersRes, usersRes] = await Promise.all([db.query(revenueQuery), db.query(ordersCountQuery), db.query(usersCountQuery)]);

    res.json({
      success: true,
      data: {
        total_revenue: parseFloat(revenueRes.rows[0].total_revenue),
        total_orders: parseInt(ordersRes.rows[0].total_orders, 10),
        paid_orders: parseInt(ordersRes.rows[0].paid_orders, 10),
        pending_orders: parseInt(ordersRes.rows[0].pending_orders, 10),
        total_users: parseInt(usersRes.rows[0].total_users, 10),
        total_customers: parseInt(usersRes.rows[0].total_customers, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard', error: error.message });
  }
});

// Jalankan Server Backend dengan fallback port otomatis jika port default terisi
function startServer(portToUse) {
  const currentPort = parseInt(portToUse, 10) || 5000;
  const server = app.listen(currentPort, () => {
    console.log(`🚀 ContentHub Backend Server v2.0 aktif pada http://localhost:${currentPort}`);
    console.log(`📡 Status Database: ${db.isPostgres ? (db.isPostgres() ? 'Neon PostgreSQL Connected' : 'Local Fallback Storage Active') : 'Active'}`);
    
    // Inisialisasi background cron scheduler notifikasi otomatis presisi menit
    initNotificationScheduler();
  });

  server.on('error', (err) => {
    if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && currentPort < 5010) {
      const nextPort = currentPort + 1;
      console.warn(`⚠️  Port ${currentPort} sedang digunakan / diblokir (${err.code}). Mencoba port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server listen error:', err);
    }
  });
}

startServer(PORT);