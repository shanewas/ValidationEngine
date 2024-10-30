const FieldValidator = require('./FieldValidator');

class RuleProcessor {
    constructor() {
        this.fieldValidator = new FieldValidator();
    }

    initializeProcessors(pdfData) {
        // Logic to initialize processors
        // Load rule definitions and setup validation chains
        return this.fieldValidator.setupValidators(pdfData);
    }

    processFormValidation(formData) {
        // Logic to process form validation
        return this.fieldValidator.validateAllFields(formData);
    }
}

module.exports = RuleProcessor;
