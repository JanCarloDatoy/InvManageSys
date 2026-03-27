import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await this.api.post('/auth/login/', formData);
    return response.data;
  }

  async logout() {
    await this.api.post('/auth/logout/');
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/user/');
    return response.data;
  }

  // Product endpoints
  async getProducts(params?: any) {
    const response = await this.api.get('/products/', { params });
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.api.get(`/products/${id}/`);
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.api.post('/products/', data);
    return response.data;
  }

  async updateProduct(id: number, data: any) {
    const response = await this.api.put(`/products/${id}/`, data);
    return response.data;
  }

  async deleteProduct(id: number) {
    await this.api.delete(`/products/${id}/`);
  }

  // Category endpoints
  async getCategories() {
    const response = await this.api.get('/products/categories/');
    return response.data;
  }

  async createCategory(data: any) {
    const response = await this.api.post('/products/categories/', data);
    return response.data;
  }

  async updateCategory(id: number, data: any) {
    const response = await this.api.put(`/products/categories/${id}/`, data);
    return response.data;
  }

  async deleteCategory(id: number) {
    await this.api.delete(`/products/categories/${id}/`);
  }

  // Supplier endpoints
  async getSuppliers(params?: any) {
    const response = await this.api.get('/suppliers/', { params });
    return response.data;
  }

  async getSupplier(id: number) {
    const response = await this.api.get(`/suppliers/${id}/`);
    return response.data;
  }

  async createSupplier(data: any) {
    const response = await this.api.post('/suppliers/', data);
    return response.data;
  }

  async updateSupplier(id: number, data: any) {
    const response = await this.api.put(`/suppliers/${id}/`, data);
    return response.data;
  }

  async deleteSupplier(id: number) {
    await this.api.delete(`/suppliers/${id}/`);
  }

  // Customer endpoints
  async getCustomers(params?: any) {
    const response = await this.api.get('/sales/customers/', { params });
    return response.data;
  }

  async getCustomer(id: number) {
    const response = await this.api.get(`/sales/customers/${id}/`);
    return response.data;
  }

  async createCustomer(data: any) {
    const response = await this.api.post('/sales/customers/', data);
    return response.data;
  }

  async updateCustomer(id: number, data: any) {
    const response = await this.api.put(`/sales/customers/${id}/`, data);
    return response.data;
  }

  async deleteCustomer(id: number) {
    await this.api.delete(`/sales/customers/${id}/`);
  }

  // Sale endpoints
  async getSales(params?: any) {
    const response = await this.api.get('/sales/', { params });
    return response.data;
  }

  async getSale(id: number) {
    const response = await this.api.get(`/sales/${id}/`);
    return response.data;
  }

  async createSale(data: any) {
    try {
      console.log('API Service: Creating sale with data:', data);
      const response = await this.api.post('/sales/', data);  // Back to original URL
      console.log('API Service: Response status:', response.status);
      console.log('API Service: Response data:', response.data);
      console.log('API Service: Response data type:', typeof response.data);
      console.log('API Service: Response data keys:', response.data ? Object.keys(response.data) : 'null');
      console.log('API Service: Response data ID:', response.data?.id);
      
      // Check if response has expected structure
      if (!response.data || !response.data.id) {
        console.error('API Service: Invalid response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
      
      // Ensure we return the data directly, not wrapped in response
      const saleData = response.data;
      console.log('API Service: Returning sale data:', saleData);
      return saleData;
    } catch (error: any) {
      console.error('API Service: Failed to create sale:', error);
      console.error('API Service: Error response:', error.response?.data);
      console.error('API Service: Error status:', error.response?.status);
      throw error;
    }
  }

  async updateSale(id: number, data: any) {
    const response = await this.api.put(`/sales/${id}/`, data);
    return response.data;
  }

  async deleteSale(id: number) {
    await this.api.delete(`/sales/${id}/`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats/');
    return response.data;
  }

  async getSalesReport(params?: any) {
    const response = await this.api.get('/reports/sales/', { params });
    return response.data;
  }

  async getInventoryReport() {
    const response = await this.api.get('/reports/inventory/');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
