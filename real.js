import { ValidationUtils } from "./utils/validation-utils.js";
import { OPERATORS } from "./constants/validation-types.js";

const formData = {
    name: { fieldId: "name", value: "" },
    age: { fieldId: "age", value: 16 },
    phone: { fieldId: "phone", value: "12345" },
    experience: { fieldId: "experience", value: 1 },
    references: { fieldId: "references", value: "" },
  };
  
  

const rules = [
  // Name is required
  {
    type: "REQUIRED",
    fieldId: "name",
    errorMessage: "Name is required.",
  },
  // Age must be at least 18
  {
    type: "COMPARISON",
    fieldId: "age",
    operator: "GREATER_THAN_OR_EQUAL",
    value: 18,
    errorMessage: "Age must be at least 18.",
  },
  // Age must be a number
  {
    type: "TYPE_CHECK",
    fieldId: "age",
    expectedType: "number",
    errorMessage: "Age must be a number.",
  },
  // Phone must match regex pattern
  {
    type: "REGEX",
    fieldId: "phone",
    value: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
    errorMessage: "Phone number must follow the format xxx-xxx-xxxx.",
  },
  // Experience must be at least 2 years if age is less than 25
  {
    type: "DEPENDENCY",
    fieldId: "experience",
    dependentFieldId: "age",
    dependentOperator: "LESS_THAN",
    dependentValue: 25,
    operator: "GREATER_THAN_OR_EQUAL",
    value: 2,
    errorMessage:
      "Experience must be at least 2 years for applicants under 25.",
  },
  // References are required if experience is less than 5 years
  {
    type: "DEPENDENCY",
    fieldId: "references",
    dependentFieldId: "experience",
    dependentOperator: "LESS_THAN",
    dependentValue: 5,
    operator: "NOT_EMPTY",
    errorMessage: "References are required if experience is less than 5 years.",
  },
];

// Validation function
function validateForm(formData, rules) {
  const validationResults = [];
  const context = { formData };

  for (const rule of rules) {
    const field = formData[rule.fieldId];
    let result;

    switch (rule.type) {
      case "REQUIRED":
        result = ValidationUtils.isEmpty(field?.value)
          ? { fieldId: field.fieldId, message: rule.errorMessage }
          : null;
        break;
      case "COMPARISON":
        result = !ValidationUtils.compare(
          field?.value,
          rule.operator,
          rule.value
        )
          ? { fieldId: field.fieldId, message: rule.errorMessage }
          : null;
        break;
      case "TYPE_CHECK":
        result = !ValidationUtils.validateType(field?.value, rule.expectedType)
          ? { fieldId: field.fieldId, message: rule.errorMessage }
          : null;
        break;
      case "REGEX":
        const regex = new RegExp(rule.value);
        result = !regex.test(field?.value)
          ? { fieldId: field.fieldId, message: rule.errorMessage }
          : null;
        break;
      case "DEPENDENCY":
        const dependentField = formData[rule.dependentFieldId];
        const isDependentValid = ValidationUtils.compare(
          dependentField?.value,
          rule.dependentOperator,
          rule.dependentValue
        );

        if (isDependentValid) {
          result = !ValidationUtils.compare(
            field?.value,
            rule.operator,
            rule.value
          )
            ? { fieldId: field.fieldId, message: rule.errorMessage }
            : null;
        }
        break;
      default:
        throw new Error(`Unsupported rule type: ${rule.type}`);
    }

    if (result) validationResults.push(result);
  }

  return validationResults;
}

// Run validation
const validationResults = validateForm(formData, rules);

if (validationResults.length > 0) {
  console.log("Validation Errors:");
  validationResults.forEach((error) =>
    console.log(`- ${error.message} (Field: ${error.fieldId})`)
  );
} else {
  console.log("All fields validated successfully!");
}
