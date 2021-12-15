import { RequestQueryBaseListValidation } from 'src/request/validation/request.query.base-list.validation';
import { EXAMPLACE_DEFAULT_SORT } from '../examplace.constant';

export class ExamplaceListValidation extends RequestQueryBaseListValidation {
    constructor() {
        super(EXAMPLACE_DEFAULT_SORT);
    }
}
