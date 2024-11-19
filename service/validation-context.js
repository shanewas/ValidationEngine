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
    this.messages = []; // To store messages triggered by actions
  }

  /**
   * Gets the value of a field from the form data.
   * @param {string} fieldId - The ID of the field.
   * @returns {*} - The field value or null if not found.
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
   * Sets the value of a field in the form data.
   * @param {string} fieldId - The ID of the field.
   * @param {*} value - The new value for the field.
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

    // Update cache
    this.fieldCache.set(fieldId, value);
  }

  /**
   * Adds an error to the validation results.
   * @param {string} fieldId - The ID of the field with the error.
   * @param {ValidationError} error - The validation error.
   */
  addError(fieldId, error) {
    if (!fieldId || !(error instanceof ValidationError)) {
      throw new Error("Invalid error parameters");
    }

    this.result.addError(fieldId, error);
  }

  /**
   * Adds a message triggered by a validation action.
   * @param {string} fieldId - The ID of the field related to the message.
   * @param {string} message - The message to add.
   */
  addMessage(fieldId, message) {
    if (!fieldId || typeof message !== "string") {
      throw new Error("Invalid message parameters");
    }

    this.messages.push({ fieldId, message });
  }

  /**
   * Gets all validation results, including errors and messages.
   * @returns {Object} - Formatted validation results.
   */
  getResults() {
    const results = this.result.formatResults();
    if (this.messages.length > 0) {
      results.messages = this.messages;
    }
    return results;
  }

  /**
   * Clears the field value cache.
   */
  clearCache() {
    this.fieldCache.clear();
  }

  /**
   * Resets the form data to its initial state.
   */
  resetForm() {
    this.formData = {};
    this.result = new ValidationResult();
    this.clearCache();
    this.messages = [];
  }
}
