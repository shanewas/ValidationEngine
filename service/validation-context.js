// service/validation-context.js
import { ValidationResult } from "../models/validation-result.js";
import { ValidationError } from "../models/validation-error.js";

export class ValidationContext {
  constructor(formData) {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data");
    }

    this.formData = formData;
    this.result = new ValidationResult();
    this.fieldCache = new Map();
  }

  /**
   * Gets the value of a field from the form data
   * @param {string} fieldId - The ID of the field
   * @returns {*} - The field value or null if not found
   */
  getFieldValue(fieldId) {
    if (!fieldId) {
      throw new Error("Field ID is required");
    }

    if (this.fieldCache.has(fieldId)) {
      return this.fieldCache.get(fieldId);
    }

    const field = this.formData[fieldId];
    const value = field ? field.value : null;
    this.fieldCache.set(fieldId, value);
    return value;
  }

  /**
   * Adds an error to the validation results
   * @param {string} fieldId - The ID of the field with the error
   * @param {ValidationError} error - The validation error
   */
  addError(fieldId, error) {
    if (!fieldId || !(error instanceof ValidationError)) {
      throw new Error("Invalid error parameters");
    }

    this.result.addError(fieldId, error);
  }

  /**
   * Gets all validation results
   * @returns {Object} - Formatted validation results
   */
  getResults() {
    return this.result.formatResults();
  }

  /**
   * Clears the field value cache
   */
  clearCache() {
    this.fieldCache.clear();
  }
}
