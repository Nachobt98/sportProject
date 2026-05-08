const {
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  isValidPassword,
  parseOptionalDate,
} = require("./validators");

describe("validators", () => {
  test("validates email format", () => {
    expect(isValidEmail("nacho@example.com")).toBe(true);
    expect(isValidEmail(" nacho@example.com ")).toBe(true);
    expect(isValidEmail("bad-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  test("validates password length", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(isValidPassword("12345678")).toBe(true);
    expect(isValidPassword("1234567")).toBe(false);
    expect(isValidPassword(null)).toBe(false);
  });

  test("parses optional dates", () => {
    expect(parseOptionalDate("")).toEqual({ value: undefined });
    expect(parseOptionalDate("1998-10-20").value).toBeInstanceOf(Date);
    expect(parseOptionalDate("bad-date")).toEqual({ error: "La fecha no es valida" });
  });
});
