// Tests/test.js
const { DynamicPdfValidator, ValidationSchema } = require('../dynamic-pdf-validator.js'); // Adjust import path

describe('DynamicPdfValidator', () => {
    let validator;
    let fieldData; // Sample field data for testing
    
    beforeEach(() => {
        // Initialize validator with a sample validation schema
        validator = new DynamicPdfValidator(ValidationSchema.validationTemplate);
        
        // Set up test data for validation
        fieldData = [
            { fieldName: 'name', value: '' }, // Invalid name (empty, should be required)
            { fieldName: 'age', value: 16 }   // Invalid age (less than 18)
            // Add additional fields here if necessary
        ];
    });

    test('should return errors for invalid fields', async () => {
        const result = await validator.validateFields(fieldData);
        
        console.log(JSON.stringify(result, null, 2)); // Log result to see all errors

        // Check error count
        expect(result.hasErrors).toBe(true);
        expect(result.errorCount).toBe(2); // Update count here if necessary
        
        // Check specific error messages
        expect(result.fieldErrors.name[0].message).toBe("Name is required.");
        expect(result.fieldErrors.age[0].message).toBe("Age must be greater than 18.");
    });
});
