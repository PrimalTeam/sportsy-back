declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_HOST: string;
      POSTGRES_PORT: number;
      JWT_SECRET: string;
      JWT_EXPIRATION: string;
    }
  }
}

export {};
