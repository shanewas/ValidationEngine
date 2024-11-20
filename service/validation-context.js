import { ValidationResult } from "../models/validation-result.js";
import { logger } from "../utils/logger.js";
/**
 * Context object for managing validation results and intermediate state.
 */
export class ValidationContext {
  constructor(formData) {
    if (!formData || typeof formData !== "object") {
      logger.warn("Invalid or missing form data provided");
      this.formData = {}; // Initialize with an empty object to prevent crashes
    } else {
      this.formData = formData;
    }

    this.result = new ValidationResult(); // Stores validation errors and actions
    this.fieldCache = new Map(); // Cache for quick access to field values
    this.messages = []; // Stores messages triggered by validation actions
  }

  /**
   * Gets a field's value from the form data, using a cache for efficiency.
   * @param {string} fieldId - The ID of the field.
   * @returns {any} - The field value or null if the field does not exist.
   */
  getFieldValue(fieldId) {
    if (!fieldId) {
      logger.warn("Field ID is required but was not provided");
      return null;
    }

    if (this.fieldCache.has(fieldId)) {
      return this.fieldCache.get(fieldId);
    }

    const field = this.formData[fieldId];
    if (!field) {
      logger.warn(`Field with ID "${fieldId}" does not exist in the form data`);
      return null;
    }

    const value = field.value || null;
    this.fieldCache.set(fieldId, value);
    return value;
  }

  /**
   * Sets a field's value in the form data and updates the cache.
   * @param {string} fieldId - The ID of the field.
   * @param {any} value - The new value for the field.
   */
  setFieldValue(fieldId, value) {
    if (!fieldId) {
      logger.warn("Field ID is required but was not provided");
      return;
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
   * @param {string} fieldId - The ID of the field associated with the error.
   * @param {Object} error - The error object with details.
   */
  addError(fieldId, error) {
    if (!fieldId || typeof fieldId !== "string") {
      logger.warn("Invalid field ID for error addition");
      return;
    }

    if (!error || typeof error !== "object" || !error.message) {
      logger.warn(`Invalid error object provided for field "${fieldId}"`);
      return;
    }

    // Use ValidationResult to track errors
    this.result.addError(fieldId, error);
  }

  /**
   * Clears all cached field values.
   */
  clearCache() {
    this.fieldCache.clear();
  }

  /**
   * Retrieves the validation results.
   * @returns {ValidationResult} - The accumulated validation results.
   */
  getResults() {
    return this.result;
  }
}
