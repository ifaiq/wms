import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MODULES_NAME } from 'src/common/constants';
import { Product } from '../monolith/entities';
import { ProductSearchDto } from './dto';
import { ProductService } from './product.service';

@ApiTags(MODULES_NAME.PRODUCT)
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/search')
  async searchProduct(
    @Query() reqParams: ProductSearchDto
  ): Promise<Product[] | null> {
    if (reqParams.subLocationId) {
      return await this.productService.filterProductsBySubLocationId(reqParams);
    }
    return await this.productService.searchProducts(reqParams);
  }
}
