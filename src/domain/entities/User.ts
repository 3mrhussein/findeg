/**
 * Domain Entity: User
 */

export interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
