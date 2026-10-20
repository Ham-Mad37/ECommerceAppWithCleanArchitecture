export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
}

export interface AddressPayload {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface CreateAddressRequest extends AddressPayload {
  makeDefault?: boolean;
}
