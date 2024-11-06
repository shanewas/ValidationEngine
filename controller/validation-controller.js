// controller/validation-controller.js
import { ValidationEngine } from "../service/validation-engine.js";

export class ValidationController {
  constructor() {
    this.engine = new ValidationEngine();
  }

  async validateForm(formData, rules) {
    try {
      return await this.engine.validate(formData, rules);
    } catch (error) {
      console.error("Validation failed:", error);
      throw error;
    }
  }
}
