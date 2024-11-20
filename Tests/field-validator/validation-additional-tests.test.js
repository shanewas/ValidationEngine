import { ValidationController } from "../../index.js";

describe("Additional Validation Tests", () => {
  let controller;

  beforeAll(() => {
    controller = new ValidationController();
  });

  test("should handle empty form data gracefully", async () => {
    const emptyFormData = {};
    const rules = [
      {
        ruleId: "rule-name-required",
        type: "REQUIRED",
        fieldId: "name",
        errorMessage: "Name is required.",
      },
    ];

    const validationResults = await controller.validateForm(
      emptyFormData,
      rules
    );

    expect(validationResults.hasErrors).toBe(true);
    expect(validationResults.details.name[0].message).toBe("Name is required.");
  });

  test("should validate nested dependencies", async () => {
    const formData = {
      age: { fieldId: "age", value: 20 },
      employmentStatus: { fieldId: "employmentStatus", value: "employed" },
      employer: { fieldId: "employer", value: "" }, // Missing
    };

    const rules = [
      {
        ruleId: "rule-age-required",
        type: "REQUIRED",
        fieldId: "age",
        errorMessage: "Age is required.",
      },
      {
        ruleId: "rule-employment-status-required",
        type: "REQUIRED",
        fieldId: "employmentStatus",
        errorMessage: "Employment status is required.",
      },
      {
        ruleId: "rule-employer-dependency",
        type: "DEPENDENCY",
        fieldId: "employer",
        dependentFieldId: "employmentStatus",
        dependentOperator: "EQUALS",
        dependentValue: "employed",
        operator: "NOT_EMPTY",
        errorMessage:
          "Employer is required if employment status is 'employed'.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);
    expect(validationResults.details.employer[0].message).toBe(
      "Employer is required if employment status is 'employed'."
    );
  });

  test("should validate REGEX rules with complex patterns", async () => {
    const formData = {
      website: { fieldId: "website", value: "http:/invalid-url" }, // Invalid URL
    };

    const rules = [
      {
        ruleId: "rule-website-regex",
        type: "REGEX",
        fieldId: "website",
        value: /^https?:\/\/[^\s$.?#].[^\s]*$/,
        errorMessage: "Invalid URL format.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);
    expect(validationResults.details.website[0].message).toBe(
      "Invalid URL format."
    );
  });

  test("should validate multiple LENGTH_CHECK rules on the same field", async () => {
    const formData = {
      username: { fieldId: "username", value: "a" }, // Too short
    };

    const rules = [
      {
        ruleId: "rule-username-min-length",
        type: "LENGTH_CHECK",
        fieldId: "username",
        minLength: 3,
        errorMessage: "Username must be at least 3 characters long.",
      },
      {
        ruleId: "rule-username-max-length",
        type: "LENGTH_CHECK",
        fieldId: "username",
        maxLength: 15,
        errorMessage: "Username must not exceed 15 characters.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);
    expect(validationResults.details.username[0].message).toBe(
      "Username must be at least 3 characters long."
    );
  });

  test("should validate COMPARISON rules with extreme values", async () => {
    const formData = {
      age: { fieldId: "age", value: 150 }, // Unreasonably high
    };

    const rules = [
      {
        ruleId: "rule-age-max-comparison",
        type: "COMPARISON",
        fieldId: "age",
        operator: "LESS_THAN_OR_EQUAL",
        value: 120,
        errorMessage: "Age must not exceed 120.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);
    expect(validationResults.details.age[0].message).toBe(
      "Age must not exceed 120."
    );
  });

  test("should validate REQUIRED fields in bulk", async () => {
    const formData = {
      field1: { fieldId: "field1", value: "" },
      field2: { fieldId: "field2", value: "" },
      field3: { fieldId: "field3", value: "" },
    };

    const rules = [
      {
        ruleId: "rule-field1-required",
        type: "REQUIRED",
        fieldId: "field1",
        errorMessage: "Field 1 is required.",
      },
      {
        ruleId: "rule-field2-required",
        type: "REQUIRED",
        fieldId: "field2",
        errorMessage: "Field 2 is required.",
      },
      {
        ruleId: "rule-field3-required",
        type: "REQUIRED",
        fieldId: "field3",
        errorMessage: "Field 3 is required.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);
    expect(validationResults.details.field1[0].message).toBe(
      "Field 1 is required."
    );
    expect(validationResults.details.field2[0].message).toBe(
      "Field 2 is required."
    );
    expect(validationResults.details.field3[0].message).toBe(
      "Field 3 is required."
    );
  });

  test("should validate edge case for dependent fields missing", async () => {
    const formData = {
      dependentField: { fieldId: "dependentField", value: "" }, // Missing dependent field
    };

    const rules = [
      {
        ruleId: "rule-dependent-field",
        type: "DEPENDENCY",
        fieldId: "dependentField",
        dependentFieldId: "missingField",
        dependentOperator: "EQUALS",
        dependentValue: "required",
        operator: "NOT_EMPTY",
        errorMessage:
          "Dependent field is required if missingField equals 'required'.",
      },
    ];

    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(false); // Dependency field missing, rule skipped
  });
});
