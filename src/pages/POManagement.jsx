import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Upload, 
  message, 
  Modal, 
  Descriptions, 
  Steps, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Alert,
  Spin,
  Badge,
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col,
  Divider,
  Timeline
} from 'antd';
import { 
  FileTextOutlined, 
  UploadOutlined, 
  PrinterOutlined, 
  CheckCircleOutlined, 
  WarningOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const POManagement = ({
  onPOCreate = () => {},
  onPOUpdate = () => {},
  onPODelete = () => {},
  permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canApprove: true,
  },
  readOnly = false,
  showStatistics = true,
  autoSave = true,
  notificationEnabled = true,
  exportFormats = ['PDF', 'Excel'],
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [createPOModalVisible, setCreatePOModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalPOs: 0,
    draftPOs: 0,
    issuedPOs: 0,
    totalValue: 0,  });

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const allPOs = Object.values(purchaseOrders);
      const totalValue = allPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

      setStatistics({
        totalPOs: allPOs.length,
        draftPOs: allPOs.filter(po => po.status === 'Draft').length,
        issuedPOs: allPOs.filter(po => po.status === 'Issued').length,
        totalValue,
      });
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [purchaseOrders]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleCreatePO = useCallback(async (values) => {
    if (!permissions.canCreate || readOnly) {
      message.warning('You do not have permission to create purchase orders');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const poData = {
        ...values,
        id: `PO-${Date.now()}`,
        packageId: selectedPackage.id,
        supplierName: selectedSupplier,
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        status: 'Draft',
        totalAmount: calculateTotalAmount(values.items),
      };

      setPurchaseOrders(prev => ({
        ...prev,
        [poData.id]: poData
      }));

      onPOCreate(poData);
      message.success('Purchase order created successfully');
      setCreatePOModalVisible(false);
      form.resetFields();
      
    } catch (err) {
      setError('Failed to create purchase order');
      message.error('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  }, [selectedPackage, selectedSupplier, permissions.canCreate, readOnly, onPOCreate, form]);

  const calculateTotalAmount = useCallback((items = []) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, []);

  const formatCurrency = useCallback((amount, currency = 'USD') => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    return `${symbols[currency] || ''}${amount?.toLocaleString() || 0}`;
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Issued': return 'processing';
      case 'Signed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  }, []);

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
      render: (text, record) => (
        <a onClick={() => setSelectedPackage(record)}>{text}</a>
      ),
    },
    {
      title: 'Engineer',
      dataIndex: 'procurementEngineer',
      key: 'engineer',
      render: (engineer) => engineer.name,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Open' ? 'blue' : status === 'In Progress' ? 'orange' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
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

  const getApprovedItemsForSupplier = (supplierName) => {
    if (!selectedPackage) return [];
    
    const items = getItemsByPackageId(selectedPackage.id);
    return items.filter(item => {
      const quotes = getQuotesByItemId(item.id);
      return quotes.some(quote => 
        quote.supplierName === supplierName && 
        quote.bodApproved && 
        quote.technicalCompliance
      );    });
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
      </div>    );
  };

  const renderStatistics = useCallback(() => {
    if (!showStatistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Purchase Orders"
              value={statistics.totalPOs}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Draft POs"
              value={statistics.draftPOs}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Issued POs"
              value={statistics.issuedPOs}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={statistics.totalValue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
    );
  }, [showStatistics, statistics, formatCurrency]);

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Purchase Order Management</Title>
          {readOnly && (
            <Tag color="orange">Read Only Mode</Tag>
          )}
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {!selectedPackage && renderStatistics()}

        <Spin spinning={loading}>
          {selectedPackage ? (
            renderPackagePOs()
          ) : (
            <Card>
              <Table 
                columns={packageColumns} 
                dataSource={packages}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} packages`,
                }}
              />
            </Card>
          )}
        </Spin>
      </Space>
    </div>
  );
};

// PropTypes validation
POManagement.propTypes = {
  onPOCreate: PropTypes.func,
  onPOUpdate: PropTypes.func,
  onPODelete: PropTypes.func,
  permissions: PropTypes.shape({
    canCreate: PropTypes.bool,
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    canView: PropTypes.bool,
    canApprove: PropTypes.bool,
  }),
  readOnly: PropTypes.bool,
  showStatistics: PropTypes.bool,
  autoSave: PropTypes.bool,
  notificationEnabled: PropTypes.bool,
  exportFormats: PropTypes.arrayOf(PropTypes.string),
};

// Default props
POManagement.defaultProps = {
  onPOCreate: () => {},
  onPOUpdate: () => {},
  onPODelete: () => {},
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canApprove: true,
  },
  readOnly: false,
  showStatistics: true,
  autoSave: true,
  notificationEnabled: true,
  exportFormats: ['PDF', 'Excel'],
};

export default POManagement;
