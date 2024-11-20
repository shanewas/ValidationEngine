import { logger } from "../utils/logger.js";
/**
 * Helper functions for validation processes.
 */
export class ValidationHelpers {
  /**
   * Ensures a specific field exists in a validation condition.
   * Logs a warning instead of throwing an error if the field is missing.
   * @param {Object} condition - The validation condition object.
   * @param {string} fieldName - The name of the required field.
   * @returns {boolean} - True if the field exists, otherwise logs a warning and returns false.
   */
  static ensureConditionField(condition, fieldName) {
    if (!condition || typeof condition !== "object") {
      logger.warn("Invalid condition object provided");
      return false;
    }

    if (!condition[fieldName]) {
      logger.warn(`Condition is missing required field: ${fieldName}`);
      return false;
    }

    return true;
  }

  /**
   * Ensures all required fields exist in a validation condition.
   * Logs warnings for missing fields instead of throwing errors.
   * @param {Object} condition - The validation condition object.
   * @param {Array<string>} requiredFields - List of required field names.
   * @returns {boolean} - True if all fields exist, otherwise logs warnings and returns false.
   */
  static ensureConditionFields(condition, requiredFields) {
    if (!condition || typeof condition !== "object") {
      logger.warn("Invalid condition object provided");
      return false;
    }

    if (!Array.isArray(requiredFields)) {
      logger.warn("Required fields must be an array");
      return false;
    }

    let allFieldsExist = true;
    for (const fieldName of requiredFields) {
      if (!condition[fieldName]) {
        logger.warn(`Condition is missing required field: ${fieldName}`);
        allFieldsExist = false;
      }
    }

    return allFieldsExist;
  }

  /**
   * Normalizes a field value to a standard format for comparison.
   * Handles unexpected types gracefully by returning `null` for unsupported types.
   * @param {*} value - The value to normalize.
   * @returns {string|number|null} - Normalized value or `null` for unsupported types.
   */
  static normalizeFieldValue(value) {
    if (typeof value === "string") {
      return value.trim();
    }
    if (typeof value === "number" || value === null) {
      return value;
    }
    logger.warn("Unsupported field value type encountered");
    return null;
  }
}
