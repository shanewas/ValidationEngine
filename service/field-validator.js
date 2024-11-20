import { ValidationError } from "../models/validation-error.js";
import { ValidationUtils } from "../utils/validation-utils.js";
import { VALIDATION_TYPES } from "../constants/validation-types.js";
import { ValidationHelpers } from "../utils/validation-helpers.js";

export class FieldValidator {
  static validateRequired(field, condition) {
    try {
      ValidationHelpers.ensureConditionField(condition, "type");
      if (ValidationUtils.isEmpty(field.value)) {
        return new ValidationError({
          fieldId: field.fieldId,
          message: condition.errorMessage || `${field.fieldId} is required`,
          type: VALIDATION_TYPES.REQUIRED,
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(field.fieldId, error.message);
    }
    return null;
  }

  static validateType(field, condition) {
    try {
      ValidationHelpers.ensureConditionField(condition, "expectedType");
      if (!ValidationUtils.validateType(field.value, condition.expectedType)) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            condition.errorMessage ||
            `${field.fieldId} must be of type ${condition.expectedType}`,
          type: VALIDATION_TYPES.TYPE_CHECK,
          details: { expectedType: condition.expectedType },
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(field.fieldId, error.message);
    }
    return null;
  }

  static validateComparison(field, condition) {
    try {
      ValidationHelpers.ensureConditionFields(condition, ["operator", "value"]);
      if (
        !ValidationUtils.compare(
          field.value,
          condition.operator,
          condition.value
        )
      ) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            condition.errorMessage || `${field.fieldId} comparison failed`,
          type: VALIDATION_TYPES.COMPARISON,
          details: {
            operator: condition.operator,
            expectedValue: condition.value,
          },
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(field.fieldId, error.message);
    }
    return null;
  }

  static validateDependency(field, condition, context) {
    try {
      const dependentField = context.formData?.[condition.dependentFieldId];
      if (!dependentField) {
        return new ValidationError({
          fieldId: condition.dependentFieldId,
          message: `Dependent field ${condition.dependentFieldId} is missing`,
          type: VALIDATION_TYPES.DEPENDENCY,
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }

      const isDependentValid = ValidationUtils.compare(
        dependentField.value,
        condition.dependentOperator,
        condition.dependentValue
      );

      if (!isDependentValid) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            condition.errorMessage ||
            `${field.fieldId} is required due to dependency not being met`,
          type: VALIDATION_TYPES.DEPENDENCY,
          details: { dependentField: condition.dependentFieldId },
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(field.fieldId, error.message);
    }
    return null;
  }

  static validateLength(field, condition) {
    try {
      ValidationHelpers.ensureConditionFields(condition, [
        "minLength",
        "maxLength",
      ]);
      if (condition.minLength > condition.maxLength) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            "Configuration error: minLength cannot be greater than maxLength.",
          type: VALIDATION_TYPES.LENGTH_CHECK,
          details: {
            minLength: condition.minLength,
            maxLength: condition.maxLength,
          },
        });
      }

      const valueLength = String(field.value || "").length;
      if (
        valueLength < condition.minLength ||
        valueLength > condition.maxLength
      ) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            condition.errorMessage ||
            `${field.fieldId} length must be between ${condition.minLength} and ${condition.maxLength}`,
          type: VALIDATION_TYPES.LENGTH_CHECK,
          details: {
            minLength: condition.minLength,
            maxLength: condition.maxLength,
            currentLength: valueLength,
          },
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(field.fieldId, error.message);
    }
    return null;
  }

  static validateRegex(field, condition) {
    try {
      ValidationHelpers.ensureConditionField(condition, "value");

      const regex = new RegExp(condition.value);
      if (!regex.test(String(field.value || ""))) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            condition.errorMessage ||
            `${field.fieldId} does not match the expected pattern`,
          type: VALIDATION_TYPES.REGEX,
          details: { pattern: condition.value },
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(
        field.fieldId,
        `Invalid regex pattern: ${error.message}`
      );
    }
    return null;
  }

  static validateEmpty(field, condition) {
    try {
      ValidationHelpers.ensureConditionField(condition, "operator");

      const isEmpty = ValidationUtils.isEmpty(field.value);
      if (
        (condition.operator === "NOT_EMPTY" && isEmpty) ||
        (condition.operator === "EMPTY" && !isEmpty)
      ) {
        return new ValidationError({
          fieldId: field.fieldId,
          message:
            condition.errorMessage ||
            `${field.fieldId} ${
              condition.operator === "EMPTY"
                ? "must be empty"
                : "cannot be empty"
            }`,
          type: VALIDATION_TYPES.EMPTY_CHECK,
          action: condition.action,
          actionValue: condition.actionValue,
        });
      }
    } catch (error) {
      return this.createSystemError(field.fieldId, error.message);
    }
    return null;
  }

  /**
   * Utility method to create a system error.
   * @param {string} fieldId - The field ID associated with the error.
   * @param {string} message - The error message.
   * @returns {ValidationError} - A ValidationError object for system errors.
   */
  static createSystemError(fieldId, message) {
    return new ValidationError({
      fieldId: fieldId || "SYSTEM",
      message: `Rule processing failed: ${message}`,
      type: "SYSTEM_ERROR",
    });
  }
}
