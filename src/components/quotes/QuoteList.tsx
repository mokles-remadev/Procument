import React, { useState } from 'react';
import { Table, Button, Tag, Space, Typography, Card, Radio, Badge, Upload, message, Modal } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  DollarOutlined, 
  UploadOutlined, 
  PaperClipOutlined,
  FileTextOutlined,
  FilePdfOutlined 
} from '@ant-design/icons';
import { Quote } from '../../types/procurement';
import { getQuotesByItemId } from '../../mock/mockData';

const { Text, Title } = Typography;

interface QuoteListProps {
  itemId: string;
}

const QuoteList: React.FC<QuoteListProps> = ({ itemId }) => {
  const quotes = getQuotesByItemId(itemId);
  const [preferredQuote, setPreferredQuote] = useState<string | null>(
    quotes.find(q => q.isPreferred)?.id || null
  );
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handlePreferredChange = (quoteId: string) => {
    setPreferredQuote(quoteId);
  };

  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewVisible(true);
  };

  const uploadProps = {
    name: 'offer',
    action: '/api/upload',
    onChange: handleUpload,
    multiple: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
  };

  const getDeliveryTermColor = (term: string) => {
    switch (term) {
      case 'EXW': return 'purple';
      case 'FOB': return 'blue';
      case 'CIF': return 'cyan';
      case 'DDP': return 'green';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    
    const symbol = symbols[currency] || '';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.pdf')) return <FilePdfOutlined />;
    return <FileTextOutlined />;
  };

  const columns = [
    {
      title: 'Preferred',
      key: 'preferred',
      render: (text: string, record: Quote) => (
        <Radio
          checked={preferredQuote === record.id}
          onChange={() => handlePreferredChange(record.id)}
        />
      ),
      width: 90,
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      sorter: (a: Quote, b: Quote) => a.supplierName.localeCompare(b.supplierName),
    },
    {
      title: 'Price',
      key: 'price',
      render: (text: string, record: Quote) => (
        <Text style={{ fontWeight: 'bold' }}>
          {formatCurrency(record.price, record.currency)}
        </Text>
      ),
      sorter: (a: Quote, b: Quote) => a.price - b.price,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      filters: [
        { text: 'USD', value: 'USD' },
        { text: 'EUR', value: 'EUR' },
        { text: 'GBP', value: 'GBP' },
      ],
      onFilter: (value: string, record: Quote) => record.currency === value,
      width: 100,
    },
    {
      title: 'Delivery Term',
      dataIndex: 'deliveryTerm',
      key: 'deliveryTerm',
      render: (term: string) => (
        <Tag color={getDeliveryTermColor(term)}>{term}</Tag>
      ),
      filters: [
        { text: 'EXW', value: 'EXW' },
        { text: 'FOB', value: 'FOB' },
        { text: 'CIF', value: 'CIF' },
        { text: 'DDP', value: 'DDP' },
      ],
      onFilter: (value: string, record: Quote) => record.deliveryTerm === value,
    },
    {
      title: 'Delivery Time',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      render: (days: number) => `${days} days`,
      sorter: (a: Quote, b: Quote) => a.deliveryTime - b.deliveryTime,
      width: 120,
    },
    {
      title: 'Material Origin',
      dataIndex: 'materialOrigin',
      key: 'materialOrigin',
    },
    {
      title: 'Valid Until',
      dataIndex: 'validUntil',
      key: 'validUntil',
      sorter: (a: Quote, b: Quote) => 
        new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime(),
    },
    {
      title: 'Technical',
      key: 'technical',
      render: (text: string, record: Quote) => (
        record.technicalCompliance ? 
          <Badge status="success" text="Compliant" /> : 
          <Badge status="error" text="Non-compliant" />
      ),
      filters: [
        { text: 'Compliant', value: true },
        { text: 'Non-compliant', value: false },
      ],
      onFilter: (value: boolean, record: Quote) => record.technicalCompliance === value,
      width: 120,
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (text: string, record: Quote) => (
        <Space wrap>
          {record.documents?.map((doc: string, index: number) => (
            <Button 
              key={index}
              icon={getFileIcon(doc)}
              size="small"
              onClick={() => handlePreview(doc)}
            >
              Document {index + 1}
            </Button>
          ))}
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="small">
              Upload
            </Button>
          </Upload>
        </Space>
      ),
      width: 250,
    },
  ];

  return (
    <div>
      <Title level={5}>Quote Comparison</Title>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', padding: '4px' }}>
        {quotes.map(quote => (
          <Card 
            key={quote.id}
            title={quote.supplierName}
            style={{ 
              width: 280, 
              borderColor: preferredQuote === quote.id ? '#1890ff' : undefined,
              backgroundColor: preferredQuote === quote.id ? '#e6f7ff' : undefined,
            }}
            extra={
              <Radio
                checked={preferredQuote === quote.id}
                onChange={() => handlePreferredChange(quote.id)}
              />
            }
          >
            <div style={{ marginBottom: 8 }}>
              <DollarOutlined style={{ marginRight: 8 }} />
              <Text strong>{formatCurrency(quote.price, quote.currency)}</Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Delivery: </Text>
              <Text>{quote.deliveryTime} days</Text>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Terms: </Text>
              <Tag color={getDeliveryTermColor(quote.deliveryTerm)}>{quote.deliveryTerm}</Tag>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Technical: </Text>
              {quote.technicalCompliance ? 
                <Text type="success"><CheckCircleOutlined /> Compliant</Text> : 
                <Text type="danger"><CloseCircleOutlined /> Non-compliant</Text>
              }
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Documents: </Text>
              <div style={{ marginTop: 4 }}>
                {quote.documents?.map((doc, index) => (
                  <Button 
                    key={index}
                    type="link"
                    icon={getFileIcon(doc)}
                    onClick={() => handlePreview(doc)}
                    style={{ padding: '4px' }}
                  >
                    Document {index + 1}
                  </Button>
                ))}
              </div>
            </div>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} block>Upload Offer</Button>
            </Upload>
          </Card>
        ))}
      </div>
      
      <Title level={5}>Quote Details</Title>
      <Table 
        columns={columns} 
        dataSource={quotes}
        rowKey="id"
        pagination={false}
        rowClassName={record => preferredQuote === record.id ? 'ant-table-row-selected' : ''}
      />

      <Modal
        title="Document Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        <iframe
          src={previewUrl}
          style={{ width: '100%', height: '80vh' }}
          title="Document Preview"
        />
      </Modal>
    </div>
  );
};

export default QuoteList;