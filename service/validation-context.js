import { ValidationResult } from "../models/validation-result.js";
// service/validation-context.js
export class ValidationContext {
  constructor(formData) {
    this.formData = formData;
    this.result = new ValidationResult();
  }

  getFieldValue(fieldId) {
    return this.formData[fieldId]?.value;
  }

  addError(fieldId, error) {
    this.result.addError(fieldId, error);
  }

  getResults() {
    return this.result.formatResults();
  }
}
