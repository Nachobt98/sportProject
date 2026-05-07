const User = require("./User");

describe("User model", () => {
  test("enables timestamps", () => {
    expect(User.schema.path("createdAt")).toBeDefined();
    expect(User.schema.path("updatedAt")).toBeDefined();
  });
});
