from django.urls import path
from . import views

app_name = 'fake_store_api'

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('productos/', views.obtener_productos, name='obtener_productos'),
    
    # --- RUTAS UNIFICADAS ---
    # Para mostrar el formulario de agregar un nuevo producto
    path('producto/nuevo/', views.gestionar_producto, name='agregar_producto'),
    
    # Para mostrar el formulario de edición de un producto existente
    path('producto/editar/<int:producto_id>/', views.gestionar_producto, name='editar_producto'),
    
    # --- RUTA PARA LA API DE ELIMINACIÓN ---
    path('eliminar_producto/', views.eliminar_producto, name='eliminar_producto'),
]
