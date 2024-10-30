// pdf-validator.js
class PdfValidator {
  constructor(validationTemplates) {
    this.validationTemplates = Array.isArray(validationTemplates)
      ? validationTemplates
      : validationTemplates.validationTemplates || [];
    this.visitedFields = new Set();
    this.errorBuilder = new ValidationErrorBuilder();
  }

  // Helper method to get field value regardless of type
  getFieldValue(field) {
    if (field.values !== undefined) {
      return Array.isArray(field.values) ? field.values : [field.values];
    }
    return field.value;
  }

  async validatePdfFields(fieldData, pdfId) {
    this.errorBuilder.clear();

    const pdfContext = {
      pdfId,
      fields: fieldData.map((field) => ({
        ...field,
        pdfId: pdfId,
      })),
    };

    for (const field of pdfContext.fields) {
      const template = this.validationTemplates.find((template) =>
        template.rules.some((rule) => rule.fieldId === field.fieldName)
      );

      if (template) {
        const rules = template.rules.filter(
          (rule) => rule.fieldId === field.fieldName
        );

        if (rules && rules.length > 0) {
          const conditions = [];
          for (const rule of rules) {
            if (rule.conditions && Array.isArray(rule.conditions)) {
              conditions.push(...rule.conditions);
            }
          }

          if (conditions.length > 0) {
            const errors = await this.validateFieldWithContext(
              field,
              conditions,
              pdfContext.fields
            );
            if (errors) {
              errors.forEach((error) => {
                this.errorBuilder.addError(
                  field.fieldName,
                  this.enhanceErrorWithContext(error, field)
                );
              });
            }
          }
        }
      }
    }

    return this.errorBuilder.formatErrors();
  }

  async validateFieldWithContext(field, conditions, allFields) {
    const errors = [];
    for (const condition of conditions) {
      try {
        const error = await this.processCondition(field, condition, allFields);
        if (error) errors.push(error);
      } catch (error) {
        errors.push(
          new ValidationError(
            field.fieldName,
            `検証エラー: ${error.message}`,
            "SYSTEM_ERROR",
            { page: field.page }
          )
        );
      }
    }
    return errors.length > 0 ? errors : null;
  }

  async processCondition(field, condition, allFields) {
    const fieldValue = this.getFieldValue(field);

    switch (condition.type) {
      case "REQUIRED":
        return this.validateRequired(field, fieldValue, condition);
      case "COMPARISON":
        return this.validateComparison(field, fieldValue, condition);
      case "DEPENDENCY":
        return this.validateDependency(field, fieldValue, condition, allFields);
      case "TYPE_CHECK":
        return this.validateType(field, fieldValue, condition);
      case "LENGTH_CHECK":
        return this.validateLength(field, fieldValue, condition);
      case "EMPTY_CHECK":
        return this.validateEmpty(field, fieldValue, condition);
      case "REGEX":
        return this.validateRegex(field, fieldValue, condition);
      case "CUSTOM":
        return this.validateCustom(field, fieldValue, condition, allFields);
      case "SUGGESTION":
        return null;
      default:
        throw new Error(`未知の検証タイプ: ${condition.type}`);
    }
  }

