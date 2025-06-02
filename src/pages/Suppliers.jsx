import React, { useState, useMemo, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Rate, 
  Select, 
  message,
  Alert,
  Spin,
  Descriptions,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  HomeOutlined, 
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  StarOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { suppliers as mockSuppliers } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Suppliers = ({ enableSearch = true, pageSize = 10 }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [suppliers, setSuppliers] = useState(mockSuppliers || []);
  const [form] = Form.useForm();

  const handleAddSupplier = useCallback(async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSupplier = {
        id: Date.now().toString(),
        ...values,
        rating: 0,
        createdAt: new Date().toISOString(),
        performance: {
          onTimeDelivery: 0,
          qualityRating: 0,
          responseTime: '0h'
        }
      };
      
      setSuppliers(prev => [...prev, newSupplier]);
      message.success('Supplier added successfully');
      setModalVisible(false);
      form.resetFields();
    } catch (err) {
      setError(err.message || 'Failed to add supplier');
      message.error('Failed to add supplier');
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleViewDetails = useCallback((record) => {
    setSelectedSupplier(record);
    setDetailsModalVisible(true);
  }, []);

  const handleEdit = useCallback((record) => {
    form.setFieldsValue(record);
    setSelectedSupplier(record);
    setModalVisible(true);
  }, [form]);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      'Electrical': 'blue',
      'Mechanical': 'green',
      'Civil': 'orange',
      'Instrumentation': 'purple',
      'Safety': 'red',
      'Software': 'cyan'
    };
    return colors[category] || 'default';
  }, []);

  const filteredSuppliers = useMemo(() => {
    if (!searchText) return suppliers;
    
    return suppliers.filter(supplier =>
      supplier.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.phone?.includes(searchText)
    );
  }, [suppliers, searchText]);

  const supplierStats = useMemo(() => {
    const total = suppliers.length;
    const highRated = suppliers.filter(s => s.rating >= 4).length;
    const averageRating = suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / total || 0;
    
    return {
      total,
      highRated,
      averageRating: averageRating.toFixed(1)
    };
  }, [suppliers]);
  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <Text strong style={{ color: '#1890ff' }}>{name}</Text>
          {record.rating >= 4.5 && (
            <Tooltip title="Top Rated Supplier">
              <StarOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (person) => (
        <Space>
          <UserOutlined />
          <Text>{person}</Text>
        </Space>
      ),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <MailOutlined style={{ color: '#1890ff' }} />
            <Text>{record.email}</Text>
          </Space>
          <Space size="small">
            <PhoneOutlined style={{ color: '#52c41a' }} />
            <Text>{record.phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space direction="vertical" size="small">
          <Rate disabled defaultValue={rating} allowHalf />
          <Text type="secondary">{rating}/5</Text>
        </Space>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Categories',
      key: 'categories',
      render: (_, record) => {
        const categories = record.categories || ['Electrical', 'Mechanical'];
        return (
          <Space wrap>
            {categories.map(category => (
              <Tag key={category} color={getCategoryColor(category)}>
                {category}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isActive = record.rating > 0;
        return (
          <Badge
            status={isActive ? 'success' : 'default'}
            text={isActive ? 'Active' : 'New'}
          />
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit Supplier">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [getCategoryColor, handleViewDetails, handleEdit]);

  if (error) {
    return (
      <Alert
        message="Error Loading Suppliers"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
      />
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Supplier Database</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setModalVisible(true)}
          loading={loading}
        >
          Add Supplier
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={supplierStats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="High Rated (4+)"
              value={supplierStats.highRated}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Rating"
              value={supplierStats.averageRating}
              suffix="/ 5"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search */}
      {enableSearch && (
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search suppliers by name, contact person, email, or phone..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 400 }}
            allowClear
          />
        </div>
      )}

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={filteredSuppliers}
          rowKey="id"
          pagination={{
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} suppliers`,
          }}
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowRender: (record) => (
              <Card size="small" style={{ margin: 0 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <HomeOutlined style={{ color: '#1890ff' }} />
                    <Text><strong>Address:</strong> {record.address}</Text>
                  </Space>
                  <Space wrap>
                    <Text strong>Performance Metrics:</Text>
                    <Tag color="green">On-time Delivery: {record.performance?.onTimeDelivery || 95}%</Tag>
                    <Tag color="blue">Quality Rating: {record.performance?.qualityRating || 4.8}/5</Tag>
                    <Tag color="purple">Response Time: {record.performance?.responseTime || '24h'}</Tag>
                  </Space>
                  {record.createdAt && (
                    <Space>
                      <CalendarOutlined style={{ color: '#8c8c8c' }} />
                      <Text type="secondary">
                        Added: {new Date(record.createdAt).toLocaleDateString()}
                      </Text>
                    </Space>
                  )}
                </Space>
              </Card>
            ),
          }}
        />
      </Spin>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedSupplier ? "Edit Supplier" : "Add New Supplier"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedSupplier(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSupplier}
          initialValues={{
            categories: ['Electrical']
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Company Name"
                rules={[
                  { required: true, message: 'Please enter company name' },
                  { min: 2, message: 'Company name must be at least 2 characters' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Company Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[
                  { required: true, message: 'Please enter contact person' },
                  { min: 2, message: 'Contact person must be at least 2 characters' }
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Contact Person" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Please enter a valid phone number' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
            rules={[
              { required: true, message: 'Please enter address' },
              { min: 10, message: 'Address must be at least 10 characters' }
            ]}
          >
            <TextArea rows={3} placeholder="Complete business address" />
          </Form.Item>

          <Form.Item
            name="categories"
            label="Categories"
            rules={[{ required: true, message: 'Please select at least one category' }]}
          >
            <Select 
              mode="multiple" 
              placeholder="Select categories"
              style={{ width: '100%' }}
            >
              <Option value="Electrical">Electrical</Option>
              <Option value="Mechanical">Mechanical</Option>
              <Option value="Civil">Civil</Option>
              <Option value="Instrumentation">Instrumentation</Option>
              <Option value="Safety">Safety Equipment</Option>
              <Option value="Software">Software</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedSupplier ? 'Update' : 'Add'} Supplier
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setSelectedSupplier(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            {selectedSupplier?.name}
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedSupplier(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setDetailsModalVisible(false);
              handleEdit(selectedSupplier);
            }}
          >
            Edit Supplier
          </Button>
        ]}
        width={700}
      >
        {selectedSupplier && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Company Name" span={2}>
              <Text strong>{selectedSupplier.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Contact Person">
              {selectedSupplier.contactPerson}
            </Descriptions.Item>
            <Descriptions.Item label="Rating">
              <Space>
                <Rate disabled defaultValue={selectedSupplier.rating} allowHalf />
                <Text>({selectedSupplier.rating}/5)</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <a href={`mailto:${selectedSupplier.email}`}>{selectedSupplier.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <a href={`tel:${selectedSupplier.phone}`}>{selectedSupplier.phone}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {selectedSupplier.address}
            </Descriptions.Item>
            <Descriptions.Item label="Categories" span={2}>
              <Space wrap>
                {(selectedSupplier.categories || ['Electrical', 'Mechanical']).map(category => (
                  <Tag key={category} color={getCategoryColor(category)}>
                    {category}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            {selectedSupplier.createdAt && (
              <Descriptions.Item label="Added Date" span={2}>
                {new Date(selectedSupplier.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

Suppliers.propTypes = {
  enableSearch: PropTypes.bool,
  pageSize: PropTypes.number,
};

Suppliers.defaultProps = {
  enableSearch: true,
  pageSize: 10,
};

export default Suppliers;
