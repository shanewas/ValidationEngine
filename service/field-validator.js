import { ValidationError } from "../models/validation-error.js";
import { ValidationUtils } from "../utils/validation-utils.js";
import { VALIDATION_TYPES } from "../constants/validation-types.js";

export class FieldValidator {
  static validateRequired(field, condition) {
    const isEmpty =
      field.value === null || field.value === undefined || field.value === "";
    if (isEmpty) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage || `${field.fieldId} is required`,
        VALIDATION_TYPES.REQUIRED
      );
    }
    return null;
  }

  static validateType(field, condition) {
    if (!ValidationUtils.validateType(field.value, condition.expectedType)) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage ||
          `${field.fieldId} must be of type ${condition.expectedType}`,
        VALIDATION_TYPES.TYPE_CHECK,
        { expectedType: condition.expectedType }
      );
    }
    return null;
  }

  static validateComparison(field, condition) {
    if (
      !ValidationUtils.compare(field.value, condition.operator, condition.value)
    ) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage || `${field.fieldId} comparison failed`,
        VALIDATION_TYPES.COMPARISON,
        { operator: condition.operator, expectedValue: condition.value }
      );
    }
    return null;
  }

  static validateDependency(field, condition, context) {
    const dependentField = context.formData?.[condition.dependentFieldId];

    // Handle missing dependent field
    if (!dependentField) {
      return new ValidationError(
        condition.dependentFieldId,
        `Dependent field ${condition.dependentFieldId} is missing`,
        VALIDATION_TYPES.DEPENDENCY
      );
    }

    // Handle invalid dependent field value
    if (dependentField.value === null || dependentField.value === undefined) {
      return new ValidationError(
        condition.dependentFieldId,
        `Dependent field ${condition.dependentFieldId} has an invalid value`,
        VALIDATION_TYPES.DEPENDENCY
      );
    }

    const isDependentValid = ValidationUtils.compare(
      dependentField.value,
      condition.dependentOperator,
      condition.dependentValue
    );

    // If dependency condition is not met and field value is empty
    if (
      !isDependentValid &&
      (field.value === null || field.value === undefined || field.value === "")
    ) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage ||
          `${field.fieldId} is required due to dependency not being met`,
        VALIDATION_TYPES.DEPENDENCY,
        { dependentField: condition.dependentFieldId }
      );
    }

    // Dependency condition met, but field value is invalid
    if (
      isDependentValid &&
      (field.value === null || field.value === undefined || field.value === "")
    ) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage ||
          `${field.fieldId} is required due to ${condition.dependentFieldId}`,
        VALIDATION_TYPES.DEPENDENCY,
        { dependentField: condition.dependentFieldId }
      );
    }

    // Validation passed
    return null;
  }

  static validateLength(field, condition) {
    const valueLength = String(field.value || "").length;
    if (
      valueLength < condition.minLength ||
      valueLength > condition.maxLength
    ) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage ||
          `${field.fieldId} length must be between ${condition.minLength} and ${condition.maxLength}`,
        VALIDATION_TYPES.LENGTH_CHECK,
        {
          minLength: condition.minLength,
          maxLength: condition.maxLength,
          currentLength: valueLength,
        }
      );
    }
    return null;
  }

  static validateRegex(field, condition) {
    try {
      const regex = new RegExp(condition.value);
      if (!regex.test(String(field.value || ""))) {
        return new ValidationError(
          field.fieldId,
          condition.errorMessage ||
            `${field.fieldId} does not match the expected pattern`,
          VALIDATION_TYPES.REGEX,
          { pattern: condition.value }
        );
      }
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }
    return null;
  }

  static validateEmpty(field, condition) {
    const isEmpty =
      field.value === null || field.value === undefined || field.value === "";

    if (
      (condition.operator === "NOT_EMPTY" && isEmpty) ||
      (condition.operator === "EMPTY" && !isEmpty)
    ) {
      return new ValidationError(
        field.fieldId,
        condition.errorMessage ||
          `${field.fieldId} ${
            condition.operator === "EMPTY" ? "must be empty" : "cannot be empty"
          }`,
        VALIDATION_TYPES.EMPTY_CHECK
      );
    }

    return null;
  }
}
