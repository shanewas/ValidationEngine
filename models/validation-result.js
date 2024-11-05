// models/validation-result.js
export class ValidationResult {
    constructor() {
      this.errors = new Map();
      this.warnings = new Map();
      this.suggestions = new Map();
    }
  
    addError(fieldId, error) {
      if (!this.errors.has(fieldId)) {
        this.errors.set(fieldId, []);
      }
      this.errors.get(fieldId).push(error);
    }
  
    addWarning(fieldId, warning) {
      if (!this.warnings.has(fieldId)) {
        this.warnings.set(fieldId, []);
      }
      this.warnings.get(fieldId).push(warning);
    }
  
    addSuggestion(fieldId, suggestion) {
      if (!this.suggestions.has(fieldId)) {
        this.suggestions.set(fieldId, []);
      }
      this.suggestions.get(fieldId).push(suggestion);
    }
  
    formatResults() {
      const result = {
        hasErrors: this.errors.size > 0,
        hasWarnings: this.warnings.size > 0,
        hasSuggestions: this.suggestions.size > 0,
        errorCount: 0,
        warningCount: 0,
        suggestionCount: 0,
        details: {
          errors: {},
          warnings: {},
          suggestions: {},
        },
        summary: []
      };
  
      this.formatErrorDetails(result);
      this.formatWarningDetails(result);
      this.formatSuggestionDetails(result);
  
      return result;
    }
  
    formatErrorDetails(result) {
      this.errors.forEach((errors, fieldId) => {
        result.errorCount += errors.length;
        result.details.errors[fieldId] = errors.map(error => ({
          message: error.message,
          type: error.type,
          pdfId: error.pdfId,
          page: error.page,
          details: error.details || {}
        }));
        errors.forEach(error => {
          result.summary.push({
            type: 'error',
            fieldId,
            message: error.message,
            pdfId: error.pdfId,
            page: error.page
          });
        });
      });
    }
  
    formatWarningDetails(result) {
      this.warnings.forEach((warnings, fieldId) => {
        result.warningCount += warnings.length;
        result.details.warnings[fieldId] = warnings;
        warnings.forEach(warning => {
          result.summary.push({
            type: 'warning',
            fieldId,
            message: warning.message,
            pdfId: warning.pdfId,
            page: warning.page
          });
        });
      });
    }
  
    formatSuggestionDetails(result) {
      this.suggestions.forEach((suggestions, fieldId) => {
        result.suggestionCount += suggestions.length;
        result.details.suggestions[fieldId] = suggestions;
        suggestions.forEach(suggestion => {
          result.summary.push({
            type: 'suggestion',
            fieldId,
            message: suggestion.message,
            pdfId: suggestion.pdfId,
            page: suggestion.page
          });
        });
      });
    }
  }