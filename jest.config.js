module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: [
    "<rootDir>/src/**/*.test.js",
    "<rootDir>/backend/src/**/*.test.js",
  ],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  collectCoverageFrom: [
    "backend/src/services/**/*.js",
    "backend/src/middlewares/**/*.js",
    "backend/src/utils/**/*.js",
    "src/api/**/*.js",
    "src/context/**/*.js",
  ],
  coverageReporters: ["text", "lcov"],
};
