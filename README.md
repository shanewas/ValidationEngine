# @shanewas/form-validation

[![npm version](https://img.shields.io/npm/v/@shanewas/form-validation.svg)](https://www.npmjs.com/package/@shanewas/form-validation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@shanewas/form-validation.svg)](https://nodejs.org)

A powerful and flexible validation engine for forms with support for complex rules, dependencies, and custom validations.

## Features

- ? Multiple validation types out of the box
- ? Complex field dependencies
- ? Type checking and length validation
- ? Custom validation functions
- ? Flexible rule configuration
- ? Priority-based validation
- ? Detailed error reporting
- ? Works in both Node.js and browsers

## Installation

```bash
npm install @shanewas/form-validation
```

## Quick Start

```javascript
import { ValidationController } from '@shanewas/form-validation';

// Initialize the validator
const validator = new ValidationController();

// Your form data
const formData = {
  name: { fieldId: "name", value: "john" },
  age: { fieldId: "age", value: 18 },
  email: { fieldId: "email", value: "john@example.com" }
};

// Define validation rules
const rules = [{
  ruleId: "userValidation",
  conditions: [{
    fieldId: "name",
    type: "REQUIRED",
    errorMessage: "Name is required"
  }, {
    fieldId: "age",
    type: "COMPARISON",
    operator: "GREATER_THAN",
    value: 17,
    errorMessage: "Must be 18 or older"
  }]
}];

// Validate
try {
  const result = await validator.validateForm(formData, rules);
  console.log(result);
} catch (error) {
  console.error('Validation failed:', error);
}
```

## Validation Types

- `REQUIRED`: Ensures field has a value
- `COMPARISON`: Compare values using operators
- `DEPENDENCY`: Field validation based on other fields
- `TYPE_CHECK`: Validate data types
- `LENGTH_CHECK`: Check string lengths
- `EMPTY_CHECK`: Validate empty/non-empty
- `REGEX`: Pattern matching
- `CUSTOM`: Custom validation functions

## Rule Structure

```javascript
{
  rules: [{
    ruleId: string,
    conditions: [{
      pdfId: string,
      fieldId: string,
      type: string,
      operator: string,
      value: any,
      expectedType: string,
      minLength: number,
      maxLength: number,
      dependentFieldId: string,
      dependentType: string,
      dependentOperator: string,
      dependentValue: any,
      errorMessage: string,
      description: string,
      documentation: string
    }]
  }]
}
```

## Operators

- `EQUALS`
- `NOT_EQUALS`
- `GREATER_THAN`
- `LESS_THAN`
- `GREATER_THAN_OR_EQUAL`
- `LESS_THAN_OR_EQUAL`
- `CONTAINS`
- `STARTS_WITH`
- `ENDS_WITH`
- `BETWEEN`
- `EMPTY`
- `NOT_EMPTY`

## Advanced Usage

### Custom Validation

```javascript
const rules = [{
  ruleId: "customValidation",
  conditions: [{
    fieldId: "password",
    type: "CUSTOM",
    customFunction: async (value, formData) => {
      // Your custom validation logic
      return value.length < 8 ? "Password must be at least 8 characters" : null;
    }
  }]
}];
```

### Dependent Fields

```javascript
const rules = [{
  ruleId: "dependencyCheck",
  conditions: [{
    fieldId: "state",
    type: "DEPENDENCY",
    dependentFieldId: "country",
    dependentOperator: "EQUALS",
    dependentValue: "USA",
    errorMessage: "State is required for USA"
  }]
}];
```

### Type Checking

```javascript
const rules = [{
  ruleId: "typeValidation",
  conditions: [{
    fieldId: "age",
    type: "TYPE_CHECK",
    expectedType: "number",
    errorMessage: "Age must be a number"
  }]
}];
```

## Validation Result

```javascript
{
  hasErrors: boolean,
  errorCount: number,
  details: {
    [fieldId]: [{
      message: string,
      type: string,
      details: object
    }]
  },
  summary: [{
    type: 'error',
    fieldId: string,
    message: string
  }]
}
```

## Requirements

- Node.js >= 16.0.0
- ES Modules support

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## Support

- [GitHub Issues](https://github.com/shanewas/ValidationEngine/issues)
- [Documentation](https://github.com/shanewas/ValidationEngine/wiki)

## Acknowledgments

Special thanks to all contributors who help make this project better!
