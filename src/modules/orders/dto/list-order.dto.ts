import { ApiResponseProperty } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";


export class ListOrderDto {
  @ApiResponseProperty({ example: []})  
  data: Order[];

  @ApiResponseProperty({ example: {
    meta: {
        total_records: 10,
        total_page: 2,
        page_size: 3
    }
  }})
  meta: {
    total_records?: number;
    total_page?: number;
    page_size?: number;
  };
}
