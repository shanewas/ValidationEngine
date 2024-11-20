HereÅfs a comprehensive documentation designed for your team. It covers how to use, develop, and extend your validation engine.

---

# **Validation Engine Documentation**

## **Overview**
The Validation Engine is a flexible and extensible library for validating form inputs. It supports a variety of validation types, including required fields, length checks, regex validation, dependency checks, and more. The engine is optimized for both browser and Node.js environments.

---

## **Table of Contents**
- [**Validation Engine Documentation**](#validation-engine-documentation)
  - [**Overview**](#overview)
  - [**Table of Contents**](#table-of-contents)
  - [**1. Getting Started**](#1-getting-started)
    - [**Installation**](#installation)
      - [Using NPM (For Node.js or Module-Based Environments)](#using-npm-for-nodejs-or-module-based-environments)
      - [Standalone (For Browser Environments)](#standalone-for-browser-environments)
    - [**Initialization**](#initialization)
  - [**2. Usage**](#2-usage)
    - [**Basic Validation**](#basic-validation)
      - [Define Your Data and Rules](#define-your-data-and-rules)
      - [Run the Validation](#run-the-validation)
    - [**Dependency Validation**](#dependency-validation)
    - [**Advanced Features**](#advanced-features)
      - [Logging](#logging)
      - [Custom Operators](#custom-operators)
  - [**3. Development Guide**](#3-development-guide)
    - [**Project Structure**](#project-structure)
    - [**Running Tests**](#running-tests)
    - [**Adding New Features**](#adding-new-features)
  - [**4. Extending the Engine**](#4-extending-the-engine)
    - [**Adding Custom Operators**](#adding-custom-operators)
    - [**Modifying Validation Rules**](#modifying-validation-rules)
  - [**5. Best Practices**](#5-best-practices)
  - [**6. Troubleshooting**](#6-troubleshooting)
    - [**Common Errors**](#common-errors)

---

## **1. Getting Started**

### **Installation**

#### Using NPM (For Node.js or Module-Based Environments)
Install the library:
```bash
npm install @shanewas/form-validation
```

#### Standalone (For Browser Environments)
Download the `validation-engine.min.js` file and include it in your HTML:
```html
<script src="path/to/validation-engine.min.js"></script>
```

### **Initialization**
For Node.js or module-based environments:
```javascript
import { ValidationController } from "@shanewas/form-validation";
```

For browser environments:
```javascript
const controller = new ValidationEngine.ValidationController();
```

---

## **2. Usage**

### **Basic Validation**

#### Define Your Data and Rules
Example: Validating a user registration form:
```javascript
const formData = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  password: "Password123!",
};

const rules = [
  {
    ruleId: "rule-1",
    fieldId: "fullName",
    conditions: [
      { type: "REQUIRED", errorMessage: "Full name is required" },
      { type: "LENGTH_CHECK", minLength: 3, maxLength: 50, errorMessage: "Full name must be between 3 and 50 characters" },
    ],
  },
  {
    ruleId: "rule-2",
    fieldId: "email",
    conditions: [
      { type: "REQUIRED", errorMessage: "Email is required" },
      { type: "REGEX", regex: "^(?=[a-zA-Z0-9@.%+-]{6,254}$)[a-zA-Z0-9.%+-]{1,64}@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", errorMessage: "Invalid email format" },
    ],
  },
];
```

#### Run the Validation
```javascript
controller.validateForm(formData, rules)
  .then(result => {
    if (result.hasErrors) {
      console.error("Validation failed:", result.details);
    } else {
      logger.log("Validation succeeded!");
    }
  })
  .catch(error => console.error("Validation error:", error));
```

---

### **Dependency Validation**
Validate fields based on the values of other fields:
```javascript
const rules = [
  {
    ruleId: "rule-3",
    fieldId: "guardianName",
    conditions: [
      {
        type: "DEPENDENCY",
        dependentFieldId: "age",
        dependentOperator: "LESS_THAN",
        dependentValue: 18,
        errorMessage: "Guardian name is required for minors",
      },
    ],
  },
];
```

---

### **Advanced Features**

#### Logging
Enable logging for debugging:
```javascript
ValidationLogger.configure({
  level: "debug",
  output: "console",
});
```

#### Custom Operators
You can add new operators for specific use cases (see [Adding Custom Operators](#adding-custom-operators)).

---

## **3. Development Guide**

### **Project Structure**
- `/src`: Contains core library files (e.g., `ValidationEngine`, `FieldValidator`).
- `/tests`: Contains test cases for all modules.
- `/dist`: Generated minified files for browser environments.

### **Running Tests**
Use `jest` to run the tests:
```bash
npm test
```

### **Adding New Features**
1. Identify the module to extend (e.g., `FieldValidator` for validation logic).
2. Add your feature in the corresponding file.
3. Write tests for the new functionality in the `/tests` directory.

---

## **4. Extending the Engine**

### **Adding Custom Operators**
1. Extend the `ValidationUtils` class:
   ```javascript
   ValidationUtils.addCustomOperator("STARTS_WITH_A", (value) => {
     return typeof value === "string" && value.startsWith("A");
   });
   ```

2. Use the new operator in rules:
   ```javascript
   const rules = [
     {
       ruleId: "rule-4",
       fieldId: "name",
       conditions: [
         { type: "CUSTOM", operator: "STARTS_WITH_A", errorMessage: "Name must start with A" },
       ],
     },
   ];
   ```

---

### **Modifying Validation Rules**
Update rules in your JSON or YAML files to reflect new requirements. Ensure your `validateForm` function is pointing to the updated rules.

---

## **5. Best Practices**
1. **Keep Rules Modular**: Use templates or reusable rule structures.
2. **Test Edge Cases**: Ensure validation works with missing, null, and unexpected values.
3. **Use Logging**: Enable logging during development to debug issues.

---

## **6. Troubleshooting**

### **Common Errors**
1. **ValidationEngine is not defined**
   - Ensure the library is properly included in your project.

2. **Validation failed: Object**
   - Log the error details using `JSON.stringify` for clarity.

3. **Rule Not Working**
   - Double-check the field ID in your `formData` matches the `fieldId` in your rules.

---

This documentation should help your team understand, use, and extend the Validation Engine effectively. Let me know if there are any additional sections you'd like included!