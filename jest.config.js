const coveragePatterns = [
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
];

const moduleNameMapper = {
  "\\.(css|less|sass|scss)$": "<rootDir>/src/__mocks__/fileMock.js",
  "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
};

module.exports = {
  collectCoverageFrom: coveragePatterns,
  coverageReporters: ["text", "lcov"],
  projects: [
    {
      displayName: "frontend",
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      testMatch: ["<rootDir>/src/**/*.test.js"],
      transform: {
        "^.+\\.[jt]sx?$": "babel-jest",
      },
      moduleNameMapper,
    },
    {
      displayName: "backend",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      testMatch: ["<rootDir>/backend/src/**/*.test.js"],
      transform: {
        "^.+\\.[jt]sx?$": "babel-jest",
      },
      moduleNameMapper,
    },
  ],
};
