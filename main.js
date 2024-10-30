// main.js
const { DynamicPdfValidator } = require("./dynamic-pdf-validator");

const validationTemplate = {
    templateId: "template123",
    version: "1.0",
    description: "Sample PDF validation template",
    rules: [
      {
        ruleId: "rule1",
        ruleName: "Age Validation",
        fieldId: "age", // The field being validated
        type: "COMPARISON", // Indicates that this is a comparison type validation
        priority: "High", // The priority of this validation rule
        scope: "Field", // The scope of the validation
        conditions: [ // Conditions that must be met for this rule
          {
            fieldId: "age", // The field ID to validate
            type: "REQUIRED", // The type of validation
            errorMessage: "Age is required", // Error message if validation fails
          },
          {
            fieldId: "age", // The field ID to validate
            type: "COMPARISON", // The type of validation
            operator: "GREATER_THAN", // Comparison operator
            value: 18, // The value to compare against
            errorMessage: "Age must be greater than 18", // Error message if validation fails
          },
        ],
      },
    ],
  };
  

const fieldData = [
  {
    pdfId: "pdf123", // First PDF
    data: [
      {
        fieldName: "age", // Field that must be validated
        page: 1,
        value: 25, // Valid: age is greater than 18
      },
      {
        fieldName: "gender",
        page: 1,
        value: "male", // Just an example field
      },
    ],
  },
  {
    pdfId: "pdf456", // Second PDF
    data: [
      {
        fieldName: "dependentField", // Field depending on age
        page: 1,
        value: null, // Invalid: should be filled if age is greater than 18
      },
      {
        fieldName: "confirmation", // Field for confirming information
        page: 1,
        value: false, // Valid: could be a checkbox for confirming age
      },
    ],
  },
  {
    pdfId: "pdf789", // Third PDF
    data: [
      {
        fieldName: "notes", // Additional notes related to the age validation
        page: 1,
        value: "User is over 18", // Valid: Notes related to the age input
      },
    ],
  },
  {
    pdfId: "pdf101", // Fourth PDF with another age field
    data: [
      {
        fieldName: "ageVerification", // Field for a second age entry to validate
        page: 1,
        value: 20, // Valid: another age input
      },
      {
        fieldName: "ageReason", // Reason why age verification is needed
        page: 1,
        value: "To ensure eligibility.", // Valid: description field
      },
    ],
  },
];


async function runValidation() {
  try {
    const validator = new DynamicPdfValidator([validationTemplate]);
    const validationResults = await validator.validateFields(fieldData);

    // Now you get a nicely structured validation result
    console.log(
      "Validation Results:",
      JSON.stringify(validationResults, null, 2)
    );

    // if (validationResults.hasErrors) {
    //     console.log('\nValidation Summary:');
    //     validationResults.summary.forEach((error, index) => {
    //         console.log(`${index + 1}. Field '${error.fieldId}': ${error.message} (${error.type})`);
    //     });

    //     console.log('\nDetailed Errors:');
    //     Object.entries(validationResults.fieldErrors).forEach(([fieldId, errors]) => {
    //         console.log(`\nField: ${fieldId}`);
    //         errors.forEach((error, index) => {
    //             console.log(`  Error ${index + 1}:`);
    //             console.log(`    Message: ${error.message}`);
    //             console.log(`    Type: ${error.type}`);
    //             if (Object.keys(error.details).length > 0) {
    //                 console.log(`    Details:`, error.details);
    //             }
    //         });
    //     });
    // } else {
    //     console.log('\nValidation Passed: No errors found');
    // }
  } catch (error) {
    console.error("Validation failed:", error);
  }
}

runValidation();
