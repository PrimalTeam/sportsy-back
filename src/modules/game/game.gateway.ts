import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game } from './entities/game.entity';
import { RoomAuthService } from '../roomAuth/roomAuth.service';
import { JwtService } from '@nestjs/jwt';
import { ProvidersNames } from '../custom-providers';
import { AccessTokenPayload } from '../auth/models/accessToken';

type TournamentPayload = { tournamentId: number; roomId: number };
type ClientContext = { userId: number };

@WebSocketGateway({ namespace: 'games', cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GameGateway.name);

  @WebSocketServer()
  private server?: Server;

  constructor(
    private readonly roomAuthService: RoomAuthService,
    @Inject(ProvidersNames.ACCESS_TOKEN_SERVICE)
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTournament')
  async handleJoinTournament(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TournamentPayload,
  ) {
    const { tournamentId, roomId } = this.validateTournamentPayload(payload);
    await this.ensureMembership(client, roomId, tournamentId);

    const room = this.getTournamentRoom(tournamentId);
    client.join(room);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leaveTournament')
  async handleLeaveTournament(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TournamentPayload,
  ) {
    const { tournamentId, roomId } = this.validateTournamentPayload(payload);
    await this.ensureMembership(client, roomId, tournamentId);

    const room = this.getTournamentRoom(tournamentId);
    client.leave(room);
    return { status: 'left', room };
  }

  emitGameCreated(game: Game) {
    this.emitToTournament(game.tournamentId, 'gameCreated', game);
  }

  emitGameUpdated(game: Game) {
    this.emitToTournament(game.tournamentId, 'gameUpdated', game);
  }

  emitGameDeleted(gameId: number, tournamentId: number) {
    this.emitToTournament(tournamentId, 'gameDeleted', {
      gameId,
      tournamentId,
    });
  }

  private emitToTournament(
    tournamentId: number,
    event: string,
    payload: unknown,
  ) {
    if (!this.server) {
      this.logger.warn(
        `Cannot emit ${event} for tournament ${tournamentId}; server unavailable`,
      );
      return;
    }

    const room = this.getTournamentRoom(tournamentId);
    this.server.to(room).emit(event, payload);
  }

  private getTournamentRoom(tournamentId: number) {
    return `tournament:${tournamentId}`;
  }

  private validateTournamentPayload(payload: TournamentPayload) {
    if (
      !payload ||
      typeof payload.tournamentId !== 'number' ||
      typeof payload.roomId !== 'number'
    ) {
      throw new WsException(
        'tournamentId and roomId must be provided as numbers',
      );
    }

    return payload;
  }

  private async ensureMembership(
    client: Socket,
    roomId: number,
    tournamentId: number,
  ) {
    const { userId } = await this.getClientContext(client);
    const room = await this.roomAuthService.getUserRoom(userId, roomId);
    if (!room || room.tournament?.id !== tournamentId) {
      throw new WsException('You are not allowed to join this tournament');
    }
  }

  private async getClientContext(client: Socket): Promise<ClientContext> {
    if (client.data?.userId) {
      return { userId: client.data.userId as number };
    }

    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Missing authorization token');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      client.data ??= {};
      client.data.userId = payload.sub;
      return { userId: payload.sub };
    } catch (error) {
      this.logger.warn(`Token verification failed: ${error}`);
      throw new WsException('Invalid or expired authorization token');
    }
  }

  private extractToken(client: Socket) {
    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    const token = (client.handshake.auth as { token?: string } | undefined)
      ?.token;
    if (typeof token === 'string' && token.length > 0) {
      return token;
    }

    return null;
  }
}
