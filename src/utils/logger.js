/**
 * Logger - Centralized Logging System
 * KESEMPATAN OS v2.0
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4
};

class Logger {
  constructor(options = {}) {
    this.level = options.level ?? LOG_LEVELS.INFO;
    this.prefix = options.prefix ?? 'KES';
    this.enableColors = options.enableColors ?? true;
    this.logs = [];
    this.maxLogs = options.maxLogs ?? 1000;
  }

  _getColor(level) {
    if (!this.enableColors) return '';
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      RESET: '\x1b[0m'
    };
    return colors[level] || '';
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const color = this._getColor(level);
    const reset = this.enableColors ? '\x1b[0m' : '';
    const prefix = `[${timestamp}] [${this.prefix}:${level}]`;
    
    let formatted = `${color}${prefix}${reset} ${message}`;
    if (data !== undefined) {
      formatted += ` ${JSON.stringify(data)}`;
    }
    return formatted;
  }

  _log(level, message, data) {
    if (LOG_LEVELS[level] < this.level) return;
    
    const formatted = this._formatMessage(level, message, data);
    
    // Store in memory
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      data
    });
    
    // Trim logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Console output
    switch (level) {
      case 'DEBUG':
        console.debug(formatted);
        break;
      case 'INFO':
        console.info(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
        console.error(formatted);
        break;
    }
  }

  debug(message, data) {
    this._log('DEBUG', message, data);
  }

  info(message, data) {
    this._log('INFO', message, data);
  }

  warn(message, data) {
    this._log('WARN', message, data);
  }

  error(message, data) {
    this._log('ERROR', message, data);
  }

  group(label) {
    console.group(`[${this.prefix}] ${label}`);
  }

  groupEnd() {
    console.groupEnd();
  }

  time(label) {
    console.time(`[${this.prefix}] ${label}`);
  }

  timeEnd(label) {
    console.timeEnd(`[${this.prefix}] ${label}`);
  }

  getLogs(filter) {
    if (!filter) return [...this.logs];
    return this.logs.filter(log => log.level === filter);
  }

  clear() {
    this.logs = [];
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
  }
}

// Singleton instance
const logger = new Logger({
  prefix: 'KES',
  level: LOG_LEVELS.INFO,
  enableColors: true
});

export default logger;
export { Logger, LOG_LEVELS };
