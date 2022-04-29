import { EntityRepository } from "typeorm"
import { ProductVariantRepository as MedusaProductVariantRepository } from "@medusajs/medusa/dist/repositories/product-variant"
import { Repository as MedusaRepository, Utils } from "medusa-extender"
import { ProductVariant } from "./product-variant.entity"

@MedusaRepository({ override: MedusaProductVariantRepository })
@EntityRepository(ProductVariant)
export default class ProductVariantRepository extends Utils.repositoryMixin<
  ProductVariant,
  MedusaProductVariantRepository
>(MedusaProductVariantRepository) {}
