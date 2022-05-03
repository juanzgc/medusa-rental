import { Module } from "medusa-extender"
import { ProductVariant } from "./product-variant.entity"
import ProductVariantRepository from "./product-variant.repository"
import { ProductVariantService } from "./product-variant.service"
import { productVariant1651213555842 } from "./1651213555842-product-variant.migration"
@Module({
  imports: [
    ProductVariant,
    ProductVariantService,
    ProductVariantRepository,
    productVariant1651213555842,
  ],
})
export class ProductVariantModule {}
