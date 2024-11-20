import { ValidationEngine } from "../service/validation-engine.js";
import { logger } from "../utils/logger.js";
/**
 * Controller responsible for orchestrating validation flow.
 * Manages communication between the form data and validation engine.
 */
export class ValidationController {
  constructor() {
    this.engine = new ValidationEngine(); // Instance of the validation engine
  }

  /**
   * Validates the provided form data against specified rules.
   * @param {Object} formData - The form data to validate.
   * @param {Array} rules - The validation rules to apply.
   * @returns {Promise<Object>} - The validation results.
   * @throws {Error} - Throws an error if validation fails.
   */
  async validateForm(formData, rules) {
    // Ensure formData is a valid object
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data provided");
    }

    // Ensure rules are a non-empty array
    if (!Array.isArray(rules) || rules.length === 0) {
      throw new Error("Validation rules must be a non-empty array");
    }

    try {
      // Delegate validation to the engine
      return await this.engine.validate(formData, rules);
    } catch (error) {
      console.error("Validation failed:", error.message);
      throw error;
    }
  }
}
