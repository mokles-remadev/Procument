import React, { useState } from 'react';
import { Table, Card, Tag, Space, Typography, Button, Progress, Rate, Statistic, Form, Input, Modal, DatePicker, Upload } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StarOutlined, UploadOutlined } from '@ant-design/icons';
import { PurchaseOrder, Supplier } from '../types/procurement';
import { suppliers } from '../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface QualityMetric {
  supplierId: string;
  poId: string;
  deliveryTime: number;
  qualityScore: number;
  documentationScore: number;
  communicationScore: number;
  notes: string;
  date: string;
}

const SupplierQuality: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [evaluationModal, setEvaluationModal] = useState(false);
  const [form] = Form.useForm();

  const handleEvaluationSubmit = (values: any) => {
    console.log('Evaluation submitted:', values);
    setEvaluationModal(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Supplier',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Supplier) => (
        <a onClick={() => setSelectedSupplier(record)}>{text}</a>
      ),
    },
    {
      title: 'Overall Rating',
      key: 'rating',
      render: (text: string, record: Supplier) => (
        <Rate disabled defaultValue={record.rating} />
      ),
      sorter: (a: Supplier, b: Supplier) => a.rating - b.rating,
    },
    {
      title: 'On-time Delivery',
      key: 'delivery',
      render: () => (
        <Progress percent={95} size="small" status="active" />
      ),
    },
    {
      title: 'Quality Score',
      key: 'quality',
      render: () => (
        <Progress percent={88} size="small" status="active" />
      ),
    },
    {
      title: 'Documentation',
      key: 'documentation',
      render: () => (
        <Progress percent={92} size="small" status="active" />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Supplier) => (
        <Button 
          type="primary"
          onClick={() => {
            setSelectedSupplier(record);
            setEvaluationModal(true);
          }}
        >
          Add Evaluation
        </Button>
      ),
    },
  ];

  const renderSupplierDetails = () => {
    if (!selectedSupplier) return null;

    return (
      <div>
        <Button 
          type="link" 
          onClick={() => setSelectedSupplier(null)} 
          style={{ paddingLeft: 0, marginBottom: 16 }}
        >
          ← Back to Suppliers
        </Button>

        <Card title={selectedSupplier.name} style={{ marginBottom: 24 }}>
          <Space size="large">
            <Statistic title="Overall Rating" value={selectedSupplier.rating} suffix="/5" />
            <Statistic title="Total POs" value={15} />
            <Statistic title="Completed POs" value={12} />
            <Statistic title="Active POs" value={3} />
          </Space>
        </Card>

        <Card title="Performance Metrics" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>On-time Delivery</Text>
              <Progress percent={95} status="active" />
            </div>
            <div>
              <Text>Quality Compliance</Text>
              <Progress percent={88} status="active" />
            </div>
            <div>
              <Text>Documentation Accuracy</Text>
              <Progress percent={92} status="active" />
            </div>
            <div>
              <Text>Communication Response</Text>
              <Progress percent={85} status="active" />
            </div>
          </Space>
        </Card>

        <Card title="Recent Evaluations">
          <Table
            dataSource={[]}
            columns={[
              {
                title: 'PO Reference',
                dataIndex: 'poId',
                key: 'poId',
              },
              {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
              },
              {
                title: 'Delivery Score',
                key: 'delivery',
                render: (text: string, record: QualityMetric) => (
                  <Rate disabled defaultValue={record.deliveryTime} />
                ),
              },
              {
                title: 'Quality Score',
                key: 'quality',
                render: (text: string, record: QualityMetric) => (
                  <Rate disabled defaultValue={record.qualityScore} />
                ),
              },
              {
                title: 'Documentation',
                key: 'documentation',
                render: (text: string, record: QualityMetric) => (
                  <Rate disabled defaultValue={record.documentationScore} />
                ),
              },
            ]}
          />
        </Card>
      </div>
    );
  };

  return (
    <div>
      <Title level={4}>Supplier Quality Management</Title>

      {selectedSupplier ? (
        renderSupplierDetails()
      ) : (
        <Table 
          columns={columns} 
          dataSource={suppliers}
          rowKey="id"
        />
      )}

      <Modal
        title="Add Quality Evaluation"
        open={evaluationModal}
        onCancel={() => {
          setEvaluationModal(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEvaluationSubmit}
        >
          <Form.Item
            name="poReference"
            label="PO Reference"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="deliveryScore"
            label="Delivery Performance"
            rules={[{ required: true }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="qualityScore"
            label="Quality Score"
            rules={[{ required: true }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="documentationScore"
            label="Documentation Score"
            rules={[{ required: true }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="communicationScore"
            label="Communication Score"
            rules={[{ required: true }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Evaluation Notes"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="documents"
            label="Supporting Documents"
          >
            <Upload>
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit Evaluation
              </Button>
              <Button onClick={() => setEvaluationModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierQuality;