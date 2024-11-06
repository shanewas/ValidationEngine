// utils/validation-utils.js
import { OPERATORS } from "../constants/validation-types.js";

export class ValidationUtils {
  static compare(value, operator, comparisonValue) {
    if (value === null || value === undefined) return false;

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
          return (
            Array.isArray(comparisonValue) &&
            Number(value) >= Number(comparisonValue[0]) &&
            Number(value) <= Number(comparisonValue[1])
          );
        case OPERATORS.EMPTY:
          return !value && value !== 0;
        case OPERATORS.NOT_EMPTY:
          return !!value || value === 0;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Comparison error: ${error.message}`);
      return false;
    }
  }

  static validateType(value, expectedType) {
    try {
      switch (expectedType.toLowerCase()) {
        case "string":
          return typeof value === "string";
        case "number":
          return typeof value === "number" && !isNaN(value);
        case "boolean":
          return typeof value === "boolean";
        case "date":
          return !isNaN(Date.parse(value));
        case "array":
          return Array.isArray(value);
        case "object":
          return (
            typeof value === "object" && value !== null && !Array.isArray(value)
          );
        default:
          return false;
      }
    } catch (error) {
      console.error(`Type validation error: ${error.message}`);
      return false;
    }
  }
}
