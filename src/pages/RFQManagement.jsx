import React, { useState, useCallback } from 'react';
import { Tabs, Card, Typography, Alert } from 'antd';
import PackageList from '../components/packages/PackageList';
import ItemList from '../components/items/ItemList';
import PropTypes from 'prop-types';

const { Title } = Typography;

const RFQManagement = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectPackage = useCallback((pkg) => {
    try {
      if (!pkg || !pkg.id) {
        throw new Error('Invalid package selected');
      }
      setSelectedPackage(pkg);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleBackToPackages = useCallback(() => {
    setSelectedPackage(null);
    setError(null);
  }, []);

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
      />
    );
  }

  return (
    <div className="rfq-management">
      <Card>
        {selectedPackage ? (
          <ItemList 
            selectedPackage={selectedPackage} 
            onBackToPackages={handleBackToPackages} 
          />
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Title level={3}>Request for Quotation Management</Title>
            </div>
            <PackageList onSelectPackage={handleSelectPackage} />
          </>
        )}
      </Card>
    </div>
  );
};

// PropTypes for development validation
RFQManagement.propTypes = {};

export default RFQManagement;