  validateRequired(field, value, condition) {
    const isEmpty = Array.isArray(value)
      ? value.length === 0
      : value === null || value === undefined || value === "";

    if (isEmpty) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage || `${field.fieldName}は必須です。`,
        "REQUIRED"
      );
    }
    return null;
  }

  validateComparison(field, value, condition) {
    // Handle array values
    if (Array.isArray(value)) {
      // If comparing arrays, check if any value matches the condition
      const hasValidValue = value.some((v) =>
        ValidationUtils.compare(v, condition.operator, condition.value)
      );
      if (!hasValidValue) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName}の値が不正です。`,
          "COMPARISON",
          { operator: condition.operator, expectedValue: condition.value }
        );
      }
    } else {
      if (
        !ValidationUtils.compare(value, condition.operator, condition.value)
      ) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName}の値が不正です。`,
          "COMPARISON",
          { operator: condition.operator, expectedValue: condition.value }
        );
      }
    }
    return null;
  }

  validateDependency(field, value, condition, allFields) {
    if (this.visitedFields.has(field.fieldName)) {
      return null;
    }

    this.visitedFields.add(field.fieldName);

    const dependentField = allFields.find(
      (f) => f.fieldName === condition.dependentFieldId
    );

    if (!dependentField) {
      this.visitedFields.delete(field.fieldName);
      return null;
    }

    const dependentValue = this.getFieldValue(dependentField);
    const isDependentValid = ValidationUtils.compare(
      dependentValue,
      condition.dependentOperator,
      condition.dependentValue
    );

    if (isDependentValid && !value) {
      const error = new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName}は${condition.dependentFieldId}の値が${condition.dependentValue}の場合、必須です。`,
        "DEPENDENCY",
        {
          dependentField: condition.dependentFieldId,
          page: field.page,
        }
      );

      this.visitedFields.delete(field.fieldName);
      return error;
    }

    this.visitedFields.delete(field.fieldName);
    return null;
  }

  validateType(field, value, condition) {
    if (Array.isArray(value)) {
      // For array fields, check if all values match the expected type
      const hasInvalidValue = value.some(
        (v) => !ValidationUtils.validateType(v, condition.expectedType)
      );
      if (hasInvalidValue) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage ||
            `${field.fieldName}は${condition.expectedType}型である必要があります。`,
          "TYPE_CHECK"
        );
      }
    } else {
      if (!ValidationUtils.validateType(value, condition.expectedType)) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage ||
            `${field.fieldName}は${condition.expectedType}型である必要があります。`,
          "TYPE_CHECK"
        );
      }
    }
    return null;
  }

  validateLength(field, value, condition) {
    const stringValue = Array.isArray(value) ? value.join("") : String(value);

    const length = stringValue.length;
    if (length < condition.minLength || length > condition.maxLength) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName}の長さは${condition.minLength}文字から${condition.maxLength}文字の間である必要があります。`,
        "LENGTH_CHECK"
      );
    }
    return null;
  }

  validateEmpty(field, value, condition) {
    const isEmpty = Array.isArray(value)
      ? value.length === 0
      : !value && value !== 0;

    if (
      (condition.operator === "NOT_EMPTY" && isEmpty) ||
      (condition.operator === "EMPTY" && !isEmpty)
    ) {
      return new ValidationError(
        field.fieldName,
        condition.errorMessage ||
          `${field.fieldName}は${
            condition.operator === "EMPTY" ? "空である" : "空でない"
          }必要があります。`,
        "EMPTY_CHECK"
      );
    }
    return null;
  }

  validateRegex(field, value, condition) {
    try {
      const regex = new RegExp(condition.value);
      const stringValue = Array.isArray(value) ? value.join("") : String(value);

      if (!regex.test(stringValue)) {
        return new ValidationError(
          field.fieldName,
          condition.errorMessage || `${field.fieldName}は必須です。`,
          "REGEX"
        );
      }
    } catch (error) {
      throw new Error(`正規表現パターンが不正です: ${error.message}`);
    }
    return null;
  }

  async validateCustom(field, value, condition, allFields) {
    if (typeof condition.customFunction !== "function") {
      throw new Error(`${field.fieldName}のカスタム関数が提供されていません。`);
    }

    try {
      const result = await condition.customFunction(value, allFields);
      if (result) {
        return new ValidationError(field.fieldName, result, "CUSTOM");
      }
    } catch (error) {
      throw new Error(`カスタム検証エラー: ${error.message}`);
    }
    return null;
  }

  enhanceErrorWithContext(error, field) {
    return new ValidationError(error.fieldId, error.message, error.type, {
      ...error.details,
      page: field.page,
    });
  }
}

// Update error builder to include field names
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
      summary: [],
    };

    for (const [fieldId, errors] of Object.entries(this.errors)) {
      formattedErrors.errorCount += errors.length;
      formattedErrors.fieldErrors[fieldId] = errors.map((error) => ({
        message: error.message,
        type: error.type,
        details: error.details || {},
        fieldId: error.fieldId,
      }));

      errors.forEach((error) => {
        formattedErrors.summary.push({
          fieldId,
          message: error.message,
          type: error.type,
        });
      });
    }

    return formattedErrors;
  }

  clear() {
    this.errors = {};
  }
}

module.exports = {
  PdfValidator,
  ValidationErrorBuilder,
};
