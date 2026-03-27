import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Category } from '../types';
import apiService from '../services/api';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchProducts: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: number, data: any) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  createCategory: (data: any) => Promise<Category>;
  updateCategory: (id: number, data: any) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getProducts(params);
      // Handle both paginated and non-paginated responses
      const productsArray = data.results || data;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCategories();
      setCategories(data.results || data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: any): Promise<Product> => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await apiService.createProduct(data);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, data: any): Promise<Product> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProduct = await apiService.updateProduct(id, data);
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ));
      return updatedProduct;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update product';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
      throw new Error(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: any): Promise<Category> => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await apiService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: any): Promise<Category> => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await apiService.updateCategory(id, data);
      setCategories(prev => prev.map(category => 
        category.id === id ? updatedCategory : category
      ));
      return updatedCategory;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
      throw new Error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const value: ProductContextType = {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
