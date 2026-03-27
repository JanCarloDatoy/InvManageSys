from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from products.models import Product
from sales.models import Sale
from suppliers.models import Supplier
from sales.models import Customer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    
    # Product stats
    total_products = Product.objects.count()
    low_stock_products = Product.objects.filter(
        quantity_in_stock__lte=F('reorder_level')
    ).count()
    total_stock_value = Product.objects.aggregate(
        total=Sum(F('quantity_in_stock') * F('unit_price'))
    )['total'] or 0
    
    # Sales stats
    total_sales = Sale.objects.count()
    total_revenue = Sale.objects.aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Customer and supplier stats
    total_customers = Customer.objects.count()
    total_suppliers = Supplier.objects.count()
    
    # Recent sales
    recent_sales = Sale.objects.select_related('customer').order_by('-sale_date')[:5]
    recent_sales_data = [
        {
            'id': sale.id,
            'invoice_number': sale.invoice_number,
            'customer_name': sale.customer.name,
            'total_amount': sale.total_amount,
            'sale_date': sale.sale_date
        }
        for sale in recent_sales
    ]
    
    # Low stock products
    low_stock_items = Product.objects.filter(
        quantity_in_stock__lte=F('reorder_level')
    ).select_related('category')[:5]
    
    low_stock_data = [
        {
            'id': product.id,
            'name': product.name,
            'sku': product.sku,
            'quantity_in_stock': product.quantity_in_stock,
            'reorder_level': product.reorder_level,
            'category_name': product.category.name if product.category else 'No Category'
        }
        for product in low_stock_items
    ]
    
    return Response({
        'stats': {
            'total_products': total_products,
            'low_stock_products': low_stock_products,
            'total_stock_value': total_stock_value,
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'total_customers': total_customers,
            'total_suppliers': total_suppliers,
        },
        'recent_sales': recent_sales_data,
        'low_stock_items': low_stock_data,
    })