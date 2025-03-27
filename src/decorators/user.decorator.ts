import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUserDto } from '../modules/user/dto/publicUser.dto';
import { User } from '../modules/user/entities/user.entity';

export const UserFromRequest = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): User | PublicUserDto | string | number => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user) return data ? request.user[data] : request.user;
  },
);
