"""
ASGI config untuk proyek ContentHub.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contenthub_project.settings')

application = get_asgi_application()
