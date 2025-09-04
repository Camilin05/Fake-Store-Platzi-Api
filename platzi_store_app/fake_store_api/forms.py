from django import forms 
import requests

class AgregarProductoForm(forms.Form):
    # Obtener categorías dinámicamente
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            # Intentar obtener categorías de la API
            response = requests.get("https://api.escuelajs.co/api/v1/categories", timeout=10)
            if response.status_code == 200:
                categorias = response.json()
                choices = [(cat['id'], cat['name']) for cat in categorias[:10]]  # Limitar a 10
                self.fields['categoria'].choices = choices
            else:
                # Categorías por defecto si falla la API
                self.fields['categoria'].choices = [
                    (1, 'Ropa'),
                    (2, 'Electrónicos'),
                    (3, 'Muebles'),
                    (4, 'Zapatos'),
                    (5, 'Otros')
                ]
        except:
            # Categorías por defecto en caso de error
            self.fields['categoria'].choices = [
                (1, 'Ropa'),
                (2, 'Electrónicos'),
                (3, 'Muebles'),
                (4, 'Zapatos'),
                (5, 'Otros')
            ]

    titulo = forms.CharField(
        max_length=100, 
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingresa el título del producto',
            'id': 'titulo'
        }),
        label='Título del Producto'
    )
    
    precio = forms.FloatField(
        required=True,
        min_value=0.01,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': '0.00 $',
            'step': '0.01',
            'min': '0.01',
            'id': 'precio'
        }),
        label='Precio (USD)'
    )
    
    descripcion = forms.CharField(
        max_length=500, 
        required=True,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Describe detalladamente el producto...',
            'rows': 4,
            'id': 'descripcion'
        }),
        label='Descripción del Producto'
    )
    
    categoria = forms.ChoiceField(
        required=True,
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'categoria'
        }),
        label='Categoría'
    )
    
    imagen1 = forms.URLField(
        required=True,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'https://ejemplo.com/imagen1.jpg',
            'id': 'imagen1'
        }),
        label='URL Imagen Principal'
    )
    
    imagen2 = forms.URLField(
        required=False,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'https://ejemplo.com/imagen2.jpg (opcional)',
            'id': 'imagen2'
        }),
        label='URL Imagen Secundaria'
    )
    
    imagen3 = forms.URLField(
        required=False,
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'https://ejemplo.com/imagen3.jpg (opcional)',
            'id': 'imagen3'
        }),
        label='URL Imagen Adicional'
    )

    def clean_precio(self):
        precio = self.cleaned_data['precio']
        if precio <= 0:
            raise forms.ValidationError("El precio debe ser mayor a 0")
        if precio > 999999:
            raise forms.ValidationError("El precio no puede ser mayor a $999,999")
        return precio

    def clean_titulo(self):
        titulo = self.cleaned_data['titulo'].strip()
        if len(titulo) < 3:
            raise forms.ValidationError("El título debe tener al menos 3 caracteres")
        return titulo

    def clean_descripcion(self):
        descripcion = self.cleaned_data['descripcion'].strip()
        if len(descripcion) < 10:
            raise forms.ValidationError("La descripción debe tener al menos 10 caracteres")
        return descripcion

    def clean_imagen1(self):
        imagen = self.cleaned_data['imagen1']
        # Validar que la URL termine en una extensión de imagen común
        valid_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp')
        if not any(imagen.lower().endswith(ext) for ext in valid_extensions):
            raise forms.ValidationError("La URL debe apuntar a una imagen válida (.jpg, .png, .gif, etc.)")
        return imagen

    def get_images_list(self):
        """Retorna lista de imágenes no vacías"""
        images = []
        if self.cleaned_data.get('imagen1'):
            images.append(self.cleaned_data['imagen1'])
        if self.cleaned_data.get('imagen2'):
            images.append(self.cleaned_data['imagen2'])
        if self.cleaned_data.get('imagen3'):
            images.append(self.cleaned_data['imagen3'])
        return images