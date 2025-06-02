import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  message,
  Tabs, 
  Badge, 
  Descriptions, 
  Collapse 
} from 'antd';
import { 
  DollarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined, 
  FilePdfOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const CBEManagement = ({ 
  readOnly = false,
  onEvaluationComplete = () => {},
  onSupplyChainApprovalComplete = () => {},
  allowMultipleSelections = false,
  customCurrencySymbols = {},
  permissions = {
    canEvaluate: true,
    canApprove: true,
    canViewSupplyChain: true,
    canEditSupplyChain: true  }
}) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [evaluationDrawerOpen, setEvaluationDrawerOpen] = useState(false);
  const [scApprovalDrawerOpen, setScApprovalDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvalForm] = Form.useForm();
  const [form] = Form.useForm();

  const handleEvaluate = (item) => {
    if (!permissions.canEvaluate || readOnly) {
      message.warning('You do not have permission to evaluate items');
      return;
    }
    setSelectedItem(item);
    setEvaluationDrawerOpen(true);
  };  const handleSupplyChainApproval = (packageRecord) => {
    if (!permissions.canViewSupplyChain) {
      message.warning('You do not have permission to view Supply Chain Manager approval');
      return;
    }
    
    // Set the selected package first, then open the drawer
    setSelectedPackage(packageRecord);
    setScApprovalDrawerOpen(true);
  };

  const handleEvaluationSubmit = async (values) => {
    if (!permissions.canEvaluate || readOnly) {
      message.warning('You do not have permission to submit evaluations');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const evaluationData = {
        ...values,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        packageId: selectedPackage?.id,
        evaluatedBy: 'Current User', // This would come from auth context
        evaluatedAt: new Date().toISOString(),
        status: 'completed'
      };

      onEvaluationComplete(evaluationData);
      message.success('Commercial evaluation submitted successfully');
      setEvaluationDrawerOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit evaluation');
      console.error('Evaluation submission error:', error);
    } finally {
      setLoading(false);
    }
  };  const handleSupplyChainApprovalSubmit = async (values) => {
    if (!permissions.canApprove || readOnly) {
      message.warning('You do not have permission to approve packages');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const approvalData = {
        packageId: selectedPackage?.id,
        decision: values.decision,
        comments: values.comments,
        riskAssessment: values.riskAssessment,
        recommendedSuppliers: values.recommendedSuppliers || [],
        conditions: values.conditions,
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
        status: values.decision === 'approved' ? 'approved' : 'rejected'
      };

      onSupplyChainApprovalComplete(approvalData);
      message.success(`Package ${values.decision === 'approved' ? 'approved' : 'rejected'} successfully`);
      setScApprovalDrawerOpen(false);
      approvalForm.resetFields();
    } catch (error) {
      message.error('Failed to submit Supply Chain Manager approval');
      console.error('Supply Chain Manager approval error:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount, currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      ...customCurrencySymbols
    };
    
    // Handle invalid amounts
    if (amount == null || isNaN(amount) || typeof amount !== 'number') {
      return `${symbols[currency] || ''}0`;
    }
    
    return `${symbols[currency] || ''}${amount.toLocaleString()}`;
  };

  const packageColumns = [
    {
      title: 'Package ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong style={{ color: '#1890ff' }}>{id}</Text>,
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
      render: (engineer) => engineer?.name || 'Unassigned',
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
        <Space>
          <Button 
            type="primary" 
            onClick={() => setSelectedPackage(record)}
            disabled={readOnly}          >
            Review Items
          </Button>          {permissions.canViewSupplyChain && (
            <Button 
              onClick={() => handleSupplyChainApproval(record)}
              disabled={readOnly}
            >
              Supply Chain Approval
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'Item ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>{id}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text style={{ color: '#1890ff' }}>{name}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Compliant Quotes',
      key: 'compliantQuotes',
      render: (_, record) => {
        const quotes = getQuotesByItemId(record.id);
        const compliantQuotes = quotes.filter(q => q.technicalCompliance);
        return (
          <Space>
            <Badge 
              count={compliantQuotes.length} 
              style={{ backgroundColor: compliantQuotes.length > 0 ? '#52c41a' : '#f5222d' }} 
            />
            <Text type="secondary">/ {quotes.length}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Best Price',
      key: 'bestPrice',
      render: (_, record) => {
        const quotes = getQuotesByItemId(record.id);
        const compliantQuotes = quotes.filter(q => q.technicalCompliance);
        if (compliantQuotes.length === 0) return <Text type="secondary">-</Text>;
        
        const bestQuote = compliantQuotes.reduce((prev, curr) => 
          prev.price < curr.price ? prev : curr
        );
        return (
          <Text strong style={{ color: '#52c41a' }}>
            {formatCurrency(bestQuote.price, bestQuote.currency)}
          </Text>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const quotes = getQuotesByItemId(record.id);
        const hasCompliantQuotes = quotes.some(q => q.technicalCompliance);
        return (
          <Button 
            type="primary" 
            icon={<DollarOutlined />}
            onClick={() => handleEvaluate(record)}
            disabled={!hasCompliantQuotes || !permissions.canEvaluate || readOnly}
          >
            Evaluate
          </Button>
        );
      },
    },
  ];

  const renderCommercialEvaluation = () => {
    if (!selectedItem) return null;

    const quotes = getQuotesByItemId(selectedItem.id)
      .filter(quote => quote.technicalCompliance);

    if (quotes.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ClockCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
          <Title level={4}>No Compliant Quotes Available</Title>
          <Text type="secondary">
            This item has no technically compliant quotes to evaluate.
          </Text>
        </div>
      );
    }

    return (
      <Form form={form} onFinish={handleEvaluationSubmit} layout="vertical">
        <Card 
          title="Item Information" 
          style={{ marginBottom: 16 }}
          size="small"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Item ID">{selectedItem.id}</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{selectedItem.quantity} {selectedItem.unit}</Descriptions.Item>
            <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
            <Descriptions.Item label="Specification" span={2}>
              {selectedItem.specification}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Form.Item
          name="selectedQuote"
          label="Select Best Quote"
          rules={[{ required: true, message: 'Please select the best quote' }]}
        >
          <Select style={{ width: '100%' }} placeholder="Choose the winning quote">
            {quotes.map(quote => (
              <Option key={quote.id} value={quote.id}>
                <Space justify="space-between" style={{ width: '100%' }}>
                  <Text>{quote.supplierName}</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {formatCurrency(quote.price, quote.currency)}
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="selectionReason"
          label="Selection Criteria"
          rules={[{ required: true, message: 'Please specify the reason for selection' }]}
        >
          <Select 
            mode="multiple" 
            style={{ width: '100%' }}
            placeholder="Select applicable criteria"
          >
            <Option value="lowest_price">Lowest Price</Option>
            <Option value="best_technical">Best Technical Specifications</Option>
            <Option value="best_delivery">Best Delivery Time</Option>
            <Option value="best_terms">Best Commercial Terms</Option>
            <Option value="best_warranty">Best Warranty Terms</Option>
            <Option value="supplier_reputation">Supplier Reputation</Option>
            <Option value="local_supplier">Local Supplier Preference</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="comments"
          label="Evaluation Comments"
          rules={[{ required: true, message: 'Please provide evaluation comments' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Provide detailed evaluation comments including technical and commercial considerations..."
          />
        </Form.Item>

        <Title level={5} style={{ marginTop: 24 }}>Quote Comparison</Title>
        {quotes.map(quote => (
          <Card 
            key={quote.id} 
            title={
              <Space>
                <Text strong>{quote.supplierName}</Text>
                {quote.isPreferred && <Badge status="success" text="Preferred" />}
              </Space>
            }
            style={{ marginBottom: 16 }}
            extra={
              <Tag color={quote.price === Math.min(...quotes.map(q => q.price)) ? 'green' : 'blue'}>
                {formatCurrency(quote.price, quote.currency)}
              </Tag>
            }
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary">Delivery Term: </Text>
                  <Tag>{quote.deliveryTerm}</Tag>
                </div>
                <div>
                  <Text type="secondary">Delivery Time: </Text>
                  <Text>{quote.deliveryTime} days</Text>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text type="secondary">Material Origin: </Text>
                  <Text>{quote.materialOrigin}</Text>
                </div>
                <div>
                  <Text type="secondary">Valid Until: </Text>
                  <Text>{new Date(quote.validUntil).toLocaleDateString()}</Text>
                </div>
              </div>
              {quote.notes && (
                <div>
                  <Text type="secondary">Notes: </Text>
                  <Text>{quote.notes}</Text>
                </div>
              )}
              {quote.documents?.length > 0 && (
                <Space wrap>
                  <Text type="secondary">Documents:</Text>
                  {quote.documents.map((doc, index) => (
                    <Button 
                      key={index}
                      type="link" 
                      icon={<FileTextOutlined />}
                      size="small"
                      onClick={() => message.info('Document preview would open here')}
                    >
                      Doc {index + 1}
                    </Button>
                  ))}
                </Space>
              )}
            </Space>
          </Card>
        ))}

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              icon={<CheckCircleOutlined />}
            >
              Submit Commercial Evaluation
            </Button>
            <Button 
              onClick={() => {
                setEvaluationDrawerOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>    </Form>
    );
  };

  const renderSupplyChainApproval = () => {
    if (!selectedPackage) {
      console.log('No selected package for approval');
      return null;
    }

    console.log('Selected package:', selectedPackage);
    
    const items = getItemsByPackageId(selectedPackage.id);
    const allQuotes = items.flatMap(item => getQuotesByItemId(item.id));
    const suppliers = [...new Set(allQuotes.map(q => q.supplierName))];
    
    console.log('Items:', items);
    console.log('All quotes:', allQuotes);
    console.log('Suppliers:', suppliers);
    
    // Calculate package totals and statistics
    const packageTotalValue = allQuotes.reduce((sum, q) => sum + q.price, 0);
    const compliantQuotes = allQuotes.filter(q => q.technicalCompliance);
    const complianceRate = allQuotes.length > 0 ? (compliantQuotes.length / allQuotes.length * 100).toFixed(1) : '0';
    
    console.log('Package total value:', packageTotalValue);
    console.log('Compliant quotes:', compliantQuotes);
    console.log('Compliance rate:', complianceRate);
      // Calculate potential savings and best options
    const supplierAnalysis = suppliers.map(supplier => {
      const supplierQuotes = allQuotes.filter(q => q.supplierName === supplier);
      const compliantSupplierQuotes = supplierQuotes.filter(q => q.technicalCompliance);
      const totalValue = compliantSupplierQuotes.reduce((sum, q) => sum + q.price, 0);
      const avgDeliveryTime = compliantSupplierQuotes.length > 0 
        ? compliantSupplierQuotes.reduce((sum, q) => sum + q.deliveryTime, 0) / compliantSupplierQuotes.length 
        : 0;
      
      return {
        supplier,
        quotedItems: supplierQuotes.length,
        compliantItems: compliantSupplierQuotes.length,
        totalValue,
        avgDeliveryTime: Math.round(avgDeliveryTime),
        complianceRate: supplierQuotes.length > 0 
          ? (compliantSupplierQuotes.length / supplierQuotes.length * 100).toFixed(1)
          : '0'
      };
    }).sort((a, b) => b.compliantItems - a.compliantItems);

    console.log('Supplier analysis:', supplierAnalysis);

    // Utility functions for supply chain analysis
    const calculateCostSavings = (suppliers) => {
      if (suppliers.length < 2) return 0;
      const costs = suppliers.map(s => s.totalValue).sort((a, b) => a - b);
      return ((costs[costs.length - 1] - costs[0]) / costs[costs.length - 1] * 100).toFixed(1);
    };

    const getSupplyChainRecommendation = (supplierAnalysis, complianceRate) => {
      const topSupplier = supplierAnalysis[0];
      if (!topSupplier) return "Insufficient data for recommendation";
      
      if (parseFloat(complianceRate) >= 90 && supplierAnalysis.length >= 3) {
        return "Strong supplier pool with excellent compliance. Recommend proceeding with competitive selection.";
      } else if (parseFloat(complianceRate) >= 70) {
        return "Adequate supplier options available. Consider negotiating with top suppliers for better terms.";
      } else {
        return "Limited compliant options. Recommend re-evaluating requirements or seeking additional suppliers.";
      }
    };

    const assessDeliveryRisk = (avgDeliveryTime) => {
      if (avgDeliveryTime <= 30) return { level: "Low", color: "green", description: "Excellent delivery timeline" };
      if (avgDeliveryTime <= 60) return { level: "Medium", color: "orange", description: "Acceptable delivery timeline" };
      return { level: "High", color: "red", description: "Extended delivery timeline - consider expediting" };
    };

    return (
      <div>
        <Title level={4}>Supply Chain Manager Approval Review</Title>
        <Text type="secondary">Package: {selectedPackage.name}</Text>
        
        <Tabs defaultActiveKey="summary" style={{ marginTop: 16 }}>
          <TabPane tab="Executive Summary" key="summary">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Package Overview */}
              <Card title="Package Overview" size="small">
                <Descriptions bordered column={3} size="small">
                  <Descriptions.Item label="Package ID">{selectedPackage.id}</Descriptions.Item>
                  <Descriptions.Item label="Procurement Engineer">
                    {selectedPackage.procurementEngineer?.name || 'Unassigned'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Creation Date">
                    {new Date(selectedPackage.creationDate).toLocaleDateString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Items">{items.length}</Descriptions.Item>
                  <Descriptions.Item label="Total Quotes">{allQuotes.length}</Descriptions.Item>
                  <Descriptions.Item label="Compliant Quotes">{compliantQuotes.length}</Descriptions.Item>
                  <Descriptions.Item label="Total Suppliers">{suppliers.length}</Descriptions.Item>
                  <Descriptions.Item label="Compliance Rate">{complianceRate}%</Descriptions.Item>                  <Descriptions.Item label="Est. Package Value">
                    {allQuotes.length > 0 ? formatCurrency(packageTotalValue, allQuotes[0]?.currency || 'USD') : '$0'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Cost Analysis */}
              <Card title="Cost Analysis & Supplier Ranking" size="small">
                <Table
                  dataSource={supplierAnalysis}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Rank',
                      key: 'rank',
                      render: (_, __, index) => (
                        <Badge 
                          count={index + 1} 
                          style={{ 
                            backgroundColor: index === 0 ? '#52c41a' : index === 1 ? '#faad14' : '#1890ff' 
                          }} 
                        />
                      ),
                      width: 60
                    },
                    {
                      title: 'Supplier',
                      dataIndex: 'supplier',
                      key: 'supplier',
                      render: (supplier, record, index) => (
                        <Space>
                          <Text strong style={{ color: index === 0 ? '#52c41a' : 'inherit' }}>
                            {supplier}
                          </Text>
                          {index === 0 && <Tag color="green">Recommended</Tag>}
                        </Space>
                      )
                    },
                    {
                      title: 'Compliant Items',
                      dataIndex: 'compliantItems',
                      key: 'compliantItems',
                      render: (compliant, record) => (
                        <Space>
                          <Text strong>{compliant}</Text>
                          <Text type="secondary">/ {record.quotedItems}</Text>
                        </Space>
                      )
                    },
                    {
                      title: 'Compliance Rate',
                      dataIndex: 'complianceRate',
                      key: 'complianceRate',
                      render: (rate) => (
                        <Tag color={parseFloat(rate) >= 90 ? 'green' : parseFloat(rate) >= 70 ? 'orange' : 'red'}>
                          {rate}%
                        </Tag>
                      )
                    },                    {
                      title: 'Total Value',
                      dataIndex: 'totalValue',
                      key: 'totalValue',
                      render: (value) => (
                        <Text strong style={{ color: '#52c41a' }}>
                          {allQuotes.length > 0 ? formatCurrency(value, allQuotes[0]?.currency || 'USD') : '$0'}
                        </Text>
                      )
                    },
                    {
                      title: 'Avg Delivery',
                      dataIndex: 'avgDeliveryTime',
                      key: 'avgDeliveryTime',
                      render: (days) => `${days} days`
                    }
                  ]}
                />
              </Card>

              {/* Risk Assessment */}
              <Card title="Supply Chain Risk Assessment" size="small">
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Supplier Diversity">
                    {suppliers.length >= 3 ? (
                      <Badge status="success" text={`Good (${suppliers.length} suppliers)`} />
                    ) : (
                      <Badge status="warning" text={`Limited (${suppliers.length} suppliers)`} />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Technical Compliance">
                    {parseFloat(complianceRate) >= 80 ? (
                      <Badge status="success" text={`Excellent (${complianceRate}%)`} />
                    ) : parseFloat(complianceRate) >= 60 ? (
                      <Badge status="warning" text={`Acceptable (${complianceRate}%)`} />
                    ) : (
                      <Badge status="error" text={`Poor (${complianceRate}%)`} />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Delivery Risk">
                    {supplierAnalysis[0]?.avgDeliveryTime <= 30 ? (
                      <Badge status="success" text="Low Risk" />
                    ) : supplierAnalysis[0]?.avgDeliveryTime <= 60 ? (
                      <Badge status="warning" text="Medium Risk" />
                    ) : (
                      <Badge status="error" text="High Risk" />
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cost Competitiveness">
                    {supplierAnalysis.length >= 2 ? (
                      <Badge status="success" text="Competitive Bidding" />
                    ) : (
                      <Badge status="warning" text="Limited Competition" />
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </TabPane>

          <TabPane tab="Detailed Analysis" key="detailed">
            {suppliers.map(supplier => {
              const supplierQuotes = allQuotes.filter(q => q.supplierName === supplier);
              const compliantQuotes = supplierQuotes.filter(q => q.technicalCompliance);
              const totalValue = compliantQuotes.reduce((sum, q) => sum + q.price, 0);
              const avgDeliveryTime = compliantQuotes.reduce((sum, q) => sum + q.deliveryTime, 0) / compliantQuotes.length;
              const quotedItems = items.filter(item => 
                getQuotesByItemId(item.id).some(q => q.supplierName === supplier)
              );

              return (
                <Card 
                  key={supplier}
                  title={supplier}
                  style={{ marginBottom: 16 }}
                  extra={
                    <Space>
                      <Tag color={compliantQuotes.length === supplierQuotes.length ? 'green' : 'orange'}>
                        {compliantQuotes.length}/{supplierQuotes.length} Compliant
                      </Tag>
                      <Text strong>{formatCurrency(totalValue, supplierQuotes[0]?.currency || 'USD')}</Text>
                    </Space>
                  }
                >
                  <Collapse>
                    <Panel header="Supplier Performance Summary" key="1">
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Quoted Items">{quotedItems.length}</Descriptions.Item>
                        <Descriptions.Item label="Total Value">
                          {formatCurrency(totalValue, supplierQuotes[0]?.currency || 'USD')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Average Delivery Time">
                          {Math.round(avgDeliveryTime)} days
                        </Descriptions.Item>
                        <Descriptions.Item label="Compliance Rate">
                          {((compliantQuotes.length / supplierQuotes.length) * 100).toFixed(1)}%
                        </Descriptions.Item>
                      </Descriptions>
                    </Panel>
                    
                    <Panel header="Item-by-Item Analysis" key="2">
                      <Table
                        dataSource={quotedItems}
                        pagination={false}
                        size="small"
                        columns={[
                          { 
                            title: 'Item', 
                            dataIndex: 'name', 
                            key: 'name',
                            render: (name) => <Text strong>{name}</Text>
                          },
                          { 
                            title: 'Specification', 
                            dataIndex: 'specification', 
                            key: 'specification',
                            ellipsis: true
                          },
                          { 
                            title: 'Price',
                            key: 'price',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              return quote ? (
                                <Text strong style={{ color: '#52c41a' }}>
                                  {formatCurrency(quote.price, quote.currency)}
                                </Text>
                              ) : '-';
                            }
                          },
                          {
                            title: 'Technical Compliance',
                            key: 'technical',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              return quote?.technicalCompliance ? 
                                <Badge status="success" text="Compliant" /> : 
                                <Badge status="error" text="Non-compliant" />;
                            }
                          },
                          {
                            title: 'Delivery',
                            key: 'delivery',
                            render: (_, record) => {
                              const quote = supplierQuotes.find(q => q.itemId === record.id);
                              return quote ? `${quote.deliveryTime} days` : '-';
                            }
                          }
                        ]}
                      />
                    </Panel>
                  </Collapse>
                </Card>
              );
            })}
          </TabPane>

          <TabPane tab="Approval Decision" key="approval">
            <Card title="Supply Chain Manager Approval Decision">
              <Form
                form={approvalForm}
                layout="vertical"
                onFinish={handleSupplyChainApprovalSubmit}
              >
                <Form.Item
                  name="decision"
                  label="Approval Decision"
                  rules={[{ required: true, message: 'Please select a decision' }]}
                >
                  <Select placeholder="Select approval decision">
                    <Option value="approved">✅ Approve Package</Option>
                    <Option value="conditionally_approved">⚠️ Conditionally Approve</Option>
                    <Option value="rejected">❌ Reject Package</Option>
                    <Option value="request_clarification">❓ Request Clarification</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="recommendedSuppliers"
                  label="Recommended Suppliers (for approval/conditional approval)"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select recommended suppliers"
                    allowClear
                  >
                    {supplierAnalysis.map(analysis => (
                      <Option key={analysis.supplier} value={analysis.supplier}>
                        {analysis.supplier} ({analysis.compliantItems} compliant items)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="riskAssessment"
                  label="Risk Assessment"
                  rules={[{ required: true, message: 'Please provide risk assessment' }]}
                >
                  <Select placeholder="Select overall risk level">
                    <Option value="low">🟢 Low Risk - Proceed with confidence</Option>
                    <Option value="medium">🟡 Medium Risk - Monitor closely</Option>
                    <Option value="high">🔴 High Risk - Requires mitigation</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="conditions"
                  label="Conditions/Requirements (if applicable)"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Specify any conditions for approval, required clarifications, or additional requirements..."
                  />
                </Form.Item>

                <Form.Item
                  name="comments"
                  label="Supply Chain Manager Comments"
                  rules={[{ required: true, message: 'Please provide approval comments' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Provide detailed comments on the approval decision, rationale, supply chain considerations, risk factors, and recommendations..."
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={loading}
                      icon={<CheckCircleOutlined />}
                    >
                      Submit Approval Decision
                    </Button>
                    <Button 
                      onClick={() => {
                        setScApprovalDrawerOpen(false);
                        approvalForm.resetFields();
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="Pending Items" key="pending">
            <Card title="Items Awaiting Quotes">
              <Table
                dataSource={items.filter(item => getQuotesByItemId(item.id).length === 0)}
                columns={[
                  { 
                    title: 'Item ID', 
                    dataIndex: 'id', 
                    key: 'id',
                    render: (id) => <Text strong>{id}</Text>
                  },
                  { title: 'Name', dataIndex: 'name', key: 'name' },
                  { title: 'Specification', dataIndex: 'specification', key: 'specification', ellipsis: true },
                  { 
                    title: 'Category', 
                    dataIndex: 'category', 
                    key: 'category',
                    render: (category) => <Tag color="blue">{category}</Tag>
                  },
                  { 
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: () => <Tag color="red">Awaiting Quotes</Tag>
                  },
                  {
                    title: 'Action Required',
                    key: 'action',
                    render: () => <Text type="secondary">Follow up with suppliers</Text>
                  }
                ]}
                size="small"
                locale={{
                  emptyText: (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                      <div>All items have received quotes</div>
                    </div>
                  )
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    );
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Commercial Bid Evaluation</Title>
          {readOnly && (
            <Tag color="orange">Read Only Mode</Tag>
          )}
        </div>
        
        {!selectedPackage ? (
          <Card>
            <Table 
              columns={packageColumns} 
              dataSource={packages}
              rowKey="id"
              size="small"
            />
          </Card>
        ) : (
          <>
            <Button 
              type="link" 
              onClick={() => setSelectedPackage(null)} 
              style={{ paddingLeft: 0, marginBottom: 16 }}
            >
              ← Back to Packages
            </Button>
            
            <Card title={`Package: ${selectedPackage.name}`}>
              <Table 
                columns={itemColumns} 
                dataSource={getItemsByPackageId(selectedPackage.id)}
                rowKey="id"
                size="small"
              />
            </Card>
          </>
        )}

        <Drawer
          title={
            <Space direction="vertical" size={0}>
              <Text>Commercial Evaluation</Text>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {selectedItem?.name} ({selectedItem?.id})
              </Text>
            </Space>
          }
          width={720}
          open={evaluationDrawerOpen}
          onClose={() => {
            setEvaluationDrawerOpen(false);
            form.resetFields();
          }}
          destroyOnClose
        >          {renderCommercialEvaluation()}
        </Drawer>

        <Drawer
          title="Supply Chain Manager Approval Review"
          width={1200}
          open={scApprovalDrawerOpen}
          onClose={() => setScApprovalDrawerOpen(false)}
          destroyOnClose
        >
          {renderSupplyChainApproval()}
        </Drawer>
      </Space>
    </div>
  );
};

// PropTypes validation
CBEManagement.propTypes = {
  readOnly: PropTypes.bool,
  onEvaluationComplete: PropTypes.func,
  onSupplyChainApprovalComplete: PropTypes.func,
  allowMultipleSelections: PropTypes.bool,
  customCurrencySymbols: PropTypes.object,
  permissions: PropTypes.shape({
    canEvaluate: PropTypes.bool,
    canApprove: PropTypes.bool,
    canViewSupplyChain: PropTypes.bool,
    canEditSupplyChain: PropTypes.bool
  })
};

// Default props
CBEManagement.defaultProps = {
  readOnly: false,
  onEvaluationComplete: () => {},
  onSupplyChainApprovalComplete: () => {},
  allowMultipleSelections: false,
  customCurrencySymbols: {},
  permissions: {
    canEvaluate: true,
    canApprove: true,
    canViewSupplyChain: true,
    canEditSupplyChain: true
  }
};

export default CBEManagement;
