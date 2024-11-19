import { ValidationUtils } from "../../utils/validation-utils.js";
import { OPERATORS } from "../../constants/validation-types.js";

describe("ValidationUtils", () => {
  describe("compare method", () => {
    test("should handle EQUALS operator", () => {
      expect(ValidationUtils.compare(5, OPERATORS.EQUALS, 5)).toBe(true);
      expect(ValidationUtils.compare(5, OPERATORS.EQUALS, 3)).toBe(false);
    });

    test("should handle NOT_EQUALS operator", () => {
      expect(ValidationUtils.compare(5, OPERATORS.NOT_EQUALS, 3)).toBe(true);
      expect(ValidationUtils.compare(5, OPERATORS.NOT_EQUALS, 5)).toBe(false);
    });

    test("should handle GREATER_THAN operator", () => {
      expect(ValidationUtils.compare(5, OPERATORS.GREATER_THAN, 3)).toBe(true);
      expect(ValidationUtils.compare(5, OPERATORS.GREATER_THAN, 5)).toBe(false);
    });

    test("should handle LESS_THAN operator", () => {
      expect(ValidationUtils.compare(3, OPERATORS.LESS_THAN, 5)).toBe(true);
      expect(ValidationUtils.compare(5, OPERATORS.LESS_THAN, 5)).toBe(false);
    });

    test("should handle GREATER_THAN_OR_EQUAL operator", () => {
      expect(
        ValidationUtils.compare(5, OPERATORS.GREATER_THAN_OR_EQUAL, 5)
      ).toBe(true);
      expect(
        ValidationUtils.compare(6, OPERATORS.GREATER_THAN_OR_EQUAL, 5)
      ).toBe(true);
      expect(
        ValidationUtils.compare(4, OPERATORS.GREATER_THAN_OR_EQUAL, 5)
      ).toBe(false);
    });

    test("should handle LESS_THAN_OR_EQUAL operator", () => {
      expect(ValidationUtils.compare(5, OPERATORS.LESS_THAN_OR_EQUAL, 5)).toBe(
        true
      );
      expect(ValidationUtils.compare(4, OPERATORS.LESS_THAN_OR_EQUAL, 5)).toBe(
        true
      );
      expect(ValidationUtils.compare(6, OPERATORS.LESS_THAN_OR_EQUAL, 5)).toBe(
        false
      );
    });

    test("should handle CONTAINS operator", () => {
      expect(ValidationUtils.compare("hello", OPERATORS.CONTAINS, "ell")).toBe(
        true
      );
      expect(
        ValidationUtils.compare("hello", OPERATORS.CONTAINS, "world")
      ).toBe(false);
    });

    test("should handle STARTS_WITH operator", () => {
      expect(
        ValidationUtils.compare("hello", OPERATORS.STARTS_WITH, "he")
      ).toBe(true);
      expect(
        ValidationUtils.compare("hello", OPERATORS.STARTS_WITH, "lo")
      ).toBe(false);
    });

    test("should handle ENDS_WITH operator", () => {
      expect(ValidationUtils.compare("hello", OPERATORS.ENDS_WITH, "lo")).toBe(
        true
      );
      expect(ValidationUtils.compare("hello", OPERATORS.ENDS_WITH, "he")).toBe(
        false
      );
    });

    test("should handle BETWEEN operator", () => {
      expect(ValidationUtils.compare(5, OPERATORS.BETWEEN, [3, 7])).toBe(true);
      expect(ValidationUtils.compare(2, OPERATORS.BETWEEN, [3, 7])).toBe(false);
      expect(() => ValidationUtils.compare(5, OPERATORS.BETWEEN, 7)).toThrow(
        "BETWEEN operator requires an array of exactly two values"
      );
    });

    test("should handle EMPTY operator", () => {
      expect(ValidationUtils.compare("", OPERATORS.EMPTY)).toBe(true);
      expect(ValidationUtils.compare([], OPERATORS.EMPTY)).toBe(true);
      expect(ValidationUtils.compare({}, OPERATORS.EMPTY)).toBe(true);
      expect(ValidationUtils.compare(0, OPERATORS.EMPTY)).toBe(false);
    });

    test("should handle NOT_EMPTY operator", () => {
      expect(ValidationUtils.compare("text", OPERATORS.NOT_EMPTY)).toBe(true);
      expect(ValidationUtils.compare(123, OPERATORS.NOT_EMPTY)).toBe(true);
      expect(ValidationUtils.compare("", OPERATORS.NOT_EMPTY)).toBe(false);
    });

    test("should throw for unsupported operators", () => {
      expect(() =>
        ValidationUtils.compare(5, "UNSUPPORTED_OPERATOR", 5)
      ).toThrow("Unsupported operator: UNSUPPORTED_OPERATOR");
    });
  });

  describe("validateType method", () => {
    test("should validate string type", () => {
      expect(ValidationUtils.validateType("Hello", "string")).toBe(true);
      expect(ValidationUtils.validateType(123, "string")).toBe(false);
    });

    test("should validate number type", () => {
      expect(ValidationUtils.validateType(123, "number")).toBe(true);
      expect(ValidationUtils.validateType("Hello", "number")).toBe(false);
      expect(ValidationUtils.validateType(NaN, "number")).toBe(false);
    });

    test("should validate boolean type", () => {
      expect(ValidationUtils.validateType(true, "boolean")).toBe(true);
      expect(ValidationUtils.validateType(false, "boolean")).toBe(true);
      expect(ValidationUtils.validateType("true", "boolean")).toBe(false);
    });

    test("should validate object type", () => {
      expect(ValidationUtils.validateType({}, "object")).toBe(true);
      expect(ValidationUtils.validateType(null, "object")).toBe(false);
      expect(ValidationUtils.validateType([], "object")).toBe(false);
    });

    test("should validate array type", () => {
      expect(ValidationUtils.validateType([], "array")).toBe(true);
      expect(ValidationUtils.validateType({}, "array")).toBe(false);
      expect(ValidationUtils.validateType(null, "array")).toBe(false);
    });

    test("should validate date type", () => {
      expect(ValidationUtils.validateType("2024-01-01", "date")).toBe(true);
      expect(ValidationUtils.validateType(new Date(), "date")).toBe(true);
      expect(ValidationUtils.validateType("invalid-date", "date")).toBe(false);
    });

    test("should throw for unsupported types", () => {
      expect(() =>
        ValidationUtils.validateType("Hello", "unsupported")
      ).toThrow("Unsupported type: unsupported");
    });
  });

  describe("isEmpty method", () => {
    test("should handle empty values", () => {
      expect(ValidationUtils.isEmpty(null)).toBe(true);
      expect(ValidationUtils.isEmpty(undefined)).toBe(true);
      expect(ValidationUtils.isEmpty("")).toBe(true);
      expect(ValidationUtils.isEmpty([])).toBe(true);
      expect(ValidationUtils.isEmpty({})).toBe(true);
    });

    test("should handle non-empty values", () => {
      expect(ValidationUtils.isEmpty(0)).toBe(false);
      expect(ValidationUtils.isEmpty("text")).toBe(false);
      expect(ValidationUtils.isEmpty([1, 2, 3])).toBe(false);
      expect(ValidationUtils.isEmpty({ key: "value" })).toBe(false);
    });
  });
});
