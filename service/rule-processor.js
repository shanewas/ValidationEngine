import { ValidationUtils } from "../utils/validation-utils.js";
import { logger } from "../utils/logger.js";

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
   */
  static async processRule(rule, context) {
    logger.log(`Processing rule: ${rule.ruleId || "UNKNOWN_RULE"}`);
    // Validate rule structure
    const validationError = RuleProcessor.validateRuleStructure(rule, context);
    if (validationError) {
      context.addError(rule.fieldId || "UNKNOWN", validationError);
      return; // Skip processing this rule
    }

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
        logger.warn(`Unsupported rule type: ${rule.type}`);
        context.addError(rule.fieldId || "SYSTEM", {
          message: `Unsupported rule type: ${rule.type}`,
          type: "SYSTEM_ERROR",
          details: { ruleId: rule.ruleId, type: rule.type },
        });
    }
  }

  /**
   * Validates the structure of a rule.
   * @param {Object} rule - The rule to validate.
   * @param {ValidationContext} context - The validation context to log errors.
   * @returns {Object|null} - Returns an error object if the rule structure is invalid, otherwise null.
   */
  static validateRuleStructure(rule) {
    if (!rule.type) {
      return {
        message: "Rule type is missing",
        type: "RULE_STRUCTURE_ERROR",
        details: { ruleId: rule.ruleId },
      };
    }
    if (!rule.fieldId) {
      return {
        message: "Rule fieldId is missing",
        type: "RULE_STRUCTURE_ERROR",
        details: { ruleId: rule.ruleId },
      };
    }
    if (!rule.errorMessage && rule.type !== "SUGGESTION") {
      return {
        message: "Rule errorMessage is missing",
        type: "RULE_STRUCTURE_ERROR",
        details: { ruleId: rule.ruleId },
      };
    }
    return null;
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
    try {
      const isValid = ValidationUtils.compare(
        fieldValue,
        rule.operator,
        rule.value
      );
      if (!isValid) {
        context.addError(rule.fieldId, {
          message: rule.errorMessage,
          type: "COMPARISON",
          details: { operator: rule.operator, value: rule.value },
        });
      }
    } catch (error) {
      context.addError(rule.fieldId, {
        message: `Unsupported operator or error: ${rule.operator}`,
        type: "OPERATOR_ERROR",
        details: { operator: rule.operator, error: error.message },
      });
    }
  }

  /**
   * Processes a TYPE_CHECK rule.
   */
  static processTypeCheckRule(rule, fieldValue, context) {
    try {
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
    } catch (error) {
      // Handle unexpected errors (e.g., unsupported types)
      context.addError(rule.fieldId, {
        message: `!!!Type validation error: ${error.message}`,
        type: "TYPE_CHECK_ERROR",
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
    try {
      const regex = new RegExp(rule.value);
      if (!regex.test(fieldValue)) {
        context.addError(rule.fieldId, {
          message: rule.errorMessage,
          type: "REGEX",
          details: { pattern: rule.value, value: fieldValue },
        });
      }
    } catch (error) {
      context.addError(rule.fieldId, {
        message: `Invalid regex pattern: ${error.message}`,
        type: "REGEX_ERROR",
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
   */
  static processSuggestionRule(rule, fieldValue, context) {
    logger.log(`Suggestion for field "${rule.fieldId}": ${rule.errorMessage}`);
  }
}
