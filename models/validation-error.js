// models/validation-error.js
export class ValidationError {
  constructor(fieldId, message, type, details = {}, fieldType = null) {
    this.fieldId = fieldId;
    this.message = message;
    this.type = type;
    this.details = details;
    this.fieldType = fieldType;
  }
}
