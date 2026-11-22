import Joi from "joi";




export const CreateStudentSchema  =Joi.object({
    fullName: Joi.string().required().trim(),
    FatherName: Joi.string().required().trim(),
    studentPhone: Joi.string().required().min(11).max(11).pattern(/^01[0125][0-9]{8}$/).messages({
        "string.empty": "Student phone is required.",
        "string.pattern.base": "Please enter a valid Egyptian phone number."
    }),
    FatherPhone: Joi.string().optional().min(11).max(11).pattern(/^01[0125][0-9]{8}$/).messages({
        "string.empty": "FatherPhone phone is required.",
        "string.pattern.base": "Please enter a valid Egyptian phone number."
    }),
    address: Joi.string().allow('', null),
    feeType: Joi.valid("full","half","exempted").default("full"),
    classId: Joi.number().integer().required(),
    branchId: Joi.number().integer().required(),
    gradeId: Joi.number().integer().required()
})


export const UpdateStudentSchema = Joi.object({
    fullName: Joi.string().optional().trim(),
    FatherName: Joi.string().optional().trim(),
    studentPhone: Joi.string().min(11).max(11).optional().pattern(/^01[0125][0-9]{8}$/),
    FatherPhone: Joi.string().min(11).max(11).optional().pattern(/^01[0125][0-9]{8}$/),
    address: Joi.string().allow('', null),
    feeType: Joi.valid("full","half","exempted").default("full").optional(),
    phoneNeedsUpdate: Joi.boolean().optional(),
    status: Joi.string().valid('active', 'inactive'),
    classId: Joi.number().integer(),
    branchId: Joi.number().integer(),
    gradeId: Joi.number().integer()
})