from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, F
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'supplier', 'is_active']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'created_at', 'unit_price', 'quantity_in_stock']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.select_related('category', 'supplier').all()
        return queryset

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock"""
        low_stock_products = self.get_queryset().filter(
            quantity_in_stock__lte=F('reorder_level')
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_value(self, request):
        """Get products with highest stock value"""
        top_products = self.get_queryset().annotate(
            stock_value=F('quantity_in_stock') * F('unit_price')
        ).order_by('-stock_value')[:10]
        serializer = self.get_serializer(top_products, many=True)
        return Response(serializer.data)
