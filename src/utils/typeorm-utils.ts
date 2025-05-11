/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {
  EntityTarget,
  FindOptionsWhere,
  getMetadataArgsStorage,
  Repository,
} from 'typeorm';

export class TypeOrmUtils {
  static buildNestedRelations(includes: string[]): Record<string, unknown> {
    const relations: Record<string, unknown> = {};
    includes = includes.sort((a, b) => b.length - a.length);

    for (const include of includes) {
      const parts = include.split('.');
      let current = relations;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = i === parts.length - 1 ? true : {};
        }
        current = current[part] as Record<string, unknown>;
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

  static getValidRelationsBFS(entity: Function): Record<string, Function> {
    const visited = new Set<Function>();
    const queue: Array<{ prefix: string; entity: Function }> = [
      { prefix: '', entity },
    ];
    const relationsMap: Record<string, Function> = {};

    while (queue.length > 0) {
      const { prefix, entity } = queue.shift()!;

      if (visited.has(entity)) continue;
      visited.add(entity);

      const relations = getMetadataArgsStorage().relations.filter(
        (r) => r.target === entity,
      );

      for (const rel of relations) {
        const relEntity = (rel.type as Function)();
        const key = prefix ? `${prefix}.${rel.propertyName}` : rel.propertyName;

        relationsMap[key] = relEntity;
        queue.push({ prefix: key, entity: relEntity });
      }
    }

    return relationsMap;
  }

  static isValidNestedRelation(
    relationPath: string,
    _rootEntity: Function,
    allValidRelations: Record<string, Function>,
  ): boolean {
    return relationPath in allValidRelations;
  }

  static getRelations(
    entity: Function,
    includes: string[],
  ): Record<string, any> {
    const validRelations = this.getValidRelationsBFS(entity);
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
