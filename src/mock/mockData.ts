import { Engineer, Package, Item, Supplier, Quote } from '../types/procurement';
import { v4 as uuidv4 } from 'uuid';

// Mock Engineers
export const engineers: Engineer[] = [
  {
    id: uuidv4(),
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Mechanical'
  },
  {
    id: uuidv4(),
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    department: 'Electrical'
  },
  {
    id: uuidv4(),
    name: 'Michael Brown',
    email: 'michael.brown@company.com',
    department: 'Civil'
  }
];

// Mock Packages
export const packages: Package[] = [
  {
    id: 'PKG-2024-001',
    name: 'Electrical Equipment',
    description: 'Power distribution and control equipment',
    procurementEngineer: engineers[1],
    creationDate: '2024-05-01',
    dueDate: '2024-06-15',
    status: 'In Progress',
    openItems: 3,
    totalItems: 4,
    bodApproved: true
  },
  {
    id: 'PKG-2024-002',
    name: 'Mechanical Systems',
    description: 'HVAC and pump systems',
    procurementEngineer: engineers[0],
    creationDate: '2024-05-05',
    dueDate: '2024-06-20',
    status: 'Open',
    openItems: 4,
    bodApproved: true,
    totalItems: 4
   
  },
  {
    id: 'PKG-2024-003',
    name: 'Construction Materials',
    description: 'Steel, concrete, and other building materials',
    procurementEngineer: engineers[2],
    creationDate: '2024-05-10',
    dueDate: '2024-07-01',
    status: 'Open',
    openItems: 6,
    bodApproved: true,
    totalItems: 6
    
  }
];

// Mock Items
export const items: Item[] = [
  // Electrical Equipment Package Items
  {
    id: 'ITEM-001',
    packageId: 'PKG-2024-001',
    name: 'Circuit Breakers',
    description: 'Industrial circuit breakers for power distribution',
    specification: '400A, 3-phase, 480V AC, NEMA rated',
    quantity: 10,
    unit: 'pcs',
    category: 'Electrical',
    status: 'Quoted',
    bodApproved: true,
  },
  {
    id: 'ITEM-002',
    packageId: 'PKG-2024-001',
    name: 'Control Panels',
    description: 'Main control panels for equipment control',
    specification: 'NEMA 4X, stainless steel, programmable',
    quantity: 5,
    unit: 'pcs',
    category: 'Electrical',
    status: 'Quoted',
    bodApproved: true,
  },
  {
    id: 'ITEM-003',
    packageId: 'PKG-2024-001',
    name: 'Power Cables',
    description: 'Power distribution cables',
    specification: '95mm², XLPE insulated, armored',
    quantity: 500,
    unit: 'm',
    category: 'Electrical',
    status: 'Quoted',
    bodApproved: false,
  },
  {
    id: 'ITEM-004',
    packageId: 'PKG-2024-001',
    name: 'Transformers',
    description: 'Step-down transformers',
    specification: '1000 kVA, 11kV/415V, oil-cooled',
    quantity: 2,
    unit: 'pcs',
    category: 'Electrical',
    status: 'Quoted',
    bodApproved: true,
  },
  {
    id: 'ITEM-005',
    packageId: 'PKG-2024-001',
    name: 'Switchgear',
    description: 'Medium voltage switchgear',
    specification: '12kV, 630A, metal-clad',
    quantity: 3,
    unit: 'sets',
    category: 'Electrical',
    status: 'Open',
    bodApproved: false,
  },
  
  // Mechanical Systems Package Items
  {
    id: 'ITEM-006',
    packageId: 'PKG-2024-002',
    name: 'HVAC Units',
    description: 'Industrial HVAC units',
    specification: '50,000 BTU, split system, R410A refrigerant',
    quantity: 4,
    unit: 'pcs',
    category: 'Mechanical',
    status: 'Open',
    bodApproved: false,
  },
  {
    id: 'ITEM-007',
    packageId: 'PKG-2024-002',
    name: 'Centrifugal Pumps',
    description: 'Industrial water pumps',
    specification: '50 m³/h, 30m head, cast iron, TEFC motor',
    quantity: 6,
    unit: 'pcs',
    category: 'Mechanical',
    status: 'Open',
    bodApproved: false,
  },
  {
    id: 'ITEM-008',
    packageId: 'PKG-2024-002',
    name: 'Pressure Vessels',
    description: 'Compressed air pressure vessels',
    specification: '10 bar, 500L, carbon steel, certified',
    quantity: 2,
    unit: 'pcs',
    category: 'Mechanical',
    status: 'Open',
    bodApproved: false,
  },
  {
    id: 'ITEM-009',
    packageId: 'PKG-2024-002',
    name: 'Ventilation Fans',
    description: 'Industrial exhaust fans',
    specification: '15,000 m³/h, axial, explosion-proof',
    quantity: 8,
    unit: 'pcs',
    category: 'Mechanical',
    status: 'Open',
    bodApproved: false,
  }
];

