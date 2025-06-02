// filepath: c:\Users\Lenovo\Desktop\PMS\project\src\pages\TBEManagement.jsx
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Drawer, 
  Form, 
  Radio, 
  Input, 
  message,
  Alert
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';

// Import mock data
import { packages, items, quotes } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Technical criteria for binary compliance evaluation
const TECHNICAL_CRITERIA = [
  {
    key: 'technicalSpecifications',
    name: 'Technical Specifications',
    description: 'Meets all technical specifications and requirements',
    type: 'compliance',
    required: true,
    options: [
      { value: 'compliant', label: 'Compliant', description: 'Meets all technical specifications' },
      { value: 'non-compliant', label: 'Non-Compliant', description: 'Does not meet technical specifications' }
    ]
  },
  {
    key: 'qualityStandards',
    name: 'Quality Standards',
    description: 'Compliance with quality standards and certifications',
    type: 'compliance',
    required: true,
    options: [
      { value: 'compliant', label: 'Compliant', description: 'Meets all required quality standards and certifications' },
      { value: 'non-compliant', label: 'Non-Compliant', description: 'Does not meet quality standards or certifications' }
    ]
  },
  {
    key: 'technicalCapability',
    name: 'Technical Capability',
    description: 'Supplier technical expertise and manufacturing capability',
    type: 'compliance',
    required: true,
    options: [
      { value: 'compliant', label: 'Compliant', description: 'Adequate technical capability and expertise' },
      { value: 'non-compliant', label: 'Non-Compliant', description: 'Insufficient technical capability' }
    ]
  },
  {
    key: 'deliveryCapability',
    name: 'Delivery Capability',
    description: 'Ability to meet delivery timeline and logistics',
    type: 'compliance',
    required: true,
    options: [
      { value: 'compliant', label: 'Compliant', description: 'Can meet delivery requirements' },
      { value: 'non-compliant', label: 'Non-Compliant', description: 'Cannot meet delivery requirements' }
    ]
  },
  {
    key: 'documentation',
    name: 'Documentation Quality',
    description: 'Completeness and quality of technical documentation',
    type: 'compliance',
    required: true,
    options: [
      { value: 'compliant', label: 'Compliant', description: 'Complete and adequate documentation provided' },
      { value: 'non-compliant', label: 'Non-Compliant', description: 'Incomplete or inadequate documentation' }
    ]
  }
];

const TBEManagement = () => {
  const [evaluations, setEvaluations] = useState({});
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [evaluationDrawerVisible, setEvaluationDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  // Calculate compliance status for a quote
  const calculateCompliance = (quoteId) => {
    const evaluation = evaluations[quoteId];
    if (!evaluation || !evaluation.technical) return { status: 'pending', compliantCount: 0, totalCount: TECHNICAL_CRITERIA.length };

    const evaluatedCriteria = evaluation.technical;
    const compliantCount = TECHNICAL_CRITERIA.filter(
      criteria => evaluatedCriteria[criteria.key] === 'compliant'
    ).length;
    
    const totalCount = TECHNICAL_CRITERIA.length;
    const isCompliant = compliantCount === totalCount;
    
    return {
      status: isCompliant ? 'compliant' : 'non-compliant',
      compliantCount,
      totalCount
    };
  };

  // Get processed data with compliance status
  const processedData = useMemo(() => {
    return quotes.map(quote => {
      const compliance = calculateCompliance(quote.id);
      return {
        ...quote,
        compliance
      };
    });
  }, [evaluations]);

  // Handle opening evaluation drawer
  const handleEvaluate = (quote) => {
    setSelectedQuote(quote);
    const existingEvaluation = evaluations[quote.id];
    
    if (existingEvaluation) {
      form.setFieldsValue({
        technical: existingEvaluation.technical || {},
        notes: existingEvaluation.notes || ''
      });
    } else {
      form.resetFields();
    }
    
    setEvaluationDrawerVisible(true);
  };

  // Handle evaluation form submission
  const handleEvaluationSubmit = async (values) => {
    try {
      const quoteId = selectedQuote.id;
      
      setEvaluations(prev => ({
        ...prev,
        [quoteId]: {
          technical: values.technical,
          notes: values.notes,
          evaluatedAt: new Date().toISOString(),
          evaluatedBy: 'Current User'
        }
      }));

      setEvaluationDrawerVisible(false);
      setSelectedQuote(null);
      form.resetFields();
      message.success('Technical evaluation saved successfully');
    } catch (error) {
      message.error('Failed to save evaluation');
    }
  };

  // Render compliance status tag
  const renderComplianceTag = (compliance) => {
    if (compliance.status === 'pending') {
      return <Tag color="default">Pending</Tag>;
    }
    
    if (compliance.status === 'compliant') {
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Compliant ({compliance.compliantCount}/{compliance.totalCount})
        </Tag>
      );
    }
    
    return (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        Non-Compliant ({compliance.compliantCount}/{compliance.totalCount})
      </Tag>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier) => <Text strong>{supplier}</Text>
    },
    {
      title: 'Package',
      dataIndex: 'packageId',
      key: 'packageId',
      render: (packageId) => {
        const pkg = packages.find(p => p.id === packageId);
        return pkg ? pkg.name : packageId;
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${amount.toLocaleString()}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Technical Compliance',
      key: 'compliance',
      render: (_, record) => renderComplianceTag(record.compliance)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEvaluate(record)}
            type={record.compliance.status === 'pending' ? 'primary' : 'default'}
          >
            {record.compliance.status === 'pending' ? 'Evaluate' : 'Edit'}
          </Button>
          <Button icon={<EyeOutlined />}>View</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Title level={2}>Technical Bid Evaluation (TBE)</Title>
        <Text type="secondary">
          Binary compliance evaluation for technical requirements
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={processedData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Evaluation Drawer */}
      <Drawer
        title={`Technical Evaluation - ${selectedQuote?.supplier}`}
        open={evaluationDrawerVisible}
        onClose={() => setEvaluationDrawerVisible(false)}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setEvaluationDrawerVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Save Evaluation
            </Button>
          </Space>
        }
      >
        {selectedQuote && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEvaluationSubmit}
          >
            <Alert
              message="Technical Compliance Evaluation"
              description="Evaluate each criterion for compliance with technical requirements."
              type="info"
              style={{ marginBottom: 24 }}
            />

            {TECHNICAL_CRITERIA.map((criteria) => (
              <Form.Item
                key={criteria.key}
                name={['technical', criteria.key]}
                label={
                  <Space direction="vertical" size={0}>
                    <Text strong>{criteria.name}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {criteria.description}
                    </Text>
                  </Space>
                }
                rules={[
                  {
                    required: criteria.required,
                    message: `Please evaluate ${criteria.name}`
                  }
                ]}
              >
                <Radio.Group>
                  {criteria.options.map((option) => (
                    <Radio.Button
                      key={option.value}
                      value={option.value}
                      style={{ marginRight: 8 }}
                    >
                      {option.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            ))}

            <Form.Item
              name="notes"
              label="Evaluation Notes"
            >
              <TextArea
                rows={4}
                placeholder="Additional notes about the technical evaluation..."
              />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default TBEManagement;
