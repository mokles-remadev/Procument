import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Steps, Button, Modal, Table, message, Tag, Form, Input, DatePicker, TimePicker, Upload, Space, Divider, Row, Col } from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { ClipboardList, Users, Settings, BarChart3, FileCheck, DollarSign, Briefcase, FileText, Star, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProcurementLayoutProps {
  children: React.ReactNode;
  onMenuSelect: (key: string) => void;
}

const ProcurementLayout: React.FC<ProcurementLayoutProps> = ({ children, onMenuSelect }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormVisible, setExportFormVisible] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<any>(null);
  const { token } = theme.useToken();
  const [form] = Form.useForm();

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
    { key: 'export', icon: <Download size={16} />, label: 'Export Declaration', onClick: () => setExportModalVisible(true) },
    { key: 'settings', icon: <Settings size={16} />, label: 'Settings' },
  ];

  const getCurrentStep = (key: string) => {
    const stepIndex = processSteps.findIndex(step => step.key === key);
    return stepIndex >= 0 ? stepIndex : -1;
  };

  // Mock data for export declarations
  const exportData = [
    {
      id: 'EXP-2024-001',
      poNumber: 'PO-2024-001',
      supplier: 'Electro Solutions Inc.',
      items: 'Circuit Breakers, Control Panels',
      from: 'Factory Warehouse',
      to: 'Project Site A',
      transportDate: '2024-03-15',
      transportTime: '09:00',
      value: 150000,
      currency: 'USD',
      status: 'Pending',
      documents: ['packing_list.pdf', 'invoice.pdf'],
      receivedDate: '2024-03-16',
      receivedTime: '10:30',
      acknowledgmentDoc: 'receipt_001.pdf',
    },
    {
      id: 'EXP-2024-002',
      poNumber: 'PO-2024-002',
      supplier: 'MechPro Industries',
      items: 'HVAC Units',
      from: 'Supplier Facility',
      to: 'Main Warehouse',
      transportDate: '2024-03-10',
      transportTime: '14:30',
      value: 280000,
      currency: 'USD',
      status: 'Completed',
      documents: ['export_permit.pdf', 'customs_declaration.pdf'],
      receivedDate: '2024-03-11',
      receivedTime: '09:15',
      acknowledgmentDoc: 'receipt_002.pdf',
    },
  ];

  const exportColumns = [
    { title: 'Declaration ID', dataIndex: 'id', key: 'id' },
    { title: 'PO Number', dataIndex: 'poNumber', key: 'poNumber' },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
    { title: 'Transport Date', dataIndex: 'transportDate', key: 'transportDate' },
    { title: 'Transport Time', dataIndex: 'transportTime', key: 'transportTime' },
    { 
      title: 'Received Date/Time', 
      key: 'received',
      render: (_, record) => record.receivedDate ? 
        `${record.receivedDate} ${record.receivedTime}` : 
        '-'
    },
    { 
      title: 'Value', 
      dataIndex: 'value', 
      key: 'value',
      render: (value: number, record: any) => `${record.currency} ${value.toLocaleString()}`
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Completed' ? 'green' : 'orange'}>{status}</Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedDeclaration(record);
              setExportFormVisible(true);
            }}
          >
            View/Edit
          </Button>
          <Button type="link" icon={<Download size={14} />}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const handleExportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Export Declarations');
    XLSX.writeFile(wb, 'export_declarations.xlsx');
    message.success('Export declarations downloaded successfully');
  };

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values);
    message.success('Export declaration form submitted successfully');
    setExportFormVisible(false);
    form.resetFields();
  };

  // Organize menu items to match the process flow
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
        onClick: item.onClick,
      })),
    },
  ];

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
        </div>
        <Menu
          theme="light"
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            if (key !== 'export') {
              onMenuSelect(key);
            }
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
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ 
            padding: 24, 
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 360 
          }}>
            {children}
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

export default ProcurementLayout;