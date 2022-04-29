import { Service } from "medusa-extender"
import { EntityManager, Brackets } from "typeorm"
import { BaseService } from "medusa-interfaces"
import EventBusService from "@medusajs/medusa/dist/services/event-bus"

import { LocationRepository } from "./location.repository"

type ContainerInjection = {
  manager: EntityManager
  eventBusService: EventBusService
  locationRepository: typeof LocationRepository
}

@Service()
export class LocationService extends BaseService {
  constructor(private readonly container: ContainerInjection) {
    super(container)
    this.manager = container.manager
    this.eventBus = container.eventBusService
    this.locationRepository = container.locationRepository
  }

  /**
   * Lists locations based on the provided parameters.
   * @param {object} selector - an object that defines rules to filter locations
   *   by
   * @param {object} config - object that defines the scope for what should be
   *   returned
   * @return {Promise<Location[]>} the result of the find operation
   */
  async list(selector = {}, config = { relations: [], skip: 0, take: 20 }) {
    const locationRepo = this.manager.getCustomRepository(
      this.locationRepository
    )

    const { q, query, relations } = this.prepareListQuery_(selector, config)

    if (q) {
      const qb = this.getFreeTextQueryBuilder_(locationRepo, query, q)
      const raw = await qb.getMany()
      return locationRepo.findWithRelations(
        relations,
        raw.map((i) => i.id),
        query.withDeleted ?? false
      )
    }

    return locationRepo.find(query)
    // return locationRepo.findWithRelations(relations, query)
  }

  /**
   * Creates a query object to be used for list queries.
   * @param {object} selector - the selector to create the query from
   * @param {object} config - the config to use for the query
   * @return {object} an object containing the query, relations and free-text
   *   search param.
   */
  prepareListQuery_(selector, config) {
    let q
    if ("q" in selector) {
      q = selector.q
      delete selector.q
    }

    const query = this.buildQuery_(selector, config)

    if (config.relations && config.relations.length > 0) {
      query.relations = config.relations
    }

    if (config.select && config.select.length > 0) {
      query.select = config.select
    }

    const rels = query.relations
    delete query.relations

    return {
      query,
      relations: rels,
      q,
    }
  }

  /**
   * Creates a QueryBuilder that can fetch locations based on free text.
   * @param {LocationRepository} locationRepo - an instance of a LocationRepository
   * @param {FindOptions<Location>} query - the query to get locations by
   * @param {string} q - the text to perform free text search from
   * @return {QueryBuilder<Location>} a query builder that can fetch locations
   */
  getFreeTextQueryBuilder_(locationRepo, query, q) {
    const where = query.where

    delete where.city
    delete where.city_slug
    delete where.country

    let qb = locationRepo
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.product_variants", "variant")
      .select(["location.id"])
      .where(where)
      .andWhere(
        new Brackets((qb) => {
          qb.where(`location.city ILIKE :q`, { q: `%${q}%` })
            .orWhere(`location.city_slug ILIKE :q`, { q: `%${q}%` })
            .orWhere(`location.country ILIKE :q`, { q: `%${q}%` })
        })
      )
      .skip(query.skip)
      .take(query.take)

    if (query.withDeleted) {
      qb = qb.withDeleted()
    }

    return qb
  }
}
