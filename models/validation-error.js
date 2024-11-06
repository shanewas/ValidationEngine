  // models/validation-error.js
  export class ValidationError {
    constructor(fieldId, message, type, details = {}) {
      this.fieldId = fieldId;
      this.message = message;
      this.type = type;
      this.details = details;
    }
  }
  