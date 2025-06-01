import React, { useState } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Drawer, Form, Input, Select, message, Tabs, Badge, Descriptions, Collapse } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Item, Package, Quote } from '../types/procurement';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const CBEManagement: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [evaluationDrawerOpen, setEvaluationDrawerOpen] = useState(false);
  const [bodApprovalDrawerOpen, setBodApprovalDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const handleEvaluate = (item: Item) => {
    setSelectedItem(item);
    setEvaluationDrawerOpen(true);
  };

  const handleBODApproval = () => {
    setBodApprovalDrawerOpen(true);
  };

  const handleEvaluationSubmit = (values: any) => {
    message.success('Commercial evaluation submitted successfully');
    setEvaluationDrawerOpen(false);
    form.resetFields();
  };

  const handleBODApprovalSubmit = (supplierId: string) => {
    message.success('BOD approval submitted successfully');
    // Here you would typically update the supplier's approval status
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    return `${symbols[currency] || ''}${amount.toLocaleString()}`;
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
        <Space>
          <Button type="primary" onClick={() => setSelectedPackage(record)}>
            Review Items
          </Button>
          <Button onClick={handleBODApproval}>
            BOD Approval
          </Button>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'Item ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Compliant Quotes',
      key: 'compliantQuotes',
      render: (_: any, record: Item) => {
        const quotes = getQuotesByItemId(record.id);
        const compliantQuotes = quotes.filter(q => q.technicalCompliance);
        return `${compliantQuotes.length} / ${quotes.length}`;
      },
    },
    {
      title: 'Best Price',
      key: 'bestPrice',
      render: (_: any, record: Item) => {
        const quotes = getQuotesByItemId(record.id);
        const compliantQuotes = quotes.filter(q => q.technicalCompliance);
        if (compliantQuotes.length === 0) return '-';
        const bestQuote = compliantQuotes.reduce((prev, curr) => 
          prev.price < curr.price ? prev : curr
        );
        return formatCurrency(bestQuote.price, bestQuote.currency);
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Item) => {
        const quotes = getQuotesByItemId(record.id);
        const hasCompliantQuotes = quotes.some(q => q.technicalCompliance);
        return (
          <Button 
            type="primary" 
            icon={<DollarOutlined />}
            onClick={() => handleEvaluate(record)}
            disabled={!hasCompliantQuotes}
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

    return (
      <Form form={form} onFinish={handleEvaluationSubmit} layout="vertical">
        <Form.Item
          name="selectedQuote"
          label="Select Best Quote"
          rules={[{ required: true, message: 'Please select the best quote' }]}
        >
          <Select style={{ width: '100%' }}>
            {quotes.map(quote => (
              <Option key={quote.id} value={quote.id}>
                {quote.supplierName} - {formatCurrency(quote.price, quote.currency)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="selectionReason"
          label="Selection Reason"
          rules={[{ required: true, message: 'Please specify the reason for selection' }]}
        >
          <Select mode="multiple" style={{ width: '100%' }}>
            <Option value="lowest_price">Lowest Price</Option>
            <Option value="best_technical">Best Technical Specifications</Option>
            <Option value="best_delivery">Best Delivery Time</Option>
            <Option value="best_terms">Best Commercial Terms</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="comments"
          label="Evaluation Comments"
          rules={[{ required: true, message: 'Please provide evaluation comments' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        {quotes.map(quote => (
          <Card 
            key={quote.id} 
            title={quote.supplierName}
            style={{ marginBottom: 16 }}
            extra={
              <Tag color={quote.price === Math.min(...quotes.map(q => q.price)) ? 'green' : 'blue'}>
                {formatCurrency(quote.price, quote.currency)}
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Delivery Term: </Text>
                <Tag>{quote.deliveryTerm}</Tag>
              </div>
              <div>
                <Text type="secondary">Delivery Time: </Text>
                <Text>{quote.deliveryTime} days</Text>
              </div>
              <div>
                <Text type="secondary">Material Origin: </Text>
                <Text>{quote.materialOrigin}</Text>
              </div>
              <div>
                <Text type="secondary">Valid Until: </Text>
                <Text>{quote.validUntil}</Text>
              </div>
            </Space>
          </Card>
        ))}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Evaluation
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderBODApproval = () => {
    if (!selectedPackage) return null;

    const items = getItemsByPackageId(selectedPackage.id);
    const allQuotes = items.flatMap(item => getQuotesByItemId(item.id));
    const suppliers = [...new Set(allQuotes.map(q => q.supplierName))];

    return (
      <div>
        <Title level={5}>BOD Approval for Package: {selectedPackage.name}</Title>
        
        <Tabs defaultActiveKey="summary">
          <TabPane tab="Summary" key="summary">
            <Card title="Package Overview" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Total Items">{items.length}</Descriptions.Item>
                <Descriptions.Item label="Quoted Items">
                  {items.filter(item => getQuotesByItemId(item.id).length > 0).length}
                </Descriptions.Item>
                <Descriptions.Item label="Pending Items">
                  {items.filter(item => getQuotesByItemId(item.id).length === 0).length}
                </Descriptions.Item>
                <Descriptions.Item label="Total Suppliers">{suppliers.length}</Descriptions.Item>
              </Descriptions>
            </Card>

            {suppliers.map(supplier => {
              const supplierQuotes = allQuotes.filter(q => q.supplierName === supplier);
              const totalValue = supplierQuotes.reduce((sum, q) => sum + q.price, 0);
              const quotedItems = items.filter(item => 
                getQuotesByItemId(item.id).some(q => q.supplierName === supplier)
              );

              return (
                <Card 
                  key={supplier}
                  title={supplier}
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button type="primary" onClick={() => handleBODApprovalSubmit(supplier)}>
                      Approve Supplier
                    </Button>
                  }
                >
                  <Collapse>
                    <Panel header="Supplier Overview" key="1">
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="Quoted Items">{quotedItems.length}</Descriptions.Item>
                        <Descriptions.Item label="Total Value">
                          {formatCurrency(totalValue, supplierQuotes[0]?.currency || 'USD')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Average Delivery Time">
                          {Math.round(supplierQuotes.reduce((sum, q) => sum + q.deliveryTime, 0) / supplierQuotes.length)} days
                        </Descriptions.Item>
                        <Descriptions.Item label="Technical Compliance">
                          {supplierQuotes.filter(q => q.technicalCompliance).length} / {supplierQuotes.length}
                        </Descriptions.Item>
                      </Descriptions>
                    </Panel>
                    
                    <Panel header="Quoted Items" key="2">
                      <Table
                        dataSource={quotedItems}
                        columns={[
                          { title: 'Item', dataIndex: 'name', key: 'name' },
                          { title: 'Specification', dataIndex: 'specification', key: 'specification' },
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
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => <Tag color="red">Not Quoted</Tag>
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
      <Title level={4}>Commercial Bid Evaluation</Title>
      
      {!selectedPackage ? (
        <Table 
          columns={packageColumns} 
          dataSource={packages}
          rowKey="id"
        />
      ) : (
        <>
          <Button 
            type="link" 
            onClick={() => setSelectedPackage(null)} 
            style={{ paddingLeft: 0, marginBottom: 16 }}
          >
            ← Back to Packages
          </Button>
          
          <Table 
            columns={itemColumns} 
            dataSource={getItemsByPackageId(selectedPackage.id)}
            rowKey="id"
          />
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
        onClose={() => setEvaluationDrawerOpen(false)}
        destroyOnClose
      >
        {renderCommercialEvaluation()}
      </Drawer>

      <Drawer
        title="BOD Approval"
        width={1200}
        open={bodApprovalDrawerOpen}
        onClose={() => setBodApprovalDrawerOpen(false)}
        destroyOnClose
      >
        {renderBODApproval()}
      </Drawer>
    </div>
  );
};

export default CBEManagement;