import React, { useEffect, useState } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useSuppliers } from '../../contexts/SupplierContext';
import { useSales } from '../../contexts/SaleContext';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Reports: React.FC = () => {
  console.log('Reports component: Component rendering');
  
  // Call all hooks at the top (Rules of Hooks) - use destructuring like other pages
  const { products, loading: productsLoading } = useProducts();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { sales, customers, loading: salesLoading } = useSales();
  const [selectedReport, setSelectedReport] = useState('');
  
  console.log('Reports component: About to access contexts');
  console.log('Products:', products);
  console.log('Suppliers:', suppliers);
  console.log('Sales:', sales);
  console.log('Customers:', customers);
  console.log('Loading states:', { productsLoading, suppliersLoading, salesLoading });
  
  try {
    // Check if any context is still loading
    if (productsLoading || suppliersLoading || salesLoading) {
      console.log('Reports component: Data still loading, showing loading');
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">Generate and view business reports</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-blue-800 font-medium">Loading Reports</h3>
            <p className="text-blue-600 text-sm">Please wait while we load your business data...</p>
          </div>
        </div>
      );
    }
    
    // Ensure we have arrays
    const safeProducts = Array.isArray(products) ? products : [];
    const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
    const safeSales = Array.isArray(sales) ? sales : [];
    const safeCustomers = Array.isArray(customers) ? customers : [];
    
    console.log('Reports component: Context data loaded');
    console.log('Reports component: Products count:', safeProducts.length);
    console.log('Reports component: Suppliers count:', safeSuppliers.length);
    console.log('Reports component: Sales count:', safeSales.length);
    console.log('Reports component: Customers count:', safeCustomers.length);

    const totalRevenue = safeSales.reduce((sum, sale) => {
    const amount = parseFloat(String(sale?.total_amount || '0')) || 0;
    return sum + amount;
  }, 0);
    const totalProductsValue = safeProducts.reduce((sum, product) => {
      const value = parseFloat(String(product?.stock_value || '0')) || 0;
      return sum + value;
    }, 0);
    const lowStockProducts = safeProducts.filter(p => (p?.quantity_in_stock || 0) <= (p?.reorder_level || 0));
    const completedSales = safeSales.filter(sale => sale?.status === 'completed');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and view business reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <DocumentArrowDownIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
                <p className="text-2xl font-bold text-gray-900">{safeSales.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                <p className="text-2xl font-bold text-gray-900">{safeProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <DocumentArrowDownIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Suppliers</h3>
                <p className="text-2xl font-bold text-gray-900">{safeSuppliers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Generate Reports</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button
                onClick={() => setSelectedReport('sales')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <h3 className="font-medium text-gray-900">Sales Report</h3>
                <p className="text-sm text-gray-600">View detailed sales analytics and trends</p>
              </button>

              <button
                onClick={() => setSelectedReport('products')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <h3 className="font-medium text-gray-900">Inventory Report</h3>
                <p className="text-sm text-gray-600">View product stock levels and values</p>
              </button>

              <button
                onClick={() => setSelectedReport('suppliers')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <h3 className="font-medium text-gray-900">Supplier Report</h3>
                <p className="text-sm text-gray-600">View supplier information and metrics</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    console.error('Reports component error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    console.log('Products:', products);
    console.log('Suppliers:', suppliers);
    console.log('Sales:', sales);
    console.log('Customers:', customers);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and view business reports</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading reports</h3>
          <p className="text-red-600 text-sm">There was an error loading the reports page. Please try refreshing the page.</p>
          <p className="text-red-500 text-xs mt-2">Error: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }
};

export default Reports;
