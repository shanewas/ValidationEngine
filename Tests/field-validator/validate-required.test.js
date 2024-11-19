import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Required Validation', () => {
  test('should pass when field is not empty', () => {
    const field = { fieldId: 'name', value: 'John' };
    const condition = { type: 'REQUIRED', errorMessage: 'Name is required' };
    const result = FieldValidator.validateRequired(field, condition);
    expect(result).toBeNull(); // Passes validation
  });

  test('should fail when field is empty', () => {
    const field = { fieldId: 'name', value: '' };
    const condition = { type: 'REQUIRED', errorMessage: 'Name is required' };
    const result = FieldValidator.validateRequired(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Name is required');
  });
});
