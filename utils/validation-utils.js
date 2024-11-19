import { OPERATORS } from "../constants/validation-types.js";

export class ValidationUtils {
  /**
   * Checks if a value is empty (null, undefined, empty string, or empty array)
   * @param {*} value - The value to check
   * @returns {boolean} - Whether the value is empty
   */
  static isEmpty(value) {
    if (value === 0) return false; // Zero is not empty
    if (Array.isArray(value)) return value.length === 0; // Check for empty arrays
    if (typeof value === "object" && value !== null) return Object.keys(value).length === 0; // Empty object
    return value === null || value === undefined || value === ""; // Null, undefined, or empty string
  }

  /**
   * Compares a value against a comparison value using the specified operator.
   * @param {*} value - The value to validate.
   * @param {string} operator - The operator to use for validation.
   * @param {*} comparisonValue - The value to compare against.
   * @returns {boolean} - The result of the comparison.
   * @throws {Error} - If operator is invalid or comparison fails
   */
  static compare(value, operator, comparisonValue) {
    if (!operator || !Object.values(OPERATORS).includes(operator)) {
      throw new Error(`Invalid operator: ${operator}`);
    }

    // Handle empty values
    if (value === null || value === undefined) {
      return operator === OPERATORS.EMPTY;
    }

    try {
      switch (operator) {
        case OPERATORS.EQUALS:
          return value === comparisonValue;
        case OPERATORS.NOT_EQUALS:
          return value !== comparisonValue;
        case OPERATORS.GREATER_THAN:
          return Number(value) > Number(comparisonValue);
        case OPERATORS.LESS_THAN:
          return Number(value) < Number(comparisonValue);
        case OPERATORS.GREATER_THAN_OR_EQUAL:
          return Number(value) >= Number(comparisonValue);
        case OPERATORS.LESS_THAN_OR_EQUAL:
          return Number(value) <= Number(comparisonValue);
        case OPERATORS.CONTAINS:
          return String(value).includes(String(comparisonValue));
        case OPERATORS.STARTS_WITH:
          return String(value).startsWith(String(comparisonValue));
        case OPERATORS.ENDS_WITH:
          return String(value).endsWith(String(comparisonValue));
        case OPERATORS.BETWEEN:
          if (!Array.isArray(comparisonValue) || comparisonValue.length !== 2) {
            throw new Error('BETWEEN operator requires an array of two values');
          }
          return (
            Number(value) >= Number(comparisonValue[0]) &&
            Number(value) <= Number(comparisonValue[1])
          );
        case OPERATORS.EMPTY:
          return this.isEmpty(value);
        case OPERATORS.NOT_EMPTY:
          return !this.isEmpty(value);
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    } catch (error) {
      throw new Error(`Comparison error: ${error.message}`);
    }
  }

  /**
   * Validates the type of a value against an expected type.
   * @param {*} value - The value to validate.
   * @param {string} expectedType - The expected type of the value.
   * @returns {boolean} - Whether the value matches the expected type.
   * @throws {Error} - If expectedType is invalid
   */
  static validateType(value, expectedType) {
    if (!expectedType) {
      throw new Error('Expected type is required');
    }

    try {
      switch (expectedType.toLowerCase()) {
        case "string":
          return typeof value === "string";
        case "number":
          return typeof value === "number" && !isNaN(value);
        case "boolean":
          return typeof value === "boolean";
        case "date":
          return value instanceof Date || !isNaN(Date.parse(value));
        case "array":
          return Array.isArray(value);
        case "object":
          return (
            typeof value === "object" && value !== null && !Array.isArray(value)
          );
        default:
          throw new Error(`Unsupported type: ${expectedType}`);
      }
    } catch (error) {
      throw new Error(`Type validation error: ${error.message}`);
    }
  }
}
