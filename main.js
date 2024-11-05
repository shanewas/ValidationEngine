import { ValidationController } from './controllers/validation-controller.js';

export const validatePDFForms = async (pdfData, customRules) => {
  try {
    const validationController = new ValidationController();

    const request = {
      fieldData: pdfData,
      validationRules: customRules
    };

    const result = await validationController.validateForms(request);
    return result;
  } catch (error) {
    console.error("Validation failed:", error);
    throw error;
  }
};

export const createValidationRules = (config) => {
  return {
    ruleId: config.ruleId,
    ruleName: config.name,
    priority: config.priority || "MEDIUM",
    scope: config.scope,
    conditions: config.conditions.map(condition => ({
      type: condition.type,
      fieldId: condition.fieldId,
      operator: condition.operator,
      value: condition.value,
      errorMessage: condition.errorMessage,
      dependentFieldId: condition.dependentFieldId,
      dependentOperator: condition.dependentOperator,
      dependentValue: condition.dependentValue,
      pdfId: condition.pdfId,
      page: condition.page
    }))
  };
};
