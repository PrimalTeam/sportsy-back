import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'text', default: '[]',  transformer: {
    to: (value: string[]) => JSON.stringify(value),
    from: (value: string) => JSON.parse(value)
  } })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;
}