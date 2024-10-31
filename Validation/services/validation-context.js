// services/validation-context.js
export class ValidationContext {
    constructor(fieldData) {
      this.fieldData = this.normalizeFieldData(fieldData);
      this.fieldMap = new Map();
      this.buildFieldMap();
    }
  
    normalizeFieldData(fieldData) {
      return fieldData.reduce((acc, pdf) => {
        pdf.data.forEach(field => {
          acc.push({
            ...field,
            pdfId: pdf.pdfId
          });
        });
        return acc;
      }, []);
    }
  
    buildFieldMap() {
      this.fieldData.forEach(field => {
        this.fieldMap.set(field.fieldName, field);
      });
    }
  
    getField(fieldName) {
      return this.fieldMap.get(fieldName);
    }
  
    getAllFields() {
      return this.fieldData;
    }
  }