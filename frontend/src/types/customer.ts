export interface CustomerListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean; // backend DTO currently spells this "isAvtive" - see fix list
}

export interface Customer extends CustomerListItem {
  createdAt: string;
  updatedAt: string;
}
