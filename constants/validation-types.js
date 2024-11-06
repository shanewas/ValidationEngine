// constants/validation-types.js
export const VALIDATION_TYPES = {
  REQUIRED: 'REQUIRED',
  COMPARISON: 'COMPARISON',
  DEPENDENCY: 'DEPENDENCY',
  TYPE_CHECK: 'TYPE_CHECK',
  LENGTH_CHECK: 'LENGTH_CHECK',
  EMPTY_CHECK: 'EMPTY_CHECK',
  REGEX: 'REGEX',
  CUSTOM: 'CUSTOM'
};

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