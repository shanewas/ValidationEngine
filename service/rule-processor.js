import { ValidationError } from "../models/validation-error.js";
import { VALIDATION_TYPES, FIELD_TYPES } from "../constants/validation-types.js";
import { FieldValidator } from "./field-validator.js";

/**
 * Processes validation rules and applies them to the form data.
 */
export class RuleProcessor {
  /**
   * Sort rules by priority (1-99; higher numbers are higher priority).
   */
  static sortRules(rules) {
    if (!Array.isArray(rules)) {
      throw new Error("Rules must be an array");
    }

    return [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Validate the structure of a single condition.
   */
  static validateCondition(condition) {
    if (!condition || typeof condition !== "object") {
      throw new Error("Invalid condition object");
    }

    if (!condition.type || !Object.values(VALIDATION_TYPES).includes(condition.type)) {
      throw new Error(`Invalid validation type: ${condition.type}`);
    }

    if (condition.fieldType && !Object.values(FIELD_TYPES).includes(condition.fieldType)) {
      throw new Error(`Invalid field type: ${condition.fieldType}`);
    }

    return true;
  }

  /**
   * Process an individual rule by iterating over its conditions.
   */
  static async processRule(rule, context) {
    if (!rule || !Array.isArray(rule.conditions)) {
      throw new Error("Invalid rule structure");
    }

    for (const condition of rule.conditions) {
      try {
        this.validateCondition(condition);
        const field = context.formData[condition.fieldId];

        if (!field) {
          context.addError(
            condition.fieldId,
            new ValidationError({
              fieldId: condition.fieldId,
              message: `Field not found: ${condition.fieldId}`,
              type: VALIDATION_TYPES.TYPE_CHECK,
            })
          );
          continue;
        }

        const error = await this.evaluateCondition(field, condition, context);
        if (error) {
          context.addError(condition.fieldId, error);
        }
      } catch (error) {
        context.addError(
          condition.fieldId,
          new ValidationError({
            fieldId: condition.fieldId,
            message: `Condition processing failed: ${error.message}`,
            type: "SYSTEM_ERROR",
          })
        );
      }
    }
  }

  /**
   * Evaluate a condition based on its type.
   */
  static async evaluateCondition(field, condition, context) {
    try {
      switch (condition.type) {
        case VALIDATION_TYPES.REQUIRED:
          return FieldValidator.validateRequired(field, condition);
        case VALIDATION_TYPES.COMPARISON:
          return FieldValidator.validateComparison(field, condition);
        case VALIDATION_TYPES.DEPENDENCY:
          return FieldValidator.validateDependency(field, condition, context);
        case VALIDATION_TYPES.TYPE_CHECK:
          return FieldValidator.validateType(field, condition);
        case VALIDATION_TYPES.LENGTH_CHECK:
          return FieldValidator.validateLength(field, condition);
        case VALIDATION_TYPES.EMPTY_CHECK:
          return FieldValidator.validateEmpty(field, condition);
        case VALIDATION_TYPES.REGEX:
          return FieldValidator.validateRegex(field, condition);
        default:
          throw new Error(`Unknown validation type: ${condition.type}`);
      }
    } catch (error) {
      throw new Error(`Condition evaluation error: ${error.message}`);
    }
  }
}
