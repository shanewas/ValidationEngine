// main.js
const validatePDFForms = async (pdfData, customRules = null) => {
    try {
      // Initialize the validation controller
      const validationController = new ValidationController();
  
      // Default validation rules if none provided
      const defaultRules = [
        {
          ruleId: "required-fields",
          ruleName: "Required Fields Validation",
          priority: "HIGH",
          conditions: [
            {
              type: VALIDATION_TYPES.REQUIRED,
              fieldId: "firstName",
              errorMessage: "First name is required"
            },
            {
              type: VALIDATION_TYPES.REQUIRED,
              fieldId: "lastName",
              errorMessage: "Last name is required"
            }
          ]
        },
        {
          ruleId: "age-validation",
          ruleName: "Age Validation",
          priority: "HIGH",
          conditions: [
            {
              type: VALIDATION_TYPES.TYPE_CHECK,
              fieldId: "age",
              expectedType: "number",
              errorMessage: "Age must be a number"
            },
            {
              type: VALIDATION_TYPES.COMPARISON,
              fieldId: "age",
              operator: OPERATORS.GREATER_THAN,
              value: 18,
              errorMessage: "Age must be greater than 18"
            }
          ]
        },
        {
          ruleId: "cross-pdf-validation",
          ruleName: "Cross PDF Validation",
          priority: "MEDIUM",
          conditions: [
            {
              type: VALIDATION_TYPES.DEPENDENCY,
              fieldId: "confirmationField",
              dependentFieldId: "age",
              dependentOperator: OPERATORS.GREATER_THAN,
              dependentValue: 18,
              errorMessage: "Confirmation required for age over 18"
            }
          ]
        }
      ];
  
      const request = {
        fieldData: pdfData,
        validationRules: customRules || defaultRules
      };
  
      const result = await validationController.validateForms(request);
      return result;
    } catch (error) {
      console.error("Validation failed:", error);
      throw error;
    }
  };
  
  // Example usage scenarios
  const runValidationExamples = async () => {
    // Example 1: Basic form validation
    const basicFormData = [
      {
        pdfId: "pdf1",
        data: [
          {
            fieldName: "firstName",
            page: 1,
            value: "John",
            type: FIELD_TYPES.TEXT
          },
          {
            fieldName: "lastName",
            page: 1,
            value: "",
            type: FIELD_TYPES.TEXT
          },
          {
            fieldName: "age",
            page: 1,
            value: 16,
            type: FIELD_TYPES.NUMBER
          }
        ]
      }
    ];
  
    // Example 2: Cross-PDF validation
    const crossPDFFormData = [
      {
        pdfId: "pdf1",
        data: [
          {
            fieldName: "age",
            page: 1,
            value: 25,
            type: FIELD_TYPES.NUMBER
          }
        ]
      },
      {
        pdfId: "pdf2",
        data: [
          {
            fieldName: "confirmationField",
            page: 1,
            value: "",
            type: FIELD_TYPES.CHECKBOX
          }
        ]
      }
    ];
  
    // Example 3: Custom rules validation
    const customRules = [
      {
        ruleId: "email-validation",
        ruleName: "Email Validation",
        priority: "HIGH",
        conditions: [
          {
            type: VALIDATION_TYPES.REGEX,
            fieldId: "email",
            value: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
            errorMessage: "Invalid email format"
          }
        ]
      }
    ];
  
    const emailFormData = [
      {
        pdfId: "pdf1",
        data: [
          {
            fieldName: "email",
            page: 1,
            value: "invalid-email",
            type: FIELD_TYPES.TEXT
          }
        ]
      }
    ];
  
    try {
      // Run different validation scenarios
      console.log("Running basic form validation...");
      const basicResult = await validatePDFForms(basicFormData);
      console.log("Basic validation result:", JSON.stringify(basicResult, null, 2));
  
      console.log("\nRunning cross-PDF validation...");
      const crossPDFResult = await validatePDFForms(crossPDFFormData);
      console.log("Cross-PDF validation result:", JSON.stringify(crossPDFResult, null, 2));
  
      console.log("\nRunning custom rules validation...");
      const customResult = await validatePDFForms(emailFormData, customRules);
      console.log("Custom validation result:", JSON.stringify(customResult, null, 2));
  
    } catch (error) {
      console.error("Validation examples failed:", error);
    }
  };
  
  // Function to create complex validation rules
  const createValidationRules = (config) => {
    return {
      ruleId: config.ruleId,
      ruleName: config.name,
      priority: config.priority || "MEDIUM",
      scope: config.scope,
      conditions: config.conditions.map(condition => ({
        type: condition.type,
        fieldId: condition.fieldId,
        operator: condition.operator,
        value: condition.value,
        errorMessage: condition.errorMessage,
        dependentFieldId: condition.dependentFieldId,
        dependentOperator: condition.dependentOperator,
        dependentValue: condition.dependentValue,
        pdfId: condition.pdfId,
        page: condition.page
      }))
    };
  };
  
  // Example of creating complex validation rules
  const createComplexValidationExample = async () => {
    const complexRules = [
      createValidationRules({
        ruleId: "complex-validation-1",
        name: "Complex Form Validation",
        priority: "HIGH",
        scope: {
          type: "PDF",
          pdfId: "pdf1"
        },
        conditions: [
          {
            type: VALIDATION_TYPES.REQUIRED,
            fieldId: "signature",
            errorMessage: "Signature is required"
          },
          {
            type: VALIDATION_TYPES.DEPENDENCY,
            fieldId: "witness",
            dependentFieldId: "signature",
            dependentOperator: OPERATORS.NOT_EQUALS,
            dependentValue: null,
            errorMessage: "Witness required when signature is present"
          }
        ]
      })
    ];
  
    const complexFormData = [
      {
        pdfId: "pdf1",
        data: [
          {
            fieldName: "signature",
            page: 1,
            value: "John Doe",
            type: FIELD_TYPES.TEXT
          },
          {
            fieldName: "witness",
            page: 1,
            value: "",
            type: FIELD_TYPES.TEXT
          }
        ]
      }
    ];
  
    try {
      const result = await validatePDFForms(complexFormData, complexRules);
      console.log("Complex validation result:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Complex validation failed:", error);
    }
  };
  
  // Execute all examples
  const runAllExamples = async () => {
    console.log("Running validation examples...");
    await runValidationExamples();
    
    console.log("\nRunning complex validation example...");
    await createComplexValidationExample();
  };
  
  // Export functions for use in other modules
  export {
    validatePDFForms,
    runValidationExamples,
    createValidationRules,
    createComplexValidationExample,
    runAllExamples
  };