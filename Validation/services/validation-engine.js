import { ValidationResult } from '../models/validation-result.js';
import { ValidationContext } from '../services/validation-context.js';
import { FieldValidator } from '../services/field-validator.js';
import { RuleProcessor } from '../services/rule-processor.js';

// services/validation-engine.js
export class ValidationEngine {
    constructor() {
      this.validationResult = new ValidationResult();
    }
  
    async validate(fieldData, validationRules) {
      try {
        const context = new ValidationContext(fieldData);
        const fieldValidator = new FieldValidator(context);
        const ruleProcessor = new RuleProcessor(context, fieldValidator);
  
        // Sort rules by priority if specified
        const sortedRules = this.sortRulesByPriority(validationRules);
  
        // Process each rule for relevant fields
        for (const rule of sortedRules) {
          await this.processRuleForAllFields(rule, context, ruleProcessor);
        }
  
        return this.validationResult.formatResults();
      } catch (error) {
        throw new Error(`Validation engine error: ${error.message}`);
      }
    }
  
    sortRulesByPriority(rules) {
      return [...rules].sort((a, b) => {
        const priorityA = this.getPriorityWeight(a.priority);
        const priorityB = this.getPriorityWeight(b.priority);
        return priorityB - priorityA;
      });
    }
  
    getPriorityWeight(priority) {
      const priorities = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
      };
      return priorities[priority] || 0;
    }
  
    async processRuleForAllFields(rule, context, ruleProcessor) {
      const fields = context.getAllFields();
      
      for (const field of fields) {
        // Check if the rule applies to this field
        if (this.isRuleApplicableToField(rule, field)) {
          const errors = await ruleProcessor.processRule(rule, field);
          errors.forEach(error => {
            this.validationResult.addError(field.fieldName, error);
          });
        }
      }
    }
  
    isRuleApplicableToField(rule, field) {
      // Check if any condition in the rule references this field
      return rule.conditions.some(condition => 
        condition.fieldId === field.fieldName || 
        condition.dependentFieldId === field.fieldName
      );
    }
  }
  