// enhanced-pdf-validator.js
class EnhancedPdfValidator {
    constructor(validationTemplates) {
      this.validationTemplates = Array.isArray(validationTemplates) 
        ? validationTemplates 
        : (validationTemplates.validationTemplates || []);
      this.visitedFields = new Set();
      this.errorBuilder = new ValidationErrorBuilder();
    }
  
    // Add a new method to validate fields within a specific PDF context
    async validatePdfFields(fieldData, pdfId, page = null) {
      this.errorBuilder.clear();
  
      // Group fields by PDF and page for better organization
      const pdfContext = {
        pdfId,
        page,
        fields: fieldData.map(field => ({
          ...field,
          pdfId: field.pdfId || pdfId, // Allow override at field level
          page: field.page || page // Allow override at field level
        }))
      };
  
      for (const field of pdfContext.fields) {
        const template = this.validationTemplates.find(template => 
          template.rules.some(rule => rule.fieldId === field.fieldName)
        );
  
        if (template) {
          const rules = template.rules.filter(rule => {
            // Check if rule applies to this PDF and page
            const ruleMatchesPdf = !rule.pdfId || rule.pdfId === field.pdfId;
            const ruleMatchesPage = !rule.page || rule.page === field.page;
            return rule.fieldId === field.fieldName && ruleMatchesPdf && ruleMatchesPage;
          });
  
          if (rules && rules.length > 0) {
            const conditions = [];
            for (const rule of rules) {
              if (rule.conditions && Array.isArray(rule.conditions)) {
                // Enhance conditions with PDF context
                const enhancedConditions = rule.conditions.map(condition => ({
                  ...condition,
                  pdfId: condition.pdfId || field.pdfId,
                  page: condition.page || field.page
                }));
                conditions.push(...enhancedConditions);
              }
            }
  
            if (conditions.length > 0) {
              const errors = await this.validateFieldWithContext(field, conditions, pdfContext.fields);
              if (errors) {
                errors.forEach(error => {
                  this.errorBuilder.addError(field.fieldName, this.enhanceErrorWithContext(error, field));
                });
              }
            }
          }
        }
      }
  
      return this.errorBuilder.formatErrors();
    }
  
    // Enhanced validation method that considers PDF context
    async validateFieldWithContext(field, conditions, allFields) {
      const errors = [];
      for (const condition of conditions) {
        try {
          const error = await this.processConditionWithContext(field, condition, allFields);
          if (error) errors.push(error);
        } catch (error) {
          errors.push(new ValidationError(
            field.fieldName,
            `Validation error: ${error.message}`,
            'SYSTEM_ERROR',
            { pdfId: field.pdfId, page: field.page }
          ));
        }
      }
      return errors.length > 0 ? errors : null;
    }
  
    // Enhanced process condition method that considers PDF context
    async processConditionWithContext(field, condition, allFields) {
      switch (condition.type) {
        case 'DEPENDENCY':
          return this.validateDependencyWithContext(field, condition, allFields);
        // Handle other condition types with PDF context
        default:
          const error = await this.processCondition(field, condition, allFields);
          if (error) {
            return this.enhanceErrorWithContext(error, field);
          }
          return null;
      }
    }
  
    // Enhanced dependency validation that considers PDF context
    validateDependencyWithContext(field, condition, allFields) {
      if (this.visitedFields.has(field.fieldName)) {
        return null; // Prevent circular dependencies
      }
      
      this.visitedFields.add(field.fieldName);
      
      const dependentField = allFields.find(f => {
        const fieldMatches = f.fieldName === condition.dependentFieldId;
        const pdfMatches = !condition.pdfId || condition.pdfId === f.pdfId;
        const pageMatches = !condition.page || condition.page === f.page;
        return fieldMatches && pdfMatches && pageMatches;
      });
  
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
        const error = new ValidationError(
          field.fieldName,
          condition.errorMessage || 
          `${field.fieldName} is required when ${condition.dependentFieldId} ${condition.dependentOperator} ${condition.dependentValue}.`,
          'DEPENDENCY',
          {
            dependentField: condition.dependentFieldId,
            dependentPdfId: dependentField.pdfId,
            dependentPage: dependentField.page
          }
        );
        
        this.visitedFields.delete(field.fieldName);
        return this.enhanceErrorWithContext(error, field);
      }
  
      this.visitedFields.delete(field.fieldName);
      return null;
    }
  
    // Helper method to enhance errors with PDF context
    enhanceErrorWithContext(error, field) {
      return new ValidationError(
        error.fieldId,
        error.message,
        error.type,
        {
          ...error.details,
          pdfId: field.pdfId,
          page: field.page
        }
      );
    }
  }
  
  // Update ValidationErrorBuilder to include PDF context in formatted errors
  class EnhancedValidationErrorBuilder extends ValidationErrorBuilder {
    formatErrors() {
      const formattedErrors = {
        hasErrors: this.hasErrors(),
        errorCount: 0,
        fieldErrors: {},
        summary: [],
        pdfContextErrors: {} // New structure to organize errors by PDF and page
      };
  
      for (const [fieldId, errors] of Object.entries(this.errors)) {
        formattedErrors.errorCount += errors.length;
        
        formattedErrors.fieldErrors[fieldId] = errors.map(error => ({
          message: error.message,
          type: error.type,
          details: error.details || {},
          fieldId: error.fieldId,
          pdfId: error.details?.pdfId,
          page: error.details?.page
        }));
  
        errors.forEach(error => {
          // Add to summary
          formattedErrors.summary.push({
            fieldId,
            message: error.message,
            type: error.type,
            pdfId: error.details?.pdfId,
            page: error.details?.page
          });
  
          // Organize by PDF context
          const pdfId = error.details?.pdfId || 'unknown';
          const page = error.details?.page || 'all';
  
          if (!formattedErrors.pdfContextErrors[pdfId]) {
            formattedErrors.pdfContextErrors[pdfId] = {};
          }
          if (!formattedErrors.pdfContextErrors[pdfId][page]) {
            formattedErrors.pdfContextErrors[pdfId][page] = [];
          }
  
          formattedErrors.pdfContextErrors[pdfId][page].push({
            fieldId,
            message: error.message,
            type: error.type,
            details: error.details
          });
        });
      }
  
      return formattedErrors;
    }
  }
  
  module.exports = {
    EnhancedPdfValidator,
    EnhancedValidationErrorBuilder
  };