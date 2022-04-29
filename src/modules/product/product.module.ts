import { Module } from 'medusa-extender';
import { ProductService } from './product.service';

@Module({
    imports: [ProductService]
})
export class ProductModule {}