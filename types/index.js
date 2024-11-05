// types/index.js
/**
 * @typedef {Object} ValidationCondition
 * @property {string} fieldId - Field identifier
 * @property {string} type - Validation type
 * @property {string} [operator] - Comparison operator
 * @property {*} [value] - Value to compare against
 * @property {string} [errorMessage] - Custom error message
 * @property {string} [dependentFieldId] - Related field identifier
 * @property {string} [pdfId] - PDF identifier
 * @property {number} [page] - Page number
 */

/**
 * @typedef {Object} ValidationRule
 * @property {string} ruleId - Rule identifier
 * @property {string} ruleName - Rule name
 * @property {string} [priority] - Rule priority
 * @property {string} [scope] - Validation scope
 * @property {ValidationCondition[]} conditions - Validation conditions
 */

/**
 * @typedef {Object} FieldData
 * @property {string} fieldName - Field name
 * @property {number} page - Page number
 * @property {*} value - Field value
 * @property {string} type - Field type (text, checkbox, radio, etc.)
 */

/**
 * @typedef {Object} PdfData
 * @property {string} pdfId - PDF identifier
 * @property {FieldData[]} data - Field data
 */