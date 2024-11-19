export class ValidationResult {
  constructor() {
    this.errors = new Map();
    this.actions = new Map(); // To track actions to be applied post-validation
  }

  addError(fieldId, error) {
    if (!this.errors.has(fieldId)) {
      this.errors.set(fieldId, []);
    }
    this.errors.get(fieldId).push(error);

    // Automatically track actions if defined in the error
    if (error.action) {
      this.addAction(fieldId, error.action, error.actionValue);
    }
  }

  addAction(fieldId, action, actionValue = null) {
    if (!this.actions.has(fieldId)) {
      this.actions.set(fieldId, []);
    }
    this.actions.get(fieldId).push({ action, actionValue });
  }

  formatResults() {
    const result = {
      hasErrors: this.errors.size > 0,
      errorCount: 0,
      details: {},
      summary: [],
      actions: {},
    };

    // Format errors
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

      errors.forEach((error) => {
        result.summary.push({
          type: "error",
          fieldId,
          message: error.message,
        });
      });
    });

    // Format actions
    this.actions.forEach((actions, fieldId) => {
      result.actions[fieldId] = actions;
    });

    return result;
  }
}
