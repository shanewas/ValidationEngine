import { OPERATORS } from "../constants/validation-types.js";

export class ValidationUtils {
  static isEmpty(value) {
    if (value === 0) return false;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object" && value !== null)
      return Object.keys(value).length === 0;
    return value === null || value === undefined || value === "";
  }

  static compare(value, operator, comparisonValue) {
    switch (operator) {
      case OPERATORS.EQUALS:
        return value === comparisonValue;
      case OPERATORS.NOT_EQUALS:
        return value !== comparisonValue;
      case OPERATORS.GREATER_THAN:
        return Number(value) > Number(comparisonValue);
      case OPERATORS.LESS_THAN:
        return Number(value) < Number(comparisonValue);
      default:
        throw new Error(`Unsupported operator: ${operator}`);
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
      default:
        throw new Error(`Unsupported type: ${expectedType}`);
    }
  }
}
