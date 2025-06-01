import React, { useState } from 'react';
import { Tabs } from 'antd';
import PackageList from '../components/packages/PackageList';
import ItemList from '../components/items/ItemList';
import { Package } from '../types/procurement';

const RFQManagement: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const handleBackToPackages = () => {
    setSelectedPackage(null);
  };

  return (
    <div>
      {selectedPackage ? (
        <ItemList 
          selectedPackage={selectedPackage} 
          onBackToPackages={handleBackToPackages} 
        />
      ) : (
        <PackageList onSelectPackage={handleSelectPackage} />
      )}
    </div>
  );
};

export default RFQManagement;