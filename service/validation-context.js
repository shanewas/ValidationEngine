import { ValidationResult } from "../models/validation-result.js";
import { logger } from "../utils/logger.js";

/**
 * Context object for managing validation results and intermediate state.
 */
export class ValidationContext {
  constructor(formData) {
    if (!Array.isArray(formData)) {
      logger.warn("Invalid or missing form data provided. Expected an array.");
      this.formData = []; // Initialize with an empty array to prevent crashes
    } else {
      this.formData = formData;
    }

    this.result = new ValidationResult(); // Stores validation errors and actions
    this.fieldCache = new Map(); // Cache for quick access to field values
    this.messages = []; // Stores messages triggered by validation actions
  }

  /**
   * Gets a field's value from the form data, using a cache for efficiency.
   * @param {string} fieldName - The name of the field.
   * @returns {any} - The field value or null if the field does not exist.
   */
  getFieldValue(fieldName) {
    if (!fieldName) {
      logger.warn("Field name is required but was not provided.");
      return null;
    }

    if (this.fieldCache.has(fieldName)) {
      return this.fieldCache.get(fieldName);
    }

    const field = this.formData.find((f) => f.fieldName === fieldName);
    if (!field) {
      logger.warn(
        `Field with name "${fieldName}" does not exist in the form data.`
      );
      return null;
    }

    const value = field.value || null;
    this.fieldCache.set(fieldName, value);
    return value;
  }

  /**
   * Sets a field's value in the form data and updates the cache.
   * @param {string} fieldName - The name of the field.
   * @param {any} value - The new value for the field.
   */
  setFieldValue(fieldName, value) {
    if (!fieldName) {
      logger.warn("Field name is required but was not provided.");
      return;
    }

    let field = this.formData.find((f) => f.fieldName === fieldName);
    if (!field) {
      field = { fieldName, value };
      this.formData.push(field);
    } else {
      field.value = value;
    }

    this.fieldCache.set(fieldName, value);
  }

  /**
   * Adds an error to the validation results.
   * @param {string} fieldName - The name of the field associated with the error.
   * @param {Object} error - The error object with details.
   */
  addError(fieldName, error) {
    if (!fieldName || typeof fieldName !== "string") {
      logger.warn("Invalid field name for error addition.");
      return;
    }

    if (!error || typeof error !== "object" || !error.message) {
      logger.warn(`Invalid error object provided for field "${fieldName}".`);
      return;
    }

    // Use ValidationResult to track errors
    this.result.addError(fieldName, error);
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
