/**
 * Helper untuk format waktu lengkap zona waktu WITA (Asia/Makassar)
 * Format keluaran: "Rabu, 18 November 2026 • 10:23 WITA"
 *
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function formatWitaDateTime(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const datePart = dateFormatter.format(date);
  const timePart = timeFormatter.format(date).replace('.', ':');

  return `${datePart} • ${timePart} WITA`;
}

export default {
  formatWitaDateTime,
};
