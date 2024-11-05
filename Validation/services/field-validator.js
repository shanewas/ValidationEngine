import { ValidationUtils } from "../utils/validation-utils.js";
import { ValidationError } from "../models/validation-error.js";
import { VALIDATION_TYPES } from "../constants/validation-types.js";

// services/field-validator.js
export class FieldValidator {
  constructor(validationContext) {
    this.context = validationContext;
  }

  validateRequired(field, condition) {
    const isEmpty =
      field.value === null || field.value === undefined || field.value === "";
    if (isEmpty) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage || `${field.fieldName} is required.`,
        VALIDATION_TYPES.REQUIRED,
        { pdfId: field.pdfId, page: field.page }
      );
    }
    return null;
  }

  validateComparison(field, condition) {
    if (
      !ValidationUtils.compare(field.value, condition.operator, condition.value)
    ) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage || `${field.fieldName} comparison failed.`,
        VALIDATION_TYPES.COMPARISON,
        {
          pdfId: field.pdfId,
          page: field.page,
          operator: condition.operator,
          expectedValue: condition.value,
        }
      );
    }
    return null;
  }

  validateDependency(field, condition) {
    const dependentField = this.context.getField(condition.dependentFieldId);
    if (!dependentField) return null;

    const isDependentValid = ValidationUtils.compare(
      dependentField.value,
      condition.dependentOperator,
      condition.dependentValue
    );

    if (isDependentValid && !field.value) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName} is required when ${condition.dependentFieldId} ${condition.dependentOperator} ${condition.dependentValue}.`,
        VALIDATION_TYPES.DEPENDENCY,
        { pdfId: field.pdfId, page: field.page }
      );
    }
    return null;
  }

  validateType(field, condition) {
    if (!ValidationUtils.validateType(field.value, condition.expectedType)) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName} must be a ${condition.expectedType}.`,
        VALIDATION_TYPES.TYPE_CHECK,
        { pdfId: field.pdfId, page: field.page }
      );
    }
    return null;
  }

  validateLength(field, condition) {
    const length = String(field.value).length;
    if (length < condition.minLength || length > condition.maxLength) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName} length must be between ${condition.minLength} and ${condition.maxLength}.`,
        VALIDATION_TYPES.LENGTH_CHECK,
        {
          pdfId: field.pdfId,
          page: field.page,
          currentLength: length,
          minLength: condition.minLength,
          maxLength: condition.maxLength,
        }
      );
    }
    return null;
  }

  validateEmpty(field, condition) {
    const isEmpty = !field.value && field.value !== 0;
    if (
      (condition.operator === "NOT_EMPTY" && isEmpty) ||
      (condition.operator === "EMPTY" && !isEmpty)
    ) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName} must ${
            condition.operator === "EMPTY" ? "be empty" : "not be empty"
          }.`,
        VALIDATION_TYPES.EMPTY_CHECK,
        { pdfId: field.pdfId, page: field.page }
      );
    }
    return null;
  }

  validateRegex(field, condition) {
    try {
      const regex = new RegExp(condition.value);
      if (!regex.test(String(field.value))) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} format is invalid.`,
          VALIDATION_TYPES.REGEX,
          {
            pdfId: field.pdfId,
            page: field.page,
            pattern: condition.value,
          }
        );
      }
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }
    return null;
  }

  async validateCustom(field, condition) {
    if (typeof condition.customFunction !== "function") {
      throw new Error(`Custom function not provided for ${field.fieldName}.`);
    }

    try {
      const result = await condition.customFunction(
        field.value,
        this.context.fieldData
      );
      if (result) {
        return new ValidationError(
          field.fieldName,
          result,
          VALIDATION_TYPES.CUSTOM,
          { pdfId: field.pdfId, page: field.page }
        );
      }
    } catch (error) {
      throw new Error(`Custom validation error: ${error.message}`);
    }
    return null;
  }
}
