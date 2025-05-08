import {
  EntityTarget,
  FindOptionsWhere,
  getMetadataArgsStorage,
  Repository,
} from 'typeorm';

export class TypeOrmUtils {
  static buildNestedRelations(includes: string[]): Record<string, any> {
    const relations: Record<string, any> = {};
    includes = includes.sort((a, b) => b.length - a.length);

    for (const include of includes) {
      const parts = include.split('.');
      let current = relations;
      let previous;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = i === parts.length - 1 ? true : {};
        }
        previous = current;
        current = current[part] as Record<string, any>;
      }
    }

    return relations;
  }

  static getValidRelationsRecursively(
    entity: Function,
    visited = new Set<Function>(),
  ): Record<string, Function> {
    if (visited.has(entity)) return {};
    visited.add(entity);

    const relationsMap: Record<string, Function> = {};

    const relations = getMetadataArgsStorage().relations.filter(
      (r) => r.target === entity,
    );

    for (const rel of relations) {
      relationsMap[rel.propertyName] = rel.type as Function;

      const nested = this.getValidRelationsRecursively(
        (rel.type as Function)(),
        visited,
      );
      for (const [nestedKey, nestedVal] of Object.entries(nested)) {
        relationsMap[`${rel.propertyName}.${nestedKey}`] = nestedVal;
      }
    }

    return relationsMap;
  }

  static isValidNestedRelation(
    relationPath: string,
    rootEntity: Function,
    allValidRelations: Record<string, Function>,
  ): boolean {
    return relationPath in allValidRelations;
  }

  static getRelations(
    entity: Function,
    includes: string[],
  ): Record<string, any> {
    const validRelations = this.getValidRelationsRecursively(entity);
    const selectedIncludes = includes.filter((include) =>
      this.isValidNestedRelation(include, entity, validRelations),
    );

    if (selectedIncludes.length === 0) {
      return {};
    }
    const relations = this.buildNestedRelations(selectedIncludes);
    return relations;
  }

  static async getEntityWithRelations<T extends { id: number }>(
    entity: EntityTarget<T>,
    repository: Repository<T>,
    id: number,
    includes: string[] = [],
  ): Promise<T | null> {
    const relations = TypeOrmUtils.getRelations(entity as Function, includes);
    const hasRelations = Object.keys(relations).length > 0;
    const whereOptions = { id } as FindOptionsWhere<T>;

    return repository.findOne({
      where: whereOptions,
      ...(hasRelations ? { relations } : {}),
    });
  }
}
