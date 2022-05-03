import { Service } from "medusa-extender"
import { EntityManager, Brackets } from "typeorm"
import { FindConfig } from "@medusajs/medusa/dist/types/common"
import { ProductVariant } from "./product-variant.entity"
import {
  ProductVariantService as MedusaProductVariantService,
  EventBusService,
  RegionService,
} from "@medusajs/medusa/dist/services"

import ProductRepository from "@medusajs/medusa/dist/repositories/product"
import ProductOptionValueRepository from "@medusajs/medusa/dist/repositories/product-option-value"
import MoneyAmountRepository from "@medusajs/medusa/dist/repositories/money-amount"
import ProductVariantRepository from "./product-variant.repository"
import { CartRepository } from "@medusajs/medusa/dist/repositories/cart"
import {
  IPriceSelectionStrategy,
  PriceSelectionContext,
} from "@medusajs/medusa/dist/interfaces/price-selection-strategy"
import { FilterableProductVariantProps } from "@medusajs/medusa/dist/types/product-variant"

import { MedusaError } from "medusa-core-utils"

type ContainerInjection = {
  manager: EntityManager
  productVariantRepository: typeof ProductVariantRepository
  productRepository: typeof ProductRepository
  eventBusService: EventBusService
  regionService: RegionService
  moneyAmountRepository: typeof MoneyAmountRepository
  productOptionValueRepository: typeof ProductOptionValueRepository
  cartRepository: typeof CartRepository
  priceSelectionStrategy: IPriceSelectionStrategy
}

@Service({ override: MedusaProductVariantService })
export class ProductVariantService extends MedusaProductVariantService {
  constructor(private readonly container: ContainerInjection) {
    super(container)
  }

  /**
   * Gets a product variant by id.
   * @param {string} variantId - the id of the product to get.
   * @param {FindConfig<ProductVariant>} config - query config object for variant retrieval.
   * @return {Promise<Product>} the product document.
   */
  async retrieve(
    variantId: string,
    config: FindConfig<ProductVariant> & PriceSelectionContext = {
      include_discount_prices: false,
    }
  ): Promise<ProductVariant> {
    config = {
      ...config,
      relations: [...(config?.relations ?? []), "locations"],
    }

    // @ts-ignore
    return super.retrieve(variantId, config)
  }

  /**
   * @param {object} selector - the query object for find
   * @param {FindConfig<ProductVariant>} config - query config object for variant retrieval
   * @return {Promise} the result of the find operation
   */
  async listAndCount(
    selector: FilterableProductVariantProps,
    config: FindConfig<ProductVariant> & PriceSelectionContext = {
      relations: [],
      skip: 0,
      take: 20,
      include_discount_prices: false,
    }
  ): Promise<[ProductVariant[], number]> {
    config = {
      ...config,
      relations: [...(config?.relations ?? []), "locations"],
    }

    // @ts-ignore
    return super.listAndCount(selector, config)
  }
}
