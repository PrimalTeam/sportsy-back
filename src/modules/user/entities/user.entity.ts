import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { RoomUser } from 'src/modules/roomUser/entities/roomUser.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserIdentifierType {
  USERNAME = 'username',
  EMAIL = 'email',
  ID = 'id',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier of the user.' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'Unique username chosen by the user.' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    description: 'Unique email associated with the user account.',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Hashed login password.', writeOnly: true })
  @Exclude()
  @Column()
  password: string;

  @ApiPropertyOptional({
    description: 'List of roles assigned to the user.',
    type: [String],
  })
  @Column({
    type: 'text',
    default: '[]',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  roles: string[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @ApiProperty({
    description: 'Date the user was created.',
    type: String,
    format: 'date-time',
  })
  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'Room memberships for the user.',
    type: () => [RoomUser],
  })
  @OneToMany(() => RoomUser, (roomUser) => roomUser.user)
  roomUsers: RoomUser[];
}