// Mock Suppliers
export const suppliers: Supplier[] = [
  {
    id: uuidv4(),
    name: 'Electro Solutions Inc.',
    contactPerson: 'Robert Williams',
    email: 'robert@electrosolutions.com',
    phone: '+1-555-123-4567',
    address: '123 Industry Way, Circuit City, CA 94025',
    rating: 4.7
  },
  {
    id: uuidv4(),
    name: 'PowerTech Systems',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@powertech.com',
    phone: '+1-555-987-6543',
    address: '456 Electric Avenue, Voltage Valley, NY 10001',
    rating: 4.3
  },
  {
    id: uuidv4(),
    name: 'Global Electrical Ltd.',
    contactPerson: 'James Chen',
    email: 'james@globalelectrical.com',
    phone: '+44-20-1234-5678',
    address: '789 Power Road, London, UK EC1A 1BB',
    rating: 4.5
  },
  {
    id: uuidv4(),
    name: 'MechPro Industries',
    contactPerson: 'Laura Martinez',
    email: 'laura@mechpro.com',
    phone: '+1-555-456-7890',
    address: '321 Gear Street, Machine City, TX 75001',
    rating: 4.8
  },
  {
    id: uuidv4(),
    name: 'Fluid Systems Co.',
    contactPerson: 'David Thompson',
    email: 'david@fluidsystems.com',
    phone: '+1-555-789-0123',
    address: '654 Pump Road, Flow Town, OH 43215',
    rating: 4.2
  }
];

// Mock Quotes
export const quotes: Quote[] = [
  // Quotes for Circuit Breakers
  {
    id: uuidv4(),
    itemId: 'ITEM-001',
    supplierId: suppliers[0].id,
    supplierName: suppliers[0].name,
    price: 1250,
    currency: 'USD',
    deliveryTerm: 'DAP',
    deliveryTime: 30,
    materialOrigin: 'Germany',
    validUntil: '2024-07-15',
    notes: 'Includes installation manual and spare parts',
    technicalCompliance: true,
    isPreferred: true,
    documents: [
      'https://example.com/technical-specs.pdf',
      'https://example.com/compliance-cert.pdf',
      'https://example.com/offer-details.pdf'
    ]
  },
  {
    id: uuidv4(),
    itemId: 'ITEM-001',
    supplierId: suppliers[1].id,
    supplierName: suppliers[1].name,
    price: 1180,
    currency: 'USD',
    deliveryTerm: 'CIP',
    deliveryTime: 45,
    materialOrigin: 'USA',
    validUntil: '2024-07-10',
    notes: 'Standard warranty of 2 years',
    technicalCompliance: true,
    isPreferred: false,
    documents: [
      'https://example.com/technical-specs.pdf',
      'https://example.com/compliance-cert.pdf',
      'https://example.com/offer-details.pdf'
    ]
  },
  {
    id: uuidv4(),
    itemId: 'ITEM-001',
    supplierId: suppliers[2].id,
    supplierName: suppliers[2].name,
    price: 1100,
    currency: 'EUR',
    deliveryTerm: 'EXW',
    deliveryTime: 60,
    materialOrigin: 'Italy',
    validUntil: '2024-07-01',
    notes: 'Budget option, basic warranty',
    technicalCompliance: false,
    isPreferred: false,
    documents: [
      'https://example.com/technical-specs.pdf',
      'https://example.com/compliance-cert.pdf',
      'https://example.com/offer-details.pdf'
    ]
  },
  
  // Quotes for Transformers
  {
    id: uuidv4(),
    itemId: 'ITEM-004',
    supplierId: suppliers[0].id,
    supplierName: suppliers[0].name,
    price: 25000,
    currency: 'USD',
    deliveryTerm: 'DAP',
    deliveryTime: 90,
    materialOrigin: 'Sweden',
    validUntil: '2024-08-15',
    notes: 'Premium quality, 5-year warranty',
    technicalCompliance: true,
    isPreferred: false,
    documents: [
      'https://example.com/technical-specs.pdf',
      'https://example.com/compliance-cert.pdf',
      'https://example.com/offer-details.pdf'
    ]
  },
  {
    id: uuidv4(),
    itemId: 'ITEM-004',
    supplierId: suppliers[1].id,
    supplierName: suppliers[1].name,
    price: 23500,
    currency: 'USD',
    deliveryTerm: 'CIF',
    deliveryTime: 75,
    materialOrigin: 'USA',
    validUntil: '2024-08-01',
    notes: 'Includes commissioning and testing',
    technicalCompliance: true,
    isPreferred: true,
    documents: [
      'https://example.com/technical-specs.pdf',
      'https://example.com/compliance-cert.pdf',
      'https://example.com/offer-details.pdf'
    ]
  },
  {
    id: uuidv4(),
    itemId: 'ITEM-004',
    supplierId: suppliers[2].id,
    supplierName: suppliers[2].name,
    price: 21000,
    currency: 'EUR',
    deliveryTerm: 'FOB',
    deliveryTime: 120,
    materialOrigin: 'China',
    validUntil: '2024-07-20',
    notes: 'Standard model, 1-year warranty',
    technicalCompliance: true,
    isPreferred: false,
    documents: [
      'https://example.com/technical-specs.pdf',
      'https://example.com/compliance-cert.pdf',
      'https://example.com/offer-details.pdf'
    ]
  }
];

// Helper function to get items by package ID
export const getItemsByPackageId = (packageId: string) => {
  return items.filter(item => item.packageId === packageId);
};

// Helper function to get quotes by item ID
export const getQuotesByItemId = (itemId: string) => {
  return quotes.filter(quote => quote.itemId === itemId);
};