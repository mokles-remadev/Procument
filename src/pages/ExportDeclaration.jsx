import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  DatePicker,
  TimePicker,
  Select,
  Table,
  Space,
  Divider,
  Row,
  Col,
  Typography,
  message,
  Steps,
  List,
  Tag,
  Descriptions,
  Modal,
  Tabs,
  Progress,
  Badge,
  Tooltip,
  Statistic,
  Timeline,
  Alert,
  Skeleton
} from 'antd';
import '../styles/ExportDeclaration.css';
import {
  UploadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
  BellOutlined,
  DownloadOutlined,
  PlusOutlined,
  EyeOutlined,
  GlobalOutlined,
  TruckOutlined,
  FileProtectOutlined,
  TeamOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  FileAddOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  BankOutlined,
  CarOutlined,
  CheckSquareOutlined,
  ContainerOutlined,
  DollarOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;

const ExportDeclaration = ({ onNavigate }) => {
  const [form] = Form.useForm();
  const [notificationForm] = Form.useForm();  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedExport, setSelectedExport] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simulate initial data loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDataLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for existing export declarations
  const existingExports = [
    {
      key: '1',
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
      key: '2',
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

  // Mock data for export items
  const exportItems = [
    {
      key: '1',
      itemCode: 'PUMP-001',
      description: 'Centrifugal Pump 50HP',
      quantity: 2,
      unitPrice: 15000,
      totalPrice: 30000,
      hsCode: '8413.70.00',
      country: 'Germany'
    },
    {
      key: '2',
      itemCode: 'VALVE-002',
      description: 'Ball Valve 6 inch',
      quantity: 5,
      unitPrice: 800,
      totalPrice: 4000,
      hsCode: '8481.80.00',
      country: 'Italy'
    }
  ];

  // Existing export table columns
  const existingExportColumns = [
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
            size="small"
            icon={<BellOutlined />}
            onClick={() => handleExportNotification(record)}
          >
            Export Notification
          </Button>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          {record.acknowledgment && (
            <Button 
              type="link" 
              size="small"
              icon={<DownloadOutlined />}
            >
              Download
            </Button>
          )}
        </Space>
      )
    }
  ];

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Unit Price (USD)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => `$${price.toLocaleString()}`
    },
    {
      title: 'Total Price (USD)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (price) => `$${price.toLocaleString()}`
    },
    {
      title: 'HS Code',
      dataIndex: 'hsCode',
      key: 'hsCode',
    },
    {
      title: 'Country of Origin',
      dataIndex: 'country',
      key: 'country',
    }
  ];
  const uploadProps = {
    beforeUpload: (file) => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        message.error('You can only upload PDF or image files!');
      }
      return false; // Prevent auto upload
    },
    multiple: true,
    maxCount: 5,
  };

  const singleUploadProps = {
    beforeUpload: (file) => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        message.error('You can only upload PDF or image files!');
      }
      return false; // Prevent auto upload
    },
    maxCount: 1,
  };

  // Export to Excel functionality
  const handleExportToExcel = () => {
    const exportableData = existingExports.map(item => ({
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
    message.success('Export data downloaded successfully!');
  };

  // Handle export notification meeting
  const handleExportNotification = (record) => {
    setSelectedExport(record);
    setNotificationModal(true);
    notificationForm.setFieldsValue({
      meetingDate: dayjs(),
      meetingTime: dayjs(),
      location: 'Conference Room A',
      attendees: ['HSE', 'GAQC', 'Logistics', 'Procurement']
    });
  };

  // Handle notification form submission
  const handleNotificationSubmit = (values) => {
    console.log('Notification submitted:', {
      export: selectedExport,
      meeting: values,
      minutesOfMeeting: values.minutesOfMeeting?.[0]?.originFileObj,
      materialReceivingAcknowledgment: values.materialReceivingAcknowledgment?.[0]?.originFileObj
    });
    message.success('Export notification meeting scheduled successfully!');
    setNotificationModal(false);
    notificationForm.resetFields();
  };

  // Handle view details
  const handleViewDetails = (record) => {
    // Switch to new declaration tab and populate form with record data
    setActiveTab('new');
    form.setFieldsValue({
      poReference: record.poRef,
      outReference: record.outRef,
      costCenter: record.costCenter,
      fromLocation: record.from,
      toLocation: record.to,
      portOfLoading: record.pol,
      portOfDischarge: record.pod,
      exportDate: record.exportDate ? dayjs(record.exportDate) : null,
    });
  };
  const steps = [
    {
      title: 'Basic Info',
      description: 'Export details & references',
      icon: <FileTextOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Transport',
      description: 'Shipping & logistics',
      icon: <TruckOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Documents',
      description: 'Required documentation',
      icon: <FileProtectOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'Review',
      description: 'Final review & submit',
      icon: <CheckCircleOutlined />,
      color: '#722ed1'
    },
  ];

  // Enhanced save draft functionality
  const handleSaveDraft = async () => {
    setSaveLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Draft saved successfully!');
    } catch (error) {
      message.error('Failed to save draft');
    } finally {
      setSaveLoading(false);
    }
  };

  // Enhanced form completion calculation
  const getFormCompletion = () => {
    const values = form.getFieldsValue();
    const totalFields = Object.keys(values).length;
    const filledFields = Object.values(values).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  // Handle next step in the form
  const handleNext = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      message.error('Please fill in all required fields');
    });
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      setFormData(values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
        message.success('Export declaration submitted successfully!');
      if (onNavigate) {
        onNavigate('po');
      }
    } catch (error) {
      message.error('Please complete all required fields');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setFormData(values);
      setPreviewModal(true);
    } catch (error) {
      message.error('Please complete all required fields before preview');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {      case 0:
        return (
          <div className="space-y-6">
            {/* Progress indicator */}
            <Card 
              size="small" 
              className="mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <div className="flex items-center space-x-3">
                    <GlobalOutlined style={{ fontSize: '24px', color: 'white' }} />
                    <div>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        Export Declaration Setup
                      </Text>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Complete your export documentation
                      </div>
                    </div>
                  </div>
                </Col>
                <Col>
                  <Progress 
                    type="circle" 
                    percent={getFormCompletion()} 
                    size={60}
                    strokeColor="white"
                    trailColor="rgba(255,255,255,0.3)"
                  />
                </Col>
              </Row>
            </Card>

            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span>Basic Export Information</span>
                </div>
              }
              className="shadow-md"
              extra={
                <Tag color="blue" icon={<InfoCircleOutlined />}>
                  Required Fields
                </Tag>
              }
            >
              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="poReference"
                    label={
                      <span className="font-medium">
                        <Tooltip title="Purchase Order reference number">
                          PO Reference <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter PO reference' }]}
                  >
                    <Input 
                      placeholder="Enter PO reference number" 
                      prefix={<FileTextOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="outReference"
                    label={
                      <span className="font-medium">
                        <Tooltip title="Outbound reference number">
                          Out Reference <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter out reference' }]}
                  >
                    <Input 
                      placeholder="Enter out reference number" 
                      prefix={<ExportOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="costCenter"
                    label={
                      <span className="font-medium">
                        <Tooltip title="Select the appropriate cost center">
                          Cost Center <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select cost center' }]}
                  >
                    <Select 
                      placeholder="Select cost center"
                      className="rounded-lg"
                      suffixIcon={<DashboardOutlined style={{ color: '#bfbfbf' }} />}
                    >
                      <Option value="CC-001">
                        <div className="flex items-center justify-between">
                          <span>CC-001</span>
                          <Tag size="small" color="blue">Active</Tag>
                        </div>
                      </Option>
                      <Option value="CC-002">
                        <div className="flex items-center justify-between">
                          <span>CC-002</span>
                          <Tag size="small" color="green">Active</Tag>
                        </div>
                      </Option>
                      <Option value="CC-003">
                        <div className="flex items-center justify-between">
                          <span>CC-003</span>
                          <Tag size="small" color="orange">Limited</Tag>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="exportLicense"
                    label={
                      <span className="font-medium">
                        Export License Number
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter export license number' }]}
                  >
                    <Input 
                      placeholder="Enter export license number" 
                      prefix={<FileProtectOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="declarationType"
                    label={
                      <span className="font-medium">
                        Declaration Type
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select declaration type' }]}
                  >
                    <Select 
                      placeholder="Select declaration type"
                      className="rounded-lg"
                    >
                      <Option value="temporary">
                        <div className="flex items-center space-x-2">
                          <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                          <span>Temporary Export</span>
                        </div>
                      </Option>
                      <Option value="permanent">
                        <div className="flex items-center space-x-2">
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <span>Permanent Export</span>
                        </div>
                      </Option>
                      <Option value="re-export">
                        <div className="flex items-center space-x-2">
                          <ExportOutlined style={{ color: '#1890ff' }} />
                          <span>Re-export</span>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="customsOffice"
                    label={
                      <span className="font-medium">
                        Customs Office
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter customs office' }]}
                  >
                    <Input 
                      placeholder="Enter customs office location" 
                      prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" orientationMargin="0">
                <span className="text-gray-600 font-medium">Location & Date Information</span>
              </Divider>

              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="exportDate"
                    label={
                      <span className="font-medium">
                        Export Date
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select export date' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      className="rounded-lg"
                      suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="fromLocation"
                    label={
                      <span className="font-medium">
                        From Location
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter from location' }]}
                  >
                    <Input 
                      placeholder="Enter from location" 
                      prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="toLocation"
                    label={
                      <span className="font-medium">
                        To Location
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter to location' }]}
                  >
                    <Input 
                      placeholder="Enter to location" 
                      prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="portOfLoading"
                    label={
                      <span className="font-medium">
                        Port of Loading (POL)
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter port of loading' }]}
                  >
                    <Input 
                      placeholder="Enter port of loading" 
                      prefix={<TruckOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="portOfDischarge"
                    label={
                      <span className="font-medium">
                        Port of Discharge (POD)
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter port of discharge' }]}
                  >
                    <Input 
                      placeholder="Enter port of discharge" 
                      prefix={<TruckOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" orientationMargin="0">
                <span className="text-gray-600 font-medium">Additional Details</span>
              </Divider>

              <Row gutter={[24, 20]}>
                <Col span={24}>
                  <Form.Item
                    name="exportPurpose"
                    label={
                      <span className="font-medium">
                        Export Purpose
                      </span>
                    }
                    rules={[{ required: true, message: 'Please describe export purpose' }]}
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="Describe the purpose of export in detail..." 
                      className="rounded-lg"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="notes"
                    label={
                      <span className="font-medium">
                        Additional Notes
                      </span>
                    }
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="Enter any additional notes or special requirements..." 
                      className="rounded-lg"
                      showCount
                      maxLength={300}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>
        );      case 1:
        return (
          <div className="space-y-6">
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <TruckOutlined style={{ color: '#52c41a' }} />
                  <span>Transport & Delivery Details</span>
                </div>
              }
              className="shadow-md"
              extra={
                <Timeline size="small" mode="horizontal">
                  <Timeline.Item color="green" dot={<CalendarOutlined />}>Schedule</Timeline.Item>
                  <Timeline.Item color="blue" dot={<TruckOutlined />}>Transport</Timeline.Item>
                  <Timeline.Item color="purple" dot={<GlobalOutlined />}>Delivery</Timeline.Item>
                </Timeline>
              }
            >
              <Alert
                message="Transport Information"
                description="Please provide accurate transport details for customs clearance and tracking purposes."
                type="info"
                showIcon
                className="mb-6 rounded-lg"
              />

              <Divider orientation="left" orientationMargin="0">
                <span className="text-gray-600 font-medium flex items-center">
                  <CalendarOutlined className="mr-2" />
                  Schedule Information
                </span>
              </Divider>

              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="transportDate"
                    label={
                      <span className="font-medium">
                        Transport Date
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select transport date' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      className="rounded-lg"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                      showNow
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="transportTime"
                    label={
                      <span className="font-medium">
                        Transport Time
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select transport time' }]}
                  >
                    <TimePicker 
                      style={{ width: '100%' }} 
                      format="HH:mm" 
                      className="rounded-lg"
                      minuteStep={15}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item
                    name="transportMode"
                    label={
                      <span className="font-medium">
                        Mode of Transport
                      </span>
                    }
                    rules={[{ required: true, message: 'Please select transport mode' }]}
                  >
                    <Select 
                      placeholder="Select transport mode"
                      className="rounded-lg"
                    >
                      <Option value="air">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                            ✈️
                          </div>
                          <span>Air Freight</span>
                          <Tag size="small" color="blue">Fast</Tag>
                        </div>
                      </Option>
                      <Option value="sea">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                            🚢
                          </div>
                          <span>Sea Freight</span>
                          <Tag size="small" color="green">Economic</Tag>
                        </div>
                      </Option>
                      <Option value="road">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                            🚛
                          </div>
                          <span>Road Transport</span>
                          <Tag size="small" color="orange">Flexible</Tag>
                        </div>
                      </Option>
                      <Option value="rail">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                            🚂
                          </div>
                          <span>Rail Transport</span>
                          <Tag size="small" color="purple">Reliable</Tag>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" orientationMargin="0">
                <span className="text-gray-600 font-medium flex items-center">
                  <TruckOutlined className="mr-2" />
                  Carrier Information
                </span>
              </Divider>

              <Row gutter={[24, 20]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="carrier"
                    label={
                      <span className="font-medium">
                        Carrier/Shipping Line
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter carrier information' }]}
                  >
                    <Input 
                      placeholder="Enter carrier or shipping line" 
                      prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="portOfExit"
                    label={
                      <span className="font-medium">
                        Port of Exit
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter port of exit' }]}
                  >
                    <Input 
                      placeholder="Enter port of exit" 
                      prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="finalDestination"
                    label={
                      <span className="font-medium">
                        Final Destination
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter final destination' }]}
                  >
                    <Input 
                      placeholder="Enter final destination address" 
                      prefix={<GlobalOutlined style={{ color: '#bfbfbf' }} />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Transport Summary Card */}
              <Card 
                size="small" 
                className="mt-4"
                style={{ 
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong style={{ color: 'white' }}>
                      Transport Summary
                    </Text>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                      Review your transport details
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Statistic 
                      title="Estimated Duration" 
                      value="5-7 days" 
                      valueStyle={{ color: 'white', fontSize: '14px' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </div>
                </div>
              </Card>
            </Card>
          </div>
        );      case 2:
        return (
          <div className="space-y-6">
            {/* Enhanced Documentation Progress Card */}
            <Card 
              size="small" 
              className="mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <div className="flex items-center space-x-3">
                    <FileProtectOutlined style={{ fontSize: '24px', color: 'white' }} />
                    <div>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        Document Management
                      </Text>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Upload required export documentation
                      </div>
                    </div>
                  </div>
                </Col>
                <Col>
                  <Progress 
                    type="circle" 
                    percent={getFormCompletion()} 
                    size={60}
                    strokeColor="white"
                    trailColor="rgba(255,255,255,0.3)"
                  />
                </Col>
              </Row>
            </Card>

            {/* Document Upload Guidelines */}
            <Alert
              message="Document Upload Guidelines"
              description="Ensure all documents are clear, legible, and in PDF format. Maximum file size: 10MB per document."
              type="info"
              icon={<InfoCircleOutlined />}
              showIcon
              className="mb-4"
            />

            {/* Essential Documents Section */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <FileProtectOutlined style={{ color: '#f5576c' }} />
                  <span>Essential Export Documents</span>
                  <Tag color="red" icon={<InfoCircleOutlined />}>
                    Required
                  </Tag>
                </div>
              }
              className="shadow-md"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileTextOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-blue-700">Equipment Datasheets</Text>
                    </div>
                    <Form.Item
                      name="datasheets"
                      rules={[{ required: true, message: 'Please upload datasheets' }]}
                    >
                      <Upload {...uploadProps} className="upload-enhanced">
                        <Button 
                          icon={<UploadOutlined />}
                          type="primary"
                          ghost
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Datasheets</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Max 5 files, PDF format
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-green-200 hover:border-green-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-green-700">Material Receiving Ack.</Text>
                    </div>
                    <Form.Item
                      name="receivingAck"
                      rules={[{ required: true, message: 'Please upload receiving acknowledgment' }]}
                    >
                      <Upload {...singleUploadProps}>
                        <Button 
                          icon={<UploadOutlined />}
                          type="primary"
                          ghost
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Acknowledgment</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Single PDF file
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TeamOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-purple-700">Minutes of Meeting</Text>
                    </div>
                    <Form.Item
                      name="minutesOfMeeting"
                      rules={[{ required: true, message: 'Please upload minutes of meeting' }]}
                    >
                      <Upload {...singleUploadProps}>
                        <Button 
                          icon={<UploadOutlined />}
                          type="primary"
                          ghost
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Minutes</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Meeting documentation
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <Divider orientation="left" orientationMargin="0" className="mt-6">
                <span className="text-gray-600 font-medium flex items-center">
                  <DollarOutlined className="mr-2" />
                  Commercial Documents
                </span>
              </Divider>

              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 20%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <DollarOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-orange-700">Commercial Invoice</Text>
                    </div>
                    <Form.Item
                      name="invoice"
                      rules={[{ required: true, message: 'Please upload invoice' }]}
                    >
                      <Upload {...singleUploadProps}>
                        <Button 
                          icon={<UploadOutlined />}
                          type="primary"
                          ghost
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Invoice</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Official commercial invoice
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-cyan-200 hover:border-cyan-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <GlobalOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-cyan-700">Certificate of Origin</Text>
                    </div>
                    <Form.Item
                      name="certificateOfOrigin"
                      rules={[{ required: true, message: 'Please upload certificate' }]}
                    >
                      <Upload {...singleUploadProps}>
                        <Button 
                          icon={<UploadOutlined />}
                          type="primary"
                          ghost
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Certificate</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Origin documentation
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-red-200 hover:border-red-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ContainerOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-red-700">Packing List</Text>
                    </div>
                    <Form.Item
                      name="packingList"
                      rules={[{ required: true, message: 'Please upload packing list' }]}
                    >
                      <Upload {...singleUploadProps}>
                        <Button 
                          icon={<UploadOutlined />}
                          type="primary"
                          ghost
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Packing List</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Detailed packing information
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Optional Documents Section */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <FileAddOutlined style={{ color: '#52c41a' }} />
                  <span>Additional Documents</span>
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Optional
                  </Tag>
                </div>
              }
              className="shadow-md"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12}>
                  <Card
                    size="small"
                    className="h-full border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)' }}
                  >
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <SafetyCertificateOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <Text strong className="text-gray-700">Export Permit</Text>
                    </div>
                    <Form.Item name="exportPermit">
                      <Upload {...singleUploadProps}>
                        <Button 
                          icon={<UploadOutlined />}
                          block
                          size="large"
                          className="h-20 border-2 border-dashed"
                        >
                          <div>
                            <div>Upload Permit</div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Optional export permit
                            </Text>
                          </div>
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* Document Checklist Summary */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <CheckSquareOutlined style={{ color: '#1890ff' }} />
                  <span>Document Submission Checklist</span>
                </div>
              }
              className="shadow-md"
            >
              <Timeline
                items={[
                  {
                    dot: <CheckCircleOutlined className="text-green-500" />,
                    children: (
                      <div>
                        <Text strong>Equipment Datasheets</Text>
                        <br />
                        <Text type="secondary">Product specifications and technical details</Text>
                      </div>
                    ),
                  },
                  {
                    dot: <CheckCircleOutlined className="text-green-500" />,
                    children: (
                      <div>
                        <Text strong>Material Receiving Acknowledgment</Text>
                        <br />
                        <Text type="secondary">Confirmation of material receipt</Text>
                      </div>
                    ),
                  },
                  {
                    dot: <CheckCircleOutlined className="text-green-500" />,
                    children: (
                      <div>
                        <Text strong>Commercial Documentation</Text>
                        <br />
                        <Text type="secondary">Invoice, certificate of origin, and packing list</Text>
                      </div>
                    ),
                  },
                  {
                    dot: <CheckCircleOutlined className="text-blue-500" />,
                    children: (
                      <div>
                        <Text strong>Meeting Documentation</Text>
                        <br />
                        <Text type="secondary">Minutes of meeting and acknowledgments</Text>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        );      case 3:
        return (
          <div className="space-y-6">
            {/* Enhanced Review Progress Card */}
            <Card 
              size="small" 
              className="mb-4"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <div className="flex items-center space-x-3">
                    <CheckSquareOutlined style={{ fontSize: '24px', color: 'white' }} />
                    <div>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        Final Review & Submission
                      </Text>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Review all details before submitting your export declaration
                      </div>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div className="text-center">
                    <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                      100%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                      Complete
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Summary Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={6}>
                <Card className="text-center shadow-sm">
                  <Statistic
                    title="Export Items"
                    value={exportItems.length}
                    prefix={<ContainerOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="text-center shadow-sm">
                  <Statistic
                    title="Total Value"
                    value={exportItems.reduce((sum, item) => sum + item.totalPrice, 0)}
                    prefix="$"
                    precision={2}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="text-center shadow-sm">
                  <Statistic
                    title="Documents"
                    value="7"
                    suffix="/ 7"
                    prefix={<FileProtectOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card className="text-center shadow-sm">
                  <Statistic
                    title="Completion"
                    value={100}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Export Items Summary with Enhanced Design */}
            <Card 
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ContainerOutlined style={{ color: '#1890ff' }} />
                    <span>Export Items Summary</span>
                    <Badge count={exportItems.length} showZero style={{ backgroundColor: '#52c41a' }} />
                  </div>
                  <Tag color="blue" icon={<InfoCircleOutlined />}>
                    Ready for Export
                  </Tag>
                </div>
              }
              className="shadow-md"
            >
              <Table
                columns={[
                  {
                    title: 'Item Code',
                    dataIndex: 'itemCode',
                    key: 'itemCode',
                    render: (text) => (
                      <Tag color="blue" className="font-mono">
                        {text}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                    render: (text) => (
                      <div>
                        <Text strong>{text}</Text>
                      </div>
                    ),
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center',
                    render: (qty) => (
                      <Badge count={qty} showZero style={{ backgroundColor: '#52c41a' }} />
                    ),
                  },
                  {
                    title: 'HS Code',
                    dataIndex: 'hsCode',
                    key: 'hsCode',
                    render: (code) => (
                      <Tag color="purple" className="font-mono">
                        {code}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'unitPrice',
                    key: 'unitPrice',
                    align: 'right',
                    render: (price) => (
                      <Text strong className="text-green-600">
                        ${price.toLocaleString()}
                      </Text>
                    ),
                  },
                  {
                    title: 'Total Value',
                    dataIndex: 'totalPrice',
                    key: 'totalPrice',
                    align: 'right',
                    render: (total) => (
                      <Text strong className="text-blue-600 text-lg">
                        ${total.toLocaleString()}
                      </Text>
                    ),
                  },
                  {
                    title: 'Origin',
                    dataIndex: 'country',
                    key: 'country',
                    render: (country) => (
                      <Tag color="orange" icon={<GlobalOutlined />}>
                        {country}
                      </Tag>
                    ),
                  },
                ]}
                dataSource={exportItems}
                pagination={false}
                size="middle"
                className="enhanced-table"
                summary={(pageData) => {
                  const totalValue = pageData.reduce((sum, item) => sum + item.totalPrice, 0);
                  const totalQty = pageData.reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <Table.Summary.Row 
                      style={{ 
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        fontWeight: 'bold'
                      }}
                    >
                      <Table.Summary.Cell colSpan={2}>
                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                          <TrophyOutlined className="mr-2" />
                          Total Export Summary
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <Badge count={totalQty} showZero style={{ backgroundColor: '#52c41a' }} />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell colSpan={3} align="right">
                        <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                          ${totalValue.toLocaleString()}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell />
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>

            {/* Enhanced Declaration Summary */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div className="flex items-center space-x-2">
                      <FileTextOutlined style={{ color: '#722ed1' }} />
                      <span>Declaration Details</span>
                    </div>
                  }
                  className="shadow-md h-full"
                  style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' }}
                >
                  <Descriptions column={1} size="middle" className="custom-descriptions">
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <FileTextOutlined className="mr-2 text-blue-500" />
                          PO Reference
                        </span>
                      }
                    >
                      <Tag color="blue" className="font-mono text-lg px-3 py-1">
                        {formData.poReference || 'Not specified'}
                      </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <FileProtectOutlined className="mr-2 text-purple-500" />
                          Declaration Type
                        </span>
                      }
                    >
                      <Tag color="purple" icon={<CheckCircleOutlined />}>
                        {formData.declarationType || 'Standard Export'}
                      </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <SafetyCertificateOutlined className="mr-2 text-green-500" />
                          Export License
                        </span>
                      }
                    >
                      <Tag color="green" icon={<SafetyCertificateOutlined />}>
                        {formData.exportLicense || 'Not required'}
                      </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <BankOutlined className="mr-2 text-orange-500" />
                          Customs Office
                        </span>
                      }
                    >
                      <Tag color="orange" icon={<BankOutlined />}>
                        {formData.customsOffice || 'Not specified'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div className="flex items-center space-x-2">
                      <TruckOutlined style={{ color: '#1890ff' }} />
                      <span>Transport & Logistics</span>
                    </div>
                  }
                  className="shadow-md h-full"
                  style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
                >
                  <Descriptions column={1} size="middle" className="custom-descriptions">
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <CalendarOutlined className="mr-2 text-blue-500" />
                          Transport Date
                        </span>
                      }
                    >
                      <Tag color="blue" icon={<CalendarOutlined />} className="text-lg px-3 py-1">
                        {formData.transportDate?.format?.('MMM DD, YYYY') || 'Not scheduled'}
                      </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <TruckOutlined className="mr-2 text-green-500" />
                          Transport Mode
                        </span>
                      }
                    >
                      <Tag color="green" icon={<TruckOutlined />}>
                        {formData.transportMode?.charAt(0).toUpperCase() + formData.transportMode?.slice(1) || 'Not specified'}
                      </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <CarOutlined className="mr-2 text-purple-500" />
                          Carrier
                        </span>
                      }
                    >
                      <Tag color="purple" icon={<CarOutlined />}>
                        {formData.carrier || 'To be assigned'}
                      </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item 
                      label={
                        <span className="font-medium text-gray-700">
                          <GlobalOutlined className="mr-2 text-orange-500" />
                          Final Destination
                        </span>
                      }
                    >
                      <Tag color="orange" icon={<GlobalOutlined />}>
                        {formData.finalDestination || 'Not specified'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Document Checklist Status */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <CheckSquareOutlined style={{ color: '#52c41a' }} />
                  <span>Document Verification Status</span>
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    All Documents Ready
                  </Tag>
                </div>
              }
              className="shadow-md"
              style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Equipment Datasheets</Text>
                      <br />
                      <Text type="success" className="text-sm">✓ Uploaded & Verified</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Commercial Invoice</Text>
                      <br />
                      <Text type="success" className="text-sm">✓ Uploaded & Verified</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Certificate of Origin</Text>
                      <br />
                      <Text type="success" className="text-sm">✓ Uploaded & Verified</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Packing List</Text>
                      <br />
                      <Text type="success" className="text-sm">✓ Uploaded & Verified</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Material Receiving Ack.</Text>
                      <br />
                      <Text type="success" className="text-sm">✓ Uploaded & Verified</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <Text strong>Minutes of Meeting</Text>
                      <br />
                      <Text type="success" className="text-sm">✓ Uploaded & Verified</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Final Submission Alert */}
            <Alert
              message="Ready for Submission"
              description="All required information and documents have been provided. Your export declaration is ready to be submitted to customs authorities. Please review all details one final time before submitting."
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              className="mb-4"              action={
                <Button size="small" type="text" className="text-green-600">
                  <InfoCircleOutlined className="mr-1" />
                  View Guidelines
                </Button>
              }
            />
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {dataLoading && (
            <div className="space-y-6">
              {/* Header Skeleton */}
              <Card className="shadow-lg border-0">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton.Button active size="large" shape="round" className="w-32" />
                  <div className="flex items-center space-x-4">
                    <Skeleton.Avatar active size="large" shape="square" />
                    <Skeleton.Button active size="small" shape="round" className="w-24" />
                  </div>
                </div>
                <Skeleton
                  active
                  title={{ width: '60%' }}
                  paragraph={{ rows: 2, width: ['40%', '30%'] }}
                  className="skeleton-card"
                />
              </Card>
              {/* Navigation Skeleton */}
              <Card className="shadow-lg border-0">
                <div className="flex space-x-8 mb-6">
                  <Skeleton.Button active size="large" shape="round" className="w-40" />
                  <Skeleton.Button active size="large" shape="round" className="w-40" />
                </div>
                {/* Progress Steps Skeleton */}
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex flex-col items-center">
                        <Skeleton.Avatar active size="large" shape="circle" />
                        <Skeleton.Button active size="small" className="w-20 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Form Content Skeleton */}
                <div className="space-y-6">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Skeleton.Input active size="large" className="w-full" />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input active size="large" className="w-full" />
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Skeleton.Input active size="large" className="w-full" />
                    </Col>
                    <Col span={8}>
                      <Skeleton.Input active size="large" className="w-full" />
                    </Col>
                    <Col span={8}>
                      <Skeleton.Input active size="large" className="w-full" />
                    </Col>
                  </Row>
                  <Skeleton active paragraph={{ rows: 3 }} className="skeleton-card" />
                </div>
              </Card>
              {/* Statistics Cards Skeleton */}
              <Row gutter={[16, 16]}>
                {[1, 2, 3].map(i => (
                  <Col span={8} key={i}>
                    <Card className="shadow-sm">
                      <div className="text-center">
                        <Skeleton.Avatar active size="large" shape="square" />
                        <Skeleton.Button active size="small" className="w-24 mt-2" />
                        <Skeleton.Button active size="large" className="w-16 mt-1" />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              {/* Table Skeleton */}
              <Card className="shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton.Input active size="large" className="w-64" />
                    <Skeleton.Button active size="large" shape="round" className="w-32" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded">
                        <Skeleton.Avatar active size="small" shape="square" />
                        <Skeleton.Input active className="flex-1" />
                        <Skeleton.Button active size="small" className="w-20" />
                        <Skeleton.Button active size="small" className="w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {!dataLoading && (
            <>
              {/* Enhanced Header */}
              <div className="mb-8">
                <Card
                  className="shadow-lg border-0"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => onNavigate ? onNavigate('dashboard') : window.history.back()}
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          border: 'none',
                          color: 'white'
                        }}
                        className="hover:bg-white hover:bg-opacity-30"
                      >
                        Back to Procurement
                      </Button>
                      <div>
                        <Title level={2} className="mb-0" style={{ color: 'white' }}>
                          <ExportOutlined className="mr-3" />
                          Export Declaration Management
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                          Streamlined export documentation and customs declaration system
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                          Today's Date
                        </div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>
                          {dayjs().format('MMM DD, YYYY')}
                        </div>
                      </div>
                      <Badge count={existingExports.filter(e => e.status === 'Pending').length} showZero={false}>
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <BellOutlined style={{ fontSize: '20px', color: 'white' }} />
                        </div>
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Enhanced Tabs */}
              <Card className="shadow-lg border-0">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  size="large"
                  tabBarStyle={{ marginBottom: '24px' }}
                  items={[
                    {
                      key: 'new',
                      label: (
                        <span className="flex items-center space-x-2 px-4 py-2">
                          <PlusOutlined />
                          <span>New Declaration</span>
                          <Badge count="New" size="small" style={{ backgroundColor: '#52c41a' }} />
                        </span>
                      ),
                      children: (
                        <div className="space-y-6">
                          {/* Enhanced Progress Steps */}
                          <Card className="shadow-sm">
                            <Steps
                              current={currentStep}
                              type="navigation"
                              className="mb-6"
                              items={steps.map((step, index) => ({
                                title: step.title,
                                description: step.description,
                                icon: step.icon,
                                status: index < currentStep ? 'finish' :
                                  index === currentStep ? 'process' : 'wait'
                              }))}
                            />

                            {/* Action Bar */}
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <Text type="secondary">
                                  Step {currentStep + 1} of {steps.length}
                                </Text>
                                <Progress
                                  percent={(currentStep / (steps.length - 1)) * 100}
                                  size="small"
                                  strokeColor="#667eea"
                                  className="w-32"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Tooltip title="Preview your declaration">
                                  <Button
                                    icon={<EyeOutlined />}
                                    onClick={handlePreview}
                                    disabled={currentStep < 3}
                                    type="text"
                                  >
                                    Preview
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Save as draft">
                                  <Button
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveDraft}
                                    loading={saveLoading}
                                    type="text"
                                  >
                                    Save Draft
                                  </Button>
                                </Tooltip>
                              </div>
                            </div>
                          </Card>

                          {/* Enhanced Form Content */}
                          <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                              declarationType: 'permanent',
                              transportMode: 'sea'
                            }}
                            onValuesChange={() => {
                              // Trigger re-render for progress calculation
                              setTimeout(() => {
                                setFormData(form.getFieldsValue());
                              }, 100);
                            }}
                          >
                            {renderStepContent()}
                          </Form>

                          {/* Enhanced Navigation */}
                          <Card className="shadow-sm">
                            <div className="flex justify-between items-center">
                              <Button
                                size="large"
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                icon={<ArrowLeftOutlined />}
                                className="flex items-center"
                              >
                                Previous
                              </Button>

                              <div className="flex items-center space-x-2">
                                <Text type="secondary" className="mr-4">
                                  {currentStep === steps.length - 1 ? 'Ready to submit' : 'Continue to next step'}
                                </Text>
                                {currentStep < steps.length - 1 ? (
                                  <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleNext}
                                    className="flex items-center"
                                    style={{
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      border: 'none'
                                    }}
                                  >
                                    Next
                                    <ArrowLeftOutlined style={{ transform: 'rotate(180deg)' }} />
                                  </Button>
                                ) : (
                                  <Button
                                    type="primary"
                                    size="large"
                                    icon={<SendOutlined />}
                                    loading={loading}
                                    onClick={handleSubmit}
                                    style={{
                                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                      border: 'none'
                                    }}
                                  >
                                    Submit Declaration
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      )
                    },
                    {
                      key: 'existing',
                      label: (
                        <span className="flex items-center space-x-2 px-4 py-2">
                          <FileTextOutlined />
                          <span>Existing Declarations</span>
                          <Badge
                            count={existingExports.length}
                            size="small"
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        </span>
                      ),
                      children: (
                        <div className="space-y-6">
                          {/* Enhanced Filter Bar */}
                          <Card className="shadow-sm">
                            <Row gutter={[16, 16]} align="middle">
                              <Col xs={24} sm={8} md={6}>
                                <Input
                                  placeholder="Search declarations..."
                                  prefix={<SearchOutlined />}
                                  value={searchText}
                                  onChange={(e) => setSearchText(e.target.value)}
                                  className="rounded-lg"
                                />
                              </Col>
                              <Col xs={24} sm={8} md={6}>
                                <Select
                                  placeholder="Filter by status"
                                  value={statusFilter}
                                  onChange={setStatusFilter}
                                  style={{ width: '100%' }}
                                  className="rounded-lg"
                                >
                                  <Option value="all">All Status</Option>
                                  <Option value="Completed">Completed</Option>
                                  <Option value="Pending">Pending</Option>
                                </Select>
                              </Col>
                              <Col xs={24} sm={8} md={12}>
                                <div className="flex justify-end space-x-2">
                                  <Tooltip title="Export to Excel">
                                    <Button
                                      icon={<DownloadOutlined />}
                                      onClick={handleExportToExcel}
                                      type="primary"
                                      ghost
                                    >
                                      Export Excel
                                    </Button>
                                  </Tooltip>
                                  <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setActiveTab('new')}
                                    style={{
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      border: 'none'
                                    }}
                                  >
                                    New Declaration
                                  </Button>
                                </div>
                              </Col>
                            </Row>
                          </Card>

                          {/* Enhanced Statistics Cards */}
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                              <Card className="text-center shadow-sm">
                                <Statistic
                                  title="Total Declarations"
                                  value={existingExports.length}
                                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                                  valueStyle={{ color: '#1890ff' }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Card className="text-center shadow-sm">
                                <Statistic
                                  title="Completed"
                                  value={existingExports.filter(e => e.status === 'Completed').length}
                                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                  valueStyle={{ color: '#52c41a' }}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                              <Card className="text-center shadow-sm">
                                <Statistic
                                  title="Pending"
                                  value={existingExports.filter(e => e.status === 'Pending').length}
                                  prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                                  valueStyle={{ color: '#fa8c16' }}
                                />
                              </Card>
                            </Col>
                          </Row>

                          {/* Enhanced Table */}
                          <Card className="shadow-sm">
                            <Table
                              columns={existingExportColumns}
                              dataSource={existingExports.filter(item =>
                                (statusFilter === 'all' || item.status === statusFilter) &&
                                (searchText === '' ||
                                  item.poRef.toLowerCase().includes(searchText.toLowerCase()) ||
                                  item.outRef.toLowerCase().includes(searchText.toLowerCase()) ||
                                  item.from.toLowerCase().includes(searchText.toLowerCase()) ||
                                  item.to.toLowerCase().includes(searchText.toLowerCase())
                                )
                              )}
                              rowKey="key"
                              pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                  `${range[0]}-${range[1]} of ${total} declarations`,
                              }}
                              scroll={{ x: 1200 }}
                              className="custom-table"
                            />
                          </Card>
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            </>
          )}
        </div>
        {/* Modals */}
        <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <EyeOutlined style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <div>
              <div className="text-lg font-semibold">Export Declaration Preview</div>
              <div className="text-sm text-gray-500">Review your export declaration details</div>
            </div>
          </div>
        }
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        width={1000}
        footer={
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text type="success">All information verified</Text>
            </div>
            <Space>
              <Button onClick={() => setPreviewModal(false)}>
                Close Preview
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginRight: '8px' }}
              >
                Download PDF
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={handleSubmit}
                style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}
              >
                Submit Declaration
              </Button>
            </Space>
          </div>
        }
        className="enhanced-modal"
      >
        <div className="space-y-6">
          {/* Preview Header */}
          <Card 
            size="small"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <div className="flex items-center space-x-3">
                  <ExportOutlined style={{ fontSize: '24px' }} />
                  <div>
                    <Text strong style={{ color: 'white', fontSize: '18px' }}>
                      Export Declaration #{formData.poReference || 'DRAFT'}
                    </Text>
                    <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Generated on {dayjs().format('MMMM DD, YYYY')}
                    </div>
                  </div>
                </div>
              </Col>
              <Col>
                <Tag color="success" className="text-lg px-4 py-2">
                  <CheckCircleOutlined className="mr-2" />
                  Ready for Export
                </Tag>
              </Col>
            </Row>
          </Card>

          {/* Quick Stats */}
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card className="text-center" size="small">
                <Statistic
                  title="Total Items"
                  value={exportItems.length}
                  prefix={<ContainerOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="text-center" size="small">
                <Statistic
                  title="Total Value"
                  value={exportItems.reduce((sum, item) => sum + item.totalPrice, 0)}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="text-center" size="small">
                <Statistic
                  title="Documents"
                  value="7"
                  suffix="/ 7"
                  prefix={<FileProtectOutlined />}
                  valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Declaration Information */}
          <Card 
            title={
              <div className="flex items-center space-x-2">
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span>Declaration Information</span>
              </div>
            }
            size="small"
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <Text strong className="text-gray-700">PO Reference:</Text>
                    <Tag color="blue" className="font-mono">
                      {formData.poReference || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <Text strong className="text-gray-700">Declaration Type:</Text>
                    <Tag color="purple">
                      {formData.declarationType || 'Standard Export'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <Text strong className="text-gray-700">Export License:</Text>
                    <Tag color="green">
                      {formData.exportLicense || 'Not required'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <Text strong className="text-gray-700">Customs Office:</Text>
                    <Tag color="orange">
                      {formData.customsOffice || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-cyan-50 rounded">
                    <Text strong className="text-gray-700">Transport Date:</Text>
                    <Tag color="cyan">
                      {formData.transportDate?.format?.('MMM DD, YYYY') || 'Not scheduled'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <Text strong className="text-gray-700">Transport Mode:</Text>
                    <Tag color="purple">
                      {formData.transportMode?.charAt(0).toUpperCase() + formData.transportMode?.slice(1) || 'Not specified'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <Text strong className="text-gray-700">Out Reference:</Text>
                    <Tag color="red" className="font-mono">
                      {formData.outReference || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <Text strong className="text-gray-700">Cost Center:</Text>
                    <Tag color="gold">
                      {formData.costCenter || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-indigo-50 rounded">
                    <Text strong className="text-gray-700">From Location:</Text>
                    <Tag color="geekblue">
                      {formData.fromLocation || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-pink-50 rounded">
                    <Text strong className="text-gray-700">To Location:</Text>
                    <Tag color="magenta">
                      {formData.toLocation || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-lime-50 rounded">
                    <Text strong className="text-gray-700">Final Destination:</Text>
                    <Tag color="lime">
                      {formData.finalDestination || 'Not specified'}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-volcano-50 rounded">
                    <Text strong className="text-gray-700">Carrier:</Text>
                    <Tag color="volcano">
                      {formData.carrier || 'To be assigned'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Export Items Details */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ContainerOutlined style={{ color: '#52c41a' }} />
                  <span>Export Items</span>
                </div>
                <Badge count={exportItems.length} showZero style={{ backgroundColor: '#52c41a' }} />
              </div>
            }
            size="small"
          >
            <List
              dataSource={exportItems}
              renderItem={(item, index) => (
                <List.Item className="border-l-4 border-blue-400 pl-4 mb-3 bg-blue-50 rounded-r">
                  <div className="w-full">
                    <Row align="middle" justify="space-between">
                      <Col span={16}>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Tag color="blue" className="font-mono">{item.itemCode}</Tag>
                            <Text strong className="text-lg">{item.description}</Text>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              <span className="font-medium">Qty:</span> {item.quantity}
                            </span>
                            <span>
                              <span className="font-medium">HS Code:</span> 
                              <Tag size="small" color="purple" className="ml-1">{item.hsCode}</Tag>
                            </span>
                            <span>
                              <span className="font-medium">Origin:</span> 
                              <Tag size="small" color="orange" className="ml-1">{item.country}</Tag>
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col span={8} className="text-right">
                        <div className="space-y-1">
                          <Text className="text-gray-600">Unit: ${item.unitPrice.toLocaleString()}</Text>
                          <div>
                            <Text strong className="text-xl text-green-600">
                              ${item.totalPrice.toLocaleString()}
                            </Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </List.Item>
              )}
            />
            
            {/* Total Summary */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-green-300">
              <Row justify="space-between" align="middle">
                <Col>
                  <div className="flex items-center space-x-2">
                    <TrophyOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                    <Text strong className="text-lg">Total Export Value</Text>
                  </div>
                </Col>
                <Col>
                  <Text strong className="text-2xl text-green-600">
                    ${exportItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                  </Text>
                </Col>
              </Row>
            </div>
          </Card>
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <BellOutlined style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <div>
              <div className="text-lg font-semibold">Export Notification Meeting</div>
              <div className="text-sm text-gray-500">Schedule and coordinate export notification meeting</div>
            </div>
          </div>
        }
        open={notificationModal}
        onCancel={() => {
          setNotificationModal(false);
          notificationForm.resetFields();
        }}
        footer={null}
        width={900}
        className="enhanced-modal"
      >
        {selectedExport && (
          <div className="space-y-6">
            {/* Export Details Header */}
            <Card 
              size="small"
              style={{ 
                background: 'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <div className="flex items-center space-x-3">
                    <ExportOutlined style={{ fontSize: '24px' }} />
                    <div>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        Export Reference: {selectedExport.poRef}
                      </Text>
                      <div style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {selectedExport.from} → {selectedExport.to}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col>
                  <Tag color="warning" className="text-lg px-3 py-1">
                    <ClockCircleOutlined className="mr-2" />
                    Pending Notification
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Export Details Grid */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card 
                  title={
                    <div className="flex items-center space-x-2">
                      <FileTextOutlined style={{ color: '#1890ff' }} />
                      <span>Export Details</span>
                    </div>
                  }
                  size="small"
                  className="h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <Text strong>PO Reference:</Text>
                      <Tag color="blue" className="font-mono">{selectedExport.poRef}</Tag>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <Text strong>Out Reference:</Text>
                      <Tag color="green" className="font-mono">{selectedExport.outRef}</Tag>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <Text strong>Cost Center:</Text>
                      <Tag color="purple">{selectedExport.costCenter}</Tag>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <Text strong>Export Date:</Text>
                      <Tag color="orange">{selectedExport.exportDate}</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  title={
                    <div className="flex items-center space-x-2">
                      <GlobalOutlined style={{ color: '#52c41a' }} />
                      <span>Transport Route</span>
                    </div>
                  }
                  size="small"
                  className="h-full"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-cyan-50 rounded">
                      <Text strong>From:</Text>
                      <Tag color="cyan">{selectedExport.from}</Tag>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-magenta-50 rounded">
                      <Text strong>To:</Text>
                      <Tag color="magenta">{selectedExport.to}</Tag>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-geekblue-50 rounded">
                      <Text strong>Port of Loading:</Text>
                      <Tag color="geekblue">{selectedExport.pol}</Tag>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-volcano-50 rounded">
                      <Text strong>Port of Discharge:</Text>
                      <Tag color="volcano">{selectedExport.pod}</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Meeting Coordination Form */}
            <Card 
              title={
                <div className="flex items-center space-x-2">
                  <TeamOutlined style={{ color: '#722ed1' }} />
                  <span>Meeting Coordination</span>
                  <Tag color="purple" icon={<CalendarOutlined />}>
                    Schedule Required
                  </Tag>
                </div>
              }
              className="shadow-md"
            >
              <Form
                form={notificationForm}
                layout="vertical"
                onFinish={handleNotificationSubmit}
              >
                <Row gutter={[24, 20]}>
                  <Col xs={24} sm={12} lg={8}>
                    <Form.Item
                      name="meetingDate"
                      label={
                        <span className="font-medium">
                          <CalendarOutlined className="mr-2 text-blue-500" />
                          Meeting Date
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select meeting date' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        className="rounded-lg"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        showToday
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Form.Item
                      name="meetingTime"
                      label={
                        <span className="font-medium">
                          <ClockCircleOutlined className="mr-2 text-green-500" />
                          Meeting Time
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select meeting time' }]}
                    >
                      <TimePicker 
                        style={{ width: '100%' }} 
                        format="HH:mm" 
                        className="rounded-lg"
                        minuteStep={15}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Form.Item
                      name="location"
                      label={
                        <span className="font-medium">
                          <GlobalOutlined className="mr-2 text-purple-500" />
                          Meeting Location
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter meeting location' }]}
                    >
                      <Input 
                        placeholder="Enter meeting location" 
                        className="rounded-lg"
                        prefix={<TeamOutlined style={{ color: '#bfbfbf' }} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 20]}>
                  <Col span={24}>
                    <Form.Item
                      name="attendees"
                      label={
                        <span className="font-medium">
                          <TeamOutlined className="mr-2 text-orange-500" />
                          Required Attendees
                        </span>
                      }
                      rules={[{ required: true, message: 'Please select attendees' }]}
                    >
                      <Select 
                        mode="multiple" 
                        style={{ width: '100%' }} 
                        placeholder="Select required attendees"
                        className="rounded-lg"
                      >
                        <Option value="HSE">
                          <div className="flex items-center space-x-2">
                            <Tag size="small" color="red">HSE</Tag>
                            <span>Health, Safety & Environment Department</span>
                          </div>
                        </Option>
                        <Option value="GAQC">
                          <div className="flex items-center space-x-2">
                            <Tag size="small" color="green">GAQC</Tag>
                            <span>General Administration & Quality Control</span>
                          </div>
                        </Option>
                        <Option value="Logistics">
                          <div className="flex items-center space-x-2">
                            <Tag size="small" color="blue">Logistics</Tag>
                            <span>Logistics Department</span>
                          </div>
                        </Option>
                        <Option value="Procurement">
                          <div className="flex items-center space-x-2">
                            <Tag size="small" color="purple">Procurement</Tag>
                            <span>Procurement Department</span>
                          </div>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 20]}>
                  <Col span={24}>
                    <Form.Item
                      name="agenda"
                      label={
                        <span className="font-medium">
                          <FileTextOutlined className="mr-2 text-blue-500" />
                          Meeting Agenda
                        </span>
                      }
                      rules={[{ required: true, message: 'Please enter meeting agenda' }]}
                    >
                      <TextArea 
                        rows={4} 
                        placeholder="Enter detailed meeting agenda and discussion points..." 
                        className="rounded-lg"
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 20]}>
                  <Col span={24}>
                    <Form.Item
                      name="requirements"
                      label={
                        <span className="font-medium">
                          <StarOutlined className="mr-2 text-gold" />
                          Special Requirements
                        </span>
                      }
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Any special requirements, equipment, or documents needed for the meeting..." 
                        className="rounded-lg"
                        showCount
                        maxLength={300}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Document Upload Section */}
                <Divider orientation="left" orientationMargin="0">
                  <span className="text-gray-600 font-medium flex items-center">
                    <FileProtectOutlined className="mr-2" />
                    Required Documents
                  </span>
                </Divider>

                <Row gutter={[24, 20]}>
                  <Col xs={24} lg={12}>
                    <Card
                      size="small"
                      className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors"
                      style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
                    >
                      <div className="text-center mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileTextOutlined style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong className="text-blue-700">Minutes of Meeting</Text>
                      </div>
                      <Form.Item
                        name="minutesOfMeeting"
                        rules={[{ required: true, message: 'Please upload the minutes of meeting' }]}
                      >
                        <Upload {...uploadProps}>
                          <Button 
                            icon={<UploadOutlined />}
                            block
                            size="large"
                            className="h-16 border-2 border-dashed"
                          >
                            <div>
                              <div>Upload Minutes</div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Meeting minutes document
                              </Text>
                            </div>
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Card
                      size="small"
                      className="border-2 border-dashed border-green-200 hover:border-green-400 transition-colors"
                      style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}
                    >
                      <div className="text-center mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircleOutlined style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong className="text-green-700">Material Receiving Acknowledgment</Text>
                      </div>
                      <Form.Item
                        name="materialReceivingAcknowledgment"
                        rules={[{ required: true, message: 'Please upload the material receiving acknowledgment' }]}
                      >
                        <Upload {...uploadProps}>
                          <Button 
                            icon={<UploadOutlined />}
                            block
                            size="large"
                            className="h-16 border-2 border-dashed"
                          >
                            <div>
                              <div>Upload Acknowledgment</div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Material receiving acknowledgment
                              </Text>
                            </div>
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-200">
                  <Alert
                    message="Meeting Coordination Required"
                    description="This meeting is required to coordinate the export notification process with all relevant departments."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    className="flex-1 mr-4"
                  />
                  <Space size="large">
                    <Button 
                      size="large"
                      onClick={() => setNotificationModal(false)}
                      icon={<ArrowLeftOutlined />}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large"
                      icon={<SendOutlined />}
                      style={{ 
                        background: 'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)',
                        border: 'none'
                      }}
                    >
                      Schedule Meeting
                    </Button>
                  </Space>
                </div>
              </Form> 
            </Card>
          </div>
        )}
      </Modal>
      </div>
    </>
  );
};

export default ExportDeclaration;
