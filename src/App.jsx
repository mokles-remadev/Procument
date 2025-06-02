import React, { useState } from 'react';
import { ConfigProvider } from 'antd';

import RFQManagement from './pages/RFQManagement';
import Dashboard from './pages/Dashboard';
import TBEManagement from './pages/TBEManagement';
import CBEManagement from './pages/CBEManagement';
import BODApproval from './pages/BODApproval';
import POManagement from './pages/POManagement';
import Suppliers from './pages/Suppliers';
import SupplierQuality from './pages/SupplierQuality';
import ExportDeclaration from './pages/ExportDeclaration';
import ProcLayout from './components/layout/ProcLayout';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const theme = {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorInfo: '#1890ff',
      borderRadius: 4,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  };
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'rfq':
        return <RFQManagement />;
      case 'tbe':
        return <TBEManagement />;
      case 'cbe':
        return <CBEManagement />;
      case 'bod':
        return <BODApproval />;
      case 'po':
        return <POManagement />;
      case 'suppliers':
        return <Suppliers />;      case 'quality':
        return <SupplierQuality />;
      case 'export':
        return <ExportDeclaration onNavigate={setCurrentPage} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfigProvider theme={theme}>
      <ProcLayout onMenuSelect={setCurrentPage}>
        {renderPage()}
      </ProcLayout>
    </ConfigProvider>
  );
}

export default App;