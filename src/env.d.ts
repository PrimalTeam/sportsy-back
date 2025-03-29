declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_HOST: string;
      POSTGRES_PORT: number;
      ACCESS_JWT_SECRET: string;
      ACCESS_JWT_EXPIRATION: string;
      REFRESH_JWT_SECRET: string;
      REFRESH_JWT_EXPIRATION: string;
    }
  }
}

export {};
