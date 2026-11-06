"""
WSGI config untuk proyek ContentHub.
Menghubungkan aplikasi web Django ke web server (seperti Gunicorn / Nginx).
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contenthub_project.settings')

application = get_wsgi_application()
