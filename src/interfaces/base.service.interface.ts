export interface IBaseModuleService<T> {
  verifyEntityFind(entity: T | T[] | null): void;

  checkEntityExistenceById(id: number): Promise<T>;

  findByIdWithRelations(id: number, includes: string[]): Promise<T>;
}
