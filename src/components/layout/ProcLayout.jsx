import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Steps, Button, Modal, Table, message, Tag, Form, Input, DatePicker, TimePicker, Upload, Space, Divider, Row, Col, Card, Select, List } from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { ClipboardList, Users, Settings, BarChart3, FileCheck, DollarSign, Briefcase, FileText, Star, Download, Bell, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProcLayout = ({ children, onMenuSelect }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormVisible, setExportFormVisible] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [selectedExport, setSelectedExport] = useState(null);
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [notificationForm] = Form.useForm();

  const processSteps = [
    { key: 'rfq', title: 'RFQ', description: 'Request for Quotation', icon: <ClipboardList size={16} /> },
    { key: 'tbe', title: 'TBE', description: 'Technical Bid Evaluation', icon: <FileCheck size={16} /> },
    { key: 'cbe', title: 'CBE', description: 'Commercial Bid Evaluation', icon: <DollarSign size={16} /> },
    { key: 'bod', title: 'BOD', description: 'Board Approval', icon: <Briefcase size={16} /> },
    { key: 'po', title: 'PO', description: 'Purchase Order', icon: <FileText size={16} /> },
  ];
  const additionalMenuItems = [
    { key: 'dashboard', icon: <BarChart3 size={16} />, label: 'Dashboard' },
    { key: 'suppliers', icon: <Users size={16} />, label: 'Suppliers' },
    { key: 'quality', icon: <Star size={16} />, label: 'Supplier Quality' },
    { key: 'export', icon: <Download size={16} />, label: 'Export Declaration' },
    { key: 'settings', icon: <Settings size={16} />, label: 'Settings' },
  ];
  const getCurrentStep = (key) => {
    const stepIndex = processSteps.findIndex(step => step.key === key);
    return stepIndex >= 0 ? stepIndex : -1;
  };

  const menuItems = [
    {
      type: 'group',
      label: 'Procurement Process',
      children: processSteps.map(step => ({
        key: step.key,
        icon: step.icon,
        label: `${step.title} - ${step.description}`,
      })),
    },
    {
      type: 'group',
      label: 'Management',
      children: additionalMenuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      })),
    },
  ];
  
  const exportData = [
    {
      poRef: 'PO-2024-001',
      outRef: 'OUT-2024-001',
      costCenter: 'CC-001',
      exportDate: '2024-03-10',
      from: 'Main Warehouse',
      to: 'Project Site A',
      pol: 'Port of Shanghai',
      pod: 'Port of Rotterdam',
      invoiceAttached: true,
      status: 'Completed',
      receivedDate: '2024-03-15',
      receivedTime: '14:30',
      acknowledgment: 'receipt_001.pdf'
    },
    {
      poRef: 'PO-2024-002',
      outRef: 'OUT-2024-002',
      costCenter: 'CC-002',
      exportDate: '2024-03-12',
      from: 'Supplier Facility',
      to: 'Regional Store',
      pol: 'Port of Singapore',
      pod: 'Port of Hamburg',
      invoiceAttached: false,
      status: 'Pending',
      receivedDate: null,
      receivedTime: null,
      acknowledgment: null
    }
  ];
  const handleExportToExcel = () => {
    const exportableData = exportData.map(item => ({
      'PO Reference': item.poRef,
      'Out Reference': item.outRef,
      'Cost Center': item.costCenter,
      'From': item.from,
      'To': item.to,
      'Port of Loading': item.pol,
      'Port of Discharge': item.pod,
      'Invoice Status': item.invoiceAttached ? 'Attached' : 'Pending',
      'Received Date': item.receivedDate || '-',
      'Received Time': item.receivedTime || '-',
      'Status': item.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Export Declarations');
    XLSX.writeFile(wb, 'export_declarations.xlsx');
  };

  const handleAddExport = () => {
    setShowAddForm(true);
    form.resetFields();
  };

  const handleFormSubmit = (values) => {
    console.log('Form submitted:', values);
    setShowAddForm(false);
    form.resetFields();
    message.success('Export declaration saved successfully');
  };

  const handleExportNotification = (record) => {
    setSelectedExport(record);
    setShowNotificationModal(true);
    notificationForm.setFieldsValue({
      meetingDate: dayjs(),
      meetingTime: dayjs(),
      location: 'Conference Room A',
      attendees: ['HSE', 'GAQC', 'Logistics', 'Procurement']
    });
  };
  const handleNotificationSubmit = (values) => {
    console.log('Notification submitted:', {
      export: selectedExport,
      meeting: values,
      minutesOfMeeting: values.minutesOfMeeting?.[0]?.originFileObj,
      materialReceivingAcknowledgment: values.materialReceivingAcknowledgment?.[0]?.originFileObj
    });
    setShowNotificationModal(false);
    notificationForm.resetFields();
    message.success('Export notification meeting scheduled successfully');
  };

  const handleViewDetails = (record) => {
    form.setFieldsValue({
      poRef: record.poRef,
      outRef: record.outRef,
      costCenter: record.costCenter,
      from: record.from,
      to: record.to,
      pol: record.pol,
      pod: record.pod,
      receivedDate: record.receivedDate,
      receivedTime: record.receivedTime,
    });
  };
  const exportColumns = [
    { title: 'PO Reference', dataIndex: 'poRef', key: 'poRef' },
    { title: 'Out Reference', dataIndex: 'outRef', key: 'outRef' },
    { title: 'Cost Center', dataIndex: 'costCenter', key: 'costCenter' },
    { title: 'Export Date', dataIndex: 'exportDate', key: 'exportDate' },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
    { title: 'POL', dataIndex: 'pol', key: 'pol' },
    { title: 'POD', dataIndex: 'pod', key: 'pod' },
    { 
      title: 'Invoice',
      dataIndex: 'invoiceAttached',
      key: 'invoiceAttached',
      render: (attached) => (
        <Tag color={attached ? 'green' : 'orange'}>
          {attached ? 'Attached' : 'Pending'}
        </Tag>
      )
    },
    {
      title: 'Received',
      key: 'received',
      render: (_, record) => (
        record.receivedDate ? 
          `${record.receivedDate} ${record.receivedTime}` :
          <Tag color="orange">Pending</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary"
            icon={<Bell size={14} />}
            onClick={() => handleExportNotification(record)}
          >
            Export Notification
          </Button>
          <Button type="link" onClick={() => handleViewDetails(record)}>
            View Details
          </Button>
          {record.acknowledgment && (
            <Button type="link" icon={<Download size={14} />}>
              Download Receipt
            </Button>
          )}
        </Space>
      )
    }
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 5,
  };

  const singleUploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
  };
  const renderContent = () => {
    return children;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{ 
          background: token.colorBgContainer,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 16px',
          color: token.colorPrimary,
          fontWeight: 'bold',
          fontSize: collapsed ? 20 : 18
        }}>
          {collapsed ? <ClipboardList size={24} /> : 'Procurement'}
        </div>        <Menu
          theme="light"
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            setCurrentPage(key);
            onMenuSelect(key);
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: token.colorBgContainer,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          flexDirection: 'column',
          height: 'auto',
          minHeight: 64
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            height: 64,
            marginBottom: 16
          }}>
            <Title level={4} style={{ margin: 0 }}>Procurement Management System</Title>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Steps
              type="navigation"
              current={getCurrentStep(window.location.pathname.split('/')[1])}
              items={processSteps.map(step => ({
                title: step.title,
                description: step.description,
              }))}
              onChange={(current) => {
                const step = processSteps[current];
                if (step) onMenuSelect(step.key);
              }}
              style={{
                marginBottom: 0,
                boxShadow: '0 -1px 0 0 #e8e8e8 inset',
              }}
            />
          </div>
        </Header>        <Content style={{ margin: '16px' }}>
          <div style={{ 
            padding: 24, 
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 360 
          }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>

      <Modal
        title="Export Declarations"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={[
          <Button key="new" type="primary" onClick={() => {
            setExportModalVisible(false);
            setSelectedDeclaration(null);
            setExportFormVisible(true);
          }}>
            New Declaration
          </Button>,
          <Button key="export" onClick={handleExportToExcel} icon={<Download size={14} />}>
            Export to Excel
          </Button>,
          <Button key="close" onClick={() => setExportModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={1200}
      >
        <Table
          columns={exportColumns}
          dataSource={exportData}
          rowKey="id"
          pagination={false}
        />
      </Modal>

      <Modal
        title={selectedDeclaration ? 'Edit Export Declaration' : 'New Export Declaration'}
        open={exportFormVisible}
        onCancel={() => {
          setExportFormVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={selectedDeclaration || {
            transportDate: dayjs(),
            transportTime: dayjs(),
          }}
        >
          <Divider>Basic Information</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="poNumber"
                label="PO Reference"
                rules={[{ required: true, message: 'Please enter PO reference' }]}
              >
                <Input placeholder="Enter PO number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Please enter supplier name' }]}
              >
                <Input placeholder="Enter supplier name" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Transportation Details</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="from"
                label="From Location"
                rules={[{ required: true, message: 'Please enter origin location' }]}
              >
                <Input placeholder="Enter origin location" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="to"
                label="To Location"
                rules={[{ required: true, message: 'Please enter destination location' }]}
              >
                <Input placeholder="Enter destination location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="transportDate"
                label="Transport Date"
                rules={[{ required: true, message: 'Please select transport date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="transportTime"
                label="Transport Time"
                rules={[{ required: true, message: 'Please select transport time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Receiving Acknowledgment</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="receivedDate"
                label="Receiving Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receivedTime"
                label="Receiving Time"
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="acknowledgmentDoc"
            label="Upload Acknowledgment"
            extra="Upload scanned copy of signed receiving acknowledgment"
          >
            <Upload
              action="/upload"
              listType="text"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<AntdIcons.UploadOutlined />}>Upload Acknowledgment</Button>
            </Upload>
          </Form.Item>

          <Divider>Documents</Divider>

          <Form.Item
            name="documents"
            label="Attach Documents"
            extra="Upload packing list, invoice, permits, etc."
          >
            <Upload
              action="/upload"
              listType="text"
              multiple
              beforeUpload={() => false}
            >
              <Button icon={<AntdIcons.UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Additional Notes"
          >
            <TextArea rows={4} placeholder="Enter any additional notes or instructions" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedDeclaration ? 'Update Declaration' : 'Create Declaration'}
              </Button>
              <Button onClick={() => {
                setExportFormVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ProcLayout;