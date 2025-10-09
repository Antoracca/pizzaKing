import { Timestamp } from 'firebase/firestore';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  streetAddress: string;
  city: string;
  zipCode?: string;
  country: string;
  coordinates: Coordinates;
  building?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUsedAt?: Timestamp;
}
