const { logger } = require("./logger");

describe("logger", () => {
  let stdoutWrite;
  let stderrWrite;

  beforeEach(() => {
    stdoutWrite = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrWrite = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWrite.mockRestore();
    stderrWrite.mockRestore();
  });

  test("writes info messages", () => {
    logger.info("Server ready");

    expect(stdoutWrite).toHaveBeenCalledWith("[info] Server ready\n");
  });

  test("writes error messages with stack details", () => {
    const error = new Error("db failed");
    error.stack = "Error stack";

    logger.error("Database error", error);

    expect(stderrWrite).toHaveBeenCalledWith("[error] Database error Error stack\n");
  });

  test("writes error messages with string details", () => {
    logger.error("Database error", "timeout");

    expect(stderrWrite).toHaveBeenCalledWith("[error] Database error timeout\n");
  });

  test("writes error messages without details", () => {
    logger.error("Database error");

    expect(stderrWrite).toHaveBeenCalledWith("[error] Database error\n");
  });
});
