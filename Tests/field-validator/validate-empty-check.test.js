import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Empty Check Validation', () => {
  test('should pass when field is empty', () => {
    const field = { fieldId: 'optionalField', value: '' };
    const condition = { type: 'EMPTY_CHECK', operator: 'EMPTY' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeNull();
  });

  test('should fail when field is not empty', () => {
    const field = { fieldId: 'optionalField', value: 'value' };
    const condition = { type: 'EMPTY_CHECK', operator: 'EMPTY', errorMessage: 'Field must be empty' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Field must be empty');
  });
});
