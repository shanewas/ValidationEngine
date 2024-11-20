/**
 * Represents an individual validation error.
 */
export class ValidationError {
  constructor({
    fieldId,      // Unique identifier for the field
    message,      // Error message
    type,         // Validation type (e.g., REQUIRED, TYPE_CHECK)
    details = {}, // Additional details about the error
    fieldType = null, // The type of the field (optional)
    action = null,    // Suggested action (e.g., CLEAR_FORMFIELD)
    actionValue = null // Associated value for the action
  }) {
    this.fieldId = fieldId;
    this.message = message;
    this.type = type;
    this.details = details;
    this.fieldType = fieldType;
    this.action = action;
    this.actionValue = actionValue;
  }
}
