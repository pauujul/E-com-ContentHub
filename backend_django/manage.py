#!/usr/bin/env python
"""
manage.py - Remote Control Utama Django
Ibarat saklar dan tombol kendali untuk menjalankan server, migrasi database, dan membuat admin.
"""
import os
import sys

def main():
    """Jalankan fungsi manajemen administratif Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contenthub_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Tidak dapat memuat Django. Apakah virtual environment sudah aktif dan Django sudah terinstall?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
