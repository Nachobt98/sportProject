const { normalizeString, validateRequiredFields } = require("./strings");

describe("string utils", () => {
  test("normalizes string input", () => {
    expect(normalizeString("  Nacho  ")).toBe("Nacho");
  });

  test("normalizes invalid input", () => {
    expect(normalizeString(undefined)).toBe("");
    expect(normalizeString(123)).toBe("");
  });

  test("finds missing required fields", () => {
    const result = validateRequiredFields({ name: "Event", city: "   " }, ["name", "city", "date"]);
    expect(result).toEqual(["city", "date"]);
  });
});
