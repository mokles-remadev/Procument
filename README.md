# Procurement Management System (PMS)

A comprehensive React-based procurement management system that streamlines the entire procurement process from Request for Quotation (RFQ) to Purchase Order (PO) generation and supplier quality management.

## 🚀 Overview

The Procurement Management System is a modern web application built with React and Ant Design that provides end-to-end procurement workflow management. It covers the complete procurement lifecycle including technical bid evaluation, commercial bid evaluation, board approval, and purchase order management.

## ✨ Key Features

### Core Procurement Workflow
- **RFQ Management**: Package and item-based request for quotation system
- **Technical Bid Evaluation (TBE)**: Binary compliance-based technical evaluation
- **Commercial Bid Evaluation (CBE)**: Advanced commercial analysis with supplier analytics
- **Board of Directors (BOD) Approval**: Executive approval workflow
- **Purchase Order Management**: Automated PO generation and tracking

### Advanced Features
- **Supplier Management**: Comprehensive supplier database with performance tracking
- **Supplier Quality Management**: Performance evaluation and rating system
- **Dashboard Analytics**: Real-time procurement metrics and insights
- **Export Declaration**: Export documentation and compliance management
- **Multi-currency Support**: Global procurement with currency conversion
- **Document Management**: Integrated document storage and tracking

## 🏗️ System Architecture

### Technology Stack
- **Frontend**: React 18.3.1 with modern hooks
- **UI Framework**: Ant Design 5.15.1
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1 + PostCSS
- **Language**: JavaScript/JSX with TypeScript definitions
- **State Management**: React Context and useState hooks
- **Charts**: Ant Design Plots for analytics visualization

### Project Structure
```
src/
├── components/
│   ├── items/           # Item management components
│   ├── layout/          # Layout and navigation components
│   ├── packages/        # Package management components
│   └── quotes/          # Quote management components
├── mock/
│   └── mockData.ts      # Sample data for development/demo
├── pages/
│   ├── Dashboard.jsx    # Main dashboard with analytics
│   ├── RFQManagement.jsx    # RFQ workflow management
│   ├── TBEManagement.jsx    # Technical bid evaluation
│   ├── CBEManagement.jsx    # Commercial bid evaluation
│   ├── BODApproval.jsx      # Board approval workflow
│   ├── POManagement.jsx     # Purchase order management
│   ├── Suppliers.jsx        # Supplier database management
│   └── SupplierQuality.jsx  # Supplier performance evaluation
└── types/
    └── procurement.ts   # TypeScript type definitions
```

## 🔧 Installation and Setup

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation Steps
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd procurement-rfq-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📋 Core Modules Documentation

### 1. RFQ Management (`RFQManagement.jsx`)
**Purpose**: Initiates the procurement process by managing packages and items for quotation.

**Key Features**:
- Package listing with search and filtering
- Item management within packages
- Engineer assignment and tracking
- Status management (Open, In Progress, Completed)
- Export functionality for package data

**Main Components**:
- `PackageList`: Display and manage procurement packages
- `ItemList`: Manage items within selected packages

### 2. Technical Bid Evaluation (`TBEManagement.jsx`)
**Purpose**: Simplified binary compliance evaluation system for technical requirements.

**Key Features**:
- Binary compliance evaluation (Compliant/Non-Compliant)
- Technical specification review
- Document review integration
- Supplier-wise technical assessment
- Evaluation form with validation

**Evaluation Criteria**:
- Technical specifications compliance
- Quality standards adherence
- Documentation completeness
- Delivery capability
- Service support

### 3. Commercial Bid Evaluation (`CBEManagement.jsx`)
**Purpose**: Advanced commercial analysis and supplier comparison system.

**Key Features**:
- Multi-criteria commercial evaluation
- Supplier analytics and comparison
- Cost analysis and savings calculation
- Supply chain risk assessment
- Approval workflow integration
- Detailed reporting and insights

**Analysis Components**:
- Package overview with compliance metrics
- Supplier performance comparison
- Cost competitiveness analysis
- Delivery time analysis
- Risk assessment matrix

### 4. Board of Directors Approval (`BODApproval.jsx`)
**Purpose**: Executive-level approval workflow for procurement decisions.

**Key Features**:
- Package approval workflow
- Executive dashboard views
- Approval decision tracking
- Risk assessment integration
- Multi-level approval support

### 5. Purchase Order Management (`POManagement.jsx`)
**Purpose**: Automated PO generation and management system.

**Key Features**:
- Automated PO creation from approved quotes
- Multi-supplier PO support
- Contract terms management
- Delivery scheduling
- PO status tracking
- Document generation

**PO Lifecycle**:
- Draft → Issued → Signed → Executed

### 6. Supplier Management (`Suppliers.jsx`)
**Purpose**: Comprehensive supplier database and relationship management.

**Key Features**:
- Supplier registration and profiling
- Contact information management
- Category-based classification
- Performance tracking
- Rating system integration

### 7. Supplier Quality Management (`SupplierQuality.jsx`)
**Purpose**: Performance evaluation and quality assessment system.

**Key Features**:
- Multi-dimensional performance evaluation
- Automated scoring algorithms
- Performance trend analysis
- Quality metrics tracking
- Improvement recommendations

**Evaluation Dimensions**:
- Delivery performance (20% weight)
- Quality standards (25% weight)
- Documentation compliance (20% weight)
- Communication effectiveness (15% weight)
- Technical capability (20% weight)

### 8. Dashboard (`Dashboard.jsx`)
**Purpose**: Executive dashboard with real-time procurement analytics.

**Key Metrics**:
- Active packages and items
- Pending approvals
- Supplier performance overview
- Cost savings analysis
- Delivery performance trends

