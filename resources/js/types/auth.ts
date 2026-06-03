export interface User {
  id: number;
  name: string;
  email: string;
  nickname: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  is_dealer: boolean;
  permission_list: string[];
}