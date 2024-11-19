# @shanewas/form-validation

[![npm version](https://img.shields.io/npm/v/@shanewas/form-validation.svg)](https://www.npmjs.com/package/@shanewas/form-validation)  
[![License: GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)  
[![Node.js Version](https://img.shields.io/badge/node-v22.11.0-green.svg)](https://nodejs.org)  

A powerful and flexible validation engine for forms with support for complex rules, dependencies, type validation, and custom validation logic.

---

## Features

- **Comprehensive Validation Types**: Supports required fields, comparisons, dependencies, type checking, regex, and more.
- **Complex Field Dependencies**: Define validations based on the values of other fields.
- **Custom Validations**: Implement application-specific validation logic.
- **Detailed Error Reporting**: Easy-to-understand validation results.
- **Flexible Rule Structure**: Configure validations using a simple and extensible rule schema.
- **Works Everywhere**: Compatible with both Node.js and browsers.

---

## Installation

Install via npm:

```bash
npm install @shanewas/form-validation
```

---

## Quick Start

```javascript
import { ValidationController } from '@shanewas/form-validation';

// Initialize the validator
const validator = new ValidationController();

// Define form data
const formData = {
  name: { fieldId: "name", value: "john" },
  age: { fieldId: "age", value: 18 },
  email: { fieldId: "email", value: "john@example.com" },
};

// Define validation rules
const rules = [
  {
    ruleId: "userValidation",
    conditions: [
      {
        fieldId: "name",
        type: "REQUIRED",
        errorMessage: "Name is required",
      },
      {
        fieldId: "age",
        type: "COMPARISON",
        operator: "GREATER_THAN",
        value: 17,
        errorMessage: "Must be 18 or older",
      },
    ],
  },
];

// Validate
(async () => {
  try {
    const result = await validator.validateForm(formData, rules);
    console.log(result);
  } catch (error) {
    console.error('Validation failed:', error);
  }
})();
```

---

## Validation Types

- **`REQUIRED`**: Ensure the field is not empty.
- **`COMPARISON`**: Compare field values using supported operators.
- **`DEPENDENCY`**: Validate a field based on another field's value.
- **`TYPE_CHECK`**: Check the field value's data type.
- **`LENGTH_CHECK`**: Validate the length of string or array fields.
- **`EMPTY_CHECK`**: Ensure fields are empty or non-empty.
- **`REGEX`**: Match field values against regular expressions.
- **`CUSTOM`**: Apply user-defined validation functions.

---

## Rule Structure

Rules are defined as objects and support a wide range of properties:

```javascript
{
  ruleId: string,
  conditions: [
    {
      fieldId: string,
      type: string,
      operator: string,
      value: any,
      expectedType: string,
      minLength: number,
      maxLength: number,
      dependentFieldId: string,
      dependentOperator: string,
      dependentValue: any,
      errorMessage: string,
      description: string,
    },
  ],
}
```

---

## Operators

The following operators are supported in `COMPARISON` and `DEPENDENCY` validations:

- **`EQUALS`**
- **`NOT_EQUALS`**
- **`GREATER_THAN`**
- **`LESS_THAN`**
- **`GREATER_THAN_OR_EQUAL`**
- **`LESS_THAN_OR_EQUAL`**
- **`CONTAINS`**
- **`STARTS_WITH`**
- **`ENDS_WITH`**
- **`BETWEEN`**
- **`EMPTY`**
- **`NOT_EMPTY`**

---

## Advanced Usage

### Custom Validation

You can define your own validation logic using the `CUSTOM` type:

```javascript
const rules = [
  {
    ruleId: "passwordValidation",
    conditions: [
      {
        fieldId: "password",
        type: "CUSTOM",
        customFunction: async (value, formData) => {
          return value.length < 8
            ? "Password must be at least 8 characters"
            : null;
        },
      },
    ],
  },
];
```

---

### Dependent Fields

Validate a field based on the value of another field using `DEPENDENCY`:

```javascript
const rules = [
  {
    ruleId: "dependencyCheck",
    conditions: [
      {
        fieldId: "state",
        type: "DEPENDENCY",
        dependentFieldId: "country",
        dependentOperator: "EQUALS",
        dependentValue: "USA",
        errorMessage: "State is required for USA",
      },
    ],
  },
];
```

---

### Validation Result

The validation result provides detailed information about errors:

```javascript
{
  hasErrors: true,
  errorCount: 2,
  details: {
    name: [{ message: "Name is required", type: "REQUIRED" }],
    age: [{ message: "Must be 18 or older", type: "COMPARISON" }],
  },
  summary: [
    { type: "error", fieldId: "name", message: "Name is required" },
    { type: "error", fieldId: "age", message: "Must be 18 or older" },
  ],
}
```

---

### Example Validation with All Types

```javascript
const formData = {
  username: { fieldId: "username", value: "" },
  age: { fieldId: "age", value: 17 },
  email: { fieldId: "email", value: "invalid-email" },
};

const rules = [
  { fieldId: "username", type: "REQUIRED", errorMessage: "Username is required" },
  { fieldId: "age", type: "COMPARISON", operator: "GREATER_THAN", value: 18, errorMessage: "Must be 18 or older" },
  { fieldId: "email", type: "REGEX", value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMessage: "Invalid email format" },
];

(async () => {
  try {
    const result = await validator.validateForm(formData, rules);
    console.log(result);
  } catch (error) {
    console.error('Validation failed:', error);
  }
})();
```

---

## Requirements

- **Node.js**: Version 16 or later.
- **Browser Support**: ES Modules and modern browsers.

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

---

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.

---

## Support

- [GitHub Issues](https://github.com/shanewas/ValidationEngine/issues)
- [Documentation](https://github.com/shanewas/ValidationEngine/wiki)

---

## Acknowledgments

Special thanks to all contributors for their efforts in making this library robust and versatile!