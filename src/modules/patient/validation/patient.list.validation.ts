import { RequestQueryBaseListValidation } from 'src/request/validation/request.query.base-list.validation';
import { PATIENT_DEFAULT_SORT } from '../patient.constant';

export class PatientListValidation extends RequestQueryBaseListValidation {
    constructor() {
        super(PATIENT_DEFAULT_SORT);
    }
}
