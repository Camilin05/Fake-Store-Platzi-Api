from django.urls import path
from . import views
app_name = 'fake_store_api'
urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('obtener-productos/', views.obtener_productos, name='obtener_productos'),
    path('agregar-producto/', views.agregar_producto, name='agregar_producto'),
    path('agregar-producto-api/', views.agregar_producto_api, name='agregar_producto_api'),
    path('editar_producto/', views.editar_producto, name='editar_producto'),
    path('editar_producto_api/', views.editar_producto_api, name='editar_producto_api'),
    path('eliminar_producto/', views.eliminar_producto, name='eliminar_producto'),
]