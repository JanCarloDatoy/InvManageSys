from django.urls import path
from .views import supplier_list_create, supplier_detail

urlpatterns = [
    path('', supplier_list_create, name='supplier-list-create'),
    path('<int:pk>/', supplier_detail, name='supplier-detail'),
]
