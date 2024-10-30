class FieldValidator {
    constructor() {
        this.validators = {};
    }

    setupValidators(flowData) {
        // Logic to setup validators
        flowData.fields.forEach(field => {
            this.validators[field.name] = this.createValidator(field);
            console.log(`Validator created for field: ${field.name}`); // Debug log
        });
        return { status: 'Validators setup complete' };
    }

    createValidator(field) {
        return (value, context) => {
            let errors = [];
            console.log(`Validating field: ${field.name}, Value: ${value}`); // Debug log

            field.conditions.forEach(condition => {
                console.log(`Evaluating condition: ${condition.type}`); // Debug log
                switch (condition.type) {
                    case 'REQUIRED':
                        if (!value) {
                            errors.push(condition.errorMessage || `${field.name} is required.`);
                        }
                        break;
                    case 'COMPARISON':
                        if (!this.compare(value, condition.operator, condition.value)) {
                            errors.push(condition.errorMessage || `${field.name} comparison failed.`);
                        }
                        break;
                    case 'DEPENDENCY':
                        if (context[condition.dependentFieldId] === condition.dependentValue && !value) {
                            errors.push(condition.errorMessage || `${field.name} depends on ${condition.dependentFieldId}.`);
                        }
                        break;
                    case 'TYPE_CHECK':
                        if (typeof value !== condition.expectedType) {
                            errors.push(condition.errorMessage || `${field.name} must be a ${condition.expectedType}.`);
                        }
                        break;
                    case 'LENGTH_CHECK':
                        if (value.length < condition.minLength || value.length > condition.maxLength) {
                            errors.push(condition.errorMessage || `${field.name} length check failed.`);
                        }
                        break;
                    case 'EMPTY_CHECK':
                        if (condition.operator === 'NOT_EMPTY' && !value) {
                            errors.push(condition.errorMessage || `${field.name} must not be empty.`);
                        } else if (condition.operator === 'EMPTY' && value) {
                            errors.push(condition.errorMessage || `${field.name} must be empty.`);
                        }
                        break;
                    case 'REGEX':
                        if (!new RegExp(condition.value).test(value)) {
                            errors.push(condition.errorMessage || `${field.name} format is invalid.`);
                        }
                        break;
                    case 'CUSTOM':
                        if (!condition.validate(value, context)) {
                            errors.push(condition.errorMessage || `${field.name} custom validation failed.`);
                        }
                        break;
                    default:
                        console.log(`Unknown condition type: ${condition.type}`); // Debug log
                        break;
                }
            });

            console.log(`Errors for field ${field.name}: ${errors}`); // Debug log
            return errors.length > 0 ? errors : null; // Return errors or null if no errors
        };
    }

    compare(value, operator, comparisonValue) {
        console.log(`Comparing value: ${value} with ${comparisonValue} using operator ${operator}`); // Debug log
        switch (operator) {
            case 'EQUALS':
                return value === comparisonValue;
            case 'NOT_EQUALS':
                return value !== comparisonValue;
            case 'GREATER_THAN':
                return value > comparisonValue;
            case 'LESS_THAN':
                return value < comparisonValue;
            case 'GREATER_THAN_OR_EQUAL':
                return value >= comparisonValue;
            case 'LESS_THAN_OR_EQUAL':
                return value <= comparisonValue;
            case 'CONTAINS':
                return value.includes(comparisonValue);
            case 'STARTS_WITH':
                return value.startsWith(comparisonValue);
            case 'ENDS_WITH':
                return value.endsWith(comparisonValue);
            case 'BETWEEN':
                return value >= comparisonValue[0] && value <= comparisonValue[1];
            case 'BEFORE':
                return new Date(value) < new Date(comparisonValue);
            case 'AFTER':
                return new Date(value) > new Date(comparisonValue);
            default:
                console.log(`Unknown operator: ${operator}`); // Debug log
                return false;
        }
    }

    validateField(fieldName, value, context) {
        if (this.validators[fieldName]) {
            return this.validatorsfieldName;
        }
        return [`No validator found for ${fieldName}`];
    }

    validateAllFields(formData) {
        let validationResults = {};
        for (let fieldName in formData) {
            let value = formData[fieldName];
            let context = formData; // Pass the entire form data as context
            validationResults[fieldName] = this.validateField(fieldName, value, context);
            console.log(`Validation result for ${fieldName}: ${validationResults[fieldName]}`); // Debug log
        }
        return validationResults;
    }
}

module.exports = FieldValidator;
