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
    "backend/src/**/*.js",
    "src/**/*.js",
    "!backend/src/app.js",
    "!backend/src/config/**",
    "!backend/src/models/**",
    "!backend/src/routes/**",
    "!backend/src/server.js",
    "!src/__mocks__/**",
    "!src/index.js",
    "!src/reportWebVitals.js",
    "!src/setupTests.js",
  ],
  coverageReporters: ["text", "lcov"],
};
