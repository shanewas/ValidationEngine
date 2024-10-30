// validation-schema.js
const ValidationSchema = {
    validationTemplate: {
      type: "object",
      properties: {
        templateId: { type: "string", required: true },
        version: { type: "string", required: true },
        description: { type: "string" },
        rules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ruleId: { type: "string", required: true },
              ruleName: { type: "string", required: true },
              priority: { type: "string", enum: ["High", "Medium", "Low"] },
              scope: { type: "string", enum: ["Form", "Field", "Section"] },
              conditions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    pdfId: { type: "string" },
                    page: { type: "number" },
                    fieldId: { type: "string", required: true },
                    type: {
                      type: "string",
                      enum: [
                        "REQUIRED",
                        "COMPARISON",
                        "DEPENDENCY",
                        "TYPE_CHECK",
                        "LENGTH_CHECK",
                        "EMPTY_CHECK",
                        "REGEX",
                        "CUSTOM",
                        "SUGGESTION"
                      ]
                    },
                    operator: {
                      type: "string",
                      enum: [
                        "EQUALS",
                        "NOT_EQUALS",
                        "GREATER_THAN",
                        "LESS_THAN",
                        "GREATER_THAN_OR_EQUAL",
                        "LESS_THAN_OR_EQUAL",
                        "CONTAINS",
                        "STARTS_WITH",
                        "ENDS_WITH",
                        "BETWEEN",
                        "BEFORE",
                        "AFTER"
                      ]
                    },
                    value: { type: ["string", "number", "array", "object"] },
                    expectedType: { type: "string" },
                    minLength: { type: "number" },
                    maxLength: { type: "number" },
                    dependentFieldId: { type: "string" },
                    dependentType: { type: "string" },
                    dependentOperator: { type: "string" },
                    dependentValue: { type: ["string", "number", "array"] },
                    errorMessage: { type: "string" },
                    description: { type: "string" },
                    order: { type: "number" },
                    priority: { type: "string", enum: ["High", "Medium", "Low"] },
                    documentation: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  class ValidationErrorBuilder {
    constructor() {
        this.errors = {};
    }

    addError(fieldId, error) {
        if (!this.errors[fieldId]) {
            this.errors[fieldId] = [];
        }
        this.errors[fieldId].push(error);
    }

    getErrors() {
        return this.errors;
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    formatErrors() {
        const formattedErrors = {
            hasErrors: this.hasErrors(),
            errorCount: 0,
            fieldErrors: {},
            summary: []
        };

        for (const [fieldId, errors] of Object.entries(this.errors)) {
            formattedErrors.errorCount += errors.length;
            formattedErrors.fieldErrors[fieldId] = errors.map(error => ({
                message: error.message,
                type: error.type,
                details: error.details || {},
                fieldId: error.fieldId
            }));
            
            errors.forEach(error => {
                formattedErrors.summary.push({
                    fieldId,
                    message: error.message,
                    type: error.type
                });
            });
        }

        return formattedErrors;
    }

    clear() {
        this.errors = {};
    }
}

  // validation-error.js
  class ValidationError extends Error {
    constructor(fieldId, message, type, details = {}) {
      super(message);
      this.name = 'ValidationError';
      this.fieldId = fieldId;
      this.type = type;
      this.details = details;
    }
  }
  
  // validation-utils.js
  class ValidationUtils {
    static compare(value, operator, comparisonValue) {
      if (value === null || value === undefined) return false;
  
      switch (operator) {
        case 'EQUALS':
          return value === comparisonValue;
        case 'NOT_EQUALS':
          return value !== comparisonValue;
        case 'GREATER_THAN':
          return Number(value) > Number(comparisonValue);
        case 'LESS_THAN':
          return Number(value) < Number(comparisonValue);
        case 'GREATER_THAN_OR_EQUAL':
          return Number(value) >= Number(comparisonValue);
        case 'LESS_THAN_OR_EQUAL':
          return Number(value) <= Number(comparisonValue);
        case 'CONTAINS':
          return String(value).includes(String(comparisonValue));
        case 'STARTS_WITH':
          return String(value).startsWith(String(comparisonValue));
        case 'ENDS_WITH':
          return String(value).endsWith(String(comparisonValue));
        case 'BETWEEN':
          return Array.isArray(comparisonValue) &&
            Number(value) >= Number(comparisonValue[0]) &&
            Number(value) <= Number(comparisonValue[1]);
        case 'BEFORE':
          return new Date(value) < new Date(comparisonValue);
        case 'AFTER':
          return new Date(value) > new Date(comparisonValue);
        default:
          return false;
      }
    }
  
    static validateType(value, expectedType) {
      switch (expectedType.toLowerCase()) {
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number' && !isNaN(value);
        case 'boolean':
          return typeof value === 'boolean';
        case 'date':
          return !isNaN(Date.parse(value));
        case 'array':
          return Array.isArray(value);
        case 'object':
          return typeof value === 'object' && value !== null && !Array.isArray(value);
        default:
          return false;
      }
    }
  }
  
  // dynamic-pdf-validator.js
  class DynamicPdfValidator {
    constructor(validationTemplates) {
        this.validationTemplates = Array.isArray(validationTemplates) 
            ? validationTemplates 
            : (validationTemplates.validationTemplates || []);
        this.visitedFields = new Set();
        this.errorBuilder = new ValidationErrorBuilder();
    }
  
    normalizeTemplates(templates) {
      if (!Array.isArray(templates)) {
        return templates.validationTemplates || [];
      }
      return templates;
    }
  
    async validateField(field, conditions, fieldData) {
      const errors = [];
      
      for (const condition of conditions) {
        try {
          const error = await this.processCondition(field, condition, fieldData);
          if (error) errors.push(error);
        } catch (error) {
          errors.push(new ValidationError(
            field.fieldName,
            `Validation error: ${error.message}`,
            'SYSTEM_ERROR'
          ));
        }
      }
  
      return errors.length > 0 ? errors : null;
    }
  
    async processCondition(field, condition, fieldData) {
      switch (condition.type) {
        case 'REQUIRED':
          return this.validateRequired(field, condition);
        case 'COMPARISON':
          return this.validateComparison(field, condition);
        case 'DEPENDENCY':
          return this.validateDependency(field, condition, fieldData);
        case 'TYPE_CHECK':
          return this.validateType(field, condition);
        case 'LENGTH_CHECK':
          return this.validateLength(field, condition);
        case 'EMPTY_CHECK':
          return this.validateEmpty(field, condition);
        case 'REGEX':
          return this.validateRegex(field, condition);
        case 'CUSTOM':
          return this.validateCustom(field, condition, fieldData);
        case 'SUGGESTION':
          return null; // Suggestions don't generate errors
        default:
          throw new Error(`Unknown validation type: ${condition.type}`);
      }
    }
  
    validateRequired(field, condition) {
      if (field.value === null || field.value === undefined || field.value === '') {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} is required.`,
          'REQUIRED'
        );
      }
      return null;
    }
  
    validateComparison(field, condition) {
      if (!ValidationUtils.compare(field.value, condition.operator, condition.value)) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} comparison failed.`,
          'COMPARISON',
          { operator: condition.operator, expectedValue: condition.value }
        );
      }
      return null;
    }
  
    validateDependency(field, condition, fieldData) {
      if (this.visitedFields.has(field.fieldName)) {
        return null; // Prevent circular dependencies
      }
  
      this.visitedFields.add(field.fieldName);
      const dependentField = fieldData.find(f => f.fieldName === condition.dependentFieldId);
      
      if (!dependentField) {
        this.visitedFields.delete(field.fieldName);
        return null;
      }
  
      const isDependentValid = ValidationUtils.compare(
        dependentField.value,
        condition.dependentOperator,
        condition.dependentValue
      );
  
      if (isDependentValid && !field.value) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} is required when ${condition.dependentFieldId} ${condition.dependentOperator} ${condition.dependentValue}.`,
          'DEPENDENCY'
        );
      }
  
      this.visitedFields.delete(field.fieldName);
      return null;
    }
  
    validateType(field, condition) {
      if (!ValidationUtils.validateType(field.value, condition.expectedType)) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} must be a ${condition.expectedType}.`,
          'TYPE_CHECK'
        );
      }
      return null;
    }
  
    validateLength(field, condition) {
      const length = String(field.value).length;
      if (length < condition.minLength || length > condition.maxLength) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} length must be between ${condition.minLength} and ${condition.maxLength}.`,
          'LENGTH_CHECK'
        );
      }
      return null;
    }
  
    validateEmpty(field, condition) {
      const isEmpty = !field.value && field.value !== 0;
      if ((condition.operator === 'NOT_EMPTY' && isEmpty) ||
          (condition.operator === 'EMPTY' && !isEmpty)) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName} must ${condition.operator === 'EMPTY' ? 'be empty' : 'not be empty'}.`,
          'EMPTY_CHECK'
        );
      }
      return null;
    }
  
    validateRegex(field, condition) {
      try {
        const regex = new RegExp(condition.value);
        if (!regex.test(String(field.value))) {
          return new ValidationError(
            field.fieldName,
            condition.errorMessage || `${field.fieldName} format is invalid.`,
            'REGEX'
          );
        }
      } catch (error) {
        throw new Error(`Invalid regex pattern: ${error.message}`);
      }
      return null;
    }
  
    async validateCustom(field, condition, fieldData) {
      if (typeof condition.customFunction !== 'function') {
        throw new Error(`Custom function not provided for ${field.fieldName}.`);
      }
  
      try {
        const result = await condition.customFunction(field.value, fieldData);
        if (result) {
          return new ValidationError(
            field.fieldName,
            result,
            'CUSTOM'
          );
        }
      } catch (error) {
        throw new Error(`Custom validation error: ${error.message}`);
      }
      return null;
    }
  
    async validateFields(fieldData) {
      this.errorBuilder.clear(); // Clear previous errors
      
      for (const field of fieldData) {
          const template = this.validationTemplates.find(template => 
              template.rules.some(rule => rule.fieldId === field.fieldName)
          );

          if (template) {
              const rules = template.rules.filter(rule => rule.fieldId === field.fieldName);
              
              if (rules && rules.length > 0) {
                  const conditions = [];
                  for (const rule of rules) {
                      if (rule.conditions && Array.isArray(rule.conditions)) {
                          conditions.push(...rule.conditions);
                      }
                  }

                  if (conditions.length > 0) {
                      const errors = await this.validateField(field, conditions, fieldData);
                      if (errors) {
                          errors.forEach(error => {
                              this.errorBuilder.addError(field.fieldName, error);
                          });
                      }
                  }
              }
          }
      }

      return this.errorBuilder.formatErrors();
    }
  }
  
  module.exports = {
    DynamicPdfValidator,
    ValidationError,
    ValidationUtils,
    ValidationSchema,
    ValidationErrorBuilder
  };