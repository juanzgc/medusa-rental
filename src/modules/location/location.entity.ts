import {
  Entity,
  BeforeInsert,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Column,
  PrimaryColumn,
  JoinColumn,
  Unique,
  Index,
} from "typeorm"
import { Entity as MedusaEntity } from "medusa-extender"
import { ulid } from "ulid"
import {
  DbAwareColumn,
  resolveDbType,
} from "@medusajs/medusa/dist/utils/db-aware-column"
import { Image } from "@medusajs/medusa/dist"
import { ProductVariant } from "../product-variant/product-variant.entity"

@MedusaEntity()
@Entity()
export class Location {
  @PrimaryColumn()
  id: string

  @Column()
  city: string

  @ManyToMany(() => ProductVariant, (prodvar) => prodvar.locations, {
    onDelete: "CASCADE",
  })
  @JoinTable({
    name: "product_variant_location",
    joinColumn: {
      name: "location_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "product_variant_id",
      referencedColumnName: "id",
    },
  })
  product_variants: ProductVariant[]

  @Column()
  @Index({ unique: true, where: "deleted_at IS NULL" })
  city_slug: string

  @Column()
  country: string

  @ManyToMany(() => Image, { cascade: ["insert"] })
  @JoinTable({
    name: "location_image",
    joinColumn: {
      name: "location_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "image_id",
      referencedColumnName: "id",
    },
  })
  images: Image[]

  @Column({ nullable: true })
  thumbnail: string

  @CreateDateColumn({ type: resolveDbType("timestamptz") })
  created_at: Date

  @UpdateDateColumn({ type: resolveDbType("timestamptz") })
  updated_at: Date

  @DeleteDateColumn({ type: resolveDbType("timestamptz") })
  deleted_at: Date

  @DbAwareColumn({ type: "jsonb", nullable: true })
  metadata: any

  @BeforeInsert()
  private beforeInsert() {
    if (this.id) return
    const id = ulid()
    this.id = `loc_${id}`
  }
}
