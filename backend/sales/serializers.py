from rest_framework import serializers
from .models import Customer, Sale, SaleItem
from products.models import Product
from decimal import Decimal

class SaleItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        model = SaleItem
        fields = ['product', 'quantity', 'unit_price', 'discount_percentage']
        extra_kwargs = {
            'product': {'required': True, 'allow_null': False}
        }

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True, allow_null=True)
    salesperson_name = serializers.CharField(source='salesperson.username', read_only=True)
    
    class Meta:
        model = Sale
        fields = ['id', 'invoice_number', 'customer', 'customer_name', 'salesperson', 'salesperson_name', 'sale_date', 'status', 'payment_method', 'subtotal', 'tax_amount', 'discount_amount', 'total_amount', 'notes', 'items', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount')

class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = ['invoice_number', 'customer', 'payment_method', 'status', 'notes', 'items']
        read_only_fields = ('created_at', 'updated_at', 'salesperson')
        extra_kwargs = {
            'customer': {'required': False, 'allow_null': True}
        }
    
    def create(self, validated_data):
        try:
            # Calculate totals from items
            items_data = validated_data.pop('items')
            print(f"Items data: {items_data}")
            
            # Use float for calculations, then convert to Decimal at the end
            subtotal = 0.0
            discount_amount = 0.0
            
            for item in items_data:
                print(f"Processing item: {item}")
                unit_price = float(item['unit_price'])
                quantity = float(item['quantity'])
                discount_percentage = float(item.get('discount_percentage', 0))
                
                print(f"unit_price: {unit_price} (type: {type(unit_price)})")
                print(f"quantity: {quantity} (type: {type(quantity)})")
                print(f"discount_percentage: {discount_percentage} (type: {type(discount_percentage)})")
                
                item_total = unit_price * quantity
                item_discount = item_total * discount_percentage / 100.0
                
                subtotal += item_total
                discount_amount += item_discount
                
                print(f"item_total: {item_total}, item_discount: {item_discount}")
            
            tax_amount = subtotal * 0.1  # 10% tax
            total_amount = subtotal - discount_amount + tax_amount
            
            print(f"Calculated totals - subtotal: {subtotal}, discount: {discount_amount}, tax: {tax_amount}, total: {total_amount}")
            
            # Convert to Decimal for database storage
            validated_data['subtotal'] = Decimal(str(subtotal))
            validated_data['tax_amount'] = Decimal(str(tax_amount))
            validated_data['discount_amount'] = Decimal(str(discount_amount))
            validated_data['total_amount'] = Decimal(str(total_amount))
            
            # Create sale with calculated totals
            sale = Sale.objects.create(**validated_data)
            
            # Create sale items and deduct stock
            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']
                
                # Deduct from product stock
                product.quantity_in_stock -= quantity
                product.save()
                
                # Create sale item
                SaleItem.objects.create(sale=sale, **item_data)
            
            # Don't call calculate_totals() to avoid potential errors
            print("Sale and items created successfully, skipping calculate_totals()")
            return sale
            
        except Exception as e:
            print(f"Error in create method: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise
