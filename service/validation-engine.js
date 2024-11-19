import { ValidationContext } from "./validation-context.js";
import { RuleProcessor } from "./rule-processor.js";

export class ValidationEngine {
  /**
   * Validates form data against a set of rules.
   * @param {Object} formData - The form data to validate.
   * @param {Array} rules - The validation rules.
   * @returns {Object} - The validation results, including errors and messages.
   */
  async validate(formData, rules) {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data provided");
    }

    if (!Array.isArray(rules)) {
      throw new Error("Rules must be an array");
    }

    const context = new ValidationContext(formData);

    // Sort rules by priority before processing
    const sortedRules = RuleProcessor.sortRules(rules);

    // Process each rule
    for (const rule of sortedRules) {
      try {
        await RuleProcessor.processRule(rule, context);
      } catch (error) {
        // Add system-level errors to context for better traceability
        context.addError(rule.ruleId || "UNKNOWN_RULE", {
          fieldId: "SYSTEM",
          message: `Rule processing failed: ${error.message}`,
          type: "SYSTEM_ERROR",
        });
      }
    }

    return context.getResults();
  }

  /**
   * Validates a single rule against the form data.
   * @param {Object} formData - The form data to validate.
   * @param {Object} rule - The validation rule.
   * @returns {Object} - Partial validation results for the specific rule.
   */
  async validateSingleRule(formData, rule) {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data provided");
    }

    if (!rule || typeof rule !== "object") {
      throw new Error("Invalid rule provided");
    }

    const context = new ValidationContext(formData);

    try {
      await RuleProcessor.processRule(rule, context);
    } catch (error) {
      context.addError(rule.ruleId || "UNKNOWN_RULE", {
        fieldId: "SYSTEM",
        message: `Single rule processing failed: ${error.message}`,
        type: "SYSTEM_ERROR",
      });
    }

    return context.getResults();
  }

  /**
   * Resets the validation state.
   * @param {Object} formData - New form data to reset with.
   * @returns {ValidationContext} - A fresh validation context.
   */
  resetValidation(formData) {
    return new ValidationContext(formData);
  }
}
