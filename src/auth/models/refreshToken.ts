import { AccessTokenPayload } from './accessToken';

export class RefreshTokenPayload extends AccessTokenPayload {
  readonly tokenType: string;
}
