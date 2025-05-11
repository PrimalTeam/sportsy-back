import { HttpException, HttpStatus } from '@nestjs/common';
import { TypeOrmUtils } from 'src/utils/typeorm-utils';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IBaseModuleService } from './base.service.interface';
import { ILookUpService } from './lookup.service.interface';

export abstract class BaseService<T extends BaseEntity>
  implements IBaseModuleService<T>, ILookUpService<T>
{
  constructor(
    private readonly entityRepository: Repository<T>,
    private readonly entityClass: new () => T,
  ) {}

  findById(id: number): Promise<T> {
    return this.entityRepository.findOne({ where: this.getWhereOption(id) });
  }
  getAll(): Promise<T[]> {
    return this.entityRepository.find();
  }

  verifyEntityFind(entity: T | T[] | null): void {
    if (!entity) {
      throw new HttpException(`${entity} not found`, HttpStatus.NOT_FOUND);
    }
  }

  async checkEntityExistenceById(id: number): Promise<T> {
    const entity = await this.entityRepository.findOne({
      where: this.getWhereOption(id),
    });
    this.verifyEntityFind(entity);
    return entity;
  }

  async findByIdWithRelations(id: number, includes: string[] = []) {
    return TypeOrmUtils.getEntityWithRelations(
      this.entityClass,
      this.entityRepository,
      id,
      includes,
    );
  }

  private getWhereOption(id: number) {
    return { id } as FindOptionsWhere<T>;
  }
}
