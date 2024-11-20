import { ValidationEngine } from "../service/validation-engine.js";
import { logger } from "../utils/logger.js";

logger.disable();

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
    const validationResult = {
      hasErrors: false,
      errorCount: 0,
      details: {},
      summary: [],
      actions: {},
    };

    const addSystemError = (message) => {
      validationResult.hasErrors = true;
      validationResult.errorCount += 1;
      validationResult.details.SYSTEM = [
        {
          message,
          type: "SYSTEM_ERROR",
          action: null,
          actionValue: null,
        },
      ];
      validationResult.summary.push({
        type: "error",
        fieldId: "SYSTEM",
        message,
      });
    };

    // Ensure formData is valid
    if (
      !formData ||
      typeof formData !== "object" ||
      !Object.values(formData).every(
        (field) =>
          field &&
          typeof field === "object" &&
          "fieldId" in field &&
          "value" in field
      )
    ) {
      const errorMessage = "Invalid form data provided";
      addSystemError(errorMessage);

      this.webhook?.trigger({
        event: "validation.error",
        details: validationResult,
      });

      return validationResult;
    }

    // Handle empty rules gracefully
    if (!Array.isArray(rules) || rules.length === 0) {
      return validationResult;
    }

    try {
      const result = await this.engine.validate(formData, rules);

      const event = result.hasErrors
        ? "validation.error"
        : "validation.success";
      this.webhook?.trigger({
        event,
        details: result,
      });

      return result;
    } catch (error) {
      const errorMessage = `Validation failed: ${error.message}`;
      addSystemError(errorMessage);

      this.webhook?.trigger({
        event: "validation.error",
        details: validationResult,
      });

      return validationResult;
    }
  }
}
