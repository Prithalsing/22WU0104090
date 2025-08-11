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
  private bearerToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwcml0aGFsc2luZy52aWxhc18yMDI2QHdveHNlbi5lZHUuaW4iLCJleHAiOjE3NTQ4OTQ1NTQsImlhdCI6MTc1NDg5MzY1NCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjYyZTRhY2EwLTQzYmYtNGI0Yi1iMGI0LTczNTVmNDMxNTE4YSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InByaXRoYWxzaW5nIG1vcmUiLCJzdWIiOiI5MmVmNDg2NC0xMGJlLTRlYmQtYjFjNS0wYWE3ZWE0NjA2YzIifSwiZW1haWwiOiJwcml0aGFsc2luZy52aWxhc18yMDI2QHdveHNlbi5lZHUuaW4iLCJuYW1lIjoicHJpdGhhbHNpbmcgbW9yZSIsInJvbGxObyI6IjIyd3UwMTA0MDkwIiwiYWNjZXNzQ29kZSI6IlVNWFZRVCIsImNsaWVudElEIjoiOTJlZjQ4NjQtMTBiZS00ZWJkLWIxYzUtMGFhN2VhNDYwNmMyIiwiY2xpZW50U2VjcmV0IjoieGFmanhtd3N0emtzakFRYSJ9.rXd344y0eRaa8OEVn8RxTRzj3h3s8GtRyrC221NqsBc';
  private endpoint: string = 'http://20.244.56.144/evaluation-service/logs';

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

    // Validate level
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
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
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