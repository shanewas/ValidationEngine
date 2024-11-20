import { ValidationUtils } from "./utils/validation-utils.js";
import { OPERATORS } from "./constants/validation-types.js";
import { ValidationController } from "./index.js";
// import { console } from "./utils/console.js";

// console.enable();

// Register the IS_MAGIC operator
ValidationUtils.addCustomOperator("IS_MAGIC", (value, comparisonValue) => {
  // The value must exactly match 'magic'
  return value === "magic";
});

// Register the MATCH_CUSTOM_PATTERN operator
ValidationUtils.addCustomOperator("MATCH_CUSTOM_PATTERN", (value, pattern) => {
  // The value must contain the specified pattern
  if (typeof value !== "string" || typeof pattern !== "string") {
    throw new Error(
      "Both the value and pattern must be strings for MATCH_CUSTOM_PATTERN."
    );
  }
  return value.includes(pattern);
});

// // Register a custom type for "magicString"
ValidationUtils.addCustomType("magicString", (value) => {
  return typeof value === "string" && value.includes("magic");
});

// // Register a custom type for "positiveInteger"
ValidationUtils.addCustomType("positiveInteger", (value) => {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
});

const formData = {
  name: { fieldId: "name", value: "Jo" }, // Too short
  age: { fieldId: "age", value: "20" }, // Valid, but as a string
  email: { fieldId: "email", value: "invalid-email" }, // Invalid format
  phone: { fieldId: "phone", value: "1234567890" }, // Incorrect format
  experience: { fieldId: "experience", value: 3 }, // Valid
  references: { fieldId: "references", value: "" }, // Missing but required
  preferredJobRole: { fieldId: "preferredJobRole", value: "" }, // Missing but required
  coverLetter: { fieldId: "coverLetter", value: "" }, // Missing, not required in this case,
  magicField: { fieldId: "magicField", value: "magic" },
  customPatternField: {
    fieldId: "customPatternField",
    value: "this is magic!",
  },
  validMagicField: { fieldId: "validMagicField", value: "this is magic" }, // Pass
  positiveField: { fieldId: "positiveField", value: 42 }, // Pass
  invalidMagicField: { fieldId: "invalidMagicField", value: "nothing special magic" }, // Fail
  negativeField: { fieldId: "negativeField", value: -10 }, // Fail
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
    errorMessage: "Phone number must follow the format xxx-xxxx-xxxx.",
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
  {
    type: "COMPARISON",
    fieldId: "magicField",
    operator: "IS_MAGIC",
    errorMessage: "The value must be 'magic'.",
  },
  {
    type: "COMPARISON",
    fieldId: "customPatternField",
    operator: "MATCH_CUSTOM_PATTERN",
    value: "magic",
    errorMessage: "The field must contain the custom pattern 'magic'.",
  },
  {
    type: "TYPE_CHECK",
    fieldId: "validMagicField",
    expectedType: "magicString",
    errorMessage: "The value must be a string containing 'magic'.",
  },
  {
    type: "TYPE_CHECK",
    fieldId: "positiveField",
    expectedType: "positiveInteger",
    errorMessage: "The value must be a positive integer.",
  },
  {
    type: "TYPE_CHECK",
    fieldId: "invalidMagicField",
    expectedType: "magicString",
    errorMessage: "The value must be a string containing 'magic'.",
  },
  {
    type: "TYPE_CHECK",
    fieldId: "negativeField",
    expectedType: "positiveInteger",
    errorMessage: "The value must be a positive integer.",
  },
];

const controller = new ValidationController();

// Validate the form with the updated rules
controller
  .validateForm(formData, rules)
  .then((validationResults) => {
    if (validationResults.hasErrors) {
      console.log("Validation Errors:");
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
