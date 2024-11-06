 // service/field-validator.js
 import { ValidationError } from '../models/validation-error.js';
 import { ValidationUtils } from '../utils/validation-utils.js';
 import { VALIDATION_TYPES } from '../constants/validation-types.js';
 
 export class FieldValidator {
   static validateRequired(field, condition, context) {
     const isEmpty = !field.value && field.value !== 0;
     return isEmpty ? new ValidationError(
       field.fieldId,
       condition.errorMessage || `${field.fieldId} is required`,
       VALIDATION_TYPES.REQUIRED
     ) : null;
   }
 
   static validateComparison(field, condition, context) {
     return !ValidationUtils.compare(field.value, condition.operator, condition.value)
       ? new ValidationError(
           field.fieldId,
           condition.errorMessage || `${field.fieldId} comparison failed`,
           VALIDATION_TYPES.COMPARISON,
           { operator: condition.operator, expectedValue: condition.value }
         )
       : null;
   }
 
   static validateDependency(field, condition, context) {
     const dependentField = context.formData[condition.dependentFieldId];
     if (!dependentField) return null;
 
     const isDependentValid = ValidationUtils.compare(
       dependentField.value,
       condition.dependentOperator,
       condition.dependentValue
     );
 
     return (isDependentValid && !field.value)
       ? new ValidationError(
           field.fieldId,
           condition.errorMessage || `${field.fieldId} is required based on ${condition.dependentFieldId}`,
           VALIDATION_TYPES.DEPENDENCY,
           { dependentField: condition.dependentFieldId }
         )
       : null;
   }
   static validateType(field, condition) {
    return !ValidationUtils.validateType(field.value, condition.expectedType)
      ? new ValidationError(
          field.fieldId,
          condition.errorMessage || `${field.fieldId} must be a ${condition.expectedType}`,
          VALIDATION_TYPES.TYPE_CHECK,
          { expectedType: condition.expectedType }
        )
      : null;
  }
  static validateLength(field, condition) {
    const length = String(field.value).length;
    return (length < condition.minLength || length > condition.maxLength)
      ? new ValidationError(
          field.fieldId,
          condition.errorMessage || `${field.fieldId} length must be between ${condition.minLength} and ${condition.maxLength}`,
          VALIDATION_TYPES.LENGTH_CHECK,
          { minLength: condition.minLength, maxLength: condition.maxLength, currentLength: length }
        )
      : null;
  }

  static validateEmpty(field, condition) {
    const isEmpty = !field.value && field.value !== 0;
    return ((condition.operator === 'NOT_EMPTY' && isEmpty) ||
            (condition.operator === 'EMPTY' && !isEmpty))
      ? new ValidationError(
          field.fieldId,
          condition.errorMessage || `${field.fieldId} ${condition.operator === 'EMPTY' ? 'must be empty' : 'cannot be empty'}`,
          VALIDATION_TYPES.EMPTY_CHECK
        )
      : null;
  }

  static validateRegex(field, condition) {
    try {
      const regex = new RegExp(condition.value);
      return !regex.test(String(field.value))
        ? new ValidationError(
            field.fieldId,
            condition.errorMessage || `${field.fieldId} format is invalid`,
            VALIDATION_TYPES.REGEX,
            { pattern: condition.value }
          )
        : null;
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }
  }

  static async validateCustom(field, condition) {
    if (typeof condition.customFunction !== 'function') {
      throw new Error(`Custom function not provided for ${field.fieldId}`);
    }

    try {
      const result = await condition.customFunction(field.value, this.formData);
      return result
        ? new ValidationError(
            field.fieldId,
            result,
            VALIDATION_TYPES.CUSTOM
          )
        : null;
    } catch (error) {
      throw new Error(`Custom validation error: ${error.message}`);
    }
  }
 }