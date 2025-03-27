import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from './user/entities/user.entity';

const commonOptions: PostgresConnectionOptions = {
  type: 'postgres',
  entities: [User],
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT as unknown as string),
};
interface iDbOptions {
  development: PostgresConnectionOptions;
  production: PostgresConnectionOptions;
}

const dbOptions: iDbOptions = {
  development: {
    ...commonOptions,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
  },
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
