import React, { useState } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Tabs, Badge, Descriptions, Collapse } from 'antd';
import { FileTextOutlined, FilePdfOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Item, Package, Quote } from '../types/procurement';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const BODApproval: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

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
      title: 'Items',
      key: 'items',
      render: (text: string, record: Package) => (
        <Space>
          <Badge status="success" text={`${record.totalItems - record.openItems} Quoted`} />
          <Badge status="error" text={`${record.openItems} Pending`} />
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Package) => (
        <Button type="primary" onClick={() => setSelectedPackage(record)}>
          Review Package
        </Button>
      ),
    },
  ];

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
                    <Space>
                      <Text strong>Total Value: {formatCurrency(totalValue, supplierQuotes[0]?.currency || 'USD')}</Text>
                      <Button type="primary">Approve Supplier</Button>
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
      {selectedPackage ? (
        renderPackageDetails()
      ) : (
        <>
          <Title level={4}>BOD Approval Management</Title>
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

export default BODApproval;