import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Length Check Validation', () => {
  test('should pass when length is within range', () => {
    const field = { fieldId: 'username', value: 'JohnDoe' };
    const condition = { type: 'LENGTH_CHECK', minLength: 3, maxLength: 10 };
    const result = FieldValidator.validateLength(field, condition);
    expect(result).toBeNull();
  });

  test('should fail when length is too short', () => {
    const field = { fieldId: 'username', value: 'JD' };
    const condition = { type: 'LENGTH_CHECK', minLength: 3, maxLength: 10, errorMessage: 'Too short' };
    const result = FieldValidator.validateLength(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Too short');
  });
});
