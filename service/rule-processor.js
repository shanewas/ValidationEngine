import { ValidationError } from "../models/validation-error.js";
import { VALIDATION_TYPES } from "../constants/validation-types.js";
import { FieldValidator } from "./field-validator.js";
// service/rule-processor.js
export class RuleProcessor {
  static sortRules(rules) {
    return [...rules].sort((a, b) => {
      const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    });
  }

  static async processRule(rule, context) {
    for (const condition of rule.conditions) {
      const field = context.formData[condition.fieldId];
      if (!field) continue;

      const error = await this.evaluateCondition(field, condition, context);
      if (error) {
        context.addError(condition.fieldId, error);
      }
    }
  }

  static async evaluateCondition(field, condition, context) {
    try {
      switch (condition.type) {
        case VALIDATION_TYPES.REQUIRED:
          return FieldValidator.validateRequired(field, condition, context);
        case VALIDATION_TYPES.COMPARISON:
          return FieldValidator.validateComparison(field, condition, context);
        case VALIDATION_TYPES.DEPENDENCY:
          return FieldValidator.validateDependency(field, condition, context);
        // Add other validation type cases...
        case VALIDATION_TYPES.TYPE_CHECK:
          return FieldValidator.validateType(field, condition);
        case VALIDATION_TYPES.LENGTH_CHECK:
          return FieldValidator.validateLength(field, condition);
        case VALIDATION_TYPES.EMPTY_CHECK:
          return FieldValidator.validateEmpty(field, condition);
        case VALIDATION_TYPES.REGEX:
          return FieldValidator.validateRegex(field, condition);
        case VALIDATION_TYPES.CUSTOM:
          return FieldValidator.validateCustom(field, condition);
        default:
          throw new Error(`Unknown validation type: ${condition.type}`);
      }
    } catch (error) {
      console.error(`Condition evaluation error: ${error.message}`);
      return new ValidationError(
        field.fieldId,
        `Validation error: ${error.message}`,
        "SYSTEM_ERROR"
      );
    }
  }
}
