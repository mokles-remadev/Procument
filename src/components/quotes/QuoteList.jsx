import React, { useState, useCallback, useMemo } from 'react';
import { Table, Button, Tag, Space, Typography, Card, Radio, Badge, Upload, message, Modal, Alert, Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DollarOutlined, 
  UploadOutlined, 
  FileTextOutlined,
  FilePdfOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getQuotesByItemId } from '../../mock/mockData';
import PropTypes from 'prop-types';

const { Text, Title } = Typography;

const QuoteList = ({ itemId }) => {
  const [preferredQuote, setPreferredQuote] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const quotes = useMemo(() => {
    try {
      if (!itemId) return [];
      const quoteData = getQuotesByItemId(itemId);
      const preferred = quoteData.find(q => q.isPreferred);
      if (preferred) {
        setPreferredQuote(preferred.id);
      }
      return quoteData;
    } catch (err) {
      setError('Error loading quotes: ' + err.message);
      return [];
    }
  }, [itemId]);

  const handlePreferredChange = useCallback((quoteId) => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setPreferredQuote(quoteId);
        setLoading(false);
        message.success('Preferred quote updated successfully');
      }, 500);
    } catch (err) {
      setError('Error updating preferred quote: ' + err.message);
      setLoading(false);
    }
  }, []);

  const handleUpload = useCallback((info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
    }
    if (info.file.status === 'done') {
      setLoading(false);
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error(`${info.file.name} upload failed.`);
    }
  }, []);

  const handlePreview = useCallback((url) => {
    if (!url) {
      message.warning('Document URL not available');
      return;
    }
    setPreviewUrl(url);
    setPreviewVisible(true);
  }, []);

  const uploadProps = useMemo(() => ({
    name: 'offer',
    action: '/api/upload',
    onChange: handleUpload,
    multiple: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
    beforeUpload: (file) => {
      const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type);
      if (!isValidType) {
        message.error('You can only upload PDF, DOC, DOCX, XLS, or XLSX files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      return true;
    },
  }), [handleUpload]);

  const getDeliveryTermColor = useCallback((term) => {
    const colorMap = {
      'EXW': 'purple',
      'FOB': 'blue', 
      'CIF': 'cyan',
      'DDP': 'green',
      'DAP': 'orange',
      'CIP': 'geekblue',
      'CPT': 'volcano',
    };
    return colorMap[term] || 'default';
  }, []);

  const formatCurrency = useCallback((amount, currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    const symbol = symbols[currency] || '';
    return `${symbol}${amount?.toLocaleString() || '0'}`;
  }, []);

  const getFileIcon = useCallback((filename) => {
    if (filename?.endsWith('.pdf')) return <FilePdfOutlined />;
    return <FileTextOutlined />;
  }, []);

  const columns = useMemo(() => [
    {
      title: 'Preferred',
      key: 'preferred',
      render: (text, record) => (
        <Radio
          checked={preferredQuote === record.id}
          onChange={() => handlePreferredChange(record.id)}
          disabled={loading}
        />
      ),
      width: 90,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      sorter: (a, b) => (a.supplierName || '').localeCompare(b.supplierName || ''),
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Price',
      key: 'price',
      render: (text, record) => (
        <Text style={{ fontWeight: 'bold', color: preferredQuote === record.id ? '#52c41a' : undefined }}>
          {formatCurrency(record.price, record.currency)}
        </Text>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      filters: [
        { text: 'USD', value: 'USD' },
        { text: 'EUR', value: 'EUR' },
        { text: 'GBP', value: 'GBP' },
        { text: 'JPY', value: 'JPY' },
      ],
      onFilter: (value, record) => record.currency === value,
      width: 100,
    },
    {
      title: 'Delivery Term',
      dataIndex: 'deliveryTerm',
      key: 'deliveryTerm',
      render: term => (
        <Tag color={getDeliveryTermColor(term)}>{term}</Tag>
      ),
      filters: [
        { text: 'EXW', value: 'EXW' },
        { text: 'FOB', value: 'FOB' },
        { text: 'CIF', value: 'CIF' },
        { text: 'DDP', value: 'DDP' },
        { text: 'DAP', value: 'DAP' },
      ],
      onFilter: (value, record) => record.deliveryTerm === value,
    },
    {
      title: 'Delivery Time',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      render: days => `${days || 0} days`,
      sorter: (a, b) => (a.deliveryTime || 0) - (b.deliveryTime || 0),
      width: 120,
    },
    {
      title: 'Material Origin',
      dataIndex: 'materialOrigin',
      key: 'materialOrigin',
      ellipsis: true,
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      sorter: (a, b) => 
        new Date(a.validUntil || 0).getTime() - new Date(b.validUntil || 0).getTime(),
      render: (date) => {
        if (!date) return 'N/A';
        const isExpired = new Date(date) < new Date();
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : undefined }}>
            {date}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
    },
    {
      title: 'Technical',
      key: 'technical',
      render: (text, record) => (
        record.technicalCompliance ? 
          <Badge status="success" text="Compliant" /> : 
          <Badge status="error" text="Non-compliant" />
      ),
      filters: [
        { text: 'Compliant', value: true },
        { text: 'Non-compliant', value: false },
      ],
      onFilter: (value, record) => record.technicalCompliance === value,
      width: 120,
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (text, record) => (
        <Space wrap>
          {record.documents?.map((doc, index) => (
            <Button 
              key={index}
              icon={getFileIcon(doc)}
              size="small"
              onClick={() => handlePreview(doc)}
              title={`View document ${index + 1}`}
            >
              Doc {index + 1}
            </Button>
          )) || <Text type="secondary">No documents</Text>}
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="small" disabled={loading}>
              Upload
            </Button>
          </Upload>
        </Space>
      ),
      width: 200,
    },
  ], [preferredQuote, handlePreferredChange, formatCurrency, getDeliveryTermColor, getFileIcon, handlePreview, uploadProps, loading]);

  if (error) {
    return (
      <Alert
        message="Error Loading Quotes"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
      />
    );
  }

  if (!quotes.length) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <DollarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">No Quotes Available</Title>
          <Text type="secondary">No quotes have been submitted for this item yet.</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="quote-list">
      <Spin spinning={loading}>
        <Title level={5}>Quote Comparison ({quotes.length} quotes)</Title>
        
        {/* Quote Summary Cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', padding: '4px' }}>
          {quotes.map(quote => (
            <Card 
              key={quote.id}
              title={
                <Space>
                  <Text strong>{quote.supplierName}</Text>
                  {preferredQuote === quote.id && <Badge status="success" text="Preferred" />}
                </Space>
              }
              style={{ 
                width: 280, 
                minWidth: 280,
                borderColor: preferredQuote === quote.id ? '#52c41a' : undefined,
                backgroundColor: preferredQuote === quote.id ? '#f6ffed' : undefined,
              }}
              size="small"
              extra={
                <Radio
                  checked={preferredQuote === quote.id}
                  onChange={() => handlePreferredChange(quote.id)}
                  disabled={loading}
                />
              }
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                {formatCurrency(quote.price, quote.currency)}
              </div>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Delivery: </Text>
                  <Tag color={getDeliveryTermColor(quote.deliveryTerm)}>
                    {quote.deliveryTerm}
                  </Tag>
                  <Text>{quote.deliveryTime} days</Text>
                </div>
                <div>
                  <Text type="secondary">Origin: </Text>
                  <Text>{quote.materialOrigin}</Text>
                </div>
                <div>
                  <Text type="secondary">Valid until: </Text>
                  <Text>{quote.validUntil}</Text>
                </div>
                <div>
                  {quote.technicalCompliance ? (
                    <Badge status="success" text="Technical compliance" />
                  ) : (
                    <Badge status="error" text="Non-compliant" />
                  )}
                </div>
                {quote.notes && (
                  <div>
                    <Text type="secondary">Notes: </Text>
                    <Text ellipsis={{ tooltip: quote.notes }} style={{ maxWidth: '200px' }}>
                      {quote.notes}
                    </Text>
                  </div>
                )}
              </Space>
            </Card>
          ))}
        </div>

        {/* Detailed Table */}
        <Card title="Detailed Comparison" size="small">
          <Table
            columns={columns}
            dataSource={quotes}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
            rowClassName={(record) => 
              preferredQuote === record.id ? 'preferred-quote-row' : ''
            }
          />
        </Card>

        {/* Document Preview Modal */}
        <Modal
          title="Document Preview"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="close" onClick={() => setPreviewVisible(false)}>
              Close
            </Button>,
            <Button key="download" type="primary" icon={<UploadOutlined />}>
              Download
            </Button>
          ]}
          width={800}
        >
          {previewUrl ? (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title="Document Preview"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <div>Preview not available</div>
            </div>
          )}
        </Modal>
      </Spin>
      
      <style jsx>{`
        .preferred-quote-row {
          background-color: #f6ffed !important;
        }
      `}</style>
    </div>
  );
};

// PropTypes for development validation
QuoteList.propTypes = {
  itemId: PropTypes.string.isRequired,
};

export default QuoteList;