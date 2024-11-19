import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Regex Validation', () => {
  test('should pass when value matches regex', () => {
    const field = { fieldId: 'email', value: 'test@example.com' };
    const condition = { type: 'REGEX', value: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', errorMessage: 'Invalid email format' };
    const result = FieldValidator.validateRegex(field, condition);
    expect(result).toBeNull();
  });

  test('should fail when value does not match regex', () => {
    const field = { fieldId: 'email', value: 'invalid-email' };
    const condition = { type: 'REGEX', value: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$', errorMessage: 'Invalid email format' };
    const result = FieldValidator.validateRegex(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Invalid email format');
  });
});
