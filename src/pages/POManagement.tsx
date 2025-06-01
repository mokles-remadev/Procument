import React, { useState } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Upload, message, Modal, Descriptions, Steps, Form, Input, DatePicker, Select, Alert } from 'antd';
import { FileTextOutlined, UploadOutlined, PrinterOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Package, PurchaseOrder, Quote } from '../types/procurement';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const POManagement: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [createPOModalVisible, setCreatePOModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [form] = Form.useForm();

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    return `${symbols[currency] || ''}${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Issued': return 'processing';
      case 'Signed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const packageColumns = [
    {
      title: 'Package ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Package) => (
        <a onClick={() => setSelectedPackage(record)}>{text}</a>
      ),
    },
    {
      title: 'Engineer',
      dataIndex: 'procurementEngineer',
      key: 'engineer',
      render: (engineer: { name: string }) => engineer.name,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Open' ? 'blue' : status === 'In Progress' ? 'orange' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Package) => (
        <Button type="primary" onClick={() => setSelectedPackage(record)}>
          Manage POs
        </Button>
      ),
    },
  ];

  const getApprovedSuppliers = () => {
    if (!selectedPackage) return [];
    
    const items = getItemsByPackageId(selectedPackage.id);
    const allQuotes = items.flatMap(item => getQuotesByItemId(item.id));
    
    // Get unique suppliers with BOD approved quotes
    const approvedSuppliers = [...new Set(
      allQuotes
        .filter(quote => quote.bodApproved)
        .map(quote => quote.supplierName)
    )];

    return approvedSuppliers;
  };

  const getApprovedItemsForSupplier = (supplierName: string) => {
    if (!selectedPackage) return [];
    
    const items = getItemsByPackageId(selectedPackage.id);
    return items.filter(item => {
      const quotes = getQuotesByItemId(item.id);
      return quotes.some(quote => 
        quote.supplierName === supplierName && 
        quote.bodApproved && 
        quote.technicalCompliance
      );
    });
  };

  const handleCreatePO = (values: any) => {
    if (!selectedSupplier) {
      message.error('Please select a supplier');
      return;
    }

    // Create PO logic here
    message.success('Purchase Order created successfully');
    setCreatePOModalVisible(false);
    form.resetFields();
  };

  const renderPackagePOs = () => {
    if (!selectedPackage) return null;

    const approvedSuppliers = getApprovedSuppliers();

    return (
      <div>
        <Button 
          type="link" 
          onClick={() => setSelectedPackage(null)} 
          style={{ paddingLeft: 0, marginBottom: 16 }}
        >
          ← Back to Packages
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Purchase Orders - {selectedPackage.name}</Title>
          <Button 
            type="primary"
            onClick={() => {
              if (approvedSuppliers.length === 0) {
                message.warning('No BOD approved suppliers available');
                return;
              }
              setCreatePOModalVisible(true);
            }}
          >
            Create New PO
          </Button>
        </div>

        {approvedSuppliers.length === 0 && (
          <Alert
            message="No BOD Approved Items"
            description="There are no BOD approved items for this package. Please ensure items are approved in BOD Approval before creating POs."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}

        <Modal
          title="Create Purchase Order"
          open={createPOModalVisible}
          onCancel={() => {
            setCreatePOModalVisible(false);
            setSelectedSupplier(null);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreatePO}
          >
            <Form.Item
              name="supplier"
              label="Supplier"
              rules={[{ required: true }]}
            >
              <Select 
                placeholder="Select supplier"
                onChange={(value) => setSelectedSupplier(value)}
              >
                {getApprovedSuppliers().map(supplier => (
                  <Option key={supplier} value={supplier}>{supplier}</Option>
                ))}
              </Select>
            </Form.Item>

            {selectedSupplier && (
              <>
                <Form.Item
                  name="items"
                  label="Approved Items"
                  rules={[{ required: true }]}
                >
                  <Select 
                    mode="multiple" 
                    placeholder="Select items"
                    optionLabelProp="label"
                  >
                    {getApprovedItemsForSupplier(selectedSupplier).map(item => {
                      const quote = getQuotesByItemId(item.id).find(q => 
                        q.supplierName === selectedSupplier && q.bodApproved
                      );
                      return (
                        <Option 
                          key={item.id} 
                          value={item.id}
                          label={item.name}
                        >
                          <Space>
                            <span>{item.name}</span>
                            <Tag color="green">
                              {formatCurrency(quote?.price || 0, quote?.currency || 'USD')}
                            </Tag>
                          </Space>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="deliveryTerm"
                  label="Delivery Term"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select delivery term">
                    <Option value="EXW">EXW</Option>
                    <Option value="FOB">FOB</Option>
                    <Option value="CIF">CIF</Option>
                    <Option value="DDP">DDP</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="deliveryDate"
                  label="Delivery Date"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="paymentTerms"
                  label="Payment Terms"
                  rules={[{ required: true }]}
                >
                  <TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Create PO
                    </Button>
                    <Button onClick={() => setCreatePOModalVisible(false)}>
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <div>
      {selectedPackage ? (
        renderPackagePOs()
      ) : (
        <>
          <Title level={4}>Purchase Order Management</Title>
          <Table 
            columns={packageColumns} 
            dataSource={packages}
            rowKey="id"
          />
        </>
      )}
    </div>
  );
};

export default POManagement;