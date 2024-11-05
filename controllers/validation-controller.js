
import { ValidationEngine } from '../services/validation-engine.js';

// controllers/validation-controller.js
export class ValidationController {
  constructor() {
    this.validationEngine = new ValidationEngine();
  }

  async validateForms(request) {
    try {
      this.validateRequest(request);

      const { fieldData, validationRules } = request;
      const result = await this.validationEngine.validate(fieldData, validationRules);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateRequest(request) {
    if (!request.fieldData || !Array.isArray(request.fieldData)) {
      throw new Error('Invalid field data format');
    }

    if (!request.validationRules || !Array.isArray(request.validationRules)) {
      throw new Error('Invalid validation rules format');
    }

    // Validate field data structure
    request.fieldData.forEach(pdf => {
      if (!pdf.pdfId || !pdf.data || !Array.isArray(pdf.data)) {
        throw new Error(`Invalid PDF data structure for PDF: ${pdf.pdfId}`);
      }

      pdf.data.forEach(field => {
        if (!field.fieldName || !field.hasOwnProperty('page')) {
          throw new Error(`Invalid field structure in PDF: ${pdf.pdfId}`);
        }
      });
    });

    // Validate rules structure
    request.validationRules.forEach(rule => {
      if (!rule.ruleId || !rule.conditions || !Array.isArray(rule.conditions)) {
        throw new Error(`Invalid rule structure for rule: ${rule.ruleId}`);
      }

      rule.conditions.forEach(condition => {
        if (!condition.type || !condition.fieldId) {
          throw new Error(`Invalid condition structure in rule: ${rule.ruleId}`);
        }
      });
    });
  }
}