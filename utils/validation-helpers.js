export class ValidationHelpers {
  /**
   * Ensures that a required field exists in a validation condition.
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
   * Ensures that a condition contains all required fields.
   * @param {Object} condition - The validation condition object.
   * @param {Array<string>} requiredFields - The list of required field names.
   * @throws {Error} - If any required field is missing.
   */
  static ensureConditionFields(condition, requiredFields) {
    if (!condition || typeof condition !== "object") {
      throw new Error("Invalid condition object provided");
    }

    if (!Array.isArray(requiredFields)) {
      throw new Error("Required fields must be an array of field names");
    }

    for (const fieldName of requiredFields) {
      if (!condition[fieldName]) {
        throw new Error(`Condition is missing required field: ${fieldName}`);
      }
    }
  }
}
