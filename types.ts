
export type AccessMode = 'GESTOR' | 'OPERACIONAL' | 'UNAUTHORIZED';

export enum UserRole {
  GESTOR = 'GESTOR',
  OPERACIONAL = 'OPERACIONAL',
  UNAUTHORIZED = 'UNAUTHORIZED'
}

export enum OSStatus {
  ABERTA = 'ABERTA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  AGUARDANDO_PECA = 'AGUARDANDO_PECA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

export enum SaleStatus {
  ABERTA = 'ABERTA',
  PAGA = 'PAGA',
  CANCELADA = 'CANCELADA'
}

export enum PaymentMethod {
  PIX = 'PIX',
  CREDITO = 'CREDITO'
}

export enum CommissionType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED'
}

export interface SystemSettings {
  workshop_name: string;
  cnpj: string;
  address_street: string;
  address_number: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  phone_whatsapp: string;
  logo_url?: string;
  manager_name: string;
  manager_photo?: string;
  gestor_pin_hash: string;
  max_discount_sem_pin: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  min_stock: number;
  price_cost: number;
  price_sell: number;
  observation?: string;
}

export interface Service {
  id: string;
  name: string;
  base_price: number;
  commission_type: CommissionType;
  commission_value: number; // e.g. 10 for 10% or 25 for R$ 25
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  default_commission_percent: number;
}

export interface Commission {
  id: string;
  order_id: string;
  order_item_id: string;
  employee_id: string;
  value: number;
  status: 'CONFIRMADA';
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export interface Sale {
  id: string;
  status: SaleStatus;
  subtotal: number;
  discount_value: number;
  total: number;
  actor_type: AccessMode;
  created_at: string;
  items: SaleItem[];
  payment_method?: PaymentMethod;
}

export interface SaleItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OSItem {
  id: string;
  service_id: string;
  service_name: string;
  employee_id: string;
  price: number;
}

export interface WorkOrder {
  id: string;
  customer_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  status: OSStatus;
  total_amount: number;
  items: OSItem[];
  created_at: string;
  paid_at?: string;
}
