import { User } from "@/domain/entities/User";
import { UserWithPassword } from "@/domain/types/admin";

export interface IUserRepository {
  getById(id: number): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
}
