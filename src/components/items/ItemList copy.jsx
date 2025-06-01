import React, { useState } from 'react';
import { Table, Button, Tag, Space, Input, Drawer, Typography, Descriptions, Badge, Menu, Form, Select, InputNumber, DatePicker, message, Upload } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Item, Package, Quote, Supplier } from '../../types/procurement';
import { getItemsByPackageId, getQuotesByItemId, suppliers } from '../../mock/mockData';
import QuoteList from '../quotes/QuoteList';
import moment from 'moment';

const { Title, Text } = Typography;

interface ItemListProps {
  selectedPackage: Package | null;
  onBackToPackages: () => void;
}

const ItemList: React.FC<ItemListProps> = ({ selectedPackage, onBackToPackages }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showQuotes, setShowQuotes] = useState(false);
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);
  const [addQuoteDrawerVisible, setAddQuoteDrawerVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [addQuoteForm] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);

  const items = selectedPackage ? getItemsByPackageId(selectedPackage.id) : [];
  
  const filteredItems = searchText 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase()) ||
        item.specification.toLowerCase().includes(searchText.toLowerCase())
      )
    : items;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'blue';
      case 'Quoted': return 'orange';
      case 'Awarded': return 'green';
      case 'Delivered': return 'purple';
      default: return 'default';
    }
  };

  const handleViewQuotes = (item: Item) => {
    setSelectedItem(item);
    setShowQuotes(true);
  };

  const handleAddItem = (values: any) => {
    // Here you would add logic to save the new item (API or state update)
    message.success('New item added successfully');
    setAddDrawerVisible(false);
    addForm.resetFields();
  };

  const handleAddQuote = (values: any) => {
    // Here you would add logic to save the new quote (API or state update)
    message.success('New quote added successfully');
    setAddQuoteDrawerVisible(false);
    addQuoteForm.resetFields();
    setUploadFileList([]);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Item, b: Item) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Specification',
      dataIndex: 'specification',
      key: 'specification',
      ellipsis: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: Item) => `${quantity} ${record.unit}`,
      sorter: (a: Item, b: Item) => a.quantity - b.quantity,
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
      onFilter: (value: string, record: Item) => record.category === value,
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Quoted', value: 'Quoted' },
        { text: 'Awarded', value: 'Awarded' },
        { text: 'Delivered', value: 'Delivered' },
      ],
      onFilter: (value: string, record: Item) => record.status === value,
      width: 110,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Item) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewQuotes(record)}
            type="primary"
          >
            Quotes
          </Button>
        </Space>
      ),
      width: 100,
    },
  ];

  const categoryOptions = [
    { label: 'Electrical', value: 'Electrical' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
  ];

  const statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Quoted', value: 'Quoted' },
    { label: 'Awarded', value: 'Awarded' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  const unitOptions = [
    { label: 'pcs', value: 'pcs' },
    { label: 'kg', value: 'kg' },
    { label: 'm', value: 'm' },
    // Add more units as needed
  ];

  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'JPY', value: 'JPY' },
  ];

  const deliveryTermOptions = [
    { label: 'EXW', value: 'EXW' },
    { label: 'FCA', value: 'FCA' },
    { label: 'CPT', value: 'CPT' },
    { label: 'CIP', value: 'CIP' },
    { label: 'DAP', value: 'DAP' },
    { label: 'DPU', value: 'DPU' },
    { label: 'DDP', value: 'DDP' },
    { label: 'FOB', value: 'FOB' },
    { label: 'CFR', value: 'CFR' },
    { label: 'CIF', value: 'CIF' },
  ];

  const uploadProps = {
    fileList: uploadFileList,
    beforeUpload: (file: any) => {
      setUploadFileList(prev => [...prev, file]);
      return false; // Prevent upload
    },
    onRemove: (file: any) => {
      setUploadFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
    multiple: true,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space direction="vertical" size={0}>
          <Button type="link" onClick={onBackToPackages} style={{ paddingLeft: 0 }}>
            ← Back to Packages
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
        >
          Add Item
        </Button>
      </div>

      <Menu mode="horizontal" style={{ marginBottom: 16 }}>
        <Menu.Item key="all" icon={<FilterOutlined />}>All Items</Menu.Item>
        <Menu.Item key="open" icon={<FilterOutlined />}>Open</Menu.Item>
        <Menu.Item key="quoted" icon={<FilterOutlined />}>Quoted</Menu.Item>
        <Menu.Item key="awarded" icon={<FilterOutlined />}>Awarded</Menu.Item>
        <Menu.Item key="delivered" icon={<FilterOutlined />}>Delivered</Menu.Item>
        <Menu.Item key="refresh" icon={<ReloadOutlined />}>Refresh</Menu.Item>
        <Menu.Item key="export" icon={<DownloadOutlined />}>Export</Menu.Item>
      </Menu>
      
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search items"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredItems}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
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