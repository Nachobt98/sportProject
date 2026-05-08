const {
  ERROR_CODES,
  buildErrorBody,
  buildSuccessBody,
  serviceResponse,
} = require("./apiResponses");

describe("apiResponses", () => {
  test("builds normalized error bodies while keeping message compatibility", () => {
    expect(buildErrorBody("Bad input", ERROR_CODES.VALIDATION_ERROR, { field: "email" })).toEqual({
      message: "Bad input",
      error: {
        code: "VALIDATION_ERROR",
        message: "Bad input",
        details: { field: "email" },
      },
    });
  });

  test("builds success bodies", () => {
    expect(buildSuccessBody("Created", { id: "1" })).toEqual({ message: "Created", id: "1" });
  });

  test("builds service responses", () => {
    expect(serviceResponse(404, "Missing", {}, ERROR_CODES.USER_NOT_FOUND)).toEqual({
      status: 404,
      body: {
        message: "Missing",
        error: {
          code: "USER_NOT_FOUND",
          message: "Missing",
        },
      },
    });
    expect(serviceResponse(200, "OK", { user: { userName: "nacho" } })).toEqual({
      status: 200,
      body: { message: "OK", user: { userName: "nacho" } },
    });
  });
});
