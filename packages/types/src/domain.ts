export const USER_ROLE = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export const PROPERTY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type PropertyStatus = (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS];

export interface Property {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
}
