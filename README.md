# @shanewas/form-validation

> A validation engine for complex forms — supports rules, dependencies, async validation, and EN/JP i18n. Published to npm, used in production at SkyCom Japan.

[![npm](https://img.shields.io/npm/v/@shanewas/form-validation?logo=npm)](https://www.npmjs.com/package/@shanewas/form-validation)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

## What it does

```javascript
import { ValidationController } from "@shanewas/form-validation"

const rules = [
  {
    ruleId: "age-rule",
    fieldId: "age",
    type: "COMPARISON",
    operator: "GREATER_THAN",
    value: 18,
    errorMessage: "Age must be greater than 18"
  }
]

const controller = new ValidationController()
controller.validateForm({ age: 16 }, rules)
// → { hasErrors: true, details: [{ fieldId: "age", error: "Age must be greater than 18" }] }
```

Validates form data against JSON rule definitions. Designed for forms where validation logic is complex enough that simple schema validation isn't enough — like enterprise document workflows, PDF form fields, or multi-step applications with conditional fields.

## Features

- **Rule-based validation** — define rules in JSON, not code
- **Dependency validation** — validate field A based on field B's value (e.g., "guardian name required if under 18")
- **Async / webhook validation** — call external APIs as part of validation
- **Custom operators** — add your own comparison logic
- **Rule inheritance** — reusable templates across forms
- **Multi-language errors** — error messages in EN and JP
- **Performance metrics** — track validation timing per rule
- **JSON schema validation** — validate the rule definition itself before running
- **Node.js + browser** — works in both environments

## Installation

```bash
npm install @shanewas/form-validation
```

For browser (standalone):
```html
<script src="https://cdn.jsdelivr.net/npm/@shanewas/form-validation/dist/validation-engine.min.js"></script>
```

## Quick start

### 1. Define rules

```javascript
const rules = [
  {
    ruleId: "full-name-required",
    fieldId: "fullName",
    type: "REQUIRED",
    errorMessage: {
      en: "Full name is required",
      jp: "氏名は必須です"
    }
  },
  {
    ruleId: "age-range",
    fieldId: "age",
    type: "COMPARISON",
    operator: "BETWEEN",
    value: [18, 99],
    errorMessage: {
      en: "Age must be between 18 and 99",
      jp: "年齢は18歳以上99歳以下である必要があります"
    }
  },
  {
    ruleId: "email-format",
    fieldId: "email",
    type: "REGEX",
    operator: "MATCHES",
    value: "^[^@]+@[^@]+\.[^@]+$",
    errorMessage: {
      en: "Invalid email address",
      jp: "メールアドレスが無効です"
    }
  },
  {
    ruleId: "guardian-required",
    fieldId: "guardianName",
    type: "DEPENDENCY",
    dependentFieldId: "age",
    dependentOperator: "LESS_THAN",
    dependentValue: 18,
    errorMessage: {
      en: "Guardian name is required for applicants under 18",
      jp: "18歳 미만の方は連絡先記載が必要です"
    }
  }
]
```

### 2. Validate

```javascript
import { ValidationController } from "@shanewas/form-validation"

const formData = {
  fullName: "Shanewas Ahmed",
  age: 31,
  email: "shane@example.com"
}

const controller = new ValidationController()
const result = await controller.validateForm(formData, rules)

if (result.hasErrors) {
  result.details.forEach(err => console.log(err.fieldId, err.error))
} else {
  console.log("All validations passed")
}
```

### 3. Run in browser

```javascript
// In browser — use the browser bundle
import { ValidationController } from "@shanewas/form-validation/browser"

const controller = new ValidationController()
controller.validateForm(formData, rules).then(console.log)
```

## Demo

Open `real.html` in a browser for a live demo with a working form.

Or see it on npm: https://www.npmjs.com/package/@shanewas/form-validation

## Operators

| Operator | What it does |
|---|---|
| `EQUALS` / `NOT_EQUALS` | Exact match |
| `GREATER_THAN` / `LESS_THAN` | Numeric/date comparison |
| `GREATER_THAN_OR_EQUAL` / `LESS_THAN_OR_EQUAL` | Inclusive comparison |
| `BETWEEN` | Value in range `[min, max]` |
| `CONTAINS` / `STARTS_WITH` / `ENDS_WITH` | String operations |
| `BEFORE` / `AFTER` | Date comparison |
| `EMPTY` / `NOT_EMPTY` | Null/undefined/empty string check |
| `REGEX` / `MATCHES` | Regular expression match |

## Custom operators

```javascript
import { ValidationUtils } from "@shanewas/form-validation"

ValidationUtils.addCustomOperator("INCLUDES", (value, comparisonValue) => {
  return Array.isArray(comparisonValue) && comparisonValue.includes(value)
})
```

## Async / webhook validation

```javascript
{
  ruleId: "email-unique",
  fieldId: "email",
  type: "CUSTOM",
  validate: async (field, context) => {
    const res = await fetch(`/api/check-email?email=${field.value}`)
    const data = await res.json()
    return data.taken ? "Email already in use" : null
  }
}
```

## Building from source

```bash
git clone https://github.com/shanewas/ValidationEngine.git
cd ValidationEngine
npm install
npm run build      # produces dist/validation-engine.min.js
npm test           # run Jest tests
```

## Project structure

```
ValidationEngine/
├── index.js              # Main entry (Node.js ESM)
├── index.cjs             # CommonJS fallback
├── controller/           # ValidationController
├── service/             # Rule engine
├── models/              # Data models
├── utils/               # ValidationUtils, operators
├── constants/            # Rule types, operators
├── real.html             # Live demo page
├── real.js               # Demo form logic
├── dist/                 # Built browser bundle (after npm run build)
├── Tests/                # Jest test suites
└── webpack.config.js
```

## Use cases

- **Enterprise PDF forms** — validate field values before submission (used at SkyCom in SkySign/SkyPAS products)
- **Multi-step onboarding** — conditional validation based on previous answers
- **Compliance forms** — dependency rules (e.g., "if resident of JP, provide My Number")
- **Payment forms** — field validation with async payment provider checks

## License

GPL-3.0 — see [LICENSE](LICENSE)

---

*Maintained by Shanewas Ahmed. Used in production at SkyCom Corporation, Japan.*