interface LogData {
  stack: 'backend' | 'frontend';
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  package: string;
  message: string;
}

const VALID_BACKEND_PACKAGES = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
const VALID_FRONTEND_PACKAGES = ['api', 'component', 'hook', 'page', 'state', 'style', 'service'];
const VALID_COMMON_PACKAGES = ['auth', 'config', 'middleware', 'utils'];

class LoggingMiddleware {
  private static instance: LoggingMiddleware;
  private endpoint: string =
    typeof window === 'undefined'
      ? 'http://localhost:3000/api/log' // Use your dev server's URL/port
      : '/api/log';

  private constructor() {}

  public static getInstance(): LoggingMiddleware {
    if (!LoggingMiddleware.instance) {
      LoggingMiddleware.instance = new LoggingMiddleware();
    }
    return LoggingMiddleware.instance;
  }

  private validateLogData(data: LogData): boolean {
    const { stack, level, package: pkg, message } = data;

    // Validate stack
    if (!['backend', 'frontend'].includes(stack)) {
      return false;
    }

    if (!['debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
      return false;
    }

    // Validate package based on stack
    const validPackages = stack === 'backend' 
      ? [...VALID_BACKEND_PACKAGES, ...VALID_COMMON_PACKAGES]
      : [...VALID_FRONTEND_PACKAGES, ...VALID_COMMON_PACKAGES];

    if (!validPackages.includes(pkg)) {
      return false;
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return false;
    }

    return true;
  }

  public async log(data: LogData): Promise<void> {
    try {
      if (!this.validateLogData(data)) {
        console.error('Invalid log data provided:', data);
        return;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send log:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending log:', error);
    }
  }

  // Convenience methods for different log levels
  public debug(stack: 'backend' | 'frontend', pkg: string, message: string) {
    return this.log({ stack, level: 'debug', package: pkg, message });
  }

  public info(stack: 'backend' | 'frontend', pkg: string, message: string) {
    return this.log({ stack, level: 'info', package: pkg, message });
  }

  public warn(stack: 'backend' | 'frontend', pkg: string, message: string) {
    return this.log({ stack, level: 'warn', package: pkg, message });
  }

  public error(stack: 'backend' | 'frontend', pkg: string, message: string) {
    return this.log({ stack, level: 'error', package: pkg, message });
  }

  public fatal(stack: 'backend' | 'frontend', pkg: string, message: string) {
    return this.log({ stack, level: 'fatal', package: pkg, message });
  }
}

export const logger = LoggingMiddleware.getInstance();