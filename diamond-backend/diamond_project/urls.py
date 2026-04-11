# diamond_project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('rings.urls')),
        path('api/chat/', include('rings.chatbot.urls')),   # ← ADD THIS LINE

]