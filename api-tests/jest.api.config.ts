import type { Config } from 'jest';

const config: Config = {
  rootDir: __dirname,
  testMatch: ['**/*.spec.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setup/jest-setup.ts'],
  testTimeout: 120000,
  verbose: false,
};

export default config;
