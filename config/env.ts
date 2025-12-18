import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const PORT = process.env.PORT || '5500';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5500';
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const ARCJET_ENV = process.env.ARCJET_ENV;
export const ARCJET_KEY = process.env.ARCJET_KEY;
export const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
export const QSTASH_URL = process.env.QSTASH_URL;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

