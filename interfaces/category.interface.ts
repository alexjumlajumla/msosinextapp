export interface Category {
  id: number;
  input?: number;
  translation?: {
    title?: string;
    description?: string;
  };
  img?: string;
  children?: Category[];
}