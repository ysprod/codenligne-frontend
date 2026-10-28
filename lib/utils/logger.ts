/**
 * Logger utilitaire — ne log qu'en mode développement.
  *
 * Usage :
 *   import { logger } from '@/lib/utils/logger';
 *   logger.error('Mon message', err);
 */

const isDev =
  typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : false;

function noop() {}

export const logger = {
  log: isDev ? console.log.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
  debug: isDev ? console.debug.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
} as const;

export default logger;
