import { Roles } from '../constants/Roles';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  roles: Roles[];
}
