import React, { useState } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Drawer, Form, Radio, Input, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Item, Package, Quote } from '../types/procurement';
import { packages, getItemsByPackageId, getQuotesByItemId } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TBEManagement: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [evaluationDrawerOpen, setEvaluationDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const handleEvaluate = (item: Item) => {
    setSelectedItem(item);
    setEvaluationDrawerOpen(true);
  };

  const handleEvaluationSubmit = (values: any) => {
    message.success('Technical evaluation submitted successfully');
    setEvaluationDrawerOpen(false);
    form.resetFields();
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
          Review Items
        </Button>
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
      title: 'Specification',
      dataIndex: 'specification',
      key: 'specification',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Open' ? 'blue' : status === 'Quoted' ? 'orange' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Item) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => handleEvaluate(record)}
        >
          Evaluate
        </Button>
      ),
    },
  ];

  const renderTechnicalEvaluation = () => {
    if (!selectedItem) return null;

    const quotes = getQuotesByItemId(selectedItem.id);

    return (
      <Form form={form} onFinish={handleEvaluationSubmit} layout="vertical">
        {quotes.map(quote => (
          <Card 
            key={quote.id} 
            title={quote.supplierName}
            style={{ marginBottom: 16 }}
          >
            <Form.Item
              name={`compliance-${quote.id}`}
              label="Technical Compliance"
              rules={[{ required: true, message: 'Please evaluate technical compliance' }]}
            >
              <Radio.Group>
                <Radio value={true}>Compliant</Radio>
                <Radio value={false}>Non-compliant</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name={`remarks-${quote.id}`}
              label="Technical Remarks"
              rules={[{ required: true, message: 'Please provide technical remarks' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Specification Review:</Text>
              <Text>{selectedItem.specification}</Text>
              
              {quote.documents?.map((doc, index) => (
                <Button 
                  key={index}
                  type="link" 
                  href={doc}
                  target="_blank"
                >
                  View Technical Document {index + 1}
                </Button>
              ))}
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

  return (
    <div>
      <Title level={4}>Technical Bid Evaluation</Title>
      
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
            <Text>Technical Evaluation</Text>
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
        {renderTechnicalEvaluation()}
      </Drawer>
    </div>
  );
};

export default TBEManagement;