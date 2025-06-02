import React, { useState, useCallback, useMemo } from 'react';
import { Table, Button, Tag, Space, Input, Drawer, Typography, Descriptions, Badge, Menu, Form, Select, InputNumber, DatePicker, message, Upload, Card, Alert, Spin, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, EyeOutlined, FilterOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined, ArrowLeftOutlined, FileExcelOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getItemsByPackageId, suppliers } from '../../mock/mockData';
import QuoteList from '../quotes/QuoteList';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

const ItemList = ({ selectedPackage, onBackToPackages }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showQuotes, setShowQuotes] = useState(false);
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);
  const [addQuoteDrawerVisible, setAddQuoteDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addForm] = Form.useForm();
  const [addQuoteForm] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState([]);

  const items = useMemo(() => {
    try {
      return selectedPackage ? getItemsByPackageId(selectedPackage.id) : [];
    } catch (err) {
      setError('Error loading items: ' + err.message);
      return [];
    }
  }, [selectedPackage]);
  
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return items;
    
    const searchLower = searchText.toLowerCase().trim();
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.specification?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower)
    );
  }, [items, searchText]);

  const getStatusColor = useCallback((status) => {
    const statusColorMap = {
      'Open': 'blue',
      'Quoted': 'orange', 
      'Awarded': 'green',
      'Delivered': 'purple'
    };
    return statusColorMap[status] || 'default';
  }, []);

  const handleViewQuotes = useCallback((item) => {
    try {
      if (!item || !item.id) {
        throw new Error('Invalid item selected');
      }
      setSelectedItem(item);
      setShowQuotes(true);
      setError(null);
    } catch (err) {
      setError('Error viewing quotes: ' + err.message);
    }
  }, []);

  const handleAddItem = useCallback(async (values) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!values.name?.trim()) {
        throw new Error('Item name is required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('New item added successfully');
      setAddDrawerVisible(false);
      addForm.resetFields();
    } catch (err) {
      message.error('Failed to add item: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [addForm]);

  const handleAddQuote = useCallback(async (values) => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!values.supplierId) {
        throw new Error('Supplier is required');
      }
      if (!values.price || values.price <= 0) {
        throw new Error('Valid price is required');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('New quote added successfully');
      setAddQuoteDrawerVisible(false);
      addQuoteForm.resetFields();
      setUploadFileList([]);
    } catch (err) {
      message.error('Failed to add quote: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [addQuoteForm]);
  // Professional Excel RFQ Export Function with Confirmation
  const handleExportRFQ = useCallback(() => {
    if (!filteredItems || filteredItems.length === 0) {
      message.warning('No items available to export');
      return;
    }

    Modal.confirm({
      title: 'Export RFQ to Excel',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>You are about to export a professional RFQ document containing:</p>
          <ul style={{ marginLeft: 20, marginTop: 10 }}>
            <li><strong>{filteredItems.length}</strong> items from package <strong>{selectedPackage?.name}</strong></li>
            <li>Company information and contact details</li>
            <li>Technical requirements and standards</li>
            <li>Supplier quotation forms</li>
          </ul>
          <p style={{ marginTop: 15, color: '#666' }}>
            The Excel file will contain multiple sheets designed for professional supplier communication.
          </p>
        </div>
      ),
      okText: 'Export RFQ',
      cancelText: 'Cancel',
      width: 500,
      onOk: () => generateExcelRFQ(),
    });  }, [filteredItems, selectedPackage]);

  const generateExcelRFQ = useCallback(() => {
    try {
      if (!filteredItems || filteredItems.length === 0) {
        message.warning('No items available to export');
        return;
      }

      // Show loading message
      const loadingMessage = message.loading('Generating professional RFQ Excel file...', 0);

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      
      // Company Information Sheet
      const companyInfo = [
        ['Request for Quotation (RFQ)'],
        [''],
        ['Company Information:'],
        ['Company Name:', 'Your Company Name Ltd.'],
        ['Contact Person:', 'Procurement Manager'],
        ['Email:', 'procurement@company.com'],
        ['Phone:', '+1 (555) 123-4567'],
        ['Address:', '123 Business Street, City, State 12345'],
        [''],
        ['RFQ Details:'],
        ['Package ID:', selectedPackage?.id || 'N/A'],
        ['Package Name:', selectedPackage?.name || 'N/A'],
        ['Package Description:', selectedPackage?.description || 'N/A'],
        ['Issue Date:', moment().format('YYYY-MM-DD')],
        ['Due Date:', selectedPackage?.dueDate || 'N/A'],
        ['Procurement Engineer:', selectedPackage?.procurementEngineer?.name || 'N/A'],
        ['Engineer Email:', selectedPackage?.procurementEngineer?.email || 'N/A'],
        [''],
        ['Instructions for Suppliers:'],
        ['1. Please fill in the "Unit Price", "Total Price", "Currency", and "Delivery Time" columns'],
        ['2. All prices should be quoted in the specified currency'],
        ['3. Delivery time should be specified in working days'],
        ['4. Include any technical clarifications in the "Supplier Notes" column'],
        ['5. Submit your quotation by the due date mentioned above'],
        ['6. For technical queries, contact the procurement engineer'],
        [''],
        ['Terms and Conditions:'],
        ['• Prices should be valid for 30 days from submission date'],
        ['• Delivery terms as specified in individual items'],
        ['• Payment terms: Net 30 days after delivery'],
        ['• Quality certificates may be required upon delivery'],
        ['• All items must meet specified technical requirements'],
        ['']
      ];

      const infoWS = XLSX.utils.aoa_to_sheet(companyInfo);
      
      // Set column widths for company info sheet
      infoWS['!cols'] = [
        { width: 25 },
        { width: 40 }
      ];

      // Style the header
      infoWS['A1'] = { 
        v: 'Request for Quotation (RFQ)', 
        s: { 
          font: { bold: true, sz: 16 }, 
          alignment: { horizontal: 'center' } 
        } 
      };

      XLSX.utils.book_append_sheet(workbook, infoWS, 'RFQ Information');

      // Items for Quotation Sheet
      const headers = [
        'Item ID',
        'Item Name', 
        'Description',
        'Technical Specification',
        'Quantity',
        'Unit',
        'Category',
        'Required Delivery Term',
        '',
        '--- SUPPLIER TO FILL ---',
        'Unit Price',
        'Total Price',
        'Currency',
        'Delivery Time (Working Days)',
        'Supplier Notes/Clarifications',
        'Supplier Company Name',
        'Contact Person',
        'Email',
        'Phone'
      ];

      const itemsData = filteredItems.map(item => [
        item.id,
        item.name,
        item.description,
        item.specification,
        item.quantity,
        item.unit,
        item.category,
        'FOB (Free on Board)', // Default delivery term, can be customized
        '',
        '', // Separator
        '', // Unit Price - to be filled by supplier
        '', // Total Price - to be filled by supplier  
        'USD', // Default currency - supplier can change
        '', // Delivery Time - to be filled by supplier
        '', // Supplier Notes - to be filled by supplier
        '', // Supplier Company Name - to be filled by supplier
        '', // Contact Person - to be filled by supplier
        '', // Email - to be filled by supplier
        ''  // Phone - to be filled by supplier
      ]);

      const allData = [headers, ...itemsData];
      const itemsWS = XLSX.utils.aoa_to_sheet(allData);

      // Set column widths for items sheet
      itemsWS['!cols'] = [
        { width: 12 }, // Item ID
        { width: 25 }, // Item Name
        { width: 40 }, // Description
        { width: 35 }, // Specification
        { width: 10 }, // Quantity
        { width: 8 },  // Unit
        { width: 12 }, // Category
        { width: 20 }, // Delivery Term
        { width: 3 },  // Separator
        { width: 25 }, // Header separator
        { width: 15 }, // Unit Price
        { width: 15 }, // Total Price
        { width: 10 }, // Currency
        { width: 20 }, // Delivery Time
        { width: 30 }, // Notes
        { width: 25 }, // Company Name
        { width: 20 }, // Contact Person
        { width: 25 }, // Email
        { width: 15 }  // Phone
      ];

      // Style headers
      const headerRange = XLSX.utils.decode_range(itemsWS['!ref']);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!itemsWS[cellAddress]) continue;
        
        itemsWS[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "366092" } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }

      // Highlight supplier fill columns (J to S)
      for (let row = 1; row <= itemsData.length; row++) {
        for (let col = 10; col <= 18; col++) { // Columns K to S (0-indexed: 10 to 18)
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!itemsWS[cellAddress]) itemsWS[cellAddress] = { v: '' };
          
          itemsWS[cellAddress].s = {
            fill: { fgColor: { rgb: "FFF2CC" } }, // Light yellow background
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      }

      XLSX.utils.book_append_sheet(workbook, itemsWS, 'Items for Quotation');

      // Technical Requirements Sheet (if needed)
      const techRequirements = [
        ['Technical Requirements & Standards'],
        [''],
        ['General Requirements:'],
        ['• All items must be new and unused'],
        ['• Manufacturer warranties apply as per standard terms'],
        ['• Items must comply with applicable industry standards'],
        ['• Certificates of compliance may be requested'],
        [''],
        ['Quality Standards:'],
        ['• ISO 9001:2015 certification preferred'],
        ['• Items must pass incoming inspection'],
        ['• Non-conforming items will be rejected'],
        [''],
        ['Packaging & Shipping:'],
        ['• Items must be properly packaged for shipping'],
        ['• Clear labeling with item ID and description required'],
        ['• Shipping insurance recommended'],
        ['• Delivery to be coordinated with procurement engineer'],
        [''],
        ['Documentation Required:'],
        ['• Commercial invoice'],
        ['• Packing list'],
        ['• Test certificates (where applicable)'],
        ['• Material safety data sheets (for chemicals)'],
        ['• Operating manuals (for equipment)']
      ];

      const techWS = XLSX.utils.aoa_to_sheet(techRequirements);
      techWS['!cols'] = [{ width: 50 }];
      
      // Style the header
      techWS['A1'].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' }
      };

      XLSX.utils.book_append_sheet(workbook, techWS, 'Technical Requirements');

      // Generate filename with timestamp
      const timestamp = moment().format('YYYYMMDD_HHmmss');
      const filename = `RFQ_${selectedPackage?.id || 'Package'}_${timestamp}.xlsx`;      // Write and download file
      XLSX.writeFile(workbook, filename);
      
      // Close loading message
      loadingMessage();
      
      message.success({
        content: `RFQ Excel file "${filename}" has been generated and downloaded successfully!`,
        duration: 5,
        style: { marginTop: '20vh' }
      });
      
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export RFQ: ' + error.message);
    }
  }, [filteredItems, selectedPackage]);

  const columns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      sorter: (a, b) => a.id?.localeCompare(b.id) || 0,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name) || 0,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <span title={text}>{text}</span>
      ),
    },
    {
      title: 'Specification',
      dataIndex: 'specification',
      key: 'specification',
      ellipsis: true,
      render: (text) => (
        <span title={text}>{text}</span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => `${quantity || 0} ${record.unit || 'pcs'}`,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
      width: 120,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Electrical', value: 'Electrical' },
        { text: 'Mechanical', value: 'Mechanical' },
        { text: 'Civil', value: 'Civil' },
      ],
      onFilter: (value, record) => record.category === value,
      width: 120,
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: 'Open', value: 'Open' },
        { text: 'Quoted', value: 'Quoted' },
        { text: 'Awarded', value: 'Awarded' },
        { text: 'Delivered', value: 'Delivered' },
      ],
      onFilter: (value, record) => record.status === value,
      width: 110,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleViewQuotes(record)}
            type="primary"
            size="small"
            disabled={!record.id}
          >
            Quotes
          </Button>
        </Space>
      ),
      width: 100,
    },
  ], [getStatusColor, handleViewQuotes]);

  const categoryOptions = useMemo(() => [
    { label: 'Electrical', value: 'Electrical' },
    { label: 'Mechanical', value: 'Mechanical' },
    { label: 'Civil', value: 'Civil' },
    { label: 'Software', value: 'Software' },
    { label: 'Other', value: 'Other' },
  ], []);

  const statusOptions = useMemo(() => [
    { label: 'Open', value: 'Open' },
    { label: 'Quoted', value: 'Quoted' },
    { label: 'Awarded', value: 'Awarded' },
    { label: 'Delivered', value: 'Delivered' },
  ], []);

  const unitOptions = useMemo(() => [
    { label: 'pieces (pcs)', value: 'pcs' },
    { label: 'kilograms (kg)', value: 'kg' },
    { label: 'meters (m)', value: 'm' },
    { label: 'liters (L)', value: 'L' },
    { label: 'sets', value: 'sets' },
    { label: 'lots', value: 'lots' },
  ], []);

  const currencyOptions = useMemo(() => [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
    { label: 'JPY (¥)', value: 'JPY' },
  ], []);

  const deliveryTermOptions = useMemo(() => [
    { label: 'EXW - Ex Works', value: 'EXW' },
    { label: 'FCA - Free Carrier', value: 'FCA' },
    { label: 'CPT - Carriage Paid To', value: 'CPT' },
    { label: 'CIP - Carriage and Insurance Paid', value: 'CIP' },
    { label: 'DAP - Delivered at Place', value: 'DAP' },
    { label: 'DPU - Delivered at Place Unloaded', value: 'DPU' },
    { label: 'DDP - Delivered Duty Paid', value: 'DDP' },
    { label: 'FOB - Free on Board', value: 'FOB' },
    { label: 'CFR - Cost and Freight', value: 'CFR' },
    { label: 'CIF - Cost, Insurance and Freight', value: 'CIF' },
  ], []);

  const uploadProps = useMemo(() => ({
    fileList: uploadFileList,
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
      setUploadFileList(prev => [...prev, file]);
      return false; // Prevent upload
    },
    onRemove: (file) => {
      setUploadFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
    multiple: true,
  }), [uploadFileList]);

  if (error) {
    return (
      <Alert
        message="Error Loading Items"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
        action={
          <Button size="small" onClick={onBackToPackages}>
            Back to Packages
          </Button>
        }
      />
    );
  }

  if (!selectedPackage) {
    return (
      <Alert
        message="No Package Selected"
        description="Please select a package to view its items."
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={onBackToPackages}>
            Back to Packages
          </Button>
        }
      />
    );
  }

  return (
    <div className="item-list">
      <Spin spinning={loading}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space direction="vertical" size={0}>
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />}
                onClick={onBackToPackages} 
                style={{ paddingLeft: 0 }}
              >
                Back to Packages
              </Button>
              <Title level={4}>
                Items for Package: {selectedPackage?.name} ({selectedPackage?.id})
              </Title>
              <Text type="secondary">
                {selectedPackage?.description} | Due: {selectedPackage?.dueDate}
              </Text>            </Space>
            <Space>
              <Button
                type="default"
                icon={<FileExcelOutlined />}
                onClick={handleExportRFQ}
                disabled={loading || !filteredItems.length}
                style={{ 
                  background: '#52c41a', 
                  borderColor: '#52c41a', 
                  color: 'white' 
                }}
              >
                Export RFQ to Excel
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddDrawerVisible(true)}
                disabled={loading}
              >
                Add Item
              </Button>
            </Space>
          </div>

          <Menu mode="horizontal" style={{ marginBottom: 16 }}>
            <Menu.Item key="all" icon={<FilterOutlined />}>All Items ({filteredItems.length})</Menu.Item>
            <Menu.Item key="open" icon={<FilterOutlined />}>Open</Menu.Item>
            <Menu.Item key="quoted" icon={<FilterOutlined />}>Quoted</Menu.Item>
            <Menu.Item key="awarded" icon={<FilterOutlined />}>Awarded</Menu.Item>
            <Menu.Item key="delivered" icon={<FilterOutlined />}>Delivered</Menu.Item>
            <Menu.Item key="refresh" icon={<ReloadOutlined />}>Refresh</Menu.Item>
            <Menu.Item key="export" icon={<DownloadOutlined />} onClick={handleExportRFQ}>Export</Menu.Item>
          </Menu>
          
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search items by name, description, specification, or category"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 400 }}
              allowClear
            />
          </div>
          
          <Table 
            columns={columns} 
            dataSource={filteredItems}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} items`
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Spin>
      
      <Drawer
        title={
          <Space direction="vertical" size={0}>
            <Text>Item Quotes</Text>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {selectedItem?.name} ({selectedItem?.id})
            </Text>
          </Space>
        }
        width={900}
        onClose={() => setShowQuotes(false)}
        open={showQuotes}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddQuoteDrawerVisible(true)}>
            Add Quote
          </Button>
        }
      >
        {selectedItem && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Description" span={2}>
                {selectedItem.description}
              </Descriptions.Item>
              <Descriptions.Item label="Specification" span={2}>
                {selectedItem.specification}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {selectedItem.quantity} {selectedItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={
                  selectedItem.status === 'Open' ? 'processing' :
                  selectedItem.status === 'Quoted' ? 'warning' :
                  selectedItem.status === 'Awarded' ? 'success' : 'default'
                } text={selectedItem.status} />
              </Descriptions.Item>
            </Descriptions>
            
            <QuoteList itemId={selectedItem.id} />
          </>
        )}
      </Drawer>

      <Drawer
        title="Add New Item"
        width={480}
        open={addDrawerVisible}
        onClose={() => {
          setAddDrawerVisible(false);
          addForm.resetFields();
        }}
        destroyOnClose
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddItem}
          initialValues={{
            status: 'Open',
            category: 'Electrical',
            quantity: 1,
            unit: 'pcs',
          }}
        >
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="specification"
            label="Specification"
            rules={[{ required: true, message: 'Please enter specification' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Unit"
            rules={[{ required: true, message: 'Please select unit' }]}
          >
            <Select options={unitOptions} placeholder="Select unit" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select options={categoryOptions} placeholder="Select category" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select options={statusOptions} placeholder="Select status" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Item
              </Button>
              <Button onClick={() => {
                setAddDrawerVisible(false);
                addForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Add New Quote"
        width={900}
        open={addQuoteDrawerVisible}
        onClose={() => {
          setAddQuoteDrawerVisible(false);
          addQuoteForm.resetFields();
          setUploadFileList([]);
        }}
        destroyOnClose
      >
        <Form
          form={addQuoteForm}
          layout="vertical"
          onFinish={handleAddQuote}
          initialValues={{
            currency: 'USD',
            deliveryTerm: 'DAP',
            technicalCompliance: true,
            validUntil: moment(),
          }}
        >
          <Form.Item
            name="supplierId"
            label="Supplier"
            rules={[{ required: true, message: 'Please select supplier' }]}
          >
            <Select
              showSearch
              placeholder="Select supplier"
              options={suppliers.map(s => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select options={currencyOptions} />
          </Form.Item>
          <Form.Item
            name="deliveryTerm"
            label="Delivery Term"
            rules={[{ required: true, message: 'Please select delivery term' }]}
          >
            <Select options={deliveryTermOptions} />
          </Form.Item>
          <Form.Item
            name="deliveryTime"
            label="Delivery Time (days)"
            rules={[{ required: true, message: 'Please enter delivery time' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="materialOrigin"
            label="Material Origin"
            rules={[{ required: true, message: 'Please enter material origin' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="validUntil"
            label="Valid Until"
            rules={[{ required: true, message: 'Please select valid until date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
         
          <Form.Item
            name="documents"
            label="Documents"
            valuePropName="fileList"
            getValueFromEvent={() => uploadFileList}
          >
            <Upload {...uploadProps} listType="text">
              <Button icon={<UploadOutlined />}>Upload Documents</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Quote
              </Button>
              <Button onClick={() => {
                setAddQuoteDrawerVisible(false);
                addQuoteForm.resetFields();
                setUploadFileList([]);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ItemList;