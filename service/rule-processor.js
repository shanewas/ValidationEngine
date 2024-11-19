import { ValidationError } from "../models/validation-error.js";
import {
  VALIDATION_TYPES,
  FIELD_TYPES,
} from "../constants/validation-types.js";
import { FieldValidator } from "./field-validator.js";

export class RuleProcessor {
  /**
   * Sort rules by priority (HIGH > MEDIUM > LOW).
   */
  static sortRules(rules) {
    if (!Array.isArray(rules)) {
      throw new Error("Rules must be an array");
    }

    const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...rules].sort((a, b) => {
      if (!a.priority || !b.priority) return 0;
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    });
  }

  /**
   * Validate the structure of a condition.
   */
  static validateCondition(condition) {
    if (!condition || typeof condition !== "object") {
      throw new Error("Invalid condition object");
    }

    if (
      !condition.type ||
      !Object.values(VALIDATION_TYPES).includes(condition.type)
    ) {
      throw new Error(`Invalid validation type: ${condition.type}`);
    }

    if (
      condition.fieldType &&
      !Object.values(FIELD_TYPES).includes(condition.fieldType)
    ) {
      throw new Error(`Invalid field type: ${condition.fieldType}`);
    }

    if (condition.action && typeof condition.action !== "string") {
      throw new Error("Invalid action value");
    }

    return true;
  }

  /**
   * Process an individual rule, iterating over its conditions.
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

        if (condition.fieldType && field.type !== condition.fieldType) {
          context.addError(
            condition.fieldId,
            new ValidationError({
              fieldId: condition.fieldId,
              message: `Field type mismatch: expected ${condition.fieldType}, got ${field.type}`,
              type: VALIDATION_TYPES.TYPE_CHECK,
            })
          );
          continue;
        }

        const error = await this.evaluateCondition(field, condition, context);
        if (error) {
          context.addError(condition.fieldId, error);
        }

        if (condition.action) {
          this.executeAction(
            condition.action,
            condition.actionValue,
            context,
            field
          );
        }
      } catch (error) {
        context.addError(
          condition.fieldId,
          new ValidationError({
            fieldId: condition.fieldId,
            message: `Validation failed: ${error.message}`,
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
          return FieldValidator.validateRequired(field, condition, context);
        case VALIDATION_TYPES.COMPARISON:
          return FieldValidator.validateComparison(field, condition, context);
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
        case VALIDATION_TYPES.CUSTOM:
          if (typeof condition.validate !== "function") {
            throw new Error("Custom validation requires a validate function");
          }
          return FieldValidator.validateCustom(field, condition);
        default:
          throw new Error(`Unknown validation type: ${condition.type}`);
      }
    } catch (error) {
      throw new Error(`Condition evaluation error: ${error.message}`);
    }
  }

  /**
   * Execute an action if specified in a condition.
   */
  static executeAction(action, actionValue, context, field) {
    try {
      console.log(`Executing action: ${action} with value: ${actionValue}`);
      switch (action) {
        case "CLEAR_FORMFIELD":
          field.value = ""; // Clear the field value
          break;
        case "UPDATE_VALUE":
          field.value = actionValue; // Update field value
          break;
        case "SHOW_MESSAGE":
          context.addMessage(field.fieldId, actionValue || "Action triggered");
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Action execution failed: ${error.message}`);
    }
  }
}
