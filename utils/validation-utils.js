import { OPERATORS } from "../constants/validation-types.js";
import { logger } from "../utils/logger.js";
/**
 * Utility functions for common validation tasks.
 */
export class ValidationUtils {
  /**
   * Checks if a value is empty (null, undefined, empty string, empty object, or empty array).
   * @param {*} value - The value to check.
   * @returns {boolean} - Whether the value is empty.
   */
  static isEmpty(value) {
    if (value === 0) return false; // Special case: 0 is not empty
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object" && value !== null) {
      return Object.keys(value).length === 0; // Empty object
    }
    return value === null || value === undefined || value === ""; // Null, undefined, or empty string
  }

  /**
   * Compares a value with another using the specified operator.
   * Gracefully handles invalid comparisons and unsupported operators.
   * @param {*} value - The value to compare.
   * @param {string} operator - The operator to use for comparison.
   * @param {*} comparisonValue - The value to compare against.
   * @returns {boolean} - The result of the comparison.
   */
  static compare(value, operator, comparisonValue) {
    if (value === null || value === undefined) {
      logger.warn(`Comparison skipped: value is ${value}`);
      return false;
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
            logger.warn(
              "BETWEEN operator requires an array of two values. Comparison skipped."
            );
            return false;
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
          logger.warn(`Unsupported operator: ${operator}`);
          return false;
      }
    } catch (error) {
      logger.error(
        `Comparison error with operator ${operator}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Validates the type of a value against the expected type.
   * Gracefully handles unexpected inputs and unsupported types.
   * @param {*} value - The value to validate.
   * @param {string} expectedType - The expected type.
   * @returns {boolean} - Whether the value matches the expected type.
   */
  static validateType(value, expectedType) {
    if (!expectedType) {
      logger.warn("Expected type must be provided. Validation skipped.");
      return false;
    }

    try {
      switch (expectedType.toLowerCase()) {
        case "string":
          return typeof value === "string";
        case "number":
          return typeof value === "number" && !isNaN(value);
        case "boolean":
          return typeof value === "boolean";
        case "object":
          return (
            typeof value === "object" && value !== null && !Array.isArray(value)
          );
        case "array":
          return Array.isArray(value);
        case "date":
          return value instanceof Date || !isNaN(Date.parse(value));
        default:
          logger.warn(`Unsupported type: ${expectedType}`);
          return false;
      }
    } catch (error) {
      logger.error(`Type validation error: ${error.message}`);
      return false;
    }
  }
}
