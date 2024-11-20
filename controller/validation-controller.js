import { ValidationEngine } from "../service/validation-engine.js";
import { logger } from "../utils/logger.js";

logger.disable();

export class ValidationController {
  constructor() {
    this.engine = new ValidationEngine(); // Instance of the validation engine
  }

  /**
   * Validates a single field against specified rules.
   * @param {Object} field - The field to validate.
   * @param {Array} rules - The validation rules to apply.
   * @returns {Promise<Object>} - Partial validation results for the field.
   */
  async validateField(field, rules) {
    const singleFieldData = [field]; // Wrap the field in an array to reuse the engine
    const filteredRules = rules.filter(
      (rule) => rule.fieldId === field.fieldName
    );

    if (filteredRules.length === 0) {
      return null; // No applicable rules for the field
    }

    return this.engine.validate(singleFieldData, filteredRules);
  }

  /**
   * Validates all fields in formData iteratively.
   * @param {Array} formData - The form data to validate.
   * @param {Array} rules - The validation rules to apply.
   * @returns {Promise<Object>} - The combined validation results.
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
      !Array.isArray(formData) || // Check if formData is an array
      !formData.every(
        (field) =>
          field &&
          typeof field === "object" &&
          "fieldName" in field && // Validate "fieldName" property
          "value" in field // Validate "value" property
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

    // Iterate through each field in formData
    for (const field of formData) {
      try {
        const fieldResult = await this.validateField(field, rules);

        if (fieldResult && fieldResult.hasErrors) {
          validationResult.hasErrors = true;
          validationResult.errorCount += fieldResult.errorCount;

          // Merge field-level details into the overall validation result
          Object.assign(validationResult.details, fieldResult.details);
          validationResult.summary.push(...fieldResult.summary);
          Object.assign(validationResult.actions, fieldResult.actions);
        }
      } catch (error) {
        const errorMessage = `Validation failed for field "${field.fieldName}": ${error.message}`;
        addSystemError(errorMessage);
      }
    }

    // Trigger webhook events
    const event = validationResult.hasErrors
      ? "validation.error"
      : "validation.success";

    this.webhook?.trigger({
      event,
      details: validationResult,
    });

    return validationResult;
  }
}
