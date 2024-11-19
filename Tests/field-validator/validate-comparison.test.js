import { FieldValidator } from '../../service/field-validator.js';
import { ValidationError } from '../../models/validation-error.js';

describe('FieldValidator - Comparison Validation', () => {
  test('should pass when value is greater', () => {
    const field = { fieldId: 'age', value: 30 };
    const condition = { type: 'COMPARISON', operator: 'GREATER_THAN', value: 18 };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeNull();
  });

  test('should fail when value is not greater', () => {
    const field = { fieldId: 'age', value: 10 };
    const condition = { type: 'COMPARISON', operator: 'GREATER_THAN', value: 18 };
    const result = FieldValidator.validateComparison(field, condition, {});
    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toContain('comparison failed');
  });
});
