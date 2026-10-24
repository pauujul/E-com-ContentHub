import React, { useState } from 'react';

export default function CalendarPreview() {
  const [items, setItems] = useState([
    { id: 1, day: 'Senin', title: 'Tips Memilih Donat Lembut Tanpa Pengawet', tag: 'Edukasi', time: '09:00', channel: 'Instagram Feed' },
    { id: 2, day: 'Rabu', title: 'Promo Beli 1 Lusin Gratis 2 Rasa Coklat Lumer', tag: 'Promosi', time: '13:00', channel: 'TikTok Video' },
    { id: 3, day: 'Jumat', title: 'Behind the Scenes: Dapur Produksi Donat Fresh', tag: 'Storytelling', time: '17:00', channel: 'Instagram Reels' },
    { id: 4, day: 'Sabtu', title: 'Kuis Tebak Rasa Donat Berhadiah Voucher', tag: 'Engagement', time: '19:30', channel: 'WhatsApp Story' },
  ]);

  return (
    <div className="container" style={{ padding: '32px 20px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          📅 Interactive Content Calendar (Fitur Pembeda SaaS)
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '650px', margin: '0 auto' }}>
          Membantu pelaku UMKM menyusun jadwal posting mingguan dengan sistem visual, pengingat otomatis, dan template siap pakai.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {items.map((item) => (
          <div 
            key={item.id}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ 
                  background: '#e0e7ff', 
                  color: '#4338ca', 
                  fontWeight: 700, 
                  fontSize: '12px', 
                  padding: '4px 10px', 
                  borderRadius: '6px' 
                }}>
                  {item.day} • {item.time} WIB
                </span>
                <span style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: 600 }}>
                  {item.channel}
                </span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                {item.title}
              </h4>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                background: '#f1f5f9', 
                color: '#475569', 
                fontSize: '11px', 
                fontWeight: 600, 
                padding: '3px 8px', 
                borderRadius: '4px' 
              }}>
                Tag: {item.tag}
              </span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                🔔 Pengingat Aktif
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '16px 20px',
        marginTop: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>💡</span>
        <p style={{ fontSize: '14px', color: '#1e40af' }}>
          <strong>Catatan Nilai Bisnis (Value Proposition):</strong> Fitur ini memecahkan masalah utama UMKM (keterbatasan ide dan inkonsistensi waktu posting) sesuai model bisnis yang dirancang Amigos Team.
        </p>
      </div>
    </div>
  );
}
