export type RefreshTokenRequest = {
  token: string;
};

export type AuthenticationResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  refreshToken: string;
};

export type DevUserKey =
  | 'USER1'
  | 'USER2'
  | 'USER3'
  | 'USER4'
  | 'USER5'
  | 'USER6'
  | 'USER7'
  | 'USER8'
  | 'USER9'
  | 'USER10';

export const DEV_USER_KEYS: DevUserKey[] = [
  'USER1',
  'USER2',
  'USER3',
  'USER4',
  'USER5',
  'USER6',
  'USER7',
  'USER8',
  'USER9',
  'USER10',
];
