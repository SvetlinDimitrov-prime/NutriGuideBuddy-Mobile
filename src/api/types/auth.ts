export type AuthenticationRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  token: string;
};

export type AuthenticationResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  refreshToken: string;
};
