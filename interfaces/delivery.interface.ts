export interface Coords {
  lat: number;
  lng: number;
}

export interface DeliveryMan {
  id: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  firstname?: string;
  lastname?: string;
  phone?: string;
  status?: 'idle' | 'delivering';
}