import { ValidationEngine } from "../service/validation-engine.js";
import { logger } from "../utils/logger.js";

logger.disable();

export class ValidationController {
  constructor() {
    this.engine = new ValidationEngine(); // Instance of the validation engine
  }

  /**
   * Generator function to iterate through formData one field at a time.
   * @param {Array} formData - The form data array to iterate over.
   * @returns {Generator} - A generator that yields fields one by one.
   */
  *fieldIterator(formData) {
    if (!Array.isArray(formData)) {
      throw new Error("formData must be an array.");
    }
    for (const field of formData) {
      yield field; // Yields one field at a time
    }
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

    if (!Array.isArray(formData)) {
      const errorMessage = "Invalid form data format. Expected an array.";
      addSystemError(errorMessage);
      return validationResult;
    }

    const fieldIterator = this.fieldIterator(formData);
    let currentField = fieldIterator.next();

    while (!currentField.done) {
      const field = currentField.value;
      try {
        const fieldResult = await this.validateField(field, rules);

        if (fieldResult?.hasErrors) {
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

      currentField = fieldIterator.next(); // Move to the next field
    }

    return validationResult;
  }
}
