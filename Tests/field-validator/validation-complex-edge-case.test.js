import { ValidationController } from "../../index.js";

describe("Complex Edge Case Validation Tests", () => {
  let controller;

  beforeAll(() => {
    controller = new ValidationController();
  });

  const formData = {
    name: { fieldId: "name", value: "Jo" }, // Too short
    age: { fieldId: "age", value: "17" }, // String, less than required
    email: { fieldId: "email", value: "invalid-email" }, // Invalid format
    phone: { fieldId: "phone", value: "123-4567-890" }, // Incorrect format
    experience: { fieldId: "experience", value: 3 }, // Valid
    references: { fieldId: "references", value: "" }, // Missing but required
    preferredJobRole: { fieldId: "preferredJobRole", value: "" }, // Missing but required
    coverLetter: { fieldId: "coverLetter", value: "" }, // Not required here
  };

  const rules = [
    // Name validation
    {
      ruleId: "rule-name-required",
      type: "REQUIRED",
      fieldId: "name",
      errorMessage: "Name is required.",
    },
    {
      ruleId: "rule-name-length",
      type: "LENGTH_CHECK",
      fieldId: "name",
      minLength: 3,
      maxLength: 50,
      errorMessage: "Name must be between 3 and 50 characters.",
    },

    // Age validation
    {
      ruleId: "rule-age-required",
      type: "REQUIRED",
      fieldId: "age",
      errorMessage: "Age is required.",
    },
    {
      ruleId: "rule-age-type-check",
      type: "TYPE_CHECK",
      fieldId: "age",
      expectedType: "number",
      errorMessage: "Age must be a number.",
    },
    {
      ruleId: "rule-age-comparison",
      type: "COMPARISON",
      fieldId: "age",
      operator: "GREATER_THAN_OR_EQUAL",
      value: 18,
      errorMessage: "Age must be at least 18.",
    },

    // Email validation
    {
      ruleId: "rule-email-required",
      type: "REQUIRED",
      fieldId: "email",
      errorMessage: "Email is required.",
    },
    {
      ruleId: "rule-email-regex",
      type: "REGEX",
      fieldId: "email",
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: "Invalid email format.",
    },

    // Phone validation
    {
      ruleId: "rule-phone-required",
      type: "REQUIRED",
      fieldId: "phone",
      errorMessage: "Phone number is required.",
    },
    {
      ruleId: "rule-phone-regex",
      type: "REGEX",
      fieldId: "phone",
      value: /^[0-9]{3}-[0-9]{4}-[0-9]{4}$/,
      errorMessage: "Phone number must follow the format xxx-xxxx-xxxx.",
    },

    // Experience validation
    {
      ruleId: "rule-experience-required",
      type: "REQUIRED",
      fieldId: "experience",
      errorMessage: "Experience is required.",
    },
    {
      ruleId: "rule-experience-type-check",
      type: "TYPE_CHECK",
      fieldId: "experience",
      expectedType: "number",
      errorMessage: "Experience must be a number.",
    },

    // References validation
    {
      ruleId: "rule-references-dependency",
      type: "DEPENDENCY",
      fieldId: "references",
      dependentFieldId: "experience",
      dependentOperator: "LESS_THAN",
      dependentValue: 5,
      operator: "NOT_EMPTY",
      errorMessage: "References are required if experience is less than 5 years.",
    },

    // Preferred Job Role validation
    {
      ruleId: "rule-preferredJobRole-dependency",
      type: "DEPENDENCY",
      fieldId: "preferredJobRole",
      dependentFieldId: "experience",
      dependentOperator: "GREATER_THAN",
      dependentValue: 2,
      operator: "NOT_EMPTY",
      errorMessage:
        "Preferred Job Role is required for applicants with more than 2 years of experience.",
    },

    // Cover Letter validation
    {
      ruleId: "rule-coverLetter-dependency",
      type: "DEPENDENCY",
      fieldId: "coverLetter",
      dependentFieldId: "experience",
      dependentOperator: "GREATER_THAN",
      dependentValue: 5,
      operator: "NOT_EMPTY",
      errorMessage:
        "Cover Letter is required for applicants with more than 5 years of experience.",
    },
  ];

  test("should return errors for all invalid fields", async () => {
    const validationResults = await controller.validateForm(formData, rules);

    expect(validationResults.hasErrors).toBe(true);

    const errorMessages = validationResults.summary.map((error) => error.message);

    expect(errorMessages).toEqual(
      expect.arrayContaining([
        "Name must be between 3 and 50 characters.",
        "Age must be a number.",
        "Age must be at least 18.",
        "Invalid email format.",
        "Phone number must follow the format xxx-xxxx-xxxx.",
        "References are required if experience is less than 5 years.",
        "Preferred Job Role is required for applicants with more than 2 years of experience.",
      ])
    );
  });

  test("should validate successfully for corrected data", async () => {
    const validFormData = {
      ...formData,
      name: { fieldId: "name", value: "John Doe" },
      age: { fieldId: "age", value: 25 },
      email: { fieldId: "email", value: "johndoe@example.com" },
      phone: { fieldId: "phone", value: "123-4567-8901" },
      references: { fieldId: "references", value: "Dr. Smith" },
      preferredJobRole: { fieldId: "preferredJobRole", value: "Software Engineer" },
      coverLetter: { fieldId: "coverLetter", value: "" }, // Not required
    };

    const validationResults = await controller.validateForm(validFormData, rules);

    expect(validationResults.hasErrors).toBe(false);
  });
});
