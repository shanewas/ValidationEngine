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
    if (!this.errors.has(fieldId)) {
      this.errors.set(fieldId, []);
    }
    this.errors.get(fieldId).push(error);

    // Automatically track actions if specified in the error
    if (error.action) {
      this.addAction(fieldId, error.action, error.actionValue);
    }
  }

  /**
   * Adds an action for a specific field.
   * @param {string} fieldId - The field associated with the action.
   * @param {string} action - The action type (e.g., CLEAR_FORMFIELD).
   * @param {any} actionValue - Optional value associated with the action.
   */
  addAction(fieldId, action, actionValue = null) {
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
        type: error.type,
        fieldType: error.fieldType,
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
      result.actions[fieldId] = actions;
    });

    return result;
  }
}
