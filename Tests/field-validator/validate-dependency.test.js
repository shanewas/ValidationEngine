import { FieldValidator } from "../../service/field-validator.js";
import { ValidationError } from "../../models/validation-error.js";

describe("FieldValidator - Dependency Validation", () => {
  test("should pass when dependent condition is met", () => {
    const context = { formData: { parentField: { value: "yes" } } };
    const field = { fieldId: "childField", value: "childValue" };
    const condition = {
      type: "DEPENDENCY",
      dependentFieldId: "parentField",
      dependentOperator: "EQUALS",
      dependentValue: "yes",
    };

    const result = FieldValidator.validateDependency(field, condition, context);
    expect(result).toBeNull(); // Validation passes
  });

  test("should fail when dependent condition is not met and field is empty", () => {
    const context = { formData: { parentField: { value: "no" } } };
    const field = { fieldId: "childField", value: "" };
    const condition = {
      type: "DEPENDENCY",
      dependentFieldId: "parentField",
      dependentOperator: "EQUALS",
      dependentValue: "yes",
      errorMessage: "Field is required due to dependency",
    };

    const result = FieldValidator.validateDependency(field, condition, context);
    expect(result).toBeInstanceOf(ValidationError); // Should now pass
    expect(result.message).toBe("Field is required due to dependency");
  });

  test("should fail when dependent field is missing", () => {
    const context = { formData: {} };
    const field = { fieldId: "childField", value: "" };
    const condition = {
      type: "DEPENDENCY",
      dependentFieldId: "parentField",
      dependentOperator: "EQUALS",
      dependentValue: "yes",
    };

    const result = FieldValidator.validateDependency(field, condition, context);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe("Dependent field parentField is missing");
  });

  test("should handle null values in dependent field", () => {
    const context = { formData: { parentField: { value: null } } };
    const field = { fieldId: "childField", value: "" };
    const condition = {
      type: "DEPENDENCY",
      dependentFieldId: "parentField",
      dependentOperator: "EQUALS",
      dependentValue: "yes",
    };

    const result = FieldValidator.validateDependency(field, condition, context);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe(
      "Dependent field parentField has an invalid value"
    );
  });

  test("should handle different comparison operators", () => {
    const context = { formData: { parentField: { value: 5 } } };
    const field = { fieldId: "childField", value: "" };
    const condition = {
      type: "DEPENDENCY",
      dependentFieldId: "parentField",
      dependentOperator: "GREATER_THAN",
      dependentValue: 3,
    };

    const result = FieldValidator.validateDependency(field, condition, context);
    expect(result).toBeInstanceOf(ValidationError);
  });
});
