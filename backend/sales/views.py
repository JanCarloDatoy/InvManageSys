from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Customer, Sale, SaleItem
from .serializers import CustomerSerializer, SaleSerializer, SaleCreateSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('customer', 'salesperson').prefetch_related('items__product').all()
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['invoice_number', 'customer__name']
    ordering_fields = ['sale_date', 'total_amount']
    ordering = ['-sale_date']
    http_method_names = ['get', 'put', 'patch', 'delete']  # Removed 'post'

    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer

    # Removed create method to avoid conflicts with function-based view
    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_create(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(salesperson=self.request.user)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent sales"""
        recent_sales = self.get_queryset()[:10]
        serializer = self.get_serializer(recent_sales, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get sales summary"""
        total_sales = self.get_queryset().count()
        total_revenue = self.get_queryset().aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        return Response({
            'total_sales': total_sales,
            'total_revenue': total_revenue,
            'average_sale': total_revenue / total_sales if total_sales > 0 else 0
        })

# Function-based view for customers
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def customer_list_create(request):
    if request.method == 'GET':
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Function-based view for individual customer operations
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def customer_detail(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# Function-based view for individual sale operations
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def sale_detail(request, pk):
    try:
        sale = Sale.objects.select_related('customer', 'salesperson').prefetch_related('items__product').get(pk=pk)
    except Sale.DoesNotExist:
        return Response({'error': 'Sale not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SaleSerializer(sale)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = SaleSerializer(sale, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Function-based view for sales
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def sale_list_create(request):
    print(f"=== SALE LIST CREATE VIEW CALLED ===")
    print(f"Method: {request.method}")
    print(f"User: {request.user}")
    print(f"Data: {request.data}")
    
    if request.method == 'GET':
        print("=== GET METHOD ===")
        sales = Sale.objects.select_related('customer', 'salesperson').prefetch_related('items__product').all()
        serializer = SaleSerializer(sales, many=True)
        print(f"Returning {len(sales)} sales")
        return Response(serializer.data)
    elif request.method == 'POST':
        print("=== POST METHOD ===")
        try:
            print("=== SALE CREATION STARTED ===")
            # Add invoice number if not provided
            data = request.data.copy()
            print(f"Received data: {data}")  # Debug print
            
            if not data.get('invoice_number'):
                # Auto-generate invoice number
                last_sale = Sale.objects.all().order_by('-id').first()
                if last_sale:
                    last_number = int(last_sale.invoice_number.split('-')[1])
                    new_number = last_number + 1
                else:
                    new_number = 1
                data['invoice_number'] = f'INV-{new_number:06d}'
                print(f"Generated invoice number: {data['invoice_number']}")
            
            # Handle customer (allow null for walk-in customers)
            if 'customer' in data and data['customer'] == '':
                data['customer'] = None
                print("Customer set to null for walk-in customer")
            
            print("Creating serializer...")
            serializer = SaleCreateSerializer(data=data)
            print("Serializer created, validating...")
            if serializer.is_valid():
                print("Serializer is valid, saving...")
                sale = serializer.save(salesperson=request.user)
                print(f"Sale saved successfully: {sale.id}")
                
                # Return a simple response to avoid serialization issues
                print("About to return simple response")
                try:
                    response_data = {
                        'id': sale.id,
                        'invoice_number': sale.invoice_number,
                        'customer_name': 'Test Customer',  # Temporary hardcoded value
                        'total_amount': str(sale.total_amount),
                        'status': sale.status,
                        'payment_method': sale.payment_method,
                        'sale_date': sale.sale_date.isoformat(),
                        'message': 'Sale created successfully'
                    }
                    print("Response data created successfully:", response_data)
                    return Response(response_data, status=status.HTTP_201_CREATED)
                except Exception as e:
                    print(f"Error creating response: {str(e)}")
                    import traceback
                    print(f"Traceback: {traceback.format_exc()}")
                    # Return minimal response
                    return Response({'message': 'Sale created successfully'}, status=status.HTTP_201_CREATED)
            else:
                print(f"Serializer errors: {serializer.errors}")
                # Return detailed error information
                error_details = {}
                for field, errors in serializer.errors.items():
                    error_details[field] = {
                        'message': f"Validation failed for {field}",
                        'errors': errors
                    }
                return Response({
                    'error': 'Validation failed',
                    'details': error_details
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error in POST method: {str(e)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            return Response({
                'error': 'Internal server error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            print("=== SALE CREATION ENDED ===")
    elif request.method == 'DELETE':
        print("=== DELETE METHOD ===")
        # Handle DELETE if needed
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    print("=== METHOD NOT ALLOWED ===")
    return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
