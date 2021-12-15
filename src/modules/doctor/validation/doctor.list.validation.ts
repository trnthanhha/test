import { RequestQueryBaseListValidation } from 'src/request/validation/request.query.base-list.validation';
import { DOCTOR_DEFAULT_SORT } from '../doctor.constant';

export class DoctorListValidation extends RequestQueryBaseListValidation {
    constructor() {
        super(DOCTOR_DEFAULT_SORT);
    }
}
