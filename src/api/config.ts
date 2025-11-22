import { Platform } from 'react-native';

const WEB_BASE_URL = 'http://localhost:8080';
const LAN_BASE_URL = 'http://192.168.0.3:8080';

export const API_BASE_URL = Platform.OS === 'web' ? WEB_BASE_URL : LAN_BASE_URL;

export const API_VERSION_PREFIX = '/api/v1';
