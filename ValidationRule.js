// validation.js

class ValidationRule {
    constructor(templateId, version, ruleId, ruleName, priority, scope) {
        this.templateId = templateId;
        this.version = version;
        this.ruleId = ruleId;
        this.ruleName = ruleName;
        this.priority = priority;
        this.scope = scope;
        this.groups = []; // Array of condition groups
    }

    addGroup(group) {
        this.groups.push(group);
    }

    validate(pdfData) {
        const errors = [];
        for (const group of this.groups) {
            const groupErrors = group.validate(pdfData);
            if (groupErrors.length > 0) {
                errors.push(group.errorMessage);
            }
        }
        return errors;
    }
}

class ConditionGroup {
    constructor(priority, operator, errorMessage) {
        this.priority = priority;
        this.operator = operator;
        this.errorMessage = errorMessage;
        this.conditions = []; // Array of conditions
    }

    addCondition(condition) {
        this.conditions.push(condition);
    }

    validate(pdfData) {
        const groupErrors = [];
        for (const condition of this.conditions) {
            const isValid = condition.validate(pdfData);
            if (!isValid) {
                groupErrors.push(condition.errorMessage);
            }
        }
        return groupErrors;
    }
}

class Condition {
    constructor(fieldName, page, type, operator, value, expectedType, minLength, maxLength, dependentFieldName, dependentValue, errorMessage) {
        this.fieldName = fieldName; // Corresponds to the field name from PDF data
        this.page = page; // Page number for the condition
        this.type = type; // Type of condition
        this.operator = operator; // Comparison operator
        this.value = value; // Value to compare against
        this.expectedType = expectedType; // Expected data type
        this.minLength = minLength; // Minimum length
        this.maxLength = maxLength; // Maximum length
        this.dependentFieldName = dependentFieldName; // Dependent field name
        this.dependentValue = dependentValue; // Dependent value for dependency check
        this.errorMessage = errorMessage; // Error message to return if validation fails
    }

    validate(pdfData) {
        const fieldValue = this.getFieldValue(pdfData, this.fieldName, this.page);
        
        switch (this.type) {
            case 'REQUIRED':
                return this.validateRequired(fieldValue);
            case 'COMPARISON':
                return this.validateComparison(fieldValue);
            case 'DEPENDENCY':
                return this.validateDependency(fieldValue, pdfData);
            case 'TYPE_CHECK':
                return this.validateType(fieldValue);
            case 'LENGTH_CHECK':
                return this.validateLength(fieldValue);
            case 'EMPTY_CHECK':
                return this.validateEmpty(fieldValue);
            case 'REGEX':
                return this.validateRegex(fieldValue);
            default:
                return true; // If the type is not recognized, consider valid
        }
    }

    getFieldValue(pdfData, fieldName, page) {
        // Look for the field in pdfData
        const fieldData = pdfData.result.data.find(item => item.fieldName === fieldName && item.page === page);
        
        // Return the value based on field type
        if (fieldData) {
            return fieldData.value || fieldData.values || null; // Return the appropriate value based on field type
        }
        return null; // Field not found
    }

    validateRequired(value) {
        return value !== null && value !== undefined && value !== '';
    }

    validateComparison(value) {
        switch (this.operator) {
            case 'EQUALS':
                return value === this.value;
            case 'NOT_EQUALS':
                return value !== this.value;
            case 'GREATER_THAN':
                return value > this.value;
            case 'LESS_THAN':
                return value < this.value;
            case 'GREATER_THAN_OR_EQUAL':
                return value >= this.value;
            case 'LESS_THAN_OR_EQUAL':
                return value <= this.value;
            case 'CONTAINS':
                return typeof value === 'string' && value.includes(this.value);
            case 'STARTS_WITH':
                return typeof value === 'string' && value.startsWith(this.value);
            case 'ENDS_WITH':
                return typeof value === 'string' && value.endsWith(this.value);
            case 'BETWEEN':
                return value >= this.value[0] && value <= this.value[1]; // Assuming value is an array for BETWEEN
            default:
                return true;
        }
    }

    validateDependency(value, pdfData) {
        const dependentValue = this.getFieldValue(pdfData, this.dependentFieldName, this.page);
        return dependentValue === this.dependentValue ? value !== null && value !== undefined : true;
    }

    validateType(value) {
        return typeof value === this.expectedType;
    }

    validateLength(value) {
        const length = value?.length || 0;
        return length >= (this.minLength || 0) && length <= (this.maxLength || Infinity);
    }

    validateEmpty(value) {
        return !value; // returns true if the value is empty
    }

    validateRegex(value) {
        const regex = new RegExp(this.value);
        return regex.test(value);
    }
}

// Exporting the classes as a module
module.exports = {
    ValidationRule,
    ConditionGroup,
    Condition
};
