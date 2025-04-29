import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { console } from 'inspector';
import { Observable } from 'rxjs';
import { ROOMROLE_KEY } from 'src/decorators/roomRole.decorator';
import { AccessTokenPayload } from 'src/modules/auth/models/accessToken';
import { RoomUserRole } from 'src/modules/roomUser/entities/roomUser.entity';
import { RoomUserService } from 'src/modules/roomUser/roomUser.service';
import { RoomAuthService } from 'src/modules/roomAuth/roomAuth.service';

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roomAuthService: RoomAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoomUserRole[]>(
      ROOMROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { user }: { user: AccessTokenPayload } = context
      .switchToHttp()
      .getRequest();
    const { roomId } = context.switchToHttp().getRequest().params;

    const role = await this.roomAuthService.getUserRoleInRoom(
      user.sub,
      Number(roomId),
    );

    if (!role) {
      throw new HttpException(
        `The user isn't member of this room.`,
        HttpStatus.FORBIDDEN,
      );
    }
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    if (requiredRoles.includes(role)) {
      return true;
    } else {
      throw new HttpException(
        `The type of user's membership isn't apropriate.`,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
