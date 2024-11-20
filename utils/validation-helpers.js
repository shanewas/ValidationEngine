/**
 * Helper functions for validation processes.
 */
export class ValidationHelpers {
  /**
   * Ensures a specific field exists in a validation condition.
   * @param {Object} condition - The validation condition object.
   * @param {string} fieldName - The name of the required field.
   * @throws {Error} - If the required field is missing.
   */
  static ensureConditionField(condition, fieldName) {
    if (!condition || typeof condition !== "object") {
      throw new Error("Invalid condition object provided");
    }

    if (!condition[fieldName]) {
      throw new Error(`Condition is missing required field: ${fieldName}`);
    }
  }

  /**
   * Ensures all required fields exist in a validation condition.
   * @param {Object} condition - The validation condition object.
   * @param {Array<string>} requiredFields - List of required field names.
   * @throws {Error} - If any required field is missing.
   */
  static ensureConditionFields(condition, requiredFields) {
    if (!condition || typeof condition !== "object") {
      throw new Error("Invalid condition object provided");
    }

    if (!Array.isArray(requiredFields)) {
      throw new Error("Required fields must be an array");
    }

    for (const fieldName of requiredFields) {
      if (!condition[fieldName]) {
        throw new Error(`Condition is missing required field: ${fieldName}`);
      }
    }
  }

  /**
   * Normalizes a field value to a standard format for comparison.
   * @param {*} value - The value to normalize.
   * @returns {string|number|null} - Normalized value.
   */
  static normalizeFieldValue(value) {
    if (typeof value === "string") {
      return value.trim();
    }
    if (typeof value === "number" || value === null) {
      return value;
    }
    throw new Error("Unsupported field value type");
  }
}
