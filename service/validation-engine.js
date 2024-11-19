// service/validation-engine.js
import { ValidationContext } from "./validation-context.js";
import { RuleProcessor } from "./rule-processor.js";

export class ValidationEngine {
  async validate(formData, rules) {
    const context = new ValidationContext(formData);

    const sortedRules = RuleProcessor.sortRules(rules);
    for (const rule of sortedRules) {
      await RuleProcessor.processRule(rule, context);
    }

    return context.getResults();
  }
}
