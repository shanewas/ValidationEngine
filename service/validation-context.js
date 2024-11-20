import { ValidationResult } from "../models/validation-result.js";
import { ValidationError } from "../models/validation-error.js";

/**
 * Context object for managing validation results and intermediate state.
 */
export class ValidationContext {
  constructor(formData) {
    if (!formData || typeof formData !== "object") {
      throw new Error("Invalid form data");
    }

    this.formData = formData;
    this.result = new ValidationResult();
    this.fieldCache = new Map();
    this.messages = []; // Stores messages triggered by validation actions
  }

  /**
   * Gets a field's value from the form data, using a cache for efficiency.
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
   * Sets a field's value in the form data and updates the cache.
   */
  setFieldValue(fieldId, value) {
    if (!fieldId) {
      throw new Error("Field ID is required");
    }

    if (!this.formData[fieldId]) {
      this.formData[fieldId] = { fieldId, value };
    } else {
      this.formData[fieldId].value = value;
    }

    this.fieldCache.set(fieldId, value);
  }

  /**
   * Adds an error to the validation results.
   */
  addError(fieldId, error) {
    if (!fieldId || !(error instanceof ValidationError)) {
      throw new Error("Invalid error parameters");
    }

    this.result.addError(fieldId, error);
  }

  /**
   * Clears all cached field values.
   */
  clearCache() {
    this.fieldCache.clear();
  }
}
