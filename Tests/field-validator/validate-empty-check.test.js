
import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Empty Check Validation', () => {
  test('should pass when field is empty (explicit check)', () => {
    const field = { fieldId: 'optionalField', value: '' };
    const condition = { type: 'EMPTY_CHECK', operator: 'EMPTY' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeNull(); // No error, field passes the empty check
  });

  test('should fail when field is not empty', () => {
    const field = { fieldId: 'optionalField', value: 'value' };
    const condition = { type: 'EMPTY_CHECK', operator: 'EMPTY', errorMessage: 'Field must be empty' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Field must be empty');
  });

  test('should fail when field is null', () => {
    const field = { fieldId: 'optionalField', value: null };
    const condition = { type: 'EMPTY_CHECK', operator: 'EMPTY', errorMessage: 'Field must be empty' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Field must be empty');
  });

  test('should fail when field is undefined', () => {
    const field = { fieldId: 'optionalField', value: undefined };
    const condition = { type: 'EMPTY_CHECK', operator: 'EMPTY', errorMessage: 'Field must be empty' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Field must be empty');
  });

  test('should handle NOT_EMPTY operator when field is populated', () => {
    const field = { fieldId: 'optionalField', value: 'value' };
    const condition = { type: 'EMPTY_CHECK', operator: 'NOT_EMPTY', errorMessage: 'Field cannot be empty' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeNull(); // Field passes as it's not empty
  });

  test('should fail NOT_EMPTY operator when field is empty', () => {
    const field = { fieldId: 'optionalField', value: '' };
    const condition = { type: 'EMPTY_CHECK', operator: 'NOT_EMPTY', errorMessage: 'Field cannot be empty' };
    const result = FieldValidator.validateEmpty(field, condition);
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Field cannot be empty');
  });
});
