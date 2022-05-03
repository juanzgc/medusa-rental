import { Service } from "medusa-extender"
import { EntityManager } from "typeorm"
import { FindConfig } from "@medusajs/medusa/dist/types/common"
import {
  ProductService as MedusaProductService,
  EventBusService,
  ProductCollectionService,
  SearchService,
} from "@medusajs/medusa/dist/services"
import { ProductVariantService } from "../product-variant/product-variant.service"
import { IPriceSelectionStrategy } from "@medusajs/medusa/dist/interfaces/price-selection-strategy"
import ProductRepository from "@medusajs/medusa/dist/repositories/product"
import ProductVariantRepository from "@medusajs/medusa/dist/repositories/product-variant"
import ProductOptionRepository from "@medusajs/medusa/dist/repositories/product-option"
import ProductTypeRepository from "@medusajs/medusa/dist/repositories/product-type"
import ProductTagRepository from "@medusajs/medusa/dist/repositories/product-tag"
import ImageRepository from "@medusajs/medusa/dist/repositories/image"
import CartRepository from "@medusajs/medusa/dist/repositories/cart"

type ContainerInjection = {
  manager: EntityManager
  productRepository: typeof ProductRepository
  productVariantRepository: typeof ProductVariantRepository
  productOptionRepository: typeof ProductOptionRepository
  eventBusService: EventBusService
  productVariantService: ProductVariantService
  productCollectionService: ProductCollectionService
  productTypeRepository: typeof ProductTypeRepository
  productTagRepository: typeof ProductTagRepository
  imageRepository: typeof ImageRepository
  searchService: SearchService
  cartRepository: typeof CartRepository
  priceSelectionStrategy: IPriceSelectionStrategy
}

@Service({ override: MedusaProductService })
export class ProductService extends MedusaProductService {
  constructor(private readonly container: ContainerInjection) {
    super(container)
  }

  /**
   * Gets a product by id.
   * Throws in case of DB Error and if product was not found.
   * @param {string} productId - id of the product to get.
   * @param {object} config - object that defines what should be included in the
   *   query response
   * @return {Promise<Product>} the result of the find one operation.
   */
  async retrieve(
    productId,
    config = {
      include_discount_prices: false,
      relations: [],
    }
  ) {
    config = {
      ...config,
      relations: [...(config?.relations ?? []), "variants.locations"],
    }
    return super.retrieve(productId, config)
  }

  /**
   * Gets all variants belonging to a product.
   * @param {string} productId - the id of the product to get variants from.
   * @return {Promise} an array of variants
   */
  async retrieveVariants(productId) {
    const product = await super.retrieve(productId, {
      relations: ["variants", "variants.locations"],
    })
    return product.variants
  }

  /**
   * Lists products based on the provided parameters and includes the count of
   * products that match the query.
   * @param {object} selector - an object that defines rules to filter products
   *   by
   * @param {object} config - object that defines the scope for what should be
   *   returned
   * @return {Promise<[Product[], number]>} an array containing the products as
   *   the first element and the total count of products that matches the query
   *   as the second element.
   */
  async listAndCount(
    selector = {},
    config = {
      relations: [],
      skip: 0,
      take: 20,
      include_discount_prices: false,
    }
  ) {
    config = {
      ...config,
      relations: [...(config?.relations ?? []), "variants.locations"],
    }

    return super.listAndCount(selector, config)
  }
}
