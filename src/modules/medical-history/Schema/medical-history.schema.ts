import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, versionKey: false })
export class MedicalHistory {
    @Prop({
        required: true,
        index: true,
    })
    patientId: string;

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    symptoms: [
        {
            time_start: Date,
            symptom: string,
            age: number,
            situation: string, //hoàn cảnh khởi phát
            descrpition: string
        }
    ]

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    regions: [ // vùng khởi phát
        {
            region: string,
            descrpition: string
        }
    ]

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    types: [ // kiểu khởi phát
        {
            type: string,
            descrpition: string
        }
    ]

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    distributions: [ // phân bổ triệu chứng
        {
            distribution: string,
            descrpition: string
        }
    ]


    @Prop({
        required: true,
        type: Array,
        default: []
    })
    symmetrys: [ // tính đối xứng
        {
            symmetry: string,
            descrpition: string
        }
    ]

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    evolveds: [ // tiến triển
        {
            evolved: string,
            descrpition: string
        }
    ]

    @Prop({
        required: true,
        type: Array,
        default: []
    })
    others: [
        { // Đặc tính khác 
            heavy_factor: string, // yếu tố làm nặng
            factors_light: string // yếu tố loàm nhẹ
            drugs_and_treatment: [
                {
                    type: string,
                    response_to_treatment: string,
                    side_effects: string
                }
            ],
            related_dopaminergic: [
                {
                    type: string,
                    descrpition: string
                }
            ],
            impact_on_daily_work: string, // ảnh hưởng đến công việc hàng ngày
            impact_on_daily_life: string,
            others_child:[
                {
                    symptom: string,
                    descrpition: string
                }
            ]
        }
    ]
}

export const MedicalHistoryDatabaseName = 'medicalHistorys';
export const MedicalHistorySchema = SchemaFactory.createForClass(MedicalHistory);
