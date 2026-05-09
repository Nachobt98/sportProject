const coveragePatterns = [
  "backend/src/**/*.js",
  "src/**/*.js",
  "src/**/*.jsx",
  "!**/*.test.js",
  "!**/*.test.jsx",
  "!backend/src/app.js",
  "!backend/src/config/**",
  "!backend/src/models/**",
  "!backend/src/routes/**",
  "!backend/src/server.js",
  "!src/__mocks__/**",
  "!src/index.jsx",
  "!src/pages/events/**",
  "!src/pages/profile/**",
  "!src/query/queryClient.js",
  "!src/reportWebVitals.js",
  "!src/setupTests.js",
];

const moduleNameMapper = {
  "\\.(css|less|sass|scss)$": "<rootDir>/src/__mocks__/fileMock.js",
  "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
};

const transform = {
  "^.+\\.[jt]sx?$": "babel-jest",
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
      collectCoverageFrom: coveragePatterns,
      transform,
      moduleFileExtensions: ["jsx", "js", "json", "node"],
      moduleNameMapper,
    },
    {
      displayName: "backend",
      testEnvironment: "node",
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      testMatch: ["<rootDir>/backend/src/**/*.test.js"],
      collectCoverageFrom: coveragePatterns,
      transform,
      moduleFileExtensions: ["js", "json", "node"],
      moduleNameMapper,
    },
  ],
};
