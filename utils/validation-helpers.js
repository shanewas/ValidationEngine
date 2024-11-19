export class ValidationHelpers {
  static ensureConditionField(condition, fieldName) {
    if (!condition[fieldName]) {
      throw new Error(`Condition is missing required field: ${fieldName}`);
    }
  }
}
