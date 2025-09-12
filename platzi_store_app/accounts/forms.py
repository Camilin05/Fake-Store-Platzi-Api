from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User

# Formulario para la creación de nuevos usuarios
class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email') # Puedes añadir más campos si quieres

# Formulario para editar usuarios (no lo usaremos ahora, pero es buena práctica tenerlo)
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'email')
