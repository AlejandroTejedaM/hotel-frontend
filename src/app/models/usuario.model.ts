import { Roles } from '../constants/Roles';

export interface UsuarioRequest {
  username: string;
  password: string;
  roles: string[];
}

export interface UsuarioResponse {
  username: string;
  roles: Roles[];
}
