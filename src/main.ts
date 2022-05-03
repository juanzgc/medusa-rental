import express = require("express")
const config = require("../medusa-config")
import { Medusa } from "medusa-extender"
import { resolve } from "path"
import { LocationModule } from "./modules/location/location.module"
import { ProductModule } from "./modules/product/product.module"
import { ProductVariantModule } from "./modules/product-variant/product-variant.module"
async function bootstrap() {
  const expressInstance = express()

  await new Medusa(resolve(__dirname, ".."), expressInstance).load([
    LocationModule,
    ProductModule,
    ProductVariantModule,
  ])

  const port = config?.serverConfig?.port ?? 9000
  expressInstance.listen(port, () => {
    console.info("Server successfully started on port " + port)
  })
}

bootstrap()
