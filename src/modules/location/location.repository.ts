import { Repository as MedusaRepository } from "medusa-extender"
import {
  EntityRepository,
  Repository,
  FindConditions,
  FindManyOptions,
  OrderByCondition,
} from "typeorm"
import { flatten, groupBy, map, merge } from "lodash"
import { Location } from "./location.entity"

export type FindWithRelationsOptions = FindManyOptions<Location> & {
  order?: OrderByCondition
  withDeleted?: boolean
}

@MedusaRepository()
@EntityRepository(Location)
export class LocationRepository extends Repository<Location> {
  private mergeEntitiesWithRelations(
    entitiesAndRelations: Array<Partial<Location>>
  ): Location[] {
    const entitiesAndRelationsById = groupBy(entitiesAndRelations, "id")
    return map(entitiesAndRelationsById, (entityAndRelations) =>
      merge({}, ...entityAndRelations)
    )
  }

  private async queryLocations(
    optionsWithoutRelations: FindWithRelationsOptions,
    shouldCount = false
  ): Promise<[Location[], number]> {
    let qb = this.createQueryBuilder("location")
      .select(["location.id"])
      .skip(optionsWithoutRelations.skip)
      .take(optionsWithoutRelations.take)

    qb = optionsWithoutRelations.where
      ? qb.where(optionsWithoutRelations.where)
      : qb

    qb = optionsWithoutRelations.order
      ? qb.orderBy(optionsWithoutRelations.order)
      : qb

    if (optionsWithoutRelations.withDeleted) {
      qb = qb.withDeleted()
    }

    let entities: Location[]
    let count = 0
    if (shouldCount) {
      const result = await qb.getManyAndCount()
      entities = result[0]
      count = result[1]
    } else {
      entities = await qb.getMany()
    }

    return [entities, count]
  }

  private getGroupedRelations(relations: Array<keyof Location>): {
    [toplevel: string]: string[]
  } {
    const groupedRelations: { [toplevel: string]: string[] } = {}
    for (const rel of relations) {
      const [topLevel] = rel.split(".")
      if (groupedRelations[topLevel]) {
        groupedRelations[topLevel].push(rel)
      } else {
        groupedRelations[topLevel] = [rel]
      }
    }

    return groupedRelations
  }

  private async queryLocationsWithIds(
    entityIds: string[],
    groupedRelations: { [toplevel: string]: string[] },
    withDeleted = false
  ): Promise<Location[]> {
    const entitiesIdsWithRelations = await Promise.all(
      Object.entries(groupedRelations).map(([toplevel, rels]) => {
        let querybuilder = this.createQueryBuilder("location")
        querybuilder = querybuilder.leftJoinAndSelect(
          `pv.${toplevel}`,
          toplevel
        )

        for (const rel of rels) {
          const [_, rest] = rel.split(".")
          if (!rest) {
            continue
          }
          // Regex matches all '.' except the rightmost
          querybuilder = querybuilder.leftJoinAndSelect(
            rel.replace(/\.(?=[^.]*\.)/g, "__"),
            rel.replace(".", "__")
          )
        }

        if (withDeleted) {
          querybuilder = querybuilder
            .where("location.id IN (:...entitiesIds)", {
              entitiesIds: entityIds,
            })
            .withDeleted()
        } else {
          querybuilder = querybuilder.where(
            "location.deleted_at IS NULL AND location.id IN (:...entitiesIds)",
            {
              entitiesIds: entityIds,
            }
          )
        }

        return querybuilder.getMany()
      })
    ).then(flatten)

    return entitiesIdsWithRelations
  }

  public async findWithRelations(
    relations: string[] = [],
    idsOrOptionsWithoutRelations: FindWithRelationsOptions | string[] = {},
    withDeleted = false
  ): Promise<Location[]> {
    let entities: Location[]
    if (Array.isArray(idsOrOptionsWithoutRelations)) {
      entities = await this.findByIds(idsOrOptionsWithoutRelations, {
        withDeleted,
      })
    } else {
      const result = await this.queryLocations(
        idsOrOptionsWithoutRelations,
        false
      )
      entities = result[0]
    }
    const entitiesIds = entities.map(({ id }) => id)

    if (entitiesIds.length === 0) {
      // no need to continue
      return []
    }

    if (relations.length === 0) {
      return await this.findByIds(
        entitiesIds,
        idsOrOptionsWithoutRelations as FindConditions<Location>
      )
    }

    const groupedRelations = this.getGroupedRelations(
      relations as (keyof Location)[]
    )
    const entitiesIdsWithRelations = await this.queryLocationsWithIds(
      entitiesIds,
      groupedRelations,
      withDeleted
    )

    const entitiesAndRelations = entitiesIdsWithRelations.concat(entities)
    const entitiesToReturn =
      this.mergeEntitiesWithRelations(entitiesAndRelations)

    return entitiesToReturn
  }
}
