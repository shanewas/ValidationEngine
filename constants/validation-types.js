// Define supported validation types
export const VALIDATION_TYPES = {
  REQUIRED: 'REQUIRED',            // Checks if a field is filled
  COMPARISON: 'COMPARISON',        // Validates based on comparison operators
  DEPENDENCY: 'DEPENDENCY',        // Validates based on other field values
  TYPE_CHECK: 'TYPE_CHECK',        // Ensures field value matches a type
  LENGTH_CHECK: 'LENGTH_CHECK',    // Validates string or array length
  EMPTY_CHECK: 'EMPTY_CHECK',      // Checks if a field is empty or not
  REGEX: 'REGEX',                  // Validates against a regex pattern
  CUSTOM: 'CUSTOM'                 // Allows for custom validation logic
};

// Define supported operators for validation
export const OPERATORS = {
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  GREATER_THAN: 'GREATER_THAN',
  LESS_THAN: 'LESS_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
  CONTAINS: 'CONTAINS',
  STARTS_WITH: 'STARTS_WITH',
  ENDS_WITH: 'ENDS_WITH',
  BETWEEN: 'BETWEEN',
  EMPTY: 'EMPTY',
  NOT_EMPTY: 'NOT_EMPTY'
};

// Supported field types for validation
export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox'
};

// Define actions triggered by validation
export const ACTIONS = {
  REQUIRED: 'REQUIRED',          // Marks a field as required
  CLEAR_FORMFIELD: 'CLEAR_FORMFIELD',  // Clears a specific form field
  UPDATE_VALUE: 'UPDATE_VALUE'   // Updates a form field's value
};
