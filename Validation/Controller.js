const ValidationEngine = require('./ValidationEngine');

class Controller {
    constructor() {
        this.validationEngine = new ValidationEngine();
    }

    initializeFlowCreation(flowData) {
        // Logic to initialize flow creation
        return this.validationEngine.setupValidation(flowData);
    }

    openDocumentViewer(flowId) {
        // Logic to open document viewer
        return this.validationEngine.getValidationConfig(flowId);
    }

    submitForm(formData) {
        // Logic to submit form
        return this.validationEngine.validateForm(formData);
    }
}

module.exports = Controller;
