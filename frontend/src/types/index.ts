export type Role = 'proprietario' | 'interessado' | 'admin';
export type VerificationStatus = 'pendente' | 'verificado' | 'rejeitado';

export interface User {
  public_id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  verification_status: VerificationStatus;
  created_at: string;
}

export type PropertyType = 'venda' | 'arrendamento';
export type PropertyStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface PropertyMedia {
  type: 'foto' | 'video';
  url: string;
  order: number;
}

export interface PropertyDocument {
  type: 'escritura' | 'bi' | 'comprovativo';
  url: string;
  validated: boolean;
}

export interface Property {
  public_id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  province: string;
  municipality: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number | null;
  status: PropertyStatus;
  rejection_reason?: string | null;
  owner?: User;
  media?: PropertyMedia[];
  documents?: PropertyDocument[];
  created_at: string;
}

export type InterestStatus =
  | 'novo'
  | 'em_mediacao'
  | 'visita_agendada'
  | 'negociacao'
  | 'fechado'
  | 'cancelado';

export interface Interest {
  public_id: string;
  status: InterestStatus;
  property?: Property;
  interested?: User;
  transaction?: Transaction;
  created_at: string;
}

export type PaymentStatus =
  | 'pendente'
  | 'pago'
  | 'transferido'
  | 'concluido'
  | 'cancelado';

export interface Transaction {
  public_id: string;
  amount: number;
  commission_amount: number;
  owner_amount: number;
  payment_reference: string | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  transferred_at: string | null;
  created_at: string;
}

export interface Message {
  public_id: string;
  content: string;
  sender: User;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}