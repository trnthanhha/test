import { Location } from '../entities/location.entity';

export class ListLocationDto {
  data: Location[];
  meta: {
    total_records?: number;
    total_page?: number;
    page_size?: number;
  };
}
