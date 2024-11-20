import { ValidationController } from "../../index.js";
import { ValidationUtils } from "../../utils/validation-utils.js";

describe("Custom Operators", () => {
  beforeAll(() => {
    ValidationUtils.addCustomOperator("INCLUDES", (value, comparisonValue) => {
      return Array.isArray(comparisonValue) && comparisonValue.includes(value);
    });
    expect(ValidationUtils.customOperators.has("INCLUDES")).toBe(true);
  });

  test("should validate using custom 'INCLUDES' operator", () => {
    expect(
      ValidationUtils.compare("apple", "INCLUDES", [
        "apple",
        "banana",
        "orange",
      ])
    ).toBe(true);
  });

  test("should fail validation if value is not included", () => {
    expect(
      ValidationUtils.compare("grape", "INCLUDES", [
        "apple",
        "banana",
        "orange",
      ])
    ).toBe(false);
  });

  test("should throw an error for unsupported operators", () => {
    expect(() => {
      ValidationUtils.compare("value", "UNSUPPORTED_OPERATOR", []);
    }).toThrow("Unsupported operator: UNSUPPORTED_OPERATOR");
  });

  test("should validate rule using custom 'INCLUDES' operator", async () => {
    const controller = new ValidationController();
    const formData = {
      fruit: { fieldId: "fruit", value: "apple" },
    };

    const rules = [
      {
        ruleId: "rule-1",
        fieldId: "fruit",
        operator: "INCLUDES",
        value: ["apple", "banana", "orange"],
        errorMessage: "The fruit must be one of the allowed values.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(false);
  });
});
