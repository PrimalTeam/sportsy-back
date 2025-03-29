import { AccessTokenPayload, AccessTokenPayloadCreate } from './accessToken';

export class RefreshTokenPayload extends AccessTokenPayload {
  readonly tokenType: string;
}

export class RefreshTokenPayloadCreate extends AccessTokenPayloadCreate {}
