import { assertOkResponse, parseApiResponse } from "./response";

describe("API response helpers", () => {
  test("parses JSON responses", async () => {
    const response = { json: jest.fn().mockResolvedValue({ ok: true }) };
    await expect(parseApiResponse(response)).resolves.toEqual({ ok: true });
  });

  test("falls back to status text when body cannot be parsed", async () => {
    const response = {
      statusText: "Bad Request",
      json: jest.fn().mockRejectedValue(new Error("invalid json")),
    };
    await expect(parseApiResponse(response)).resolves.toEqual({ message: "Bad Request" });
  });

  test("returns data when response is ok", async () => {
    const response = { ok: true, json: jest.fn().mockResolvedValue({ data: 1 }) };
    await expect(assertOkResponse(response, "fallback")).resolves.toEqual({ data: 1 });
  });

  test("throws API message when response is not ok", async () => {
    const response = { ok: false, json: jest.fn().mockResolvedValue({ message: "API error" }) };
    await expect(assertOkResponse(response, "fallback")).rejects.toThrow("API error");
  });
});
