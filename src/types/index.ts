export type Language = "ar" | "en" | "id";

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "QUEUED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentMethod =
  | "PAY_AT_PICKUP"
  | "TRANSFER_KURAIMI"
  | "TRANSFER_AMQI"
  | "TRANSFER_BUSAIRI";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

export interface SelectedOptionPayload {
  groupId: string;
  groupNameAr: string;
  groupNameEn: string;
  groupNameId?: string;
  optionId: string;
  optionNameAr: string;
  optionNameEn: string;
  optionNameId?: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  nameId?: string;
  imageUrl: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  selectedOptions: SelectedOptionPayload[];
  notes?: string;
}

export interface TimeSlotOption {
  timeString: string;
  displayLabelAr: string;
  displayLabelEn: string;
  displayLabelId?: string;
  isAvailable: boolean;
  reason?: string;
}
