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
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  collectCoverageFrom: [
    "backend/src/**/*.js",
    "src/api/**/*.js",
    "src/context/**/*.js",
    "!backend/src/server.js",
    "!backend/src/config/database.js",
    "!backend/src/config/loadEnv.js",
  ],
  coverageReporters: ["text", "lcov"],
};
