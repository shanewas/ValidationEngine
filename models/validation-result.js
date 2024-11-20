/**
 * Stores and formats validation results, including errors and actions.
 */
export class ValidationResult {
  constructor() {
    this.errors = new Map(); // Tracks validation errors by field ID
    this.actions = new Map(); // Tracks actions to apply post-validation
  }

  /**
   * Adds an error to the results.
   * @param {string} fieldId - The field associated with the error.
   * @param {ValidationError} error - The error object.
   */
  addError(fieldId, error) {
    if (!fieldId || typeof fieldId !== "string") {
      console.warn("Invalid field ID for error. Error not added.");
      return;
    }
    if (!error || typeof error !== "object" || !error.message) {
      console.warn("Invalid error object provided. Error not added.");
      return;
    }

    if (!this.errors.has(fieldId)) {
      this.errors.set(fieldId, []);
    }

    // Avoid duplicate errors
    const existingErrors = this.errors.get(fieldId);
    if (!existingErrors.some((e) => e.message === error.message)) {
      existingErrors.push(error);
    }
  }

  /**
   * Adds an action for a specific field.
   * @param {string} fieldId - The field associated with the action.
   * @param {string} action - The action type (e.g., CLEAR_FORMFIELD).
   * @param {any} actionValue - Optional value associated with the action.
   */
  addAction(fieldId, action, actionValue = null) {
    if (!fieldId || typeof fieldId !== "string") {
      console.warn("Invalid field ID for action. Action not added.");
      return;
    }
    if (!action || typeof action !== "string") {
      console.warn("Invalid action type. Action not added.");
      return;
    }

    if (!this.actions.has(fieldId)) {
      this.actions.set(fieldId, []);
    }

    this.actions.get(fieldId).push({ action, actionValue });
  }

  /**
   * Formats the validation results for external use.
   * @returns {Object} - Formatted validation results.
   */
  formatResults() {
    const result = {
      hasErrors: this.errors.size > 0,
      errorCount: 0,
      details: {}, // Detailed error data by field
      summary: [], // Summary of all errors
      actions: {}, // Actions to apply
    };

    // Process errors
    this.errors.forEach((errors, fieldId) => {
      result.errorCount += errors.length;
      result.details[fieldId] = errors.map((error) => ({
        message: error.message,
        type: error.type || "UNKNOWN",
        fieldType: error.fieldType || null,
        details: error.details || {},
        action: error.action || null,
        actionValue: error.actionValue || null,
      }));

      // Add to summary
      errors.forEach((error) => {
        result.summary.push({
          type: "error",
          fieldId,
          message: error.message,
        });
      });
    });

    // Process actions
    this.actions.forEach((actions, fieldId) => {
      result.actions[fieldId] = actions.map((action) => ({
        action: action.action,
        actionValue: action.actionValue,
      }));
    });

    return result;
  }
}
