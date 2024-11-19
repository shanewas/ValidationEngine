export class ValidationError {
  constructor({
    fieldId,
    message,
    type,
    details = {},
    fieldType = null,
    action = null,
    actionValue = null,
  }) {
    this.fieldId = fieldId;
    this.message = message;
    this.type = type;
    this.details = details;
    this.fieldType = fieldType;
    this.action = action; // For specifying actions like CLEAR_FORMFIELD, UPDATE_VALUE, etc.
    this.actionValue = actionValue; // For action-specific details
  }
}
