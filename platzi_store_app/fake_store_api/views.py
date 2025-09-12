from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
import requests
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import AgregarProductoForm
import json

# URL base de la API para evitar repetición
API_BASE_URL = "https://api.escuelajs.co/api/v1"

def inicio(request):
    """Renderiza la página de inicio."""
    return render(request, 'inicio.html')
@login_required
def obtener_productos(request):
    """Obtiene y muestra todos los productos desde la API."""
    try:
        response_productos = requests.get(f"{API_BASE_URL}/products", timeout=20)
        response_productos.raise_for_status()
        productos = response_productos.json()

        response_categorias = requests.get(f"{API_BASE_URL}/categories", timeout=20)
        response_categorias.raise_for_status()
        categorias = response_categorias.json()
        
        contexto = {
            'success': True,
            'total_mostrados': len(productos),
            'productos': productos,
            'categorias': categorias,
        }
        return render(request, 'obtener_producto.html', contexto)

    except requests.exceptions.RequestException as e:
        messages.error(request, f'Error de conexión con la API: {e}')
        contexto = {'success': False, 'error_message': str(e)}
        return render(request, 'obtener_producto.html', contexto, status=500)

@login_required
def gestionar_producto(request, producto_id=None):
    """
    Vista UNIFICADA para agregar (POST) y editar (PUT) productos.
    """
    es_edicion = producto_id is not None
    initial_data = {}

    if es_edicion:
        try:
            response = requests.get(f"{API_BASE_URL}/products/{producto_id}", timeout=20)
            response.raise_for_status()
            producto_data = response.json()
            initial_data = {
                'titulo': producto_data.get('title', ''),
                'precio': producto_data.get('price', 0),
                'descripcion': producto_data.get('description', ''),
                'categoria': producto_data.get('category', {}).get('id', ''),
                'imagen1': producto_data.get('images', [''])[0] if producto_data.get('images') else ''
            }
        except requests.exceptions.RequestException as e:
            messages.error(request, f'No se pudo obtener el producto. Error: {e}')
            return redirect('fake_store_api:obtener_productos')

    form = AgregarProductoForm(request.POST or None, initial=initial_data)

    if request.method == 'POST' and form.is_valid():
        datos_enviar = {
            "title": form.cleaned_data['titulo'],
            "price": float(form.cleaned_data['precio']),
            "description": form.cleaned_data['descripcion'],
            "categoryId": int(form.cleaned_data['categoria']),
            "images": form.get_images_list()
        }
        
        try:
            if es_edicion:
                response = requests.put(f"{API_BASE_URL}/products/{producto_id}", json=datos_enviar, timeout=20)
                accion_msg = "actualizado"
            else:
                response = requests.post(f"{API_BASE_URL}/products/", json=datos_enviar, timeout=20)
                accion_msg = "agregado"
            
            response.raise_for_status()
            messages.success(request, f'¡Producto "{datos_enviar["title"]}" {accion_msg} exitosamente!')
            return redirect('fake_store_api:obtener_productos')

        except requests.exceptions.HTTPError as e:
            messages.error(request, f'Error de API ({e.response.status_code}): {e.response.text}')
        except requests.exceptions.RequestException as e:
            messages.error(request, f'Error de red: {e}')
    
    contexto = {
        'form': form,
        'es_edicion': es_edicion,
        'producto_id': producto_id
    }
    # --- CAMBIO IMPORTANTE: Apuntar a la plantilla unificada ---
    return render(request, 'producto_formulario.html', contexto)

@login_required 
def eliminar_producto(request):
    """Elimina un producto usando la API."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Solo se permiten solicitudes POST'}, status=405)

    try:
        data = json.loads(request.body)
        producto_id = data.get('id')
        if not producto_id:
            return JsonResponse({'error': 'ID del producto requerido'}, status=400)

        response = requests.delete(f"{API_BASE_URL}/products/{producto_id}", timeout=20)
        response.raise_for_status()

        return JsonResponse({'success': True, 'message': '¡Producto eliminado exitosamente!'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Cuerpo de la solicitud inválido'}, status=400)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return JsonResponse({'error': 'Producto no encontrado en la API'}, status=404)
        return JsonResponse({'error': f'Error de API: {e.response.status_code}'}, status=e.response.status_code)
    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': f'Error de red: {e}'}, status=500)