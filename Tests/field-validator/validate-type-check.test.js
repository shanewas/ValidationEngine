import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Type Check Validation', () => {
  test('should pass when type matches', () => {
    const field = { fieldId: 'amount', value: 123 };
    const condition = { type: 'TYPE_CHECK', expectedType: 'number' };
    const result = FieldValidator.validateType(field, condition);
    expect(result).toBeNull();
  });

  test('should fail when type does not match', () => {
    const field = { fieldId: 'amount', value: '123' };
    const condition = { type: 'TYPE_CHECK', expectedType: 'number', errorMessage: 'Must be a number' };
    const result = FieldValidator.validateType(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Must be a number');
  });
});
