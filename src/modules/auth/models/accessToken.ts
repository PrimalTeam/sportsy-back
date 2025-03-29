export class AccessTokenPayloadCreate {
  readonly sub: number;

  readonly email: string;
}

export class AccessTokenPayload extends AccessTokenPayloadCreate {
  readonly iat: number;

  readonly exp: number;
}
