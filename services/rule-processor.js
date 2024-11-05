import { ValidationError } from "../models/validation-error.js";
import { VALIDATION_TYPES } from "../constants/validation-types.js";
// services/rule-processor.js
export class RuleProcessor {
  constructor(validationContext, fieldValidator) {
    this.context = validationContext;
    this.fieldValidator = fieldValidator;
  }

  async processRule(rule, field) {
    const errors = [];
    const conditions = rule.conditions || [];

    // Process conditions based on rule scope if specified
    if (rule.scope) {
      const scopedFields = this.getScopedFields(rule.scope);
      if (!scopedFields.includes(field.fieldName)) {
        return errors;
      }
    }

    for (const condition of conditions) {
      try {
        const error = await this.evaluateCondition(field, condition);
        if (error) errors.push(error);
      } catch (error) {
        errors.push(
          new ValidationError(
            field.fieldName,
            `Validation error: ${error.message}`,
            "SYSTEM_ERROR",
            { pdfId: field.pdfId, page: field.page }
          )
        );
      }
    }

    return errors;
  }

  async evaluateCondition(field, condition) {
    const validatorMethod = this.getValidatorMethod(condition.type);
    if (!validatorMethod) {
      throw new Error(`Unknown validation type: ${condition.type}`);
    }

    // Skip validation if condition is not applicable to this field
    if (!this.isConditionApplicable(field, condition)) {
      return null;
    }

    return validatorMethod.call(this.fieldValidator, field, condition);
  }

  getValidatorMethod(type) {
    const validators = {
      [VALIDATION_TYPES.REQUIRED]: this.fieldValidator.validateRequired,
      [VALIDATION_TYPES.COMPARISON]: this.fieldValidator.validateComparison,
      [VALIDATION_TYPES.DEPENDENCY]: this.fieldValidator.validateDependency,
      [VALIDATION_TYPES.TYPE_CHECK]: this.fieldValidator.validateType,
      [VALIDATION_TYPES.LENGTH_CHECK]: this.fieldValidator.validateLength,
      [VALIDATION_TYPES.EMPTY_CHECK]: this.fieldValidator.validateEmpty,
      [VALIDATION_TYPES.REGEX]: this.fieldValidator.validateRegex,
      [VALIDATION_TYPES.CUSTOM]: this.fieldValidator.validateCustom,
      [VALIDATION_TYPES.SUGGESTION]: () => null,
    };

    const validator = validators[type];
    return validator ? validator.bind(this.fieldValidator) : null;
  }

  isConditionApplicable(field, condition) {
    // Check if the condition applies to the current field
    if (condition.fieldId === field.fieldName) {
      return true;
    }

    // For dependency conditions, check if this field is the dependent field
    if (
      condition.type === VALIDATION_TYPES.DEPENDENCY &&
      condition.dependentFieldId === field.fieldName
    ) {
      return true;
    }

    // Check for cross-PDF validations
    if (condition.pdfId && condition.pdfId !== field.pdfId) {
      return false;
    }

    return false;
  }

  getScopedFields(scope) {
    // This method would implement scope-based field filtering
    // Scope could be specific pages, PDFs, or field groups
    const scopedFields = new Set();

    this.context.getAllFields().forEach((field) => {
      if (this.isFieldInScope(field, scope)) {
        scopedFields.add(field.fieldName);
      }
    });

    return Array.from(scopedFields);
  }

  isFieldInScope(field, scope) {
    // Implement scope checking logic based on your requirements
    // Example implementation:
    switch (scope.type) {
      case "PDF":
        return field.pdfId === scope.pdfId;
      case "PAGE":
        return field.pdfId === scope.pdfId && field.page === scope.page;
      case "GROUP":
        return scope.fieldGroups.includes(field.fieldName);
      default:
        return true;
    }
  }
}
