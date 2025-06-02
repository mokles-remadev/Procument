export interface Engineer {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  procurementEngineer: Engineer;
  creationDate: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  openItems: number;
  totalItems: number;
  bodApproved: boolean;
}

export interface Item {
  id: string;
  packageId: string;
  name: string;
  description: string;
  specification: string;
  quantity: number;
  unit: string;
  category: string;
  status: 'Open' | 'Quoted' | 'Awarded' | 'Delivered';
  bodApproved: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
}

export type DeliveryTerm = 'EXW' | 'FCA' | 'CPT' | 'CIP' | 'DAP' | 'DPU' | 'DDP' | 'FOB' | 'CFR' | 'CIF';

export interface Quote {
  id: string;
  itemId: string;
  supplierId: string;
  supplierName: string;
  price: number;
  currency: string;
  deliveryTerm: DeliveryTerm;
  deliveryTime: number;
  materialOrigin: string;
  validUntil: string;
  notes: string;
  technicalCompliance: boolean;
  isPreferred: boolean;
  documents?: string[];
  bodApproved?: boolean;
}

export interface PurchaseOrder {
  id: string;
  packageId: string;
  supplierId: string;
  supplierName: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalValue: number;
  currency: string;
  status: 'Draft' | 'Issued' | 'Signed' | 'Cancelled';
  issueDate: string;
  deliveryTerm: DeliveryTerm;
  deliveryDate: string;
  paymentTerms: string;
  signedDocument?: string;
}