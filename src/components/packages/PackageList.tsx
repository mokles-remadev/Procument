import React, { useState } from 'react';
import { Table, Button, Tag, Space, Input, DatePicker, Typography, Menu, Drawer, Form, message, Select, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Package } from '../../types/procurement';
import { packages } from '../../mock/mockData';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface PackageListProps {
  onSelectPackage: (pkg: Package) => void;
}

const PackageList: React.FC<PackageListProps> = ({ onSelectPackage }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredPackages, setFilteredPackages] = useState<Package[]>(packages);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedMenuKey, setSelectedMenuKey] = useState('all');

  const procurementEngineers = [
    { name: 'John Doe' },
    { name: 'Jane Smith' },
    { name: 'Alice Johnson' },
    // Add more as needed
  ];

  const statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'blue';
      case 'In Progress': return 'orange';
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  };

  // Update handleSearch to always filter from the original packages list
  const handleSearch = (value: string, filterKey = selectedMenuKey) => {
    setSearchText(value);
    let filtered = packages;

    // Apply menu filter
    if (filterKey !== 'all') {
      if (filterKey === 'open') filtered = filtered.filter(pkg => pkg.status === 'Open');
      else if (filterKey === 'inProgress') filtered = filtered.filter(pkg => pkg.status === 'In Progress');
      else if (filterKey === 'completed') filtered = filtered.filter(pkg => pkg.status === 'Completed');
    }

    // Apply search filter
    if (value) {
      filtered = filtered.filter(pkg =>
        pkg.id.toLowerCase().includes(value.toLowerCase()) ||
        pkg.name.toLowerCase().includes(value.toLowerCase()) ||
        pkg.description.toLowerCase().includes(value.toLowerCase()) ||
        pkg.procurementEngineer.name.toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredPackages(filtered);
  };

  // Menu click handler
  const handleMenuClick = (e: any) => {
    setSelectedMenuKey(e.key);
    handleSearch(searchText, e.key);
  };

  const handleAddPackage = (values: any) => {
    // Here you would add logic to save the new package (API or state update)
    message.success('New package added successfully');
    setDrawerVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: Package, b: Package) => a.id.localeCompare(b.id),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Package, b: Package) => a.name.localeCompare(b.name),
      render: (text: string, record: Package) => (
        <a onClick={() => onSelectPackage(record)}>{text}</a>
      ),
    },
    {
      title: 'Procurement Engineer',
      dataIndex: 'procurementEngineer',
      key: 'procurementEngineer',
      render: (engineer: { name: string }) => engineer.name,
      sorter: (a: Package, b: Package) => 
        a.procurementEngineer.name.localeCompare(b.procurementEngineer.name),
    },
    {
      title: 'Creation Date',
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: (a: Package, b: Package) => 
        new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime(),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a: Package, b: Package) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
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
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value: string, record: Package) => record.status === value,
    },
    {
      title: 'Open Items',
      key: 'openItems',
      render: (text: string, record: Package) => (
        <span>{record.openItems}/{record.totalItems}</span>
      ),
      sorter: (a: Package, b: Package) => a.openItems - b.openItems,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Package) => (
        <Button type="primary" onClick={() => onSelectPackage(record)}>
          View Items
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Procurement Packages</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
          New Package
        </Button>
      </div>

      <Menu
        mode="horizontal"
        style={{ marginBottom: 16 }}
        selectedKeys={[selectedMenuKey]}
        onClick={handleMenuClick}
      >
        <Menu.Item key="all" icon={<FilterOutlined />}>All Packages</Menu.Item>
        <Menu.Item key="open" icon={<FilterOutlined />}>Open</Menu.Item>
        <Menu.Item key="inProgress" icon={<FilterOutlined />}>In Progress</Menu.Item>
        <Menu.Item key="completed" icon={<FilterOutlined />}>Completed</Menu.Item>
        <Menu.Item key="refresh" icon={<ReloadOutlined />}>Refresh</Menu.Item>
        <Menu.Item key="export" icon={<DownloadOutlined />}>Export</Menu.Item>
      </Menu>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Search packages"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <RangePicker placeholder={['Creation date', 'Due date']} />
      </div>
      <Table 
        columns={columns} 
        dataSource={filteredPackages}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Add New Package"
        width={480}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPackage}
          initialValues={{
            status: 'Open',
            creationDate: moment(),
          }}
        >
          <Form.Item
            name="name"
            label="Package Name"
            rules={[{ required: true, message: 'Please enter package name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="procurementEngineer"
            label="Procurement Engineer"
            rules={[{ required: true, message: 'Please select procurement engineer' }]}
          >
            <Select
              placeholder="Select engineer"
              options={procurementEngineers.map(e => ({ label: e.name, value: e.name }))}
            />
          </Form.Item>
          <Form.Item
            name="creationDate"
            label="Creation Date"
            rules={[{ required: true, message: 'Please select creation date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select
              placeholder="Select status"
              options={statusOptions}
            />
          </Form.Item>
         
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Package
              </Button>
              <Button onClick={() => {
                setDrawerVisible(false);
                form.resetFields();
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

export default PackageList;