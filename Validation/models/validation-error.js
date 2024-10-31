// models/validation-error.js
export class ValidationError extends Error {
    constructor(fieldId, message, type, details = {}) {
      super(message);
      this.name = 'ValidationError';
      this.fieldId = fieldId;
      this.type = type;
      this.details = details;
      this.pdfId = details.pdfId;
      this.page = details.page;
    }
  }
  