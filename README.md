# InventoryPro - Advanced Inventory Management System

A comprehensive, production-ready inventory management system built with React and Django REST Framework.

## 🚀 Features

### 🏷️ Product Management
- **Complete CRUD Operations**: Create, read, update, delete products
- **Category Management**: Organize products by categories (Block, Head, Injectors, Center Spring, Flyball, Pulley, Pipes)
- **Stock Tracking**: Real-time inventory monitoring with automatic stock deduction
- **Dual Pricing System**: Cost Price vs Unit Price for profit tracking
- **SKU Management**: Unique product identification system
- **Low Stock Alerts**: Automatic notifications when inventory falls below reorder levels

### 🛒 Sales Management
- **Complete Sales Workflow**: Create, manage, and track sales transactions
- **Customer Integration**: Associate sales with customers or walk-in transactions
- **Multi-Item Sales**: Add multiple products to a single sale
- **Automatic Calculations**: Real-time subtotal, tax, and total calculations
- **Payment Processing**: Support for multiple payment methods
- **Invoice Generation**: Automatic invoice numbering (INV-000001 format)

### 👥 Customer Management
- **Customer Database**: Comprehensive customer information management
- **Contact Management**: Store email, phone, address information
- **Customer Status**: Active/inactive customer management
- **Transaction History**: View all customer purchases and interactions
- **Customer Analytics**: Purchase patterns and preferences

### 📊 Business Analytics & Reporting
- **Revenue Dashboard**: Real-time revenue tracking and visualization
- **Sales Analytics**: Comprehensive sales performance metrics
- **Inventory Reports**: Stock levels, values, and movement tracking
- **Customer Reports**: Customer demographics and purchasing behavior
- **Product Performance**: Top-selling products and inventory insights

### 🏭 Supplier Management
- **Supplier Database**: Complete supplier information management
- **Contact Management**: Store supplier contact and communication details
- **Supplier Status**: Active/inactive supplier management
- **Procurement Tracking**: Monitor supplier relationships and performance

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Axios** for API communication
- **React Router** for navigation
- **React Context API** for state management

### Backend
- **Django 4.2** with Django REST Framework
- **SQLite** database (production-ready for PostgreSQL/MySQL)
- **Token-based authentication**
- **RESTful API design**

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser** (optional)
   ```bash
   python manage.py createsuperuser
   ```

6. **Start backend server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at: `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start frontend server**
   ```bash
   npm start
   ```

   Frontend will be available at: `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api/
```

### Backend Settings

The backend uses SQLite by default. For production, update `DATABASES` in `backend/inventory_system/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'inventory_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 📱 Usage

1. **Access the application**: Open `http://localhost:3000` in your browser
2. **Login**: Use your credentials or create a new account
3. **Navigate**: Use the sidebar to access different modules:
   - **Dashboard**: Overview of business metrics
   - **Products**: Manage inventory and product catalog
   - **Sales**: Create and manage sales transactions
   - **Customers**: Manage customer information
   - **Suppliers**: Manage supplier relationships
   - **Reports**: View business analytics and insights

## 🏗️ Project Structure

```
Full Stack/
├── backend/                 # Django REST Framework backend
│   ├── inventory_system/    # Main Django project
│   ├── products/           # Product management app
│   ├── sales/              # Sales management app
│   ├── customers/          # Customer management app
│   ├── suppliers/          # Supplier management app
│   └── users/              # User management app
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts for state management
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── public/
├── DOCUMENTATION.md        # Comprehensive project documentation
├── DEMO_SCRIPT.md         # Demo presentation script
└── README.md              # This file
```

## 🎯 Key Features Demonstration

### Product Management
- Add products with SKU, category, pricing
- Track stock levels in real-time
- Set reorder points for low-stock alerts
- Organize by specific categories (Block, Head, Injectors, etc.)

### Sales Processing
- Create multi-item sales with automatic calculations
- Associate sales with customers or walk-in
- Automatic invoice generation
- Real-time stock deduction

### Customer Management
- Complete customer profiles with contact information
- Transaction history tracking
- Active/inactive status management

### Business Analytics
- Real-time revenue tracking in Philippine Peso
- Sales performance metrics
- Inventory value calculations
- Customer and supplier analytics

## 🔒 Security Features

- **Token-based authentication**
- **Permission-based access control**
- **Input validation and sanitization**
- **CORS configuration**
- **SQL injection prevention**

## 📊 Business Intelligence

- **Real-time metrics**: Revenue, sales count, inventory value
- **Profit tracking**: Cost vs Unit price analysis
- **Low stock alerts**: Automatic notifications
- **Customer analytics**: Purchase patterns and preferences

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `build` folder to your hosting service.

### Backend Deployment
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Run `python manage.py collectstatic`
4. Use WSGI server (Gunicorn) with reverse proxy (Nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Jan Carlo Datoy**
- Project Lead & Full-Stack Developer
- System Architecture Design
- Backend Development (Django REST Framework)
- Frontend Development (React + TypeScript)
- Database Design & Implementation

## 📞 Support

For support, please contact:
- Email: jcmdatoy123@gmail.com
- GitHub: [JanCarloDatoy](https://github.com/JanCarloDatoy)

## 🎯 Project Status

✅ **Complete** - Production-ready inventory management system with all features implemented and tested.

---

**InventoryPro represents a complete, production-ready inventory management solution that addresses real business needs while maintaining high standards of code quality, security, and user experience.**
