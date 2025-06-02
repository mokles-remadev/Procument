import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Table, Tag, Progress, Alert, Spin, Button } from 'antd';
import { Area, Column } from '@ant-design/plots';
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Title } = Typography;

const Dashboard = ({ refreshInterval = 300000 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);

  // Mock data fetching function
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = {
        rfqStats: {
          active: 15,
          completed: 32,
          pending: 8,
          totalValue: 2500000
        },
        poStats: {
          active: 12,
          completed: 45,
          pending: 28,
          totalValue: 1250000,
          paid: 850000,
          remaining: 400000
        },
        poData: [
          { id: 'PO-2024-001', supplier: 'Electro Solutions', value: 150000, paid: 120000, status: 'Active' },
          { id: 'PO-2024-002', supplier: 'MechPro Industries', value: 280000, paid: 280000, status: 'Completed' },
          { id: 'PO-2024-003', supplier: 'Global Electrical', value: 95000, paid: 0, status: 'Pending' },
          { id: 'PO-2024-004', supplier: 'TechCorp Ltd', value: 175000, paid: 87500, status: 'Active' },
          { id: 'PO-2024-005', supplier: 'Industrial Parts Co', value: 225000, paid: 225000, status: 'Completed' }
        ],
        rfqTrendData: [
          { month: 'Jan', value: 8, type: 'Active RFQ' },
          { month: 'Feb', value: 12, type: 'Active RFQ' },
          { month: 'Mar', value: 15, type: 'Active RFQ' },
          { month: 'Apr', value: 10, type: 'Active RFQ' },
          { month: 'May', value: 18, type: 'Active RFQ' },
          { month: 'Jun', value: 15, type: 'Active RFQ' },
          { month: 'Jan', value: 20, type: 'Completed RFQ' },
          { month: 'Feb', value: 25, type: 'Completed RFQ' },
          { month: 'Mar', value: 30, type: 'Completed RFQ' },
          { month: 'Apr', value: 32, type: 'Completed RFQ' },
          { month: 'May', value: 28, type: 'Completed RFQ' },
          { month: 'Jun', value: 35, type: 'Completed RFQ' }
        ],
        poTrendData: [
          { date: '2024-01', value: 200000, category: 'Paid' },
          { date: '2024-02', value: 350000, category: 'Paid' },
          { date: '2024-03', value: 450000, category: 'Paid' },
          { date: '2024-04', value: 650000, category: 'Paid' },
          { date: '2024-05', value: 750000, category: 'Paid' },
          { date: '2024-06', value: 850000, category: 'Paid' },
          { date: '2024-01', value: 1000000, category: 'Total' },
          { date: '2024-02', value: 1100000, category: 'Total' },
          { date: '2024-03', value: 1150000, category: 'Total' },
          { date: '2024-04', value: 1200000, category: 'Total' },
          { date: '2024-05', value: 1225000, category: 'Total' },
          { date: '2024-06', value: 1250000, category: 'Total' }
        ]
      };
      
      setDashboardData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, refreshInterval]);

  // Memoized configurations
  const areaConfig = useMemo(() => {
    if (!dashboardData?.poTrendData) return {};
    
    return {
      data: dashboardData.poTrendData,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      color: ['#1890ff', '#f0f0f0'],
      areaStyle: {
        fillOpacity: 0.7,
      },
      yAxis: {
        label: {
          formatter: (value) => `$${(value / 1000).toFixed(0)}k`,
        },
      },
      legend: {
        position: 'top',
      },
      smooth: true,
    };
  }, [dashboardData?.poTrendData]);

  const rfqColumnConfig = useMemo(() => {
    if (!dashboardData?.rfqTrendData) return {};
    
    return {
      data: dashboardData.rfqTrendData,
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
  }, [dashboardData?.rfqTrendData]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Extract data with fallbacks
  const rfqStats = dashboardData?.rfqStats || { active: 0, completed: 0, pending: 0, totalValue: 0 };
  const poStats = dashboardData?.poStats || { active: 0, completed: 0, pending: 0, totalValue: 0, paid: 0, remaining: 0 };
  // Memoized table columns configuration
  const poColumns = useMemo(() => [
    {
      title: 'PO ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 500 }}>{id}</span>,
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
      render: (value) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          ${value.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paid',
      key: 'paid',
      render: (paid, record) => (
        <Space direction="vertical" size={0}>
          <span>${paid.toLocaleString()}</span>
          <Progress 
            percent={Math.round((paid / record.value) * 100)} 
            size="small" 
            status={paid === record.value ? 'success' : 'active'}
            strokeColor={paid === record.value ? '#52c41a' : '#1890ff'}
          />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Active' ? 'blue' : status === 'Completed' ? 'green' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ], []);

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
        action={
          <Button 
            size="small" 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            Retry
          </Button>
        }
      />
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Procurement Dashboard</Title>
        <Space>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="RFQ Statistics" extra={<DollarOutlined style={{ color: '#1890ff' }} />}>
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
              <div style={{ marginTop: 16 }}>
                <Statistic
                  title="Total RFQ Value"
                  value={rfqStats.totalValue}
                  prefix="$"
                  precision={0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="PO Statistics" extra={<DollarOutlined style={{ color: '#52c41a' }} />}>
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
                    title="Pending POs"
                    value={poStats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <Statistic
                  title="Total PO Value"
                  value={poStats.totalValue}
                  prefix="$"
                  precision={0}
                  valueStyle={{ color: '#722ed1' }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="RFQ Trend (6 Months)" loading={loading && !dashboardData}>
              <div style={{ height: 300 }}>
                {dashboardData?.rfqTrendData ? (
                  <Column {...rfqColumnConfig} />
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#8c8c8c' 
                  }}>
                    No data available
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="PO Payment Progress" loading={loading && !dashboardData}>
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
                  {dashboardData?.poTrendData ? (
                    <Area {...areaConfig} />
                  ) : (
                    <div style={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#8c8c8c' 
                    }}>
                      No data available
                    </div>
                  )}
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card 
              title="Recent Purchase Orders" 
              extra={
                <Button type="link" onClick={() => console.log('View all POs')}>
                  View All
                </Button>
              }
            >
              <Table 
                columns={poColumns} 
                dataSource={dashboardData?.poData || []}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                }}
                rowKey="id"
                loading={loading && !dashboardData}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

Dashboard.propTypes = {
  refreshInterval: PropTypes.number,
};

Dashboard.defaultProps = {
  refreshInterval: 300000, // 5 minutes
};

export default Dashboard;
