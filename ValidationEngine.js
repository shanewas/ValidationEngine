// validationTypes.js
export const ValidationTypes = {
    REQUIRED: 'REQUIRED',
    COMPARISON: 'COMPARISON',
    DEPENDENCY: 'DEPENDENCY',
    TYPE_CHECK: 'TYPE_CHECK',
    LENGTH_CHECK: 'LENGTH_CHECK',
    EMPTY_CHECK: 'EMPTY_CHECK',
    REGEX: 'REGEX',
    CUSTOM: 'CUSTOM',
    SUGGESTION: 'SUGGESTION'
  };
  
  export const Operators = {
    EQUALS: 'EQUALS',
    NOT_EQUALS: 'NOT_EQUALS',
    GREATER_THAN: 'GREATER_THAN',
    LESS_THAN: 'LESS_THAN',
    BETWEEN: 'BETWEEN',
    CONTAINS: 'CONTAINS',
    STARTS_WITH: 'STARTS_WITH',
    ENDS_WITH: 'ENDS_WITH',
    BEFORE: 'BEFORE',
    AFTER: 'AFTER'
  };
  
  // fieldValidator.js
  export class FieldValidator {
    constructor() {
      this.validatorMap = new Map();
      this.initializeValidators();
    }
  
    initializeValidators() {
      // Register built-in validators
      this.registerValidator(ValidationTypes.REQUIRED, this.validateRequired);
      this.registerValidator(ValidationTypes.COMPARISON, this.validateComparison);
      this.registerValidator(ValidationTypes.TYPE_CHECK, this.validateType);
      this.registerValidator(ValidationTypes.LENGTH_CHECK, this.validateLength);
      this.registerValidator(ValidationTypes.DEPENDENCY, this.validateDependency);
      this.registerValidator(ValidationTypes.REGEX, this.validateRegex);
    }
  
    registerValidator(type, validatorFn) {
      this.validatorMap.set(type, validatorFn);
    }
  
    async validateField(field, rule, context) {
      const validator = this.validatorMap.get(rule.type);
      if (!validator) {
        throw new Error(`No validator registered for type: ${rule.type}`);
      }
      return validator.call(this, field, rule, context);
    }
  
    // Validator implementations
    async validateRequired(field, rule) {
      const value = field.value;
      return {
        isValid: value !== null && value !== undefined && value !== '',
        error: rule.errorMessage || 'This field is required'
      };
    }
  
    async validateComparison(field, rule, context) {
      const value = field.value;
      const targetValue = rule.value;
  
      switch (rule.operator) {
        case Operators.EQUALS:
          return {
            isValid: value === targetValue,
            error: rule.errorMessage || `Value must equal ${targetValue}`
          };
        case Operators.GREATER_THAN:
          return {
            isValid: value > targetValue,
            error: rule.errorMessage || `Value must be greater than ${targetValue}`
          };
        // Add other operators...
      }
    }
  
    async validateDependency(field, rule, context) {
      const dependentField = context.getField(rule.dependentFieldId);
      if (!dependentField) {
        return { isValid: false, error: 'Dependent field not found' };
      }
  
      return {
        isValid: this.evaluateDependency(field.value, dependentField.value, rule),
        error: rule.errorMessage || 'Dependency validation failed'
      };
    }
  
    // Additional validator methods...
  }
  
  // ruleProcessor.js
  export class RuleProcessor {
    constructor(fieldValidator) {
      this.fieldValidator = fieldValidator;
      this.ruleGroups = new Map();
    }
  
    setRules(rules) {
      this.ruleGroups = this.organizeRulesByGroup(rules);
    }
  
    organizeRulesByGroup(rules) {
      const groups = new Map();
      rules.forEach(rule => {
        if (!groups.has(rule.groupId)) {
          groups.set(rule.groupId, {
            priority: rule.groupPriority,
            operator: rule.groupOperator,
            rules: []
          });
        }
        groups.get(rule.groupId).rules.push(rule);
      });
      return groups;
    }
  
    async processField(field, context) {
      const fieldRules = this.getRulesForField(field.id);
      const results = [];
  
      for (const group of this.ruleGroups.values()) {
        const groupResults = await this.processRuleGroup(field, group, context);
        results.push(groupResults);
      }
  
      return this.aggregateResults(results);
    }
  
    async processRuleGroup(field, group, context) {
      const results = await Promise.all(
        group.rules.map(rule => this.fieldValidator.validateField(field, rule, context))
      );
  
      const isValid = group.operator === 'AND' 
        ? results.every(r => r.isValid)
        : results.some(r => r.isValid);
  
      return {
        isValid,
        errors: results.filter(r => !r.isValid).map(r => r.error),
        groupId: group.groupId
      };
    }
  
    getRulesForField(fieldId) {
      const fieldRules = new Map();
      this.ruleGroups.forEach((group, groupId) => {
        const rules = group.rules.filter(r => r.fieldId === fieldId);
        if (rules.length > 0) {
          fieldRules.set(groupId, { ...group, rules });
        }
      });
      return fieldRules;
    }
  }
  
  // validationEngine.js
  export class ValidationEngine {
    constructor() {
      this.fieldValidator = new FieldValidator();
      this.ruleProcessor = new RuleProcessor(this.fieldValidator);
      this.context = null;
    }
  
    initialize(config) {
      this.context = this.createContext(config);
      this.ruleProcessor.setRules(config.rules);
      this.registerCustomValidators(config.customValidators);
    }
  
    createContext(config) {
      return {
        getField: (fieldId) => this.getFieldValue(fieldId),
        getPdfContext: (pdfId) => this.getPdfContext(pdfId),
        config
      };
    }
  
    registerCustomValidators(validators = {}) {
      Object.entries(validators).forEach(([type, validator]) => {
        this.fieldValidator.registerValidator(type, validator);
      });
    }
  
    async validateField(fieldId, value) {
      const field = { id: fieldId, value };
      return this.ruleProcessor.processField(field, this.context);
    }
  
    async validateForm(fields) {
      const results = await Promise.all(
        Object.entries(fields).map(([fieldId, value]) => 
          this.validateField(fieldId, value)
        )
      );
  
      return {
        isValid: results.every(r => r.isValid),
        errors: results.reduce((acc, r) => {
          if (!r.isValid) acc[r.fieldId] = r.errors;
          return acc;
        }, {})
      };
    }
  
    getFieldValue(fieldId) {
      // Implementation to get field value from viewer
      return null;
    }
  
    getPdfContext(pdfId) {
      // Implementation to get PDF context from viewer
      return null;
    }
  }
  
  // validationController.js
  export class ValidationController {
    constructor(webViewer) {
      this.webViewer = webViewer;
      this.engine = new ValidationEngine();
      this.initialized = false;
    }
  
    async initialize(config) {
      try {
        await this.engine.initialize(config);
        this.setupEventListeners();
        this.initialized = true;
      } catch (error) {
        console.error('Validation initialization failed:', error);
        throw error;
      }
    }
  
    setupEventListeners() {
      // Listen for field changes
      this.webViewer.addEventListener('fieldChange', async (event) => {
        const { fieldId, value } = event.detail;
        await this.validateField(fieldId, value);
      });
  
      // Listen for form submission
      this.webViewer.addEventListener('formSubmit', async () => {
        await this.validateForm();
      });
    }
  
    async validateField(fieldId, value) {
      if (!this.initialized) {
        throw new Error('Validation not initialized');
      }
  
      const result = await this.engine.validateField(fieldId, value);
      this.updateFieldUI(fieldId, result);
      return result;
    }
  
    async validateForm() {
      if (!this.initialized) {
        throw new Error('Validation not initialized');
      }
  
      const fields = this.webViewer.getFormFields();
      const result = await this.engine.validateForm(fields);
      this.updateFormUI(result);
      return result;
    }
  
    updateFieldUI(fieldId, result) {
      if (!result.isValid) {
        this.webViewer.showFieldError(fieldId, result.errors);
      } else {
        this.webViewer.clearFieldError(fieldId);
      }
    }
  
    updateFormUI(result) {
      if (!result.isValid) {
        this.webViewer.showFormErrors(result.errors);
      } else {
        this.webViewer.clearAllErrors();
      }
    }
  }
  
  // Usage example:
  /*
  import { ValidationController } from './validationController';
  
  // In your Web Viewer initialization
  const validationController = new ValidationController(webViewer);
  
  // Configure validation
  await validationController.initialize({
    rules: [
      {
        fieldId: 'name',
        type: 'REQUIRED',
        groupId: 'group1',
        groupPriority: 'HIGH',
        groupOperator: 'AND',
        errorMessage: 'Name is required'
      },
      // ... more rules
    ],
    customValidators: {
      // Add custom validators if needed
      CUSTOM_TYPE: async (field, rule, context) => {
        // Custom validation logic
        return { isValid: true, error: null };
      }
    }
  });
  */