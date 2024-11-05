import { OPERATORS } from "../constants/validation-types.js";
// utils/validation-utils.js
export class ValidationUtils {
  static compare(value, operator, comparisonValue) {
    if (value === null || value === undefined) return false;

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
      case OPERATORS.BEFORE:
        return new Date(value) < new Date(comparisonValue);
      case OPERATORS.AFTER:
        return new Date(value) > new Date(comparisonValue);
      default:
        return false;
    }
  }

  static validateType(value, expectedType) {
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
  }
}
