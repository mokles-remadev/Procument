import React, { useState } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Modal, Form, Input, Rate, Select, message } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, PlusOutlined } from '@ant-design/icons';
import { Supplier } from '../types/procurement';
import { suppliers } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Suppliers: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAddSupplier = (values: any) => {
    message.success('Supplier added successfully');
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Supplier, b: Supplier) => a.name.localeCompare(b.name),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_: any, record: Supplier) => (
        <Space direction="vertical" size="small">
          <Space>
            <MailOutlined />
            <Text>{record.email}</Text>
          </Space>
          <Space>
            <PhoneOutlined />
            <Text>{record.phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
      sorter: (a: Supplier, b: Supplier) => a.rating - b.rating,
    },
    {
      title: 'Categories',
      key: 'categories',
      render: () => (
        <Space>
          <Tag color="blue">Electrical</Tag>
          <Tag color="green">Mechanical</Tag>
          <Tag color="orange">Civil</Tag>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Supplier) => (
        <Space>
          <Button type="link">View Details</Button>
          <Button type="link">Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Supplier Database</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Supplier
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={suppliers}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <Card size="small">
              <Space direction="vertical">
                <Text>
                  <HomeOutlined style={{ marginRight: 8 }} />
                  Address: {record.address}
                </Text>
                <Space>
                  <Text strong>Performance Metrics:</Text>
                  <Tag color="green">On-time Delivery: 95%</Tag>
                  <Tag color="blue">Quality Rating: 4.8/5</Tag>
                  <Tag color="purple">Response Time: 24h</Tag>
                </Space>
              </Space>
            </Card>
          ),
        }}
      />

      <Modal
        title="Add New Supplier"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSupplier}
        >
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="Contact Person"
            rules={[{ required: true }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="categories"
            label="Categories"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select categories">
              <Option value="electrical">Electrical</Option>
              <Option value="mechanical">Mechanical</Option>
              <Option value="civil">Civil</Option>
              <Option value="instrumentation">Instrumentation</Option>
              <Option value="safety">Safety Equipment</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Supplier
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;