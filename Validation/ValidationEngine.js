const RuleProcessor = require('./RuleProcessor');

class ValidationEngine {
    constructor() {
        this.ruleProcessor = new RuleProcessor();
    }

    setupValidation(pdfData) {
        // Logic to setup validation
        return this.ruleProcessor.initializeProcessors(pdfData);
    }

    validateForm(formData) {
        // Logic to validate form
        return this.ruleProcessor.processFormValidation(formData);
    }
}

module.exports = ValidationEngine;
