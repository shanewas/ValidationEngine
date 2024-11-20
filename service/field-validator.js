import { ValidationError } from "../models/validation-error.js";
import { ValidationUtils } from "../utils/validation-utils.js";
import { VALIDATION_TYPES } from "../constants/validation-types.js";
import { ValidationHelpers } from "../utils/validation-helpers.js";

/**
 * Handles individual field validation logic for various validation types.
 */
export class FieldValidator {
  /**
   * Validates that a field is required.
   */
  static validateRequired(field, condition) {
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
    return null;
  }

  /**
   * Validates the type of a field's value.
   */
  static validateType(field, condition) {
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
    return null;
  }

  /**
   * Compares a field's value against a specified condition.
   */
  static validateComparison(field, condition) {
    ValidationHelpers.ensureConditionFields(condition, ["operator", "value"]);
    if (
      !ValidationUtils.compare(field.value, condition.operator, condition.value)
    ) {
      return new ValidationError({
        fieldId: field.fieldId,
        message: condition.errorMessage || `${field.fieldId} comparison failed`,
        type: VALIDATION_TYPES.COMPARISON,
        details: {
          operator: condition.operator,
          expectedValue: condition.value,
        },
        action: condition.action,
        actionValue: condition.actionValue,
      });
    }
    return null;
  }

  /**
   * Validates a dependency between fields.
   */
  static validateDependency(field, condition, context) {
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
    return null;
  }

  /**
   * Validates the length of a field's value.
   */
  static validateLength(field, condition) {
    ValidationHelpers.ensureConditionFields(condition, ["minLength", "maxLength"]);
    if (condition.minLength > condition.maxLength) {
      throw new Error("minLength cannot be greater than maxLength.");
    }

    const valueLength = String(field.value || "").length;
    if (valueLength < condition.minLength || valueLength > condition.maxLength) {
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
    return null;
  }

  /**
   * Validates a field's value against a regex pattern.
   */
  static validateRegex(field, condition) {
    ValidationHelpers.ensureConditionField(condition, "value");

    try {
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
      throw new Error(`Invalid regex pattern: ${error.message}`);
    }
    return null;
  }

  /**
   * Validates if a field is empty or not.
   */
  static validateEmpty(field, condition) {
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
            condition.operator === "EMPTY" ? "must be empty" : "cannot be empty"
          }`,
        type: VALIDATION_TYPES.EMPTY_CHECK,
        action: condition.action,
        actionValue: condition.actionValue,
      });
    }
    return null;
  }
}
