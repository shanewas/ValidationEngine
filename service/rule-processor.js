import { ValidationUtils } from "../utils/validation-utils.js";
import { logger } from "../utils/logger.js";

logger.enable();

/**
 * RuleProcessor class handles the processing of individual validation rules.
 */
export class RuleProcessor {
  /**
   * Sorts rules based on their priority.
   * Higher priority rules are processed first.
   * @param {Array} rules - The validation rules to sort.
   * @returns {Array} - Sorted validation rules.
   */
  static sortRules(rules) {
    return rules.slice().sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Processes an individual validation rule.
   * @param {Object} rule - The validation rule to process.
   * @param {ValidationContext} context - The validation context.
   * @throws {Error} - Throws error for unsupported or invalid rules.
   */
  static async processRule(rule, context) {
    logger.log(`Processing rule: ${rule.ruleId || "UNKNOWN_RULE"}`);
    // Validate rule structure
    RuleProcessor.validateRuleStructure(rule);

    // Get field value from context
    const fieldValue = context.getFieldValue(rule.fieldId);

    switch (rule.type) {
      case "REQUIRED":
        RuleProcessor.processRequiredRule(rule, fieldValue, context);
        break;

      case "COMPARISON":
        RuleProcessor.processComparisonRule(rule, fieldValue, context);
        break;

      case "TYPE_CHECK":
        RuleProcessor.processTypeCheckRule(rule, fieldValue, context);
        break;

      case "REGEX":
        RuleProcessor.processRegexRule(rule, fieldValue, context);
        break;

      case "DEPENDENCY":
        RuleProcessor.processDependencyRule(rule, context);
        break;

      case "LENGTH_CHECK":
        RuleProcessor.processLengthCheckRule(rule, fieldValue, context);
        break;

      case "SUGGESTION":
        RuleProcessor.processSuggestionRule(rule, fieldValue, context);
        break;

      default:
        throw new Error(`Unsupported rule type: ${rule.type}`);
    }
  }

  /**
   * Validates the structure of a rule.
   * @param {Object} rule - The rule to validate.
   * @throws {Error} - Throws an error if the rule structure is invalid.
   */
  static validateRuleStructure(rule) {
    if (!rule.type) throw new Error("Rule type is missing");
    if (!rule.fieldId) throw new Error("Rule fieldId is missing");
    if (!rule.errorMessage && rule.type !== "SUGGESTION") {
      throw new Error("Rule errorMessage is missing");
    }
  }

  /**
   * Processes a REQUIRED rule.
   */
  static processRequiredRule(rule, fieldValue, context) {
    if (ValidationUtils.isEmpty(fieldValue)) {
      context.addError(rule.fieldId, {
        message: rule.errorMessage,
        type: "REQUIRED",
      });
    }
  }

  /**
   * Processes a COMPARISON rule.
   */
  static processComparisonRule(rule, fieldValue, context) {
    if (!ValidationUtils.compare(fieldValue, rule.operator, rule.value)) {
      context.addError(rule.fieldId, {
        message: rule.errorMessage,
        type: "COMPARISON",
        details: { expected: rule.value, actual: fieldValue },
      });
    }
  }

  /**
   * Processes a TYPE_CHECK rule.
   */
  static processTypeCheckRule(rule, fieldValue, context) {
    if (!ValidationUtils.validateType(fieldValue, rule.expectedType)) {
      context.addError(rule.fieldId, {
        message: rule.errorMessage,
        type: "TYPE_CHECK",
        details: {
          expectedType: rule.expectedType,
          actualType: typeof fieldValue,
        },
      });
    }
  }

  /**
   * Processes a REGEX rule.
   */
  static processRegexRule(rule, fieldValue, context) {
    const regex = new RegExp(rule.value);
    if (!regex.test(fieldValue)) {
      context.addError(rule.fieldId, {
        message: rule.errorMessage,
        type: "REGEX",
        details: { pattern: rule.value, value: fieldValue },
      });
    }
  }

  /**
   * Processes a DEPENDENCY rule.
   */
  static processDependencyRule(rule, context) {
    const dependentFieldValue = context.getFieldValue(rule.dependentFieldId);
    const isDependentValid = ValidationUtils.compare(
      dependentFieldValue,
      rule.dependentOperator,
      rule.dependentValue
    );

    if (isDependentValid) {
      const fieldValue = context.getFieldValue(rule.fieldId);
      if (!ValidationUtils.compare(fieldValue, rule.operator, rule.value)) {
        context.addError(rule.fieldId, {
          message: rule.errorMessage,
          type: "DEPENDENCY",
          details: {
            dependentField: rule.dependentFieldId,
            dependentValue: dependentFieldValue,
            expected: rule.value,
            actual: fieldValue,
          },
        });
      }
    }
  }

  /**
   * Processes a LENGTH_CHECK rule.
   * Ensures the length of a field value is within specified bounds.
   * @param {Object} rule - The LENGTH_CHECK rule.
   * @param {any} fieldValue - The field value.
   * @param {ValidationContext} context - The validation context.
   */
  static processLengthCheckRule(rule, fieldValue, context) {
    const length = fieldValue ? String(fieldValue).length : 0;
    const { minLength, maxLength } = rule;

    if (
      (minLength && length < minLength) ||
      (maxLength && length > maxLength)
    ) {
      context.addError(rule.fieldId, {
        message: rule.errorMessage,
        type: "LENGTH_CHECK",
        details: { minLength, maxLength, actualLength: length },
      });
    }
  }

  /**
   * Processes a SUGGESTION rule.
   * SUGGESTION rules do not raise errors; they only log suggestions.
   * @param {Object} rule - The SUGGESTION rule.
   * @param {any} fieldValue - The field value.
   * @param {ValidationContext} context - The validation context.
   */
  static processSuggestionRule(rule, fieldValue, context) {
    logger.log(`Suggestion for field "${rule.fieldId}": ${rule.errorMessage}`);
  }
}
