import { ValidationUtils } from "./utils/validation-utils.js";
import { OPERATORS } from "./constants/validation-types.js";
import { ValidationController } from "./index.js";
// import { logger } from "./utils/logger.js";

// logger.enable();

const formData = {
  name: { fieldId: "name", value: "Jo" }, // Too short
  age: { fieldId: "age", value: "20" }, // Valid, but as a string
  email: { fieldId: "email", value: "invalid-email" }, // Invalid format
  phone: { fieldId: "phone", value: "1234567890" }, // Incorrect format
  experience: { fieldId: "experience", value: 3 }, // Valid
  references: { fieldId: "references", value: "" }, // Missing but required
  preferredJobRole: { fieldId: "preferredJobRole", value: "" }, // Missing but required
  coverLetter: { fieldId: "coverLetter", value: "" }, // Missing, not required in this case
};

const rules = [
  // Name validation
  {
    type: "REQUIRED",
    fieldId: "name",
    errorMessage: "Name is required.",
  },
  {
    type: "LENGTH_CHECK",
    fieldId: "name",
    minLength: 3,
    maxLength: 50,
    errorMessage: "Name must be between 3 and 50 characters.",
  },

  // Age validation
  {
    type: "REQUIRED",
    fieldId: "age",
    errorMessage: "Age is required.",
  },
  {
    type: "TYPE_CHECK",
    fieldId: "age",
    expectedType: "number",
    errorMessage: "Age must be a number.",
  },
  {
    type: "COMPARISON",
    fieldId: "age",
    operator: "GREATER_THAN_OR_EQUAL",
    value: 18,
    errorMessage: "Age must be at least 18.",
  },

  // Email validation
  {
    type: "REQUIRED",
    fieldId: "email",
    errorMessage: "Email is required.",
  },
  {
    type: "REGEX",
    fieldId: "email",
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Invalid email format.",
  },

  // Phone validation
  {
    type: "REQUIRED",
    fieldId: "phone",
    errorMessage: "Phone number is required.",
  },
  {
    type: "REGEX",
    fieldId: "phone",
    value: /^[0-9]{3}-[0-9]{4}-[0-9]{4}$/,
    errorMessage: "Phone number must follow the format xxx-xxx-xxxx.",
  },

  // Experience validation
  {
    type: "REQUIRED",
    fieldId: "experience",
    errorMessage: "Experience is required.",
  },
  {
    type: "TYPE_CHECK",
    fieldId: "experience",
    expectedType: "number",
    errorMessage: "Experience must be a number.",
  },

  // References validation
  {
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

const controller = new ValidationController();

// Validate the form
controller
  .validateForm(formData, rules)
  .then((validationResults) => {
    if (validationResults.hasErrors) {
      console.log("Validation Errors:");
      // Use Object.entries to iterate over details
      Object.entries(validationResults.details).forEach(([fieldId, errors]) => {
        errors.forEach((error) => {
          console.log(`- ${error.message} (Field: ${fieldId})`);
        });
      });
    } else {
      console.log("All fields validated successfully!");
    }
  })
  .catch((error) => {
    console.error("Error during validation:", error);
  });
