import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch jadwal dari database berdasarkan user yang login
  const loadSchedules = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSchedules(currentUser.id);
      if (res.success) {
        setSchedules(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat jadwal:', err);
      setError(err.message || 'Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Auto-load saat user pertama kali login / berubah
  useEffect(() => {
    if (currentUser?.id) {
      loadSchedules();
    } else {
      setSchedules([]);
    }
  }, [currentUser?.id, loadSchedules]);

  // Buat jadwal baru → POST ke API → update state lokal
  const addSchedule = useCallback(async (scheduleData) => {
    if (!currentUser?.id) throw new Error('Pengguna belum login.');
    const payload = { user_id: currentUser.id, ...scheduleData };
    const res = await api.createSchedule(payload);
    if (res.success) {
      setSchedules((prev) => [...prev, res.data]);
      return res.data;
    }
    throw new Error(res.message || 'Gagal membuat jadwal');
  }, [currentUser?.id]);

  // Update jadwal (termasuk drag-drop posisi kanban) → PATCH ke API → update state lokal
  const updateScheduleItem = useCallback(async (id, data) => {
    const res = await api.updateSchedule(id, data);
    if (res.success) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...res.data } : s))
      );
      return res.data;
    }
    throw new Error(res.message || 'Gagal memperbarui jadwal');
  }, []);

  // Hapus jadwal → DELETE ke API → hapus dari state lokal
  const deleteScheduleItem = useCallback(async (id) => {
    const res = await api.deleteSchedule(id);
    if (res.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      return true;
    }
    throw new Error(res.message || 'Gagal menghapus jadwal');
  }, []);

  // Helper: ambil jadwal berdasarkan kolom kanban
  const getSchedulesByColumn = useCallback(
    (column) => schedules.filter((s) => s.kanban_column === column),
    [schedules]
  );

  // Helper: ambil jadwal berdasarkan tanggal (untuk kalender)
  const getSchedulesByDate = useCallback(
    (dateStr) => {
      return schedules.filter((s) => {
        if (!s.start_time) return false;
        const schedDate = new Date(s.start_time);
        const d = `${schedDate.getFullYear()}-${String(schedDate.getMonth() + 1).padStart(2, '0')}-${String(schedDate.getDate()).padStart(2, '0')}`;
        return d === dateStr;
      });
    },
    [schedules]
  );

  const value = {
    schedules,
    loading,
    error,
    loadSchedules,
    addSchedule,
    updateScheduleItem,
    deleteScheduleItem,
    getSchedulesByColumn,
    getSchedulesByDate,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule harus digunakan di dalam ScheduleProvider');
  }
  return context;
}

export default ScheduleContext;
