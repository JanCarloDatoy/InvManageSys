import React, { useEffect, useState } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useSuppliers } from '../../contexts/SupplierContext';
import { useSales } from '../../contexts/SaleContext';
import { DashboardStats } from '../../types';
import apiService from '../../services/api';
import {
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { products, fetchProducts } = useProducts();
  const { suppliers, fetchSuppliers } = useSuppliers();
  const { sales, customers, fetchSales, fetchCustomers } = useSales();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic data
        await Promise.all([
          fetchProducts({ page_size: 5 }),
          fetchSuppliers({ page_size: 5 }),
          fetchSales({ page_size: 5 }),
          fetchCustomers({ page_size: 5 }),
        ]);

        // Fetch dashboard stats
        const dashboardStats = await apiService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Total Products',
      value: products.length,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Suppliers',
      value: suppliers.length,
      icon: TruckIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Customers',
      value: customers.length,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Sales',
      value: sales.length,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Inventory Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {products.some(p => p.quantity_in_stock <= p.reorder_level) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            {products.filter(p => p.quantity_in_stock <= p.reorder_level).length} products are running low on stock.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sale.invoice_number}</p>
                    <p className="text-sm text-gray-500">{sale.customer?.name || 'Walk-in Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₱{sale.total_amount}</p>
                    <p className="text-sm text-gray-500">{new Date(sale.sale_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-sm text-gray-500">No sales recorded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Products by Stock Value</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {products
                .filter(p => p.stock_value && p.stock_value > 0)
                .sort((a, b) => (b.stock_value || 0) - (a.stock_value || 0))
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity_in_stock} in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₱{product.stock_value}</p>
                      <p className="text-sm text-gray-500">@ ₱{product.unit_price}</p>
                    </div>
                  </div>
                ))}
              {products.length === 0 && (
                <p className="text-sm text-gray-500">No products available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
