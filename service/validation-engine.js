// service/validation-engine.js
import { ValidationContext } from "./validation-context.js";
import { RuleProcessor } from "./rule-processor.js";

export class ValidationEngine {
  constructor() {
    this.context = null;
  }

  async validate(formData, rules) {
    try {
      this.context = new ValidationContext(formData);
      const sortedRules = RuleProcessor.sortRules(rules);

      for (const rule of sortedRules) {
        await RuleProcessor.processRule(rule, this.context);
      }

      return this.context.getResults();
    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      throw new Error("Validation process failed");
    }
  }
}
