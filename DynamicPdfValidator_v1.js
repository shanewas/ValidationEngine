class DynamicPdfValidator {
    constructor(rules) {
        this.rules = rules.validationSystem.validationTemplates;
        this.visitedFields = new Set();  // To detect circular dependencies
    }

    validateField(field, conditions, fieldData) {
        let errors = [];
        
        conditions.forEach(condition => {
            // Check for dependencies first
            if(condition.type == "DEPENDENCY"){
                if (condition.dependentFieldID) {
                    if (!this.resolveDependency(field, condition, fieldData)) {
                        errors.push(condition.errorMessage || `${field.fieldName} dependency check failed.`);
                        return; // Skip further checks if dependency is not satisfied
                    }
                }else{
                    errors.push(condition.errorMessage || `dependency check failed.`);
                }                    
            }

            // Validate based on condition type
            switch (condition.type) {
                case 'REQUIRED':
                    if (!field.value) {
                        errors.push(condition.errorMessage || `${field.fieldName} is required.`);
                    }
                    break;
                case 'COMPARISON':
                    if (!this.compare(field.value, condition.operator, condition.value)) {
                        errors.push(condition.errorMessage || `${field.fieldName} comparison failed.`);
                    }
                    break;
                case 'TYPE_CHECK':
                    if (typeof field.value !== condition.expectedType) {
                        errors.push(condition.errorMessage || `${field.fieldName} must be a ${condition.expectedType}.`);
                    }
                    break;
                case 'LENGTH_CHECK':
                    const length = field.value?.length || 0;
                    if (length < condition.minLength || length > condition.maxLength) {
                        errors.push(condition.errorMessage || `${field.fieldName} length check failed.`);
                    }
                    break;
                case 'EMPTY_CHECK':
                    if ((condition.operator === 'NOT_EMPTY' && !field.value) || 
                        (condition.operator === 'EMPTY' && field.value)) {
                        errors.push(condition.errorMessage || `${field.fieldName} must ${condition.operator === 'EMPTY' ? 'be empty' : 'not be empty'}.`);
                    }
                    break;
                case 'REGEX':
                    if (!new RegExp(condition.value).test(field.value)) {
                        errors.push(condition.errorMessage || `${field.fieldName} format is invalid.`);
                    }
                    break;
                default:
                    errors.push(`Unknown validation type for ${field.fieldName}.`);
                    break;
            }
        });

        return errors.length ? errors : null;
    }

    resolveDependency(field, condition, fieldData) {
        const dependentField = fieldData.find(f => f.fieldName === condition.dependentFieldID);
        if (!dependentField) return false;  // Dependent field not found
        
        // Prevent circular dependencies
        if (this.visitedFields.has(dependentField.fieldName)) {
            throw new Error(`Circular dependency detected for field: ${field.fieldName}`);
        }

        // Mark this field as visited to detect circular dependency
        this.visitedFields.add(dependentField.fieldName);

        // Check the dependent field's condition
        const result = this.compare(dependentField.value, condition.dependentOperator, condition.dependentValue);
        
        // Remove from visited fields after check
        this.visitedFields.delete(dependentField.fieldName);

        return result;
    }

    compare(value, operator, comparisonValue) {
        switch (operator) {
            case 'EQUALS': return value === comparisonValue;
            case 'NOT_EQUALS': return value !== comparisonValue;
            case 'GREATER_THAN': return value > comparisonValue;
            case 'LESS_THAN': return value < comparisonValue;
            case 'GREATER_THAN_OR_EQUAL': return value >= comparisonValue;
            case 'LESS_THAN_OR_EQUAL': return value <= comparisonValue;
            case 'CONTAINS': return value.includes(comparisonValue);
            case 'STARTS_WITH': return value.startsWith(comparisonValue);
            case 'ENDS_WITH': return value.endsWith(comparisonValue);
            case 'BETWEEN': return value >= comparisonValue[0] && value <= comparisonValue[1];
            case 'BEFORE': return new Date(value) < new Date(comparisonValue);
            case 'AFTER': return new Date(value) > new Date(comparisonValue);
            default: return false;
        }
    }

    validateGroup(groupConditions, fieldData) {
        let groupErrors = [];
        
        for (let condition of groupConditions) {
            const field = fieldData.find(f => f.fieldName === condition.fieldID);
            if (!field) continue;

            const errors = this.validateField(field, [condition], fieldData);
            
            if (errors) {
                if (condition.groupOperator === 'OR') {
                    groupErrors.push(...errors);
                } else if (condition.groupOperator === 'AND') {
                    if (errors.length > 0) {
                        groupErrors.push(...errors);
                        break;
                    }
                }
            }
        }
        
        return groupErrors.length ? groupErrors : null;
    }

    validateFields(fieldData) {
        let validationResults = {};
        
        fieldData.forEach(field => {
            const rules = this.rules.find(template => 
                template.rules.some(rule => rule.fieldID === field.fieldName)
            )?.rules;
            
            if (rules) {
                const errors = this.validateField(field, rules, fieldData);
                if (errors) validationResults[field.fieldName] = errors;
            }
        });

        // Handling group validation if specified
        this.rules.forEach(template => {
            if (template.group) {
                const groupErrors = this.validateGroup(template.group, fieldData);
                if (groupErrors) validationResults[template.group.groupID] = groupErrors;
            }
        });

        return validationResults;
    }
}

module.exports = DynamicPdfValidator;
