import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Table, Tag, Progress } from 'antd';
import { Area, Column } from '@ant-design/plots';
import { ShoppingCartOutlined, CheckCircleOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  // Mock data for RFQ statistics
  const rfqStats = {
    active: 15,
    completed: 32,
    pending: 8,
    totalValue: 2500000
  };

  // Mock data for PO statistics
  const poStats = {
    active: 12,
    completed: 45,
    pending: 28,
    totalValue: 1250000,
    paid: 850000,
    remaining: 400000
  };

  // Mock data for individual POs
  const poData = [
    { id: 'PO-2024-001', supplier: 'Electro Solutions', value: 150000, paid: 120000, status: 'Active' },
    { id: 'PO-2024-002', supplier: 'MechPro Industries', value: 280000, paid: 280000, status: 'Completed' },
    { id: 'PO-2024-003', supplier: 'Global Electrical', value: 95000, paid: 0, status: 'Pending' },
  ];

  // Mock data for RFQ trend
  const rfqTrendData = [
    { month: 'Jan', value: 8, type: 'Active RFQ' },
    { month: 'Feb', value: 12, type: 'Active RFQ' },
    { month: 'Mar', value: 15, type: 'Active RFQ' },
    { month: 'Apr', value: 10, type: 'Active RFQ' },
    { month: 'Jan', value: 20, type: 'Completed RFQ' },
    { month: 'Feb', value: 25, type: 'Completed RFQ' },
    { month: 'Mar', value: 30, type: 'Completed RFQ' },
    { month: 'Apr', value: 32, type: 'Completed RFQ' },
  ];

  // Mock data for PO payment trend
  const poTrendData = [
    { date: '2024-01', value: 200000, category: 'Paid' },
    { date: '2024-02', value: 350000, category: 'Paid' },
    { date: '2024-03', value: 450000, category: 'Paid' },
    { date: '2024-04', value: 850000, category: 'Paid' },
    { date: '2024-01', value: 1000000, category: 'Total' },
    { date: '2024-02', value: 1100000, category: 'Total' },
    { date: '2024-03', value: 1200000, category: 'Total' },
    { date: '2024-04', value: 1250000, category: 'Total' },
  ];

  const areaConfig = {
    data: poTrendData,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    color: ['#1890ff', '#f0f0f0'],
    areaStyle: {
      fillOpacity: 0.7,
    },
    yAxis: {
      label: {
        formatter: (value: number) => `$${(value / 1000).toFixed(0)}k`,
      },
    },
    legend: {
      position: 'top',
    },
  };

  const rfqColumnConfig = {
    data: rfqTrendData,
    isGroup: true,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    color: ['#1890ff', '#52c41a'],
    label: {
      position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' },
      ],
    },
  };

  const poColumns = [
    {
      title: 'PO ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: 'Total Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paid',
      key: 'paid',
      render: (paid: number, record: any) => (
        <Space direction="vertical" size={0}>
          <span>${paid.toLocaleString()}</span>
          <Progress 
            percent={Math.round((paid / record.value) * 100)} 
            size="small" 
            status={paid === record.value ? 'success' : 'active'}
          />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Active' ? 'blue' : status === 'Completed' ? 'green' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={4}>Procurement Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="RFQ Statistics">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Active RFQs"
                  value={rfqStats.active}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Completed RFQs"
                  value={rfqStats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pending RFQs"
                  value={rfqStats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="PO Statistics">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Active POs"
                  value={poStats.active}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Completed POs"
                  value={poStats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Value"
                  value={poStats.totalValue}
                  prefix="$"
                  precision={0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="RFQ Trend">
            <div style={{ height: 300 }}>
              <Column {...rfqColumnConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="PO Payment Progress">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Paid"
                    value={poStats.paid}
                    prefix="$"
                    precision={0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Remaining"
                    value={poStats.remaining}
                    prefix="$"
                    precision={0}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
              <div style={{ height: 250 }}>
                <Area {...areaConfig} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Purchase Orders">
            <Table 
              columns={poColumns} 
              dataSource={poData}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;