import { randomUUID } from 'crypto';
import type { Agent } from 'supertest';

// Use CommonJS require to ensure compatibility with supertest's export shape.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const supertest: typeof import('supertest') = require('supertest');

export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

export type ApiHttpClient = Agent;

export const apiClient = (): ApiHttpClient => supertest.agent(API_BASE_URL);

export interface ApiTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TestUser {
  email: string;
  username: string;
  password: string;
}

export interface AuthenticatedTestUser {
  user: TestUser;
  tokens: ApiTokens;
}

export function buildUniqueUser(): TestUser {
  const unique = randomUUID().replace(/-/g, '').slice(0, 12);
  return {
    email: `api_test_${unique}@example.com`,
    username: `api_test_${unique}`,
    password: `Pass${unique}!1`,
  };
}

export async function registerUser(
  agent: ApiHttpClient,
  user: TestUser,
): Promise<void> {
  const response = await agent.post('/auth/register').send(user);
  if (response.status !== 201) {
    throw new Error(
      `Registration failed (${response.status}): ${JSON.stringify(response.body)}`,
    );
  }
}

export async function loginUser(
  agent: ApiHttpClient,
  user: Pick<TestUser, 'email' | 'password'>,
): Promise<ApiTokens> {
  const response = await agent.post('/auth/login').send(user);
  if (response.status !== 201) {
    throw new Error(
      `Login failed (${response.status}): ${JSON.stringify(response.body)}`,
    );
  }

  const { access_token: accessToken, refresh_token: refreshToken } =
    response.body;
  if (!accessToken || !refreshToken) {
    throw new Error('Access or refresh token missing in login response');
  }

  return { accessToken, refreshToken };
}

export async function authenticateTestUser(
  agent: ApiHttpClient,
  user: TestUser,
): Promise<AuthenticatedTestUser> {
  await registerUser(agent, user).catch(() => undefined);
  const tokens = await loginUser(agent, user);
  return { user, tokens };
}
