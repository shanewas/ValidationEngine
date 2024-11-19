import { ValidationError } from "../../models/validation-error.js";

test("ValidationError should be instantiated correctly", () => {
  const error = new ValidationError("field1", "Error message", "DEPENDENCY", {
    extra: "info",
  });
  expect(error).toBeInstanceOf(ValidationError);
  expect(error.fieldId).toBe("field1");
  expect(error.message).toBe("Error message");
  expect(error.type).toBe("DEPENDENCY");
  expect(error.details).toEqual({ extra: "info" });
});
