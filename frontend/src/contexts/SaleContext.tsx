import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Sale, Customer } from '../types';
import apiService from '../services/api';

interface SaleContextType {
  sales: Sale[];
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchSales: (params?: any) => Promise<void>;
  fetchCustomers: (params?: any) => Promise<void>;
  createSale: (data: any) => Promise<Sale>;
  updateSale: (id: number, data: any) => Promise<Sale>;
  deleteSale: (id: number) => Promise<void>;
  createCustomer: (data: any) => Promise<Customer>;
  updateCustomer: (id: number, data: any) => Promise<Customer>;
  deleteCustomer: (id: number) => Promise<void>;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const useSales = () => {
  const context = useContext(SaleContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SaleProvider');
  }
  return context;
};

interface SaleProviderProps {
  children: ReactNode;
}

export const SaleProvider: React.FC<SaleProviderProps> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      console.log('SaleContext: Fetching sales...');
      const data = await apiService.getSales(params);
      console.log('SaleContext: Raw API response:', data);
      // Handle both paginated and non-paginated responses
      const salesArray = data.results || data;
      console.log('SaleContext: Sales array:', salesArray);
      console.log('SaleContext: Sales count:', salesArray?.length);
      setSales(Array.isArray(salesArray) ? salesArray : []);
      console.log('SaleContext: Sales state updated');
    } catch (err: any) {
      console.error('SaleContext: Failed to fetch sales:', err);
      setError(err.response?.data?.message || 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCustomers(params);
      // Handle both paginated and non-paginated responses
      const customersArray = data.results || data;
      setCustomers(Array.isArray(customersArray) ? customersArray : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (data: any): Promise<Sale> => {
    try {
      console.log('SaleContext: Creating sale with data:', data);
      const newSale = await apiService.createSale(data);
      console.log('SaleContext: Sale created successfully:', newSale);
      return newSale;
    } catch (err: any) {
      console.error('SaleContext: Failed to create sale:', err);
      throw err; // Just re-throw without additional processing
    }
  };

  const updateSale = async (id: number, data: any): Promise<Sale> => {
    try {
      setLoading(true);
      setError(null);
      const updatedSale = await apiService.updateSale(id, data);
      setSales(prev => prev.map(sale => 
        sale.id === id ? updatedSale : sale
      ));
      return updatedSale;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update sale';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteSale(id);
      setSales(prev => prev.filter(sale => sale.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete sale');
      throw new Error(err.response?.data?.message || 'Failed to delete sale');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: any): Promise<Customer> => {
    try {
      setLoading(true);
      setError(null);
      const newCustomer = await apiService.createCustomer(data);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: number, data: any): Promise<Customer> => {
    try {
      setLoading(true);
      setError(null);
      const updatedCustomer = await apiService.updateCustomer(id, data);
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? updatedCustomer : customer
      ));
      return updatedCustomer;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete customer');
      throw new Error(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const value: SaleContextType = {
    sales,
    customers,
    loading,
    error,
    fetchSales,
    fetchCustomers,
    createSale,
    updateSale,
    deleteSale,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
};
