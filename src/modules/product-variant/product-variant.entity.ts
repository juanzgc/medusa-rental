import { ProductVariant as MedusaProductVariant } from "@medusajs/medusa/dist"
import {
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm"
import { Entity as MedusaEntity } from "medusa-extender"
import { Location } from "../location/location.entity"

@MedusaEntity({ override: MedusaProductVariant })
@Entity()
export class ProductVariant extends MedusaProductVariant {
  @ManyToMany(() => Location, (loc) => loc.product_variants, {
    eager: true,
    cascade: true,
  })
  @JoinTable({
    name: "product_variant_location",
    joinColumn: {
      name: "product_variant_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "location_id",
      referencedColumnName: "id",
    },
  })
  locations: Location[]
}
