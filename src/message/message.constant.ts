import en from 'src/message/languages/en';
import appointment from 'src/modules/appointment/message/appointment';
import patient from 'src/modules/patient/message/patient';
import auth from 'src/modules/auth/message/auth';
import user from 'src/modules/user/message/user';
import role from 'src/modules/role/message/role';
import examRecord from 'src/modules/examRecord/message/examRecord';
import doctor from 'src/modules/doctor/message/doctor';
import symptom from 'src/modules/symptoms/message/symptom';

export default {
    en: {
        ...en,
        appointment,
        patient,
        auth,
        user,
        role,
        examRecord,
        doctor,
        symptom
    },
    
};
