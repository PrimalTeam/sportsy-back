import { BaseEntity } from './base.entity';

export interface ILookUpService<T extends BaseEntity> {
  findById(id: number): Promise<T | null>;
  getAll(): Promise<T[] | null>;
}
