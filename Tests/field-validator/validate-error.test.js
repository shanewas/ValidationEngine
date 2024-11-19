import { ValidationError } from "../../models/validation-error.js";

describe("ValidationError", () => {
  test("should be instantiated correctly with all properties", () => {
    const error = new ValidationError({
      fieldId: "field1",
      message: "Error message",
      type: "DEPENDENCY",
      details: { extra: "info" },
      fieldType: "text",
      action: "CLEAR_FORMFIELD",
      actionValue: null,
    });

    expect(error).toBeInstanceOf(ValidationError); // Ensure instance type
    expect(error.fieldId).toBe("field1"); // Verify fieldId
    expect(error.message).toBe("Error message"); // Verify message
    expect(error.type).toBe("DEPENDENCY"); // Verify type
    expect(error.details).toEqual({ extra: "info" }); // Verify details
    expect(error.fieldType).toBe("text"); // Verify fieldType
    expect(error.action).toBe("CLEAR_FORMFIELD"); // Verify action
    expect(error.actionValue).toBe(null); // Verify actionValue
  });

  test("should handle default values correctly", () => {
    const error = new ValidationError({
      fieldId: "field2",
      message: "Another error",
      type: "TYPE_CHECK",
    });

    expect(error.fieldId).toBe("field2");
    expect(error.message).toBe("Another error");
    expect(error.type).toBe("TYPE_CHECK");
    expect(error.details).toEqual({}); // Default empty object for details
    expect(error.fieldType).toBe(null); // Default null for fieldType
    expect(error.action).toBe(null); // Default null for action
    expect(error.actionValue).toBe(null); // Default null for actionValue
  });
});
