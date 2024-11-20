# **@shanewas/form-validation**

A flexible and enterprise-ready validation framework designed to handle complex form validations. It supports robust validation types, dependency checks, and customizable workflows.

---

## **Features**
- **Extensive Validation Types**: Includes `REQUIRED`, `COMPARISON`, `DEPENDENCY`, `REGEX`, `TYPE_CHECK`, and more.
- **Dependency Validation**: Ensures fields are validated based on related fields.
- **Asynchronous Validation**: Supports async operations and webhooks for dynamic validations.
- **Custom Operators**: Allows you to define your own operators for specific use cases.
- **Rule Inheritance**: Enables reusable and extendable rule templates.
- **Multi-Language Support**: Fully supports English and Japanese.
- **Performance Metrics**: Tracks and optimizes validation performance.
- **Customizable Logging**: Provides detailed logs with adjustable output formats.
- **Schema Validation**: Validates JSON and YAML rule definitions.
- **Standalone or NPM Module**: Usable in both environments seamlessly.

---

## **Installation**

### Using NPM
```bash
npm install @shanewas/form-validation
```

### Standalone
Include the compiled JavaScript file in your project:
```html
<script src="validation-engine.min.js"></script>
```

---

## **Basic Usage**

### **1. Defining Rules**
Validation rules are defined in JSON format:
```json
{
  "rules": [
    {
      "ruleId": "rule-1",
      "groupId": "group-1",
      "ruleName": "Age Validation",
      "priority": 1,
      "conditions": [
        {
          "pdfId": "form-1",
          "fieldId": "age",
          "fieldType": "number",
          "type": "COMPARISON",
          "operator": "GREATER_THAN",
          "value": 18,
          "errorMessage": "Age must be greater than 18"
        }
      ]
    }
  ]
}
```

### **2. Validating Form Data**
#### With NPM:
```javascript
import { ValidationController } from "@shanewas/form-validation";

const formData = { age: 16 };
const rules = [ /* JSON Rules */ ];

const controller = new ValidationController();
controller
  .validateForm(formData, rules)
  .then((result) => logger.log(result))
  .catch((error) => logger.error(error));
```

#### Standalone:
```html
<script>
  const formData = { age: 16 };
  const rules = [ /* JSON Rules */ ];

  const controller = new ValidationController();
  controller.validateForm(formData, rules)
    .then((result) => logger.log(result))
    .catch((error) => logger.error(error));
</script>
```

---

## **Advanced Features**

### **1. Dependency Validation**
Dependency validation ensures that a field is validated based on the value of another field. For example, if a guardianÅfs name is required when the applicant is a minor.

#### **Example**
Define a dependency rule:
```json
{
  "rules": [
    {
      "ruleId": "dependency-rule-1",
      "groupId": "group-1",
      "ruleName": "Guardian Dependency Rule",
      "priority": 1,
      "conditions": [
        {
          "pdfId": "form-1",
          "fieldId": "guardianName",
          "fieldType": "text",
          "type": "DEPENDENCY",
          "dependentFieldId": "applicantAge",
          "dependentOperator": "LESS_THAN",
          "dependentValue": 18,
          "errorMessage": "Guardian name is required for minors."
        }
      ]
    }
  ]
}
```

#### **Usage in Code**
```javascript
const formData = {
  applicantAge: 16, // Dependent field
  guardianName: ""  // Target field
};

const rules = [ /* Dependency rule defined above */ ];

const controller = new ValidationController();

controller
  .validateForm(formData, rules)
  .then((result) => {
    if (result.hasErrors) {
      logger.error("Validation failed:", result.details);
    } else {
      logger.log("Validation succeeded!");
    }
  })
  .catch((error) => logger.error("System error:", error));
```

---

### **2. Custom Operators**
Add custom operators using `ValidationUtils`:
```javascript
ValidationUtils.addCustomOperator("INCLUDES", (value, comparisonValue) => {
  return Array.isArray(comparisonValue) && comparisonValue.includes(value);
});
```

---

### **3. Webhook Support**
You can validate asynchronously with external services:
```javascript
{
  "type": "CUSTOM",
  "validate": async (field, context) => {
    const response = await fetch("https://api.example.com/validate", {
      method: "POST",
      body: JSON.stringify({ field })
    });
    return response.ok ? null : "Validation failed";
  }
}
```

---

### **4. Rule Templates**
Define reusable templates:
```json
{
  "template": "ageValidation",
  "fields": ["age"],
  "conditions": [
    {
      "operator": "GREATER_THAN",
      "value": 18,
      "errorMessage": "Age must be greater than 18"
    }
  ]
}
```

---

### **5. Multi-Language Errors**
Provide errors in multiple languages:
```json
{
  "errorMessage": {
    "en": "Age must be greater than 18",
    "jp": "îNóÓÇÕ18çŒà»è„Ç≈Ç»ÇØÇÍÇŒÇ»ÇËÇ‹ÇπÇÒ"
  }
}
```

---

### **6. Logging**
Configure logging output:
```javascript
import { ValidationLogger } from "@shanewas/form-validation";

ValidationLogger.configure({
  level: "debug", // "info", "warn", "error"
  output: "file", // "console", "file"
  filePath: "/logs/validation.log"
});
```

---

## **API Reference**

### **ValidationController**
- `validateForm(formData, rules)`: Validates form data against rules.
- `reset()`: Resets internal state for reuse.

---

### **Validation Types**
| Type           | Description                              |
|----------------|------------------------------------------|
| `REQUIRED`     | Ensures the field is filled.             |
| `COMPARISON`   | Validates using operators.               |
| `DEPENDENCY`   | Validates based on related field values. |
| `TYPE_CHECK`   | Ensures the value matches a type.        |
| `REGEX`        | Validates using regular expressions.     |

---

HereÅfs the complete list of operators with their descriptions, as defined in your system:

---

### **Operators**
| Operator                  | Description                                                  |
|---------------------------|--------------------------------------------------------------|
| `EQUALS`                  | Checks if the field value is equal to the comparison value.  |
| `NOT_EQUALS`              | Checks if the field value is not equal to the comparison value. |
| `GREATER_THAN`            | Checks if the field value is greater than the comparison value. |
| `LESS_THAN`               | Checks if the field value is less than the comparison value. |
| `GREATER_THAN_OR_EQUAL`   | Checks if the field value is greater than or equal to the comparison value. |
| `LESS_THAN_OR_EQUAL`      | Checks if the field value is less than or equal to the comparison value. |
| `CONTAINS`                | Checks if the field value contains the comparison value as a substring. |
| `STARTS_WITH`             | Checks if the field value starts with the comparison value. |
| `ENDS_WITH`               | Checks if the field value ends with the comparison value.   |
| `BETWEEN`                 | Checks if the field value lies within the range of two values (inclusive). |
| `BEFORE`                  | Checks if the field value is before the comparison date (for date values). |
| `AFTER`                   | Checks if the field value is after the comparison date (for date values). |
| `EMPTY`                   | Checks if the field value is empty (null, undefined, or ""). |
| `NOT_EMPTY`               | Checks if the field value is not empty.                     |

---

## **Performance Metrics**
Track performance with detailed insights:
```javascript
ValidationEngine.enableMetrics();
const metrics = ValidationEngine.getMetrics();
logger.log(metrics);
```

---

## **Testing**
Run tests for your validation rules:
```bash
npm test
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