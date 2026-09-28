import { celebrate, Joi, Segments } from 'celebrate';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validation for updating a progress entry (PUT /progress/:id)
 * Only the message may be edited; any other field (caseId, statusSnapshot,
 * files, updatedBy, MongoDB operators such as $set) is rejected.
 */
export const updateProgressValidation = celebrate({
    [Segments.PARAMS]: Joi.object({
        id: Joi.string().regex(OBJECT_ID_REGEX).required().messages({
            'string.pattern.base': 'Invalid progress entry ID format',
            'any.required': 'Progress entry ID is required',
        }),
    }),
    [Segments.BODY]: Joi.object({
        message: Joi.string().trim().min(1).max(5000).required().messages({
            'string.empty': 'Message is required',
            'any.required': 'Message is required',
            'string.max': 'Message must be at most 5000 characters long',
        }),
    }),
});
