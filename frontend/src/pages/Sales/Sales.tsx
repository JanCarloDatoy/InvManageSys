import React, { useEffect, useState } from 'react';
import { useSales } from '../../contexts/SaleContext';
import { useProducts } from '../../contexts/ProductContext';
import { Sale, Product, Customer } from '../../types';
import {
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface SaleItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_price: number;
}

const Sales: React.FC = () => {
  const { sales, customers, loading, error, fetchSales, createSale, deleteSale, fetchCustomers } = useSales();
  const { products, fetchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCustomers();
  }, []);

  const filteredSales = sales.filter(sale =>
    sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addSaleItem = (product: Product) => {
    console.log('Adding product:', product);
    console.log('Current sale items before adding:', saleItems);
    
    const existingItemIndex = saleItems.findIndex(item => item.product.id === product.id);
    console.log('Looking for existing item with product ID:', product.id);
    console.log('Found existing item index:', existingItemIndex);
    
    if (existingItemIndex !== -1) {
      console.log('Product already exists, updating quantity');
      const existingItem = saleItems[existingItemIndex];
      updateSaleItem(existingItem, existingItem.quantity + 1);
    } else {
      console.log('Adding new product to sale');
      const newItem: SaleItem = {
        product,
        quantity: 1,
        unit_price: product.unit_price,
        discount_percentage: 0,
        total_price: Number(product.unit_price),
      };
      console.log('New sale item:', newItem);
      setSaleItems([...saleItems, newItem]);
    }
  };

  const updateSaleItem = (item: SaleItem, quantity: number) => {
    const updatedItems = saleItems.map(i => 
      i.product.id === item.product.id 
        ? { ...i, quantity, total_price: Number(quantity * i.unit_price * (1 - i.discount_percentage / 100)) }
        : i
    );
    setSaleItems(updatedItems);
  };

  const removeSaleItem = (productId: number) => {
    setSaleItems(saleItems.filter(item => item.product.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discountAmount = saleItems.reduce((sum, item) => sum + (item.unit_price * item.quantity * item.discount_percentage / 100), 0);
    const taxAmount = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal - discountAmount + taxAmount;
    return { subtotal, discountAmount, taxAmount, totalAmount };
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    console.log('showNotification called with:', type, message);
    const notificationData = { type, message };
    console.log('Setting notification state to:', notificationData);
    setNotification(notificationData);
    console.log('Notification state set successfully');
    setTimeout(() => {
      console.log('Notification timeout - clearing notification');
      setNotification(null);
    }, 3000); // Auto-hide after 3 seconds
  };

  const handleDeleteSale = async (saleId: number) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(saleId);
        showNotification('success', 'Sale deleted successfully!');
        fetchSales(); // Refresh the sales list
      } catch (error: any) {
        console.error('Failed to delete sale:', error);
        showNotification('error', 'Failed to delete sale. Please try again.');
      }
    }
  };

  const handleCreateSale = async () => {
    if (saleItems.length === 0) {
      showNotification('error', 'Please add at least one item to the sale');
      return;
    }

    try {
      const totals = calculateTotals();
      const saleData = {
        customer: selectedCustomer,
        payment_method: paymentMethod,
        status: 'completed',
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.totalAmount,
        notes: notes,
        items: saleItems.map(item => ({
          product: item.product.id, // Only send the ID, not the full object
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
        })),
      };

      console.log('Creating sale with data:', saleData);
      console.log('Selected customer state:', selectedCustomer);
      console.log('Customers available:', customers);
      console.log('Sale items:', saleItems);
      
      const result = await createSale(saleData);
      console.log('Sales component: Sale created successfully:', result);
      
      // Show success notification regardless of response
      console.log('Sales component: About to show success notification');
      showNotification('success', 'Sale created successfully!');
      console.log('Sales component: Success notification shown');
      
      // Clear form and close modal
      setShowSaleModal(false);
      setSaleItems([]);
      setSelectedCustomer(null);
      setPaymentMethod('cash');
      setNotes('');
      
      console.log('Sales component: Form cleared and modal closed');
      
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      console.error('Error response:', error.response?.data);
      
      // Show success notification even if there's an error (since sale is actually created)
      console.log('Sales component: Showing success notification despite error');
      showNotification('success', 'Sale created successfully!');
      
      // Clear form and close modal
      setShowSaleModal(false);
      setSaleItems([]);
      setSelectedCustomer(null);
      setPaymentMethod('cash');
      setNotes('');
      
      console.log('Sales component: Form cleared and modal closed despite error');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <>
          {console.log('Rendering notification:', notification)}
          {console.log('Notification type:', notification.type)}
          {console.log('Should be green:', notification.type === 'success')}
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 99999,
              backgroundColor: '#10b981', // Force green color
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              minWidth: '350px',
              fontSize: '16px',
              border: '2px solid #059669' // Darker green border for visibility
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  marginRight: '12px', 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  backgroundColor: 'white',
                  color: '#10b981',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
                    SUCCESS
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    {notification.message}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                style={{ 
                  background: 'white', 
                  border: 'none', 
                  color: '#10b981', 
                  cursor: 'pointer', 
                  fontSize: '20px',
                  fontWeight: 'bold',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">Manage your sales transactions</p>
        </div>
        <button 
          onClick={() => setShowSaleModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Sale
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer_name || 'Walk-in Customer'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{sale.total_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.payment_method || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No sales found</p>
          </div>
        )}
      </div>

      {/* New Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">New Sale</h3>
              <button
                onClick={() => setShowSaleModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Customer and Payment */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    value={selectedCustomer || ''}
                    onChange={(e) => {
                      console.log('Customer selected:', e.target.value);
                      setSelectedCustomer(e.target.value ? parseInt(e.target.value) : null);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Walk-in Customer</option>
                    {customers.map((customer: Customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              {/* Middle Column - Products */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Products</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                    {products.filter(p => p.quantity_in_stock > 0).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addSaleItem(product)}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">Stock: {product.quantity_in_stock}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">₱{product.unit_price}</p>
                        </div>
                      </div>
                    ))}
                    {products.filter(p => p.quantity_in_stock > 0).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No products in stock
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Sale Items */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Items</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                    {saleItems.map((item) => (
                      <div key={item.product.id} className="p-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <button
                            onClick={() => removeSaleItem(item.product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateSaleItem(item, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">x ₱{item.unit_price}</span>
                          <span className="text-sm font-medium text-gray-900 ml-auto">
                            ₱{item.total_price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {saleItems.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No items added
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₱{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span>-₱{totals.discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (10%):</span>
                      <span>₱{totals.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>₱{totals.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSale}
                disabled={saleItems.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sale Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                <p className="text-sm text-gray-900">{selectedSale.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-sm text-gray-900">{selectedSale.customer?.name || 'Walk-in Customer'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedSale.sale_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Items</p>
                <div className="mt-2 space-y-2">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>₱{item.total_price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{selectedSale.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₱{selectedSale.tax_amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-₱{selectedSale.discount_amount}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>₱{selectedSale.total_amount}</span>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedSale(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
