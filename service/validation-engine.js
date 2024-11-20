import { ValidationContext } from "./validation-context.js";
import { RuleProcessor } from "./rule-processor.js";
import { logger } from "../utils/logger.js";

/**
 * Main engine for orchestrating the validation process.
 */
export class ValidationEngine {
  /**
   * Validates form data against a set of rules.
   */
  async validate(formData, rules) {
    // Validate and assign default rule IDs
    const processedRules = rules.map((rule, index) => ({
      ...rule,
      ruleId: rule.ruleId || `default-rule-${index}`,
    }));

    const context = new ValidationContext(formData);
    const sortedRules = RuleProcessor.sortRules(processedRules);

    for (const rule of sortedRules) {
      logger.log(`Processing rule: ${rule.ruleId}`);
      try {
        await RuleProcessor.processRule(rule, context);
        logger.log(`Successfully processed rule: ${rule.ruleId}`);
      } catch (error) {
        logger.error(`Error processing rule: ${rule.ruleId}`, error);
        context.addError(rule.ruleId, {
          fieldId: rule.fieldId || "SYSTEM",
          message: `Rule processing failed: ${error.message}`,
          type: "SYSTEM_ERROR",
        });
      }
    }

    return context.result.formatResults();
  }
}

/**
 * Validates the structure of rules.
 * @param {Array} rules - The validation rules to check.
 * @returns {Array} - An array of validation results for each rule.
 */
function validateRules(rules) {
  return rules.map((rule, index) => {
    const errors = [];
    if (!rule.type) errors.push("Rule type is missing");
    if (!rule.fieldId) errors.push("Field ID is missing");
    if (!rule.errorMessage) errors.push("Error message is missing");

    return {
      index,
      rule,
      valid: errors.length === 0,
      errors,
    };
  });
}
