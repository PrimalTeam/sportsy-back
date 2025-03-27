import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';

const commonOptions = {
  type: 'postgres',
  entities: [User],
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT as unknown as string),
};

const dbOptions = {
  development: {
    ...commonOptions,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
  }),
  production: {
    ...commonOptions,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
  },
};

dotenv.config();
export const AppDataSource = new DataSource({
  ...dbOptions[process.env.NODE_ENV ?? 'development'],
});

export const DataSourceOptions = AppDataSource.options;
