export interface User {
  name: string
  email: string
  role: string
  merchantId?: number
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuthStatus: () => Promise<void>
  changePassword: (
    oldPassword: string,
    newPassword: string,
    username: string
  ) => Promise<void>
}

export interface LocationState {
  from?: {
    pathname: string
  }
}

export interface Merchant {
  id: number
  name: string
  address: string
  contactInfo: string
  ownerId: number
}

export interface ProductVariation {
  id: number
  name: string
  priceOffset: number
}

export interface Item {
  id: number
  name: string
  price: number
  type: "PRODUCT" | "SERVICE_ITEM"
  taxRateId?: string
  variations?: ProductVariation[] | null
}

export interface ItemCreateRequest {
  name: string
  price: number
  type: "PRODUCT" | "SERVICE_ITEM"
  taxRateId?: string
}

export interface ItemUpdateRequest {
  name: string
  price: number
  taxRateId?: string
}

export interface VariationCreateRequest {
  name: string
  priceOffset: number
}

export interface GiftCard {
  code: string
  initialBalance: number
  currentBalance: number
  active: boolean
  createdAt: string
  expiryDate?: string | null
}

export interface GiftCardCreateRequest {
  amount: number
}

export interface Discount {
    id: string;
    code: string;
    value: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    scope: "ORDER" | "PRODUCT";
    productId?: number;
    merchantId: number;
}

export interface Reservation {
    id: number
    serviceId: number
    serviceName: string
    customerName: string
    customerContact: string
    appointmentTime: string
    status: "CONFIRMED" | "CANCELLED"
}

export interface ReservationCreateRequest {
    serviceId: number
    customerName: string
    customerContact: string
    appointmentTime: string
}

export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    merchantId: number;
    isActive: boolean;
}