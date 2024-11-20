import { ValidationController } from "../../index.js";

describe("Dependency Edge Case Tests", () => {
  let controller;

  beforeAll(() => {
    controller = new ValidationController();
  });

  test("should validate multi-level dependencies", async () => {
    const formData = {
      level1: { fieldId: "level1", value: "trigger" },
      level2: { fieldId: "level2", value: "" }, // Missing but required by level1
      level3: { fieldId: "level3", value: "" }, // Missing but required by level2
    };

    const rules = [
      {
        ruleId: "rule-level2-dependency",
        type: "DEPENDENCY",
        fieldId: "level2",
        dependentFieldId: "level1",
        dependentOperator: "EQUALS",
        dependentValue: "trigger",
        operator: "NOT_EMPTY",
        errorMessage: "Level 2 is required when Level 1 equals 'trigger'.",
      },
      {
        ruleId: "rule-level3-dependency",
        type: "DEPENDENCY",
        fieldId: "level3",
        dependentFieldId: "level2",
        dependentOperator: "NOT_EMPTY",
        operator: "NOT_EMPTY",
        errorMessage: "Level 3 is required when Level 2 is not empty.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);
    const errorMessages = validationResults.summary.map(
      (error) => error.message
    );

    expect(errorMessages).toContain(
      "Level 2 is required when Level 1 equals 'trigger'."
    );
    expect(errorMessages).not.toContain(
      "Level 3 is required when Level 2 is not empty."
    );
  });

  test("should handle circular dependencies gracefully", async () => {
    const formData = {
      fieldA: { fieldId: "fieldA", value: "" },
      fieldB: { fieldId: "fieldB", value: "" },
    };

    const rules = [
      {
        ruleId: "rule-fieldA-dependency",
        type: "DEPENDENCY",
        fieldId: "fieldA",
        dependentFieldId: "fieldB",
        dependentOperator: "NOT_EMPTY",
        operator: "NOT_EMPTY",
        errorMessage: "Field A is required if Field B is not empty.",
      },
      {
        ruleId: "rule-fieldB-dependency",
        type: "DEPENDENCY",
        fieldId: "fieldB",
        dependentFieldId: "fieldA",
        dependentOperator: "NOT_EMPTY",
        operator: "NOT_EMPTY",
        errorMessage: "Field B is required if Field A is not empty.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    // Expect no errors since the circular dependency is gracefully handled
    expect(validationResults.hasErrors).toBe(false);

    // Ensure that circular dependencies are skipped or handled
    expect(validationResults.details?.fieldA ?? []).toHaveLength(0);
    expect(validationResults.details?.fieldB ?? []).toHaveLength(0);
  });
});
