import React, { useState, useCallback, useMemo } from 'react';
import { Table, Button, Tag, Space, Input, DatePicker, Typography, Menu, Drawer, Form, message, Select, InputNumber, Card, Alert, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { packages } from '../../mock/mockData';
import moment from 'moment';
import PropTypes from 'prop-types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PackageList = ({ onSelectPackage }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredPackages, setFilteredPackages] = useState(packages);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();
  const [selectedMenuKey, setSelectedMenuKey] = useState('all');

  const procurementEngineers = useMemo(() => [
    { name: 'John Doe', id: '1' },
    { name: 'Jane Smith', id: '2' },
    { name: 'Alice Johnson', id: '3' },
  ], []);

  const statusOptions = useMemo(() => [
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ], []);

  const getStatusColor = useCallback((status) => {
    const statusColorMap = {
      'Open': 'blue',
      'In Progress': 'orange',
      'Completed': 'green',
      'Cancelled': 'red'
    };
    return statusColorMap[status] || 'default';
  }, []);

  const handleSearch = useCallback((value, filterKey = selectedMenuKey) => {
    try {
      setSearchText(value);
      let filtered = [...packages];
      
      // Apply status filter
      if (filterKey !== 'all') {
        const statusMap = {
          'open': 'Open',
          'inProgress': 'In Progress',
          'completed': 'Completed'
        };
        const status = statusMap[filterKey];
        if (status) {
          filtered = filtered.filter(pkg => pkg.status === status);
        }
      }
      
      // Apply search filter
      if (value && value.trim()) {
        const searchLower = value.toLowerCase().trim();
        filtered = filtered.filter(pkg =>
          pkg.id?.toLowerCase().includes(searchLower) ||
          pkg.name?.toLowerCase().includes(searchLower) ||
          pkg.description?.toLowerCase().includes(searchLower) ||
          pkg.procurementEngineer?.name?.toLowerCase().includes(searchLower)
        );
      }
      
      setFilteredPackages(filtered);
      setError(null);
    } catch (err) {
      setError('Error filtering packages: ' + err.message);
    }
  }, [selectedMenuKey]);

  const handleMenuClick = useCallback((e) => {
    setSelectedMenuKey(e.key);
    if (e.key === 'refresh') {
      handleRefresh();
    } else if (e.key === 'export') {
      handleExport();
    } else {
      handleSearch(searchText, e.key);
    }
  }, [searchText, handleSearch]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFilteredPackages([...packages]);
      setSearchText('');
      setSelectedMenuKey('all');
      setLoading(false);
      message.success('Data refreshed successfully');
    }, 1000);
  }, []);

  const handleExport = useCallback(() => {
    try {
      // Basic CSV export functionality
      const csvContent = [
        ['ID', 'Name', 'Engineer', 'Creation Date', 'Due Date', 'Status', 'Open Items', 'Total Items'],
        ...filteredPackages.map(pkg => [
          pkg.id,
          pkg.name,
          pkg.procurementEngineer?.name || '',
          pkg.creationDate,
          pkg.dueDate,
          pkg.status,
          pkg.openItems,
          pkg.totalItems
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `packages_export_${moment().format('YYYY-MM-DD')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Export completed successfully');
    } catch (err) {
      message.error('Export failed: ' + err.message);
    }
  }, [filteredPackages]);

  const handleAddPackage = useCallback(async (values) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('New package added successfully');
      setDrawerVisible(false);
      form.resetFields();
      handleRefresh();
    } catch (err) {
      message.error('Failed to add package: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [form, handleRefresh]);

  const handlePackageSelect = useCallback((record) => {
    try {
      if (!record || !record.id) {
        throw new Error('Invalid package selected');
      }
      onSelectPackage(record);
    } catch (err) {
      message.error('Error selecting package: ' + err.message);
    }
  }, [onSelectPackage]);

  const columns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id?.localeCompare(b.id) || 0,
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name) || 0,
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => handlePackageSelect(record)}
          style={{ padding: 0, height: 'auto' }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Procurement Engineer',
      dataIndex: 'procurementEngineer',
      key: 'procurementEngineer',
      render: (engineer) => engineer?.name || 'N/A',
      sorter: (a, b) => (a.procurementEngineer?.name || '').localeCompare(b.procurementEngineer?.name || ''),
    },
    {
      title: 'Creation Date',
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: (a, b) => new Date(a.creationDate || 0).getTime() - new Date(b.creationDate || 0).getTime(),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime(),
      render: (date) => {
        if (!date) return 'N/A';
        const isOverdue = moment(date).isBefore(moment(), 'day');
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {date}
            {isOverdue && ' (Overdue)'}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      filters: statusOptions.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: 'Progress',
      key: 'openItems',
      render: (text, record) => {
        const total = record.totalItems || 0;
        const open = record.openItems || 0;
        const completed = total - open;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return (
          <div>
            <div>{completed}/{total} items</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {percentage}% complete
            </div>
          </div>
        );
      },
      sorter: (a, b) => (a.openItems || 0) - (b.openItems || 0),
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button 
          type="primary" 
          onClick={() => handlePackageSelect(record)}
          disabled={!record.id}
        >
          View Items
        </Button>
      ),
      width: 120,
    },
  ], [getStatusColor, handlePackageSelect, statusOptions]);

  if (error) {
    return (
      <Alert
        message="Error Loading Packages"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
      />
    );
  }

  return (
    <div className="package-list">
      <Spin spinning={loading}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4}>Procurement Packages</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDrawerVisible(true)}
              disabled={loading}
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
              placeholder="Search packages by ID, name, description, or engineer"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 400 }}
              allowClear
            />
            <RangePicker 
              placeholder={['Creation date from', 'Creation date to']} 
              style={{ width: 280 }}
            />
          </div>
          
          <Table 
            columns={columns} 
            dataSource={filteredPackages}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} packages`
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Spin>
      
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
            rules={[
              { required: true, message: 'Please enter package name' },
              { min: 3, message: 'Package name must be at least 3 characters' }
            ]}
          >
            <Input placeholder="Enter package name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter description' },
              { min: 10, message: 'Description must be at least 10 characters' }
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Enter package description"
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Form.Item
            name="procurementEngineer"
            label="Procurement Engineer"
            rules={[{ required: true, message: 'Please select procurement engineer' }]}
          >
            <Select
              placeholder="Select engineer"
              options={procurementEngineers.map(e => ({ 
                label: e.name, 
                value: e.name,
                key: e.id 
              }))}
              showSearch
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          
          <Form.Item
            name="creationDate"
            label="Creation Date"
            rules={[{ required: true, message: 'Please select creation date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > moment().endOf('day')}
            />
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[
              { required: true, message: 'Please select due date' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const creationDate = getFieldValue('creationDate');
                  if (!value || !creationDate || value.isAfter(creationDate)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Due date must be after creation date'));
                },
              }),
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < moment().endOf('day')}
            />
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
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                Add Package
              </Button>
              <Button 
                onClick={() => {
                  setDrawerVisible(false);
                  form.resetFields();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

// PropTypes for development validation
PackageList.propTypes = {
  onSelectPackage: PropTypes.func.isRequired,
};

export default PackageList;