import React, { useState, useCallback, useMemo } from 'react';
import { Table, Button, Tag, Space, Input, Drawer, Typography, Descriptions, Badge, Menu, Form, Select, InputNumber, DatePicker, message, Upload, Card, Alert, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getItemsByPackageId, suppliers } from '../../mock/mockData';
import QuoteList from '../quotes/QuoteList';
import moment from 'moment';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const ItemList = ({ selectedPackage, onBackToPackages }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQuotes, setShowQuotes] = useState(false);
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);
  const [addQuoteDrawerVisible, setAddQuoteDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addForm] = Form.useForm();
  const [addQuoteForm] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState([]);

  const items = useMemo(() => {
    try {
      return selectedPackage ? getItemsByPackageId(selectedPackage.id) : [];
    } catch (err) {
      setError('Error loading items: ' + err.message);
      return [];
    }
  }, [selectedPackage]);
  
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    
    const searchLower = searchText.toLowerCase().trim();
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.specification?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    );
  }, [items, searchText]);

  const getStatusColor = useCallback((status) => {
    const statusColorMap = {
      'Open': 'blue',
      'Quoted': 'orange', 
      'Awarded': 'green',
      'Delivered': 'purple'
    };
    return statusColorMap[status] || 'default';
  }, []);

  const handleViewQuotes = useCallback((item) => {
    try {
      if (!item || !item.id) {
        throw new Error('Invalid item selected');
      }
      setSelectedItem(item);
      setShowQuotes(true);
      setError(null);
    } catch (err) {
      setError('Error viewing quotes: ' + err.message);
    }
  }, []);

  const handleAddItem = useCallback(async (values) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!values.name?.trim()) {
        throw new Error('Item name is required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('New item added successfully');
      setAddDrawerVisible(false);
      addForm.resetFields();
    } catch (err) {
      message.error('Failed to add item: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [addForm]);

  const handleAddQuote = useCallback(async (values) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!values.supplierId) {
        throw new Error('Supplier is required');
      }
      if (!values.price || values.price <= 0) {
        throw new Error('Valid price is required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('New quote added successfully');
      setAddQuoteDrawerVisible(false);
      addQuoteForm.resetFields();
      setUploadFileList([]);
    } catch (err) {
      message.error('Failed to add quote: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [addQuoteForm]);

  const columns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      sorter: (a, b) => a.id?.localeCompare(b.id) || 0,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name) || 0,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <span title={text}>{text}</span>
      ),
    },
    {
      title: 'Specification',
      dataIndex: 'specification',
      key: 'specification',
      ellipsis: true,
      render: (text) => (
        <span title={text}>{text}</span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => `${quantity || 0} ${record.unit || 'pcs'}`,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
      width: 120,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Electrical', value: 'Electrical' },
        { text: 'Mechanical', value: 'Mechanical' },
        { text: 'Civil', value: 'Civil' },
      ],
      onFilter: (value, record) => record.category === value,
      width: 120,
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Quoted', value: 'Quoted' },
        { text: 'Awarded', value: 'Awarded' },
        { text: 'Delivered', value: 'Delivered' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 110,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewQuotes(record)}
            type="primary"
            size="small"
            disabled={!record.id}
          >
            Quotes
          </Button>
        </Space>
      ),
      width: 100,
    },
  ], [getStatusColor, handleViewQuotes]);

  const categoryOptions = useMemo(() => [
    { label: 'Electrical', value: 'Electrical' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
    { label: 'Software', value: 'Software' },
    { label: 'Other', value: 'Other' },
  ], []);

  const statusOptions = useMemo(() => [
    { label: 'Open', value: 'Open' },
    { label: 'Quoted', value: 'Quoted' },
    { label: 'Awarded', value: 'Awarded' },
    { label: 'Delivered', value: 'Delivered' },
  ], []);

  const unitOptions = useMemo(() => [
    { label: 'pieces (pcs)', value: 'pcs' },
    { label: 'kilograms (kg)', value: 'kg' },
    { label: 'meters (m)', value: 'm' },
    { label: 'liters (L)', value: 'L' },
    { label: 'sets', value: 'sets' },
    { label: 'lots', value: 'lots' },
  ], []);

  const currencyOptions = useMemo(() => [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
    { label: 'JPY (¥)', value: 'JPY' },
  ], []);

  const deliveryTermOptions = useMemo(() => [
    { label: 'EXW - Ex Works', value: 'EXW' },
    { label: 'FCA - Free Carrier', value: 'FCA' },
    { label: 'CPT - Carriage Paid To', value: 'CPT' },
    { label: 'CIP - Carriage and Insurance Paid', value: 'CIP' },
    { label: 'DAP - Delivered at Place', value: 'DAP' },
    { label: 'DPU - Delivered at Place Unloaded', value: 'DPU' },
    { label: 'DDP - Delivered Duty Paid', value: 'DDP' },
    { label: 'FOB - Free on Board', value: 'FOB' },
    { label: 'CFR - Cost and Freight', value: 'CFR' },
    { label: 'CIF - Cost, Insurance and Freight', value: 'CIF' },
  ], []);

  const uploadProps = useMemo(() => ({
    fileList: uploadFileList,
    beforeUpload: (file) => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type);
      if (!isValidType) {
        message.error('You can only upload PDF, DOC, DOCX, XLS, or XLSX files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      setUploadFileList(prev => [...prev, file]);
      return false; // Prevent upload
    },
    onRemove: (file) => {
      setUploadFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
    multiple: true,
  }), [uploadFileList]);

  if (error) {
    return (
      <Alert
        message="Error Loading Items"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
        action={
          <Button size="small" onClick={onBackToPackages}>
            Back to Packages
          </Button>
        }
      />
    );
  }

  if (!selectedPackage) {
    return (
      <Alert
        message="No Package Selected"
        description="Please select a package to view its items."
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={onBackToPackages}>
            Back to Packages
          </Button>
        }
      />
    );
  }

  return (
    <div className="item-list">
      <Spin spinning={loading}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space direction="vertical" size={0}>
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />}
                onClick={onBackToPackages} 
                style={{ paddingLeft: 0 }}
              >
                Back to Packages
              </Button>
              <Title level={4}>
                Items for Package: {selectedPackage?.name} ({selectedPackage?.id})
              </Title>
              <Text type="secondary">
                {selectedPackage?.description} | Due: {selectedPackage?.dueDate}
              </Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddDrawerVisible(true)}
              disabled={loading}
            >
              Add Item
            </Button>
          </div>

          <Menu mode="horizontal" style={{ marginBottom: 16 }}>
            <Menu.Item key="all" icon={<FilterOutlined />}>All Items ({filteredItems.length})</Menu.Item>
            <Menu.Item key="open" icon={<FilterOutlined />}>Open</Menu.Item>
            <Menu.Item key="quoted" icon={<FilterOutlined />}>Quoted</Menu.Item>
            <Menu.Item key="awarded" icon={<FilterOutlined />}>Awarded</Menu.Item>
            <Menu.Item key="delivered" icon={<FilterOutlined />}>Delivered</Menu.Item>
            <Menu.Item key="refresh" icon={<ReloadOutlined />}>Refresh</Menu.Item>
            <Menu.Item key="export" icon={<DownloadOutlined />}>Export</Menu.Item>
          </Menu>
          
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search items by name, description, specification, or category"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 400 }}
              allowClear
            />
          </div>
          
          <Table 
            columns={columns} 
            dataSource={filteredItems}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} items`
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Spin>
      
      <Drawer
        title={
          <Space direction="vertical" size={0}>
            <Text>Item Quotes</Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {selectedItem?.name} ({selectedItem?.id})
            </Text>
          </Space>
        }
        width={900}
        onClose={() => setShowQuotes(false)}
        open={showQuotes}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddQuoteDrawerVisible(true)}>
            Add Quote
          </Button>
        }
      >
        {selectedItem && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Description" span={2}>
                {selectedItem.description}
              </Descriptions.Item>
              <Descriptions.Item label="Specification" span={2}>
                {selectedItem.specification}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {selectedItem.quantity} {selectedItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={
                  selectedItem.status === 'Open' ? 'processing' :
                  selectedItem.status === 'Quoted' ? 'warning' :
                  selectedItem.status === 'Awarded' ? 'success' : 'default'
                } text={selectedItem.status} />
              </Descriptions.Item>
            </Descriptions>
            
            <QuoteList itemId={selectedItem.id} />
          </>
        )}
      </Drawer>

      <Drawer
        title="Add New Item"
        width={480}
        open={addDrawerVisible}
        onClose={() => {
          setAddDrawerVisible(false);
          addForm.resetFields();
        }}
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddItem}
          initialValues={{
            status: 'Open',
            category: 'Electrical',
            quantity: 1,
            unit: 'pcs',
          }}
        >
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="specification"
            label="Specification"
            rules={[{ required: true, message: 'Please enter specification' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: 'Please select unit' }]}
          >
            <Select options={unitOptions} placeholder="Select unit" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select options={categoryOptions} placeholder="Select category" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select options={statusOptions} placeholder="Select status" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Item
              </Button>
              <Button onClick={() => {
                setAddDrawerVisible(false);
                addForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Add New Quote"
        width={900}
        open={addQuoteDrawerVisible}
        onClose={() => {
          setAddQuoteDrawerVisible(false);
          addQuoteForm.resetFields();
          setUploadFileList([]);
        }}
        destroyOnClose
      >
        <Form
          form={addQuoteForm}
          layout="vertical"
          onFinish={handleAddQuote}
          initialValues={{
            currency: 'USD',
            deliveryTerm: 'DAP',
            technicalCompliance: true,
            validUntil: moment(),
          }}
        >
          <Form.Item
            name="supplierId"
            label="Supplier"
            rules={[{ required: true, message: 'Please select supplier' }]}
          >
            <Select
              showSearch
              placeholder="Select supplier"
              options={suppliers.map(s => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select options={currencyOptions} />
          </Form.Item>
          <Form.Item
            name="deliveryTerm"
            label="Delivery Term"
            rules={[{ required: true, message: 'Please select delivery term' }]}
          >
            <Select options={deliveryTermOptions} />
          </Form.Item>
          <Form.Item
            name="deliveryTime"
            label="Delivery Time (days)"
            rules={[{ required: true, message: 'Please enter delivery time' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="materialOrigin"
            label="Material Origin"
            rules={[{ required: true, message: 'Please enter material origin' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="validUntil"
            label="Valid Until"
            rules={[{ required: true, message: 'Please select valid until date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
         
          <Form.Item
            name="documents"
            label="Documents"
            valuePropName="fileList"
            getValueFromEvent={() => uploadFileList}
          >
            <Upload {...uploadProps} listType="text">
              <Button icon={<UploadOutlined />}>Upload Documents</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Quote
              </Button>
              <Button onClick={() => {
                setAddQuoteDrawerVisible(false);
                addQuoteForm.resetFields();
                setUploadFileList([]);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ItemList;