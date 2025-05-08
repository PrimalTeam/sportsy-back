import { User, UserIdentifierType } from '../entities/user.entity';

export interface UserLookupService {
  findOne(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  getUserIdByIdentifier(
    identifier: string,
    identifierType: UserIdentifierType,
  ): Promise<number | null>;
}
