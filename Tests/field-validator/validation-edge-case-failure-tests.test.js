// import { ValidationController } from "../../index.js";

// describe("Edge Case Failure Tests", () => {
//   let controller;

//   beforeAll(() => {
//     controller = new ValidationController();
//   });

//   test("should handle fieldId mismatch gracefully", async () => {
//     const formData = {
//       name: { fieldId: "name", value: "John" },
//     };

//     const rules = [
//       {
//         ruleId: "rule-missing-field",
//         type: "REQUIRED",
//         fieldId: "nonExistentField",
//         errorMessage: "This field is required.",
//       },
//     ];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(true);
//     expect(validationResults.details.nonExistentField[0].message).toBe(
//       "This field is required."
//     );
//   });

//   test("should handle empty string values in REGEX validation", async () => {
//     const formData = {
//       email: { fieldId: "email", value: "" },
//     };

//     const rules = [
//       {
//         ruleId: "rule-email-regex",
//         type: "REGEX",
//         fieldId: "email",
//         value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//         errorMessage: "Invalid email format.",
//       },
//     ];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(true);
//     expect(validationResults.details.email[0].message).toBe("Invalid email format.");
//   });

//   test("should handle nested dependencies with cyclic references", async () => {
//     const formData = {
//       fieldA: { fieldId: "fieldA", value: "" },
//       fieldB: { fieldId: "fieldB", value: "" },
//     };

//     const rules = [
//       {
//         ruleId: "rule-fieldA-dependency",
//         type: "DEPENDENCY",
//         fieldId: "fieldA",
//         dependentFieldId: "fieldB",
//         dependentOperator: "NOT_EMPTY",
//         operator: "NOT_EMPTY",
//         errorMessage: "Field A is required if Field B is not empty.",
//       },
//       {
//         ruleId: "rule-fieldB-dependency",
//         type: "DEPENDENCY",
//         fieldId: "fieldB",
//         dependentFieldId: "fieldA",
//         dependentOperator: "NOT_EMPTY",
//         operator: "NOT_EMPTY",
//         errorMessage: "Field B is required if Field A is not empty.",
//       },
//     ];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(false); // Should not crash, dependencies are cyclic
//   });

//   test("should handle rules with unsupported types", async () => {
//     const formData = {
//       username: { fieldId: "username", value: "JohnDoe" },
//     };

//     const rules = [
//       {
//         ruleId: "rule-unsupported-type",
//         type: "UNSUPPORTED_RULE",
//         fieldId: "username",
//         errorMessage: "Unsupported rule type.",
//       },
//     ];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(true);
//     expect(validationResults.details.username[0].message).toBe(
//       "Rule processing failed: Unsupported rule type."
//     );
//   });

//   test("should handle unexpected data types in fields", async () => {
//     const formData = {
//       age: { fieldId: "age", value: null }, // Null instead of number
//     };

//     const rules = [
//       {
//         ruleId: "rule-age-required",
//         type: "REQUIRED",
//         fieldId: "age",
//         errorMessage: "Age is required.",
//       },
//       {
//         ruleId: "rule-age-type-check",
//         type: "TYPE_CHECK",
//         fieldId: "age",
//         expectedType: "number",
//         errorMessage: "Age must be a number.",
//       },
//     ];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(true);
//     expect(validationResults.details.age[0].message).toBe("Age is required.");
//     expect(validationResults.details.age[1].message).toBe("Age must be a number.");
//   });

//   test("should handle empty rules gracefully", async () => {
//     const formData = {
//       name: { fieldId: "name", value: "John" },
//     };

//     const rules = [];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(false);
//   });

//   test("should handle form data with unexpected structures", async () => {
//     const formData = {
//       name: "John", // Not wrapped in an object
//     };

//     const rules = [
//       {
//         ruleId: "rule-name-required",
//         type: "REQUIRED",
//         fieldId: "name",
//         errorMessage: "Name is required.",
//       },
//     ];

//     await expect(controller.validateForm(formData, rules)).rejects.toThrow(
//       "Invalid form data"
//     );
//   });

//   test("should handle multiple rules on the same field with conflicting results", async () => {
//     const formData = {
//       age: { fieldId: "age", value: 17 }, // Satisfies one rule but not the other
//     };

//     const rules = [
//       {
//         ruleId: "rule-age-comparison-1",
//         type: "COMPARISON",
//         fieldId: "age",
//         operator: "GREATER_THAN",
//         value: 16,
//         errorMessage: "Age must be greater than 16.",
//       },
//       {
//         ruleId: "rule-age-comparison-2",
//         type: "COMPARISON",
//         fieldId: "age",
//         operator: "LESS_THAN",
//         value: 16,
//         errorMessage: "Age must be less than 16.",
//       },
//     ];

//     const validationResults = await controller.validateForm(formData, rules);

//     expect(validationResults.hasErrors).toBe(true);
//     const errorMessages = validationResults.summary.map((error) => error.message);

//     expect(errorMessages).toEqual(expect.arrayContaining(["Age must be less than 16."]));
//   });
// });
