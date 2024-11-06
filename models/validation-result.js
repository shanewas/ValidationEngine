 // models/validation-result.js
 export class ValidationResult {
  constructor() {
    this.errors = new Map();
  }

  addError(fieldId, error) {
    if (!this.errors.has(fieldId)) {
      this.errors.set(fieldId, []);
    }
    this.errors.get(fieldId).push(error);
  }

  formatResults() {
    const result = {
      hasErrors: this.errors.size > 0,
      errorCount: 0,
      details: {},
      summary: []
    };

    this.errors.forEach((errors, fieldId) => {
      result.errorCount += errors.length;
      result.details[fieldId] = errors.map(error => ({
        message: error.message,
        type: error.type,
        details: error.details || {}
      }));
      
      errors.forEach(error => {
        result.summary.push({
          type: 'error',
          fieldId,
          message: error.message
        });
      });
    });

    return result;
  }
}