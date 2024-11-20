import { ValidationContext } from "./validation-context.js";
import { RuleProcessor } from "./rule-processor.js";

/**
 * Main engine for orchestrating the validation process.
 */
export class ValidationEngine {
  /**
   * Validates form data against a set of rules.
   */
  async validate(formData, rules) {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data");
    }

    if (!Array.isArray(rules)) {
      throw new Error("Rules must be an array");
    }

    const context = new ValidationContext(formData);
    const sortedRules = RuleProcessor.sortRules(rules);

    for (const rule of sortedRules) {
      try {
        await RuleProcessor.processRule(rule, context);
      } catch (error) {
        context.addError(rule.ruleId || "UNKNOWN_RULE", {
          fieldId: "SYSTEM",
          message: `Rule processing failed: ${error.message}`,
          type: "SYSTEM_ERROR",
        });
      }
    }

    return context.result.formatResults();
  }
}
