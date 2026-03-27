from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, customer_list_create, customer_detail, sale_list_create, sale_detail

router = DefaultRouter()
# router.register(r'customers', CustomerViewSet)  # Removed - using function-based view instead

urlpatterns = [
    path('customers/', customer_list_create, name='customer-list-create'),
    path('customers/<int:pk>/', customer_detail, name='customer-detail'),
    path('', sale_list_create, name='sale-list-create'),  # Back to empty path
    path('<int:pk>/', sale_detail, name='sale-detail'),
]
