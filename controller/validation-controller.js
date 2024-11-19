import { ValidationEngine } from "../service/validation-engine.js";

export class ValidationController {
  constructor() {
    this.engine = new ValidationEngine();
  }

  /**
   * Validates the provided form data against the specified rules.
   * @param {Object} formData - The form data to validate.
   * @param {Array} rules - The validation rules to apply.
   * @returns {Promise<Object>} - The validation results.
   * @throws {Error} - Throws an error if validation fails.
   */
  async validateForm(formData, rules) {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data provided");
    }

    if (!Array.isArray(rules) || rules.length === 0) {
      throw new Error("Validation rules must be a non-empty array");
    }

    try {
      return await this.engine.validate(formData, rules);
    } catch (error) {
      console.error("Validation failed:", error.message);
      throw error;
    }
  }
}
