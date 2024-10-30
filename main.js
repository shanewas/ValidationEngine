// main.js
const { DynamicPdfValidator } = require('./dynamic-pdf-validator');

const validationTemplate = {
    templateId: "template123",
    version: "1.0",
    description: "Sample PDF validation template",
    rules: [
        {
            ruleId: "rule1",
            ruleName: "Age Validation",
            fieldId: "age",
            type: "COMPARISON",
            priority: "High",
            scope: "Field",
            conditions: [
                {
                    fieldId: "age",
                    type: "REQUIRED",
                    errorMessage: "Age is required"
                },
                {
                    fieldId: "age",
                    type: "COMPARISON",
                    operator: "GREATER_THAN",
                    value: 18,
                    errorMessage: "Age must be greater than 18"
                }
            ]
        }
    ]
};

const fieldData = [
    { fieldName: "age", value: 16 }
];

async function runValidation() {
    try {
        const validator = new DynamicPdfValidator([validationTemplate]);
        const validationResults = await validator.validateFields(fieldData);
        
        // Now you get a nicely structured validation result
        console.log('Validation Results:', JSON.stringify(validationResults, null, 2));
        
        if (validationResults.hasErrors) {
            console.log('\nValidation Summary:');
            validationResults.summary.forEach((error, index) => {
                console.log(`${index + 1}. Field '${error.fieldId}': ${error.message} (${error.type})`);
            });
            
            console.log('\nDetailed Errors:');
            Object.entries(validationResults.fieldErrors).forEach(([fieldId, errors]) => {
                console.log(`\nField: ${fieldId}`);
                errors.forEach((error, index) => {
                    console.log(`  Error ${index + 1}:`);
                    console.log(`    Message: ${error.message}`);
                    console.log(`    Type: ${error.type}`);
                    if (Object.keys(error.details).length > 0) {
                        console.log(`    Details:`, error.details);
                    }
                });
            });
        } else {
            console.log('\nValidation Passed: No errors found');
        }
    } catch (error) {
        console.error('Validation failed:', error);
    }
}

runValidation();