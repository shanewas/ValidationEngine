### **Filename: `DEVELOPMENT.md`**

# Development Guide for Validation Engine

This document serves as a comprehensive guide for developers working on the Validation Engine. It explains how to use, extend, and maintain the library as part of the software ecosystem. Additionally, it provides an in-depth explanation of how field validation and the validation controller work.

---

## **Table of Contents**
- [Development Guide for Validation Engine](#development-guide-for-validation-engine)
  - [**Table of Contents**](#table-of-contents)
  - [**1. Project Setup**](#1-project-setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [**2. Project Structure**](#2-project-structure)
    - [Directory Layout](#directory-layout)
  - [**3. Understanding Core Components**](#3-understanding-core-components)
    - [**Field Validation**](#field-validation)
      - [What It Does](#what-it-does)
      - [How It Works](#how-it-works)
      - [Key Methods in `FieldValidator`](#key-methods-in-fieldvalidator)
    - [**Validation Controller**](#validation-controller)
      - [What It Does](#what-it-does-1)
      - [How It Works](#how-it-works-1)
      - [Example Flow](#example-flow)
      - [Key Methods in `ValidationController`](#key-methods-in-validationcontroller)
  - [**4. Development Workflow**](#4-development-workflow)
      - [Run Tests:](#run-tests)
      - [Build the Minified File:](#build-the-minified-file)
  - [**5. Adding Features**](#5-adding-features)
    - [Steps to Add a New Feature](#steps-to-add-a-new-feature)
  - [**6. Writing and Running Tests**](#6-writing-and-running-tests)
  - [**7. Building the Library**](#7-building-the-library)

---

## **1. Project Setup**

### Prerequisites
- **Node.js**: v16 or later.
- **Web Browser**: Modern browsers (e.g., Chrome, Firefox, Edge) for testing.

### Installation
Clone the project directory to your local environment:
```bash
cp -r /shared/-repo/ValidationEngine .
cd ValidationEngine
```

---

## **2. Project Structure**

### Directory Layout
```
ValidationEngine/
„¥„Ÿ„Ÿ src/                # Source files
„    „¥„Ÿ„Ÿ models/         # Validation models (e.g., ValidationError, ValidationResult)
„    „¥„Ÿ„Ÿ service/        # Core services (e.g., FieldValidator, ValidationController)
„    „¥„Ÿ„Ÿ utils/          # Utility functions and helper classes
„¥„Ÿ„Ÿ tests/              # Unit tests
„¥„Ÿ„Ÿ dist/               # Bundled and minified files for browsers
„¥„Ÿ„Ÿ webpack.config.js   # Webpack configuration for bundling
„¤„Ÿ„Ÿ README.md           # User documentation
```

---

## **3. Understanding Core Components**

### **Field Validation**

#### What It Does
Field validation is the process of applying one or more validation conditions to a specific form field. It ensures the field meets the requirements defined in the validation rules.

#### How It Works
1. **Validation Rules**:
   Each field has associated rules defining conditions like "Required," "Length Check," "Regex Match," etc.

2. **FieldValidator**:
   The `FieldValidator` service contains methods for validating individual conditions.

3. **Example Flow**:
   - A rule is defined for the `email` field:
     ```javascript
     {
       fieldId: "email",
       conditions: [
         { type: "REQUIRED", errorMessage: "Email is required" },
         { type: "REGEX", regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", errorMessage: "Invalid email format" }
       ]
     }
     ```
   - During validation, each condition is checked using `FieldValidator` methods:
     ```javascript
     const field = { fieldId: "email", value: "john.doe@example.com" };
     const condition = { type: "REQUIRED" };
     const result = FieldValidator.validateRequired(field, condition);
     if (result) {
       console.error("Validation error:", result.message);
     }
     ```

#### Key Methods in `FieldValidator`
- **`validateRequired(field, condition)`**:
  Ensures the field is not empty.
- **`validateLength(field, condition)`**:
  Checks if the field value length is within a specified range.
- **`validateRegex(field, condition)`**:
  Validates the field value against a regex pattern.
- **`validateDependency(field, condition, formData)`**:
  Ensures the field meets conditions based on the values of other fields.

---

### **Validation Controller**

#### What It Does
The `ValidationController` orchestrates the validation process. It applies the rules defined for each field and aggregates the results.

#### How It Works
1. **Load Rules**:
   The controller takes the form data and validation rules as input.

2. **Apply Field Validation**:
   It uses `FieldValidator` to validate each field against its conditions.

3. **Aggregate Results**:
   Errors are collected into a `ValidationResult` object, which can be returned to the caller.

#### Example Flow
Herefs how the `ValidationController` validates a form:
```javascript
const formData = {
  email: "john.doe@example",
  password: "1234"
};

const rules = [
  {
    fieldId: "email",
    conditions: [
      { type: "REQUIRED", errorMessage: "Email is required" },
      { type: "REGEX", regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", errorMessage: "Invalid email format" }
    ]
  },
  {
    fieldId: "password",
    conditions: [
      { type: "REQUIRED", errorMessage: "Password is required" },
      { type: "LENGTH_CHECK", minLength: 8, errorMessage: "Password must be at least 8 characters long" }
    ]
  }
];

const controller = new ValidationController();
controller.validateForm(formData, rules)
  .then(result => {
    if (result.hasErrors) {
      console.error("Validation errors:", result.details);
    } else {
      logger.log("Validation passed!");
    }
  });
```

#### Key Methods in `ValidationController`
- **`validateForm(formData, rules)`**:
  Validates the entire form based on the provided rules.
- **`applyRule(field, rule)`**:
  Validates a single field against a single rule.

---

## **4. Development Workflow**

Use the following commands during development:

#### Run Tests:
```bash
npm test
```

#### Build the Minified File:
```bash
npm run build
```

---

## **5. Adding Features**

### Steps to Add a New Feature
1. **Identify the Module**:
   - For field-specific logic, update `FieldValidator`.
   - For overall rule application, update `ValidationController`.

2. **Write the Feature**:
   - Add the new functionality in the appropriate file.
   - Follow the existing modular structure.

3. **Test the Feature**:
   - Add test cases in `/tests` for the new functionality.

---

## **6. Writing and Running Tests**

1. Create a test file in `/tests`:
   ```bash
   touch tests/new-feature.test.js
   ```

2. Write test cases:
   ```javascript
   describe("New Feature", () => {
     test("should validate custom logic", () => {
       const result = newFeatureFunction();
       expect(result).toBe(expectedValue);
     });
   });
   ```

3. Run tests:
   ```bash
   npm test
   ```

---

## **7. Building the Library**

Use Webpack to bundle the library:
```bash
npm run build
```

The output will be generated in `/dist/validation-engine.min.js`.
