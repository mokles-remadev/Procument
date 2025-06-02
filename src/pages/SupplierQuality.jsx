import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Progress, 
  Rate, 
  Statistic, 
  Form, 
  Input, 
  Modal, 
  DatePicker, 
  Upload,
  Alert,
  Spin,
  Row,
  Col,
  Tooltip,
  Divider,
  Timeline,
  Badge,
  Select,
  message,
  Drawer,
  Tabs
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  StarOutlined, 
  UploadOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { suppliers } from '../mock/mockData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const SupplierQuality = ({
  onEvaluationSubmit = () => {},
  onEvaluationUpdate = () => {},
  onEvaluationDelete = () => {},
  permissions = {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
  },
  readOnly = false,
  showStatistics = true,
  autoCalculate = true,
  notificationEnabled = true,
  thresholds = {
    excellent: 4.5,
    good: 3.5,
    poor: 2.5,
  },
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [evaluationModal, setEvaluationModal] = useState(false);
  const [detailsDrawer, setDetailsDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [statistics, setStatistics] = useState({
    totalSuppliers: 0,
    excellentSuppliers: 0,
    averageRating: 0,
    totalEvaluations: 0,
    onTimeDelivery: 0,
    qualityCompliance: 0,
  });
  const [form] = Form.useForm();
  // Mock evaluation data
  const mockEvaluations = useMemo(() => [
    {
      id: 'EVAL-001',
      supplierId: 'SUPP-001',
      poId: 'PO-2024-001',
      date: '2024-05-15',
      deliveryScore: 5,
      qualityScore: 4,
      documentationScore: 5,
      communicationScore: 4,
      overallScore: 4.5,
      evaluator: 'John Smith',
      notes: 'Excellent delivery and quality standards maintained.',
      status: 'Completed',
    },
    {
      id: 'EVAL-002',
      supplierId: 'SUPP-002',
      poId: 'PO-2024-002',
      date: '2024-05-10',
      deliveryScore: 3,
      qualityScore: 4,
      documentationScore: 3,
      communicationScore: 4,
      overallScore: 3.5,
      evaluator: 'Sarah Johnson',
      notes: 'Minor delays in delivery but good quality.',
      status: 'Completed',
    },
  ], []);

  // Calculate statistics
  const calculateStatistics = useCallback(() => {
    const totalSuppliers = suppliers.length;
    const excellentSuppliers = suppliers.filter(s => s.rating >= thresholds.excellent).length;
    const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers;
    const totalEvaluations = mockEvaluations.length;
    
    // Calculate performance metrics
    const avgDelivery = mockEvaluations.reduce((sum, e) => sum + e.deliveryScore, 0) / totalEvaluations * 20;
    const avgQuality = mockEvaluations.reduce((sum, e) => sum + e.qualityScore, 0) / totalEvaluations * 20;

    return {
      totalSuppliers,
      excellentSuppliers,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalEvaluations,
      onTimeDelivery: Math.round(avgDelivery),
      qualityCompliance: Math.round(avgQuality),
    };
  }, [suppliers, mockEvaluations, thresholds.excellent]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stats = calculateStatistics();
      setStatistics(stats);
      setEvaluations(mockEvaluations);
      
    } catch (err) {
      setError('Failed to load quality statistics');
    } finally {
      setLoading(false);
    }
  }, [calculateStatistics, mockEvaluations]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Get supplier performance level
  const getPerformanceLevel = useCallback((rating) => {
    if (rating >= thresholds.excellent) return { level: 'Excellent', color: 'green' };
    if (rating >= thresholds.good) return { level: 'Good', color: 'blue' };
    if (rating >= thresholds.poor) return { level: 'Average', color: 'orange' };
    return { level: 'Poor', color: 'red' };
  }, [thresholds]);
  // Get supplier evaluations
  const getSupplierEvaluations = useCallback((supplierId) => {
    return evaluations.filter(evaluation => evaluation.supplierId === supplierId);
  }, [evaluations]);

  // Enhanced evaluation submission
  const handleEvaluationSubmit = useCallback(async (values) => {
    if (!permissions.canCreate || readOnly) {
      message.warning('You do not have permission to create evaluations');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate overall score
      const scores = [values.deliveryScore, values.qualityScore, values.documentationScore, values.communicationScore];
      const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      const evaluationData = {
        ...values,
        id: `EVAL-${Date.now()}`,
        supplierId: selectedSupplier?.id,
        overallScore: parseFloat(overallScore.toFixed(2)),
        evaluator: 'Current User',
        date: values.date.format('YYYY-MM-DD'),
        status: 'Completed',
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEvaluations(prev => [...prev, evaluationData]);
      onEvaluationSubmit(evaluationData);
      
      if (notificationEnabled) {
        message.success('Quality evaluation submitted successfully');
      }
      
      setEvaluationModal(false);
      form.resetFields();
      
    } catch (err) {
      setError('Failed to submit evaluation');
      message.error('Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier, permissions.canCreate, readOnly, onEvaluationSubmit, notificationEnabled, form]);

  // Format percentage
  const formatPercentage = useCallback((value) => {
    return `${Math.round(value)}%`;
  }, []);
  // Enhanced columns with better functionality
  const columns = [
    {
      title: 'Supplier',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => setSelectedSupplier(record)}
            style={{ padding: 0, height: 'auto' }}
          >
            {text}
          </Button>
          {record.certified && (
            <Tooltip title="Certified Supplier">
              <Badge status="success" />
            </Tooltip>
          )}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Overall Rating',
      key: 'rating',
      render: (text, record) => {
        const performance = getPerformanceLevel(record.rating);
        return (
          <Space direction="vertical" size="small">
            <Rate disabled defaultValue={record.rating} />
            <Tag color={performance.color}>{performance.level}</Tag>
          </Space>
        );
      },
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'On-time Delivery',
      key: 'delivery',
      render: (text, record) => {
        const supplierEvals = getSupplierEvaluations(record.id);
        const avgDelivery = supplierEvals.length > 0 
          ? supplierEvals.reduce((sum, e) => sum + e.deliveryScore, 0) / supplierEvals.length * 20
          : 95; // default mock value
        
        return (
          <Tooltip title={`${supplierEvals.length} evaluations`}>
            <Progress 
              percent={Math.round(avgDelivery)} 
              size="small" 
              status={avgDelivery >= 90 ? "success" : avgDelivery >= 70 ? "active" : "exception"}
              format={formatPercentage}
            />
          </Tooltip>
        );
      },
      sorter: (a, b) => {
        const aEvals = getSupplierEvaluations(a.id);
        const bEvals = getSupplierEvaluations(b.id);
        const aAvg = aEvals.length > 0 ? aEvals.reduce((sum, e) => sum + e.deliveryScore, 0) / aEvals.length : 4.75;
        const bAvg = bEvals.length > 0 ? bEvals.reduce((sum, e) => sum + e.deliveryScore, 0) / bEvals.length : 4.75;
        return aAvg - bAvg;
      },
    },
    {
      title: 'Quality Score',
      key: 'quality',
      render: (text, record) => {
        const supplierEvals = getSupplierEvaluations(record.id);
        const avgQuality = supplierEvals.length > 0 
          ? supplierEvals.reduce((sum, e) => sum + e.qualityScore, 0) / supplierEvals.length * 20
          : 88; // default mock value
        
        return (
          <Tooltip title={`Based on ${supplierEvals.length} evaluations`}>
            <Progress 
              percent={Math.round(avgQuality)} 
              size="small" 
              status={avgQuality >= 90 ? "success" : avgQuality >= 70 ? "active" : "exception"}
              format={formatPercentage}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Documentation',
      key: 'documentation',
      render: (text, record) => {
        const supplierEvals = getSupplierEvaluations(record.id);
        const avgDoc = supplierEvals.length > 0 
          ? supplierEvals.reduce((sum, e) => sum + e.documentationScore, 0) / supplierEvals.length * 20
          : 92; // default mock value
        
        return (
          <Progress 
            percent={Math.round(avgDoc)} 
            size="small" 
            status={avgDoc >= 90 ? "success" : avgDoc >= 70 ? "active" : "exception"}
            format={formatPercentage}
          />
        );
      },
    },
    {
      title: 'Total Evaluations',
      key: 'evaluations',
      render: (text, record) => {
        const count = getSupplierEvaluations(record.id).length;
        return (
          <Badge 
            count={count} 
            style={{ backgroundColor: count > 0 ? '#52c41a' : '#faad14' }}
          />
        );
      },
      sorter: (a, b) => getSupplierEvaluations(a.id).length - getSupplierEvaluations(b.id).length,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space>
          {permissions.canView && (
            <Tooltip title="View Details">
              <Button 
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedSupplier(record);
                  setDetailsDrawer(true);
                }}
              />
            </Tooltip>
          )}
          {permissions.canCreate && !readOnly && (
            <Tooltip title="Add Evaluation">
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedSupplier(record);
                  setEvaluationModal(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
  // Enhanced supplier details with comprehensive information
  const renderSupplierDetails = useCallback(() => {
    if (!selectedSupplier) return null;

    const supplierEvals = getSupplierEvaluations(selectedSupplier.id);
    const performance = getPerformanceLevel(selectedSupplier.rating);
    
    // Calculate metrics
    const avgDelivery = supplierEvals.length > 0 
      ? supplierEvals.reduce((sum, e) => sum + e.deliveryScore, 0) / supplierEvals.length * 20
      : 95;
    const avgQuality = supplierEvals.length > 0 
      ? supplierEvals.reduce((sum, e) => sum + e.qualityScore, 0) / supplierEvals.length * 20
      : 88;
    const avgDocumentation = supplierEvals.length > 0 
      ? supplierEvals.reduce((sum, e) => sum + e.documentationScore, 0) / supplierEvals.length * 20
      : 92;
    const avgCommunication = supplierEvals.length > 0 
      ? supplierEvals.reduce((sum, e) => sum + e.communicationScore, 0) / supplierEvals.length * 20
      : 85;

    const evaluationColumns = [
      {
        title: 'PO Reference',
        dataIndex: 'poId',
        key: 'poId',
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date) => dayjs(date).format('DD/MM/YYYY'),
        sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      },
      {
        title: 'Delivery Score',
        dataIndex: 'deliveryScore',
        key: 'delivery',
        render: (score) => (
          <Space>
            <Rate disabled defaultValue={score} />
            <Text>{score}/5</Text>
          </Space>
        ),
        sorter: (a, b) => a.deliveryScore - b.deliveryScore,
      },
      {
        title: 'Quality Score',
        dataIndex: 'qualityScore',
        key: 'quality',
        render: (score) => (
          <Space>
            <Rate disabled defaultValue={score} />
            <Text>{score}/5</Text>
          </Space>
        ),
        sorter: (a, b) => a.qualityScore - b.qualityScore,
      },
      {
        title: 'Documentation',
        dataIndex: 'documentationScore',
        key: 'documentation',
        render: (score) => (
          <Space>
            <Rate disabled defaultValue={score} />
            <Text>{score}/5</Text>
          </Space>
        ),
      },
      {
        title: 'Overall Score',
        dataIndex: 'overallScore',
        key: 'overall',
        render: (score) => (
          <Tag color={score >= 4 ? 'green' : score >= 3 ? 'blue' : 'orange'}>
            {score.toFixed(1)}/5
          </Tag>
        ),
        sorter: (a, b) => a.overallScore - b.overallScore,
      },
      {
        title: 'Evaluator',
        dataIndex: 'evaluator',
        key: 'evaluator',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (text, record) => (
          <Space>
            {permissions.canView && (
              <Tooltip title="View Details">
                <Button icon={<EyeOutlined />} size="small" />
              </Tooltip>
            )}
            {permissions.canEdit && !readOnly && (
              <Tooltip title="Edit Evaluation">
                <Button icon={<EditOutlined />} size="small" />
              </Tooltip>
            )}
            {permissions.canDelete && !readOnly && (
              <Tooltip title="Delete Evaluation">
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return (
      <div>
        <Button 
          type="link" 
          onClick={() => setSelectedSupplier(null)} 
          style={{ paddingLeft: 0, marginBottom: 16 }}
        >
          ← Back to Suppliers
        </Button>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  {selectedSupplier.name}
                  <Tag color={performance.color}>{performance.level}</Tag>
                  {selectedSupplier.certified && (
                    <Tag color="gold" icon={<TrophyOutlined />}>
                      Certified
                    </Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  {permissions.canCreate && !readOnly && (
                    <Button 
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setEvaluationModal(true)}
                    >
                      Add Evaluation
                    </Button>
                  )}
                  {permissions.canExport && (
                    <Button icon={<DownloadOutlined />}>
                      Export Report
                    </Button>
                  )}
                </Space>
              }
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic 
                    title="Overall Rating" 
                    value={selectedSupplier.rating} 
                    suffix="/5"
                    valueStyle={{ color: performance.color === 'green' ? '#3f8600' : performance.color === 'blue' ? '#1890ff' : '#faad14' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic title="Total Evaluations" value={supplierEvals.length} />
                </Col>
                <Col span={6}>
                  <Statistic title="Active Since" value="2020" />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="Last Evaluation" 
                    value={supplierEvals.length > 0 ? dayjs(supplierEvals[0].date).format('DD/MM/YYYY') : 'N/A'} 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Performance Metrics" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text>On-time Delivery</Text>
                    <Text strong>{Math.round(avgDelivery)}%</Text>
                  </Space>
                  <Progress 
                    percent={Math.round(avgDelivery)} 
                    status={avgDelivery >= 90 ? "success" : avgDelivery >= 70 ? "active" : "exception"}
                    showInfo={false}
                  />
                </div>
                <div>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text>Quality Compliance</Text>
                    <Text strong>{Math.round(avgQuality)}%</Text>
                  </Space>
                  <Progress 
                    percent={Math.round(avgQuality)} 
                    status={avgQuality >= 90 ? "success" : avgQuality >= 70 ? "active" : "exception"}
                    showInfo={false}
                  />
                </div>
                <div>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text>Documentation Accuracy</Text>
                    <Text strong>{Math.round(avgDocumentation)}%</Text>
                  </Space>
                  <Progress 
                    percent={Math.round(avgDocumentation)} 
                    status={avgDocumentation >= 90 ? "success" : avgDocumentation >= 70 ? "active" : "exception"}
                    showInfo={false}
                  />
                </div>
                <div>
                  <Space justify="space-between" style={{ width: '100%' }}>
                    <Text>Communication Response</Text>
                    <Text strong>{Math.round(avgCommunication)}%</Text>
                  </Space>
                  <Progress 
                    percent={Math.round(avgCommunication)} 
                    status={avgCommunication >= 90 ? "success" : avgCommunication >= 70 ? "active" : "exception"}
                    showInfo={false}
                  />
                </div>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Performance Trend" style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <LineChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Performance chart will be displayed here</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card title="Recent Evaluations">
          <Table
            dataSource={supplierEvals}
            columns={evaluationColumns}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} evaluations`,
            }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">No evaluations found</Text>
                  </div>
                  {permissions.canCreate && !readOnly && (
                    <div style={{ marginTop: 16 }}>
                      <Button 
                        type="primary" 
                        onClick={() => setEvaluationModal(true)}
                      >
                        Add First Evaluation
                      </Button>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </Card>
      </div>
    );
  }, [selectedSupplier, getSupplierEvaluations, getPerformanceLevel, permissions, readOnly]);

  // Render statistics dashboard
  const renderStatistics = useCallback(() => {
    if (!showStatistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Suppliers"
              value={statistics.totalSuppliers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Excellent Suppliers"
              value={statistics.excellentSuppliers}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={statistics.averageRating}
              suffix="/5"
              precision={2}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Evaluations"
              value={statistics.totalEvaluations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    );
  }, [showStatistics, statistics]);
  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Supplier Quality Management</Title>
          <Space>
            {readOnly && (
              <Tag color="orange">Read Only Mode</Tag>
            )}
            {permissions.canExport && (
              <Button icon={<DownloadOutlined />}>
                Export Report
              </Button>
            )}
          </Space>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {!selectedSupplier && renderStatistics()}

        <Spin spinning={loading}>
          {selectedSupplier ? (
            renderSupplierDetails()
          ) : (
            <Card>
              <Table 
                columns={columns} 
                dataSource={suppliers}
                rowKey="id"
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} suppliers`,
                }}
              />
            </Card>
          )}
        </Spin>
      </Space>

      {/* Enhanced Evaluation Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Add Quality Evaluation
            {selectedSupplier && (
              <Tag color="blue">{selectedSupplier.name}</Tag>
            )}
          </Space>
        }
        open={evaluationModal}
        onCancel={() => {
          setEvaluationModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEvaluationSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="poId"
                label="PO Reference"
                rules={[{ required: true, message: 'Please enter PO reference' }]}
              >
                <Input 
                  placeholder="e.g., PO-2024-001"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Evaluation Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Performance Scores</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deliveryScore"
                label="Delivery Performance"
                rules={[{ required: true, message: 'Please rate delivery performance' }]}
              >
                <Rate 
                  count={5} 
                  tooltips={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="qualityScore"
                label="Quality Standards"
                rules={[{ required: true, message: 'Please rate quality standards' }]}
              >
                <Rate 
                  count={5} 
                  tooltips={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="documentationScore"
                label="Documentation Quality"
                rules={[{ required: true, message: 'Please rate documentation' }]}
              >
                <Rate 
                  count={5} 
                  tooltips={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="communicationScore"
                label="Communication & Support"
                rules={[{ required: true, message: 'Please rate communication' }]}
              >
                <Rate 
                  count={5} 
                  tooltips={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Evaluation Notes"
          >
            <TextArea 
              rows={4} 
              placeholder="Provide detailed feedback about the supplier's performance..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="attachments"
            label="Supporting Documents"
          >
            <Upload 
              beforeUpload={() => false} 
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
              listType="text"
            >
              <Button icon={<UploadOutlined />}>
                Upload Documents
              </Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
            </Text>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEvaluationModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit Evaluation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={selectedSupplier?.name}
        placement="right"
        onClose={() => setDetailsDrawer(false)}
        open={detailsDrawer}
        width={600}
      >
        {selectedSupplier && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Contact Information</Text>
                <Text>Email: {selectedSupplier.contactEmail || 'info@supplier.com'}</Text>
                <Text>Phone: {selectedSupplier.contactPhone || '+1 234 567 8900'}</Text>
                <Text>Address: {selectedSupplier.address || 'Not specified'}</Text>
              </Space>
            </Card>
            
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Performance Summary</Text>
                <Text>Overall Rating: {selectedSupplier.rating}/5</Text>
                <Text>Total Evaluations: {getSupplierEvaluations(selectedSupplier.id).length}</Text>
                <Text>Performance Level: {getPerformanceLevel(selectedSupplier.rating).level}</Text>
              </Space>
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

// PropTypes validation
SupplierQuality.propTypes = {
  onEvaluationSubmit: PropTypes.func,
  onEvaluationUpdate: PropTypes.func,
  onEvaluationDelete: PropTypes.func,
  permissions: PropTypes.shape({
    canCreate: PropTypes.bool,
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    canView: PropTypes.bool,
    canExport: PropTypes.bool,
  }),
  readOnly: PropTypes.bool,
  showStatistics: PropTypes.bool,
  autoCalculate: PropTypes.bool,
  notificationEnabled: PropTypes.bool,
  thresholds: PropTypes.shape({
    excellent: PropTypes.number,
    good: PropTypes.number,
    poor: PropTypes.number,
  }),
};

// Default props
SupplierQuality.defaultProps = {
  onEvaluationSubmit: () => {},
  onEvaluationUpdate: () => {},
  onEvaluationDelete: () => {},
  permissions: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canExport: true,
  },
  readOnly: false,
  showStatistics: true,
  autoCalculate: true,
  notificationEnabled: true,
  thresholds: {
    excellent: 4.5,
    good: 3.5,
    poor: 2.5,
  },
};

export default SupplierQuality;