## 💾 Data Models

### Core Entities

#### Package
```typescript
interface Package {
  id: string;
  name: string;
  description: string;
  procurementEngineer: Engineer;
  creationDate: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  openItems: number;
  totalItems: number;
  bodApproved: boolean;
}
```

#### Item
```typescript
interface Item {
  id: string;
  packageId: string;
  name: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  category: string;
  status: 'Open' | 'Quoted' | 'Awarded' | 'Delivered';
  bodApproved: boolean;
}
```

#### Quote
```typescript
interface Quote {
  id: string;
  itemId: string;
  supplierId: string;
  supplierName: string;
  price: number;
  currency: string;
  deliveryTerm: DeliveryTerm;
  deliveryTime: number;
  materialOrigin: string;
  validUntil: string;
  notes: string;
  technicalCompliance: boolean;
  isPreferred: boolean;
  documents?: string[];
  bodApproved?: boolean;
}
```

#### Supplier
```typescript
interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  categories: string[];
  performance: {
    onTimeDelivery: number;
    qualityRating: number;
    responseTime: string;
  };
}
```

## 🔄 Workflow Process

### Standard Procurement Flow
1. **RFQ Creation**: Create packages and items for quotation
2. **Quote Collection**: Suppliers submit technical and commercial quotes
3. **Technical Evaluation**: Evaluate technical compliance (binary)
4. **Commercial Evaluation**: Analyze commercial aspects and supplier capabilities
5. **Board Approval**: Executive approval for selected suppliers
6. **Purchase Order**: Generate and issue POs to approved suppliers
7. **Delivery & Quality**: Track delivery and evaluate supplier performance

### Evaluation Process
- **Technical**: Binary compliance check (Compliant/Non-Compliant)
- **Commercial**: Multi-factor analysis with weighted scoring
- **Risk Assessment**: Supply chain and delivery risk evaluation
- **Approval**: Multi-level approval workflow

## 🎯 Key Features in Detail

### Advanced Analytics
- **Real-time Dashboards**: Live procurement metrics
- **Supplier Performance**: Historical performance tracking
- **Cost Analysis**: Savings identification and tracking
- **Compliance Monitoring**: Regulatory and internal compliance

### User Experience
- **Responsive Design**: Mobile-friendly interface
- **Intuitive Navigation**: Process-driven workflow
- **Role-based Access**: Permission-based feature access
- **Real-time Updates**: Live status updates and notifications

### Integration Capabilities
- **Document Management**: File upload and document tracking
- **Export Functionality**: Data export in multiple formats
- **Multi-currency**: Global procurement support
- **API Ready**: Modular design for easy integration

## 🔐 Security & Permissions

### Role-based Access Control
- **Admin**: Full system access
- **Procurement Engineer**: Package and evaluation management
- **Supply Chain Manager**: Approval and oversight
- **Finance**: Commercial evaluation and approval
- **Executive**: Dashboard and final approvals

### Data Security
- Input validation and sanitization
- Role-based feature restrictions
- Audit trail for all actions
- Secure document handling

## 🚀 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for performance
- **Virtual Scrolling**: Efficient large data rendering
- **Optimistic Updates**: Immediate UI feedback

### Data Management
- **Efficient Filtering**: Client-side and server-side filtering
- **Pagination**: Large dataset handling
- **Caching**: Strategic data caching for performance
- **Batch Operations**: Bulk operations support

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Essential features with streamlined UI

## 🔧 Development Guidelines

### Code Standards
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety (where applicable)
- **Component Architecture**: Reusable component design

### Development Workflow
1. **Feature Development**: Branch-based development
2. **Code Review**: Peer review process
3. **Testing**: Unit and integration testing
4. **Deployment**: Automated CI/CD pipeline

## 📦 Dependencies

### Core Dependencies
- **React 18.3.1**: Frontend framework
- **Ant Design 5.15.1**: UI component library
- **React Router 6.22.3**: Navigation and routing
- **Day.js 1.11.10**: Date manipulation
- **UUID 9.0.1**: Unique identifier generation

### Development Dependencies
- **Vite 5.4.2**: Build tool and dev server
- **TypeScript 5.5.3**: Type checking
- **ESLint 9.9.1**: Code linting
- **Tailwind CSS 3.4.1**: Utility-first CSS

## 🚦 Getting Started Guide

### For End Users
1. **Dashboard**: Start with the dashboard for system overview
2. **Create Package**: Initiate procurement with RFQ Management
3. **Evaluate Bids**: Use TBE and CBE for bid evaluation
4. **Approval Process**: Route through BOD approval
5. **Generate PO**: Create purchase orders for approved suppliers

### For Developers
1. **Setup Environment**: Follow installation steps
2. **Understand Architecture**: Review component structure
3. **Mock Data**: Use provided mock data for development
4. **API Integration**: Replace mock data with real API calls
5. **Customization**: Extend components as needed

## 📞 Support & Maintenance

### System Administration
- **User Management**: Role and permission management
- **Data Backup**: Regular data backup procedures
- **Performance Monitoring**: System performance tracking
- **Security Updates**: Regular security patch management

### Training & Documentation
- **User Training**: Role-specific training programs
- **System Documentation**: Comprehensive user guides
- **Technical Documentation**: Developer and admin guides
- **Best Practices**: Procurement process optimization

---

## 📄 License

This project is developed as a procurement management solution. Please refer to your organization's licensing requirements for deployment and usage guidelines.

## 🤝 Contributing

For contribution guidelines and development standards, please refer to the development team or project maintainers.

---

*Last Updated: June 2025*
*Version: 0.1.0*