import { RequestQueryBaseListValidation } from 'src/request/validation/request.query.base-list.validation';
import { APPOINTMENT_DEFAULT_SORT } from '../appointment.constant';

export class AppointmentListValidation extends RequestQueryBaseListValidation {
    constructor() {
        super(APPOINTMENT_DEFAULT_SORT);
    }
}
