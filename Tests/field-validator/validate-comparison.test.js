import { FieldValidator } from "../../service/field-validator.js";
import { ValidationError } from "../../models/validation-error.js";

describe("FieldValidator - Comparison Validation", () => {
  test("should pass when value is greater", () => {
    const field = { fieldId: "age", value: 30 };
    const condition = {
      type: "COMPARISON",
      operator: "GREATER_THAN",
      value: 18,
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeNull();
  });

  test("should fail when value is not greater", () => {
    const field = { fieldId: "age", value: 10 };
    const condition = {
      type: "COMPARISON",
      operator: "GREATER_THAN",
      value: 18,
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });

  test("should pass when value is equal for GREATER_THAN_OR_EQUAL", () => {
    const field = { fieldId: "age", value: 18 };
    const condition = {
      type: "COMPARISON",
      operator: "GREATER_THAN_OR_EQUAL",
      value: 18,
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeNull();
  });

  test("should fail when value is less for GREATER_THAN_OR_EQUAL", () => {
    const field = { fieldId: "age", value: 17 };
    const condition = {
      type: "COMPARISON",
      operator: "GREATER_THAN_OR_EQUAL",
      value: 18,
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });

  test("should pass when value is within range for BETWEEN", () => {
    const field = { fieldId: "age", value: 25 };
    const condition = {
      type: "COMPARISON",
      operator: "BETWEEN",
      value: [20, 30],
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeNull();
  });

  test("should fail when value is outside range for BETWEEN", () => {
    const field = { fieldId: "age", value: 35 };
    const condition = {
      type: "COMPARISON",
      operator: "BETWEEN",
      value: [20, 30],
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });

  test("should pass when value matches EQUALS", () => {
    const field = { fieldId: "age", value: 18 };
    const condition = { type: "COMPARISON", operator: "EQUALS", value: 18 };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeNull();
  });

  test("should fail when value does not match EQUALS", () => {
    const field = { fieldId: "age", value: 20 };
    const condition = { type: "COMPARISON", operator: "EQUALS", value: 18 };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });

  test("should pass when value is less for LESS_THAN", () => {
    const field = { fieldId: "age", value: 15 };
    const condition = { type: "COMPARISON", operator: "LESS_THAN", value: 18 };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeNull();
  });

  test("should fail when value is not less for LESS_THAN", () => {
    const field = { fieldId: "age", value: 18 };
    const condition = { type: "COMPARISON", operator: "LESS_THAN", value: 18 };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });

  test("should fail for unsupported operator", () => {
    const field = { fieldId: "age", value: 18 };
    const condition = {
      type: "COMPARISON",
      operator: "UNSUPPORTED",
      value: 18,
    };
    expect(() =>
      FieldValidator.validateComparison(field, condition, {})
    ).toThrow("Unsupported operator: UNSUPPORTED");
  });

  test("should fail when value is null", () => {
    const field = { fieldId: "age", value: null };
    const condition = {
      type: "COMPARISON",
      operator: "GREATER_THAN",
      value: 18,
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });

  test("should fail when value is undefined", () => {
    const field = { fieldId: "age", value: undefined };
    const condition = {
      type: "COMPARISON",
      operator: "GREATER_THAN",
      value: 18,
    };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain("comparison failed");
  });
});
