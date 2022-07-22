import consola, { ConsolaLogObject } from 'consola'

type EnumType = 'success' | 'error' | 'log' | 'warn' | 'info' | 'debug' | 'trace'

export function log(type: EnumType, message: ConsolaLogObject | any, ...args: any[]) {
  switch (type) {
    case 'success':
      consola.success(message, ...args)
      break;
    case 'error':
      consola.error(message, ...args)
      break;
    case 'log':
      consola.log(message, ...args)
      break;
    case 'warn':
      consola.warn(message, ...args)
      break;
    case 'info':
      consola.info(message, ...args)
      break;
    case 'debug':
      consola.debug(message, ...args)
      break;
    case 'trace':
      consola.trace(message, ...args)
      break;
    default:
      consola.log(message, ...args)
      break;
  }
}
