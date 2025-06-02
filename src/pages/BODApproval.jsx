import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Tabs, 
  Badge, 
  Descriptions, 
  Collapse,
  message,
  Alert,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Statistic,
  Row,
  Col,
  Tooltip,
  Progress,
  Drawer
} from 'antd';
import { 
  FileTextOutlined, 
  FilePdfOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FileProtectOutlined,
  EyeOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const BODApproval = ({ 
  onApprovalSubmit = () => {},
  onApprovalUpdate = () => {},
  permissions = {
    canApprove: true,
    canReject: true,
    canView: true,
    canComment: true,
  },
  readOnly = false,
  showStatistics = true,
  autoRefresh = false,
  refreshInterval = 30000,
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [approvals, setApprovals] = useState({});
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    pendingApprovals: 0,
    approvedPackages: 0,
    rejectedPackages: 0,  });

  // Fetch dashboard statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stats = {
        totalPackages: packages.length,
        pendingApprovals: packages.filter(p => !approvals[p.id]).length,
        approvedPackages: Object.values(approvals).filter(a => a.status === 'approved').length,
        rejectedPackages: Object.values(approvals).filter(a => a.status === 'rejected').length,
      };
      
      setStatistics(stats);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [approvals]);

  // Auto refresh functionality
  useEffect(() => {
    fetchStatistics();
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatistics, autoRefresh, refreshInterval]);

  // Handle approval submission
  const handleApprovalSubmit = useCallback(async (values) => {
    if (!permissions.canApprove && !permissions.canReject) {
      message.warning('You do not have permission to submit approvals');
      return;
    }

    try {
      setLoading(true);
      
      const approvalData = {
        ...values,
        packageId: selectedPackage.id,
        supplierName: selectedSupplier,
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
        status: values.decision === 'approve' ? 'approved' : 'rejected',
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const approvalKey = `${selectedPackage.id}-${selectedSupplier}`;
      setApprovals(prev => ({
        ...prev,
        [approvalKey]: approvalData
      }));

      onApprovalSubmit(approvalData);
      message.success(`Approval ${values.decision === 'approve' ? 'granted' : 'rejected'} successfully`);
      setApprovalModalOpen(false);
      form.resetFields();
      
    } catch (err) {
      setError('Failed to submit approval');
      message.error('Failed to submit approval');
    } finally {
      setLoading(false);
    }
  }, [selectedPackage, selectedSupplier, permissions, onApprovalSubmit, form]);

  const formatCurrency = useCallback((amount, currency = 'USD') => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    return `${symbols[currency] || ''}${amount?.toLocaleString() || 0}`;
  }, []);

  const getApprovalStatus = useCallback((packageId, supplier) => {
    const key = `${packageId}-${supplier}`;
    return approvals[key]?.status || 'pending';
  }, [approvals]);
  const packageColumns = useMemo(() => [
    {
      title: 'Package ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => setSelectedPackage(record)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Engineer',
      dataIndex: 'procurementEngineer',
      key: 'engineer',
      render: (engineer) => (
        <Space>
          <TeamOutlined />
          <Text>{engineer.name}</Text>
        </Space>
      ),
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
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const progress = Math.round(((record.totalItems - record.openItems) / record.totalItems) * 100);
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Progress 
              percent={progress} 
              size="small"
              status={progress === 100 ? 'success' : 'active'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.totalItems - record.openItems}/{record.totalItems} quoted
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      render: (_, record) => {
        const items = getItemsByPackageId(record.id);
        const allQuotes = items.flatMap(item => getQuotesByItemId(item.id));
        const suppliers = [...new Set(allQuotes.map(q => q.supplierName))];
        
        const approvedSuppliers = suppliers.filter(supplier => 
          getApprovalStatus(record.id, supplier) === 'approved'
        ).length;
        
        return (
          <Space direction="vertical" size="small">
            <Badge 
              status={approvedSuppliers === suppliers.length ? 'success' : 'processing'}
              text={`${approvedSuppliers}/${suppliers.length} Approved`}
            />
          </Space>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Review Package">
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => setSelectedPackage(record)}
            >
              Review
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [getApprovalStatus]);

  const renderStatistics = useCallback(() => {
    if (!showStatistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Packages"
              value={statistics.totalPackages}
              prefix={<FileProtectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Approvals"
              value={statistics.pendingApprovals}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved"
              value={statistics.approvedPackages}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={statistics.rejectedPackages}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
    );
  }, [showStatistics, statistics]);

  const renderPackageDetails = () => {
    if (!selectedPackage) return null;

    const items = getItemsByPackageId(selectedPackage.id);
    const allQuotes = items.flatMap(item => getQuotesByItemId(item.id));
    const suppliers = [...new Set(allQuotes.map(q => q.supplierName))];

    return (
      <div>
        <Button 
          type="link" 
          onClick={() => setSelectedPackage(null)} 
          style={{ paddingLeft: 0, marginBottom: 16 }}
        >
          ← Back to Packages
        </Button>

        <Title level={4}>BOD Approval Review</Title>
        <Text type="secondary">Package: {selectedPackage.name} ({selectedPackage.id})</Text>

        <Card style={{ marginTop: 16, marginBottom: 24 }}>
          <Descriptions title="Package Overview" bordered column={2}>
            <Descriptions.Item label="Total Items">{items.length}</Descriptions.Item>
            <Descriptions.Item label="Total Suppliers">{suppliers.length}</Descriptions.Item>
            <Descriptions.Item label="Quoted Items">
              {items.filter(item => getQuotesByItemId(item.id).length > 0).length}
            </Descriptions.Item>
            <Descriptions.Item label="Pending Items">
              {items.filter(item => getQuotesByItemId(item.id).length === 0).length}
            </Descriptions.Item>
            <Descriptions.Item label="Engineer">{selectedPackage.procurementEngineer.name}</Descriptions.Item>
            <Descriptions.Item label="Due Date">{selectedPackage.dueDate}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs defaultActiveKey="suppliers">
          <TabPane tab="Supplier Comparison" key="suppliers">
            {suppliers.map(supplier => {
              const supplierQuotes = allQuotes.filter(q => q.supplierName === supplier);
              const totalValue = supplierQuotes.reduce((sum, q) => sum + q.price, 0);              const supplierStatus = getApprovalStatus(selectedPackage.id, supplier);
              const quotedItems = items.filter(item => 
                getQuotesByItemId(item.id).some(q => q.supplierName === supplier)
              );

              return (
                <Card 
                  key={supplier}
                  title={
                    <Space>
                      <Text>{supplier}</Text>
                      <Badge 
                        status={supplierStatus === 'approved' ? 'success' : supplierStatus === 'rejected' ? 'error' : 'processing'}
                        text={supplierStatus === 'pending' ? 'Pending' : supplierStatus}
                      />
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                  extra={
                    <Space>
                      <Text strong>Total Value: {formatCurrency(totalValue, supplierQuotes[0]?.currency || 'USD')}</Text>
                      {permissions.canApprove && supplierStatus !== 'approved' && (
                        <Button 
                          type="primary"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setApprovalModalOpen(true);
                          }}
                          disabled={readOnly}
                        >
                          {supplierStatus === 'rejected' ? 'Re-approve' : 'Approve'} Supplier
                        </Button>
                      )}
                      {supplierStatus === 'approved' && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Approved
                        </Tag>
                      )}
                      {supplierStatus === 'rejected' && (
                        <Tag color="red" icon={<CloseCircleOutlined />}>
                          Rejected
                        </Tag>
                      )}
                    </Space>
                  }
                >
                  <Collapse defaultActiveKey={['1']}>
                    <Panel header="Supplier Overview" key="1">
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="Quoted Items">{quotedItems.length}</Descriptions.Item>
                        <Descriptions.Item label="Technical Compliance">
                          {supplierQuotes.filter(q => q.technicalCompliance).length} / {supplierQuotes.length}
                        </Descriptions.Item>
                        <Descriptions.Item label="Average Delivery">
                          {Math.round(supplierQuotes.reduce((sum, q) => sum + q.deliveryTime, 0) / supplierQuotes.length)} days
                        </Descriptions.Item>
                        <Descriptions.Item label="Best Price Items">
                          {supplierQuotes.filter(q => {
                            const itemQuotes = getQuotesByItemId(q.itemId);
                            return q.price === Math.min(...itemQuotes.map(iq => iq.price));
                          }).length}
                        </Descriptions.Item>
                      </Descriptions>
                    </Panel>

                    <Panel header="Quoted Items" key="2">
                      <Table
                        dataSource={quotedItems}
                        columns={[
                          { title: 'Item', dataIndex: 'name', key: 'name' },
                          { title: 'Specification', dataIndex: 'specification', key: 'specification', ellipsis: true },
                          { 
                            title: 'Price',
                            key: 'price',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              return quote ? formatCurrency(quote.price, quote.currency) : '-';
                            }
                          },
                          {
                            title: 'Technical',
                            key: 'technical',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              return quote?.technicalCompliance ? 
                                <Badge status="success" text="Compliant" /> : 
                                <Badge status="error" text="Non-compliant" />;
                            }
                          },
                          {
                            title: 'Best Price',
                            key: 'bestPrice',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              const itemQuotes = getQuotesByItemId(record.id);
                              const isBestPrice = quote && quote.price === Math.min(...itemQuotes.map(q => q.price));
                              return isBestPrice ? 
                                <Tag color="green">Best Price</Tag> : 
                                <Tag color="orange">Higher Price</Tag>;
                            }
                          },
                          {
                            title: 'Documents',
                            key: 'documents',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              return (
                                <Space>
                                  {quote?.documents?.map((doc, index) => (
                                    <Button
                                      key={index}
                                      icon={doc.endsWith('.pdf') ? <FilePdfOutlined /> : <FileTextOutlined />}
                                      onClick={() => window.open(doc, '_blank')}
                                    >
                                      Doc {index + 1}
                                    </Button>
                                  ))}
                                </Space>
                              );
                            }
                          }
                        ]}
                        pagination={false}
                      />
                    </Panel>
                  </Collapse>
                </Card>
              );
            })}
          </TabPane>

          <TabPane tab="Pending Items" key="pending">
            <Table
              dataSource={items.filter(item => getQuotesByItemId(item.id).length === 0)}
              columns={[
                { title: 'Item', dataIndex: 'name', key: 'name' },
                { title: 'Specification', dataIndex: 'specification', key: 'specification' },
                { title: 'Category', dataIndex: 'category', key: 'category' },
                { 
                  title: 'Status',
                  key: 'status',
                  render: () => <Tag color="red">Not Quoted</Tag>
                }
              ]}
            />
          </TabPane>

          <TabPane tab="Item Comparison" key="comparison">
            <Table
              dataSource={items.filter(item => getQuotesByItemId(item.id).length > 0)}
              columns={[
                { title: 'Item', dataIndex: 'name', key: 'name' },
                { 
                  title: 'Quotes',
                  key: 'quotes',
                  render: (_, record) => {
                    const quotes = getQuotesByItemId(record.id);
                    return (
                      <Collapse>
                        <Panel 
                          header={`${quotes.length} Quotes (Best: ${
                            formatCurrency(
                              Math.min(...quotes.map(q => q.price)),
                              quotes[0].currency
                            )
                          })`} 
                          key="1"
                        >
                          {quotes.map(quote => (
                            <Card key={quote.id} size="small" style={{ marginBottom: 8 }}>
                              <Space direction="vertical">
                                <Space>
                                  <Text strong>{quote.supplierName}</Text>
                                  <Text type="secondary">|</Text>
                                  <Text>{formatCurrency(quote.price, quote.currency)}</Text>
                                  <Text type="secondary">|</Text>
                                  <Text>{quote.deliveryTime} days</Text>
                                </Space>
                                <Space>
                                  {quote.technicalCompliance ? 
                                    <Tag icon={<CheckCircleOutlined />} color="success">
                                      Technical: Compliant
                                    </Tag> :
                                    <Tag icon={<CloseCircleOutlined />} color="error">
                                      Technical: Non-compliant
                                    </Tag>
                                  }
                                  <Tag color="blue">{quote.deliveryTerm}</Tag>
                                  <Tag>{quote.materialOrigin}</Tag>
                                </Space>
                              </Space>
                            </Card>
                          ))}
                        </Panel>
                      </Collapse>
                    );
                  }
                }
              ]}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  };
  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>BOD Approval Management</Title>
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
            renderPackageDetails()
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

      {/* Approval Modal */}
      <Modal
        title="Supplier Approval"
        open={approvalModalOpen}
        onCancel={() => setApprovalModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleApprovalSubmit}
          layout="vertical"
        >
          <Alert
            message={`Package: ${selectedPackage?.name || ''}`}
            description={`Supplier: ${selectedSupplier || ''}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="decision"
            label="Approval Decision"
            rules={[{ required: true, message: 'Please make a decision' }]}
          >
            <Select placeholder="Select approval decision">
              <Option value="approve">
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  Approve Supplier
                </Space>
              </Option>
              <Option value="reject">
                <Space>
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  Reject Supplier
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="comments"
            label="Comments"
            rules={[{ required: true, message: 'Please provide comments' }]}
          >
            <TextArea
              rows={4}
              placeholder="Provide detailed comments for your decision..."
            />
          </Form.Item>

          <Form.Item
            name="conditions"
            label="Special Conditions (Optional)"
          >
            <TextArea
              rows={3}
              placeholder="Any special conditions or requirements..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setApprovalModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                Submit Decision
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// PropTypes validation
BODApproval.propTypes = {
  onApprovalSubmit: PropTypes.func,
  onApprovalUpdate: PropTypes.func,
  permissions: PropTypes.shape({
    canApprove: PropTypes.bool,
    canReject: PropTypes.bool,
    canView: PropTypes.bool,
    canComment: PropTypes.bool,
  }),
  readOnly: PropTypes.bool,
  showStatistics: PropTypes.bool,
  autoRefresh: PropTypes.bool,
  refreshInterval: PropTypes.number,
  filterConfig: PropTypes.shape({
    showApproved: PropTypes.bool,
    showPending: PropTypes.bool,
    showRejected: PropTypes.bool,
  }),
  customColumns: PropTypes.array,
  exportEnabled: PropTypes.bool,
};

// Default props
BODApproval.defaultProps = {
  onApprovalSubmit: () => {},
  onApprovalUpdate: () => {},
  permissions: {
    canApprove: true,
    canReject: true,
    canView: true,
    canComment: true,
  },
  readOnly: false,
  showStatistics: true,
  autoRefresh: false,
  refreshInterval: 30000,
  filterConfig: {
    showApproved: true,
    showPending: true,
    showRejected: true,
  },
  customColumns: [],
  exportEnabled: false,
};

export default BODApproval;
