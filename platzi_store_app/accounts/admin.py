from django.contrib import admin
from django.apps import AppConfig
# Register your models here.

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'