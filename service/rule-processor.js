// service/rule-processor.js
import { ValidationError } from "../models/validation-error.js";
import { VALIDATION_TYPES, FIELD_TYPES } from "../constants/validation-types.js";
import { FieldValidator } from "./field-validator.js";

export class RuleProcessor {
  static sortRules(rules) {
    if (!Array.isArray(rules)) {
      throw new Error('Rules must be an array');
    }

    const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...rules].sort((a, b) => {
      if (!a.priority || !b.priority) return 0;
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    });
  }

  static validateCondition(condition) {
    if (!condition || typeof condition !== 'object') {
      throw new Error('Invalid condition object');
    }

    if (!condition.type || !Object.values(VALIDATION_TYPES).includes(condition.type)) {
      throw new Error(`Invalid validation type: ${condition.type}`);
    }

    if (condition.fieldType && !Object.values(FIELD_TYPES).includes(condition.fieldType)) {
      throw new Error(`Invalid field type: ${condition.fieldType}`);
    }

    return true;
  }

  static async processRule(rule, context) {
    if (!rule || !Array.isArray(rule.conditions)) {
      throw new Error('Invalid rule structure');
    }

    for (const condition of rule.conditions) {
      try {
        this.validateCondition(condition);
        
        const field = context.formData[condition.fieldId];
        if (!field) {
          context.addError(condition.fieldId, new ValidationError(
            condition.fieldId,
            `Field not found: ${condition.fieldId}`,
            VALIDATION_TYPES.TYPE_CHECK
          ));
          continue;
        }

        if (condition.fieldType && field.type !== condition.fieldType) {
          context.addError(condition.fieldId, new ValidationError(
            condition.fieldId,
            `Field type mismatch: expected ${condition.fieldType}, got ${field.type}`,
            VALIDATION_TYPES.TYPE_CHECK
          ));
          continue;
        }

        const error = await this.evaluateCondition(field, condition, context);
        if (error) {
          context.addError(condition.fieldId, error);
        }
      } catch (error) {
        context.addError(condition.fieldId, new ValidationError(
          condition.fieldId,
          `Validation failed: ${error.message}`,
          'SYSTEM_ERROR'
        ));
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
        case VALIDATION_TYPES.TYPE_CHECK:
          return FieldValidator.validateType(field, condition);
        case VALIDATION_TYPES.LENGTH_CHECK:
          return FieldValidator.validateLength(field, condition);
        case VALIDATION_TYPES.EMPTY_CHECK:
          return FieldValidator.validateEmpty(field, condition);
        case VALIDATION_TYPES.REGEX:
          return FieldValidator.validateRegex(field, condition);
        case VALIDATION_TYPES.CUSTOM:
          if (typeof condition.validate !== 'function') {
            throw new Error('Custom validation requires a validate function');
          }
          return FieldValidator.validateCustom(field, condition);
        default:
          throw new Error(`Unknown validation type: ${condition.type}`);
      }
    } catch (error) {
      throw new Error(`Condition evaluation error: ${error.message}`);
    }
  }
}