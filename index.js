// index.js
import { ValidationController } from './controller/validation-controller.js';
import { VALIDATION_TYPES, OPERATORS } from './constants/validation-types.js';
import { ValidationError } from './models/validation-error.js';
import { ValidationResult } from './models/validation-result.js';
import { ValidationEngine } from './service/validation-engine.js';
import { ValidationContext } from './service/validation-context.js';
import { FieldValidator } from './service/field-validator.js';
import { RuleProcessor } from './service/rule-processor.js';
import { ValidationUtils } from './utils/validation-utils.js';

// Main exports
export {
  // Core functionality
  ValidationController,
  ValidationEngine,
  
  // Models
  ValidationError,
  ValidationResult,
  
  // Services
  ValidationContext,
  FieldValidator,
  RuleProcessor,
  
  // Utils
  ValidationUtils,
  
  // Constants
  VALIDATION_TYPES,
  OPERATORS
};

// Default export for common use case
export default ValidationController;