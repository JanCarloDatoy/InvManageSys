import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Supplier } from '../types';
import apiService from '../services/api';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchSuppliers: (params?: any) => Promise<void>;
  createSupplier: (data: any) => Promise<Supplier>;
  updateSupplier: (id: number, data: any) => Promise<Supplier>;
  deleteSupplier: (id: number) => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};

interface SupplierProviderProps {
  children: ReactNode;
}

export const SupplierProvider: React.FC<SupplierProviderProps> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSuppliers(params);
      // Handle both paginated and non-paginated responses
      const suppliersArray = data.results || data;
      setSuppliers(Array.isArray(suppliersArray) ? suppliersArray : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (data: any): Promise<Supplier> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Creating supplier with data:', data);
      const newSupplier = await apiService.createSupplier(data);
      console.log('Supplier created successfully:', newSupplier);
      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err: any) {
      console.error('Create supplier error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create supplier';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: number, data: any): Promise<Supplier> => {
    try {
      setLoading(true);
      setError(null);
      const updatedSupplier = await apiService.updateSupplier(id, data);
      setSuppliers(prev => prev.map(supplier => 
        supplier.id === id ? updatedSupplier : supplier
      ));
      return updatedSupplier;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update supplier';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete supplier');
      throw new Error(err.response?.data?.message || 'Failed to delete supplier');
    } finally {
      setLoading(false);
    }
  };

  const value: SupplierContextType = {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
};
