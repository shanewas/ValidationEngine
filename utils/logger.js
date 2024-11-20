class Logger {
  constructor() {
    this.isEnabled = true; // Default to enabled
  }

  /**
   * Enables logging.
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disables logging.
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Logs a general message if logging is enabled.
   * @param {string} message - The message to log.
   * @param {...any} args - Additional arguments.
   */
  log(message, ...args) {
    if (this.isEnabled) {
      Function.prototype.apply.call(console.log, console, [message, ...args]);
    }
  }

  /**
   * Logs an error message if logging is enabled.
   * @param {string} message - The error message to log.
   * @param {...any} args - Additional arguments.
   */
  error(message, ...args) {
    if (this.isEnabled) {
      Function.prototype.apply.call(console.error, console, [message, ...args]);
    }
  }

  /**
   * Logs a warning message if logging is enabled.
   * @param {string} message - The warning message to log.
   * @param {...any} args - Additional arguments.
   */
  warn(message, ...args) {
    if (this.isEnabled) {
      Function.prototype.apply.call(console.warn, console, [message, ...args]);
    }
  }

  /**
   * Logs an informational message if logging is enabled.
   * @param {string} message - The informational message to log.
   * @param {...any} args - Additional arguments.
   */
  info(message, ...args) {
    if (this.isEnabled) {
      Function.prototype.apply.call(console.info, console, [message, ...args]);
    }
  }

  /**
   * Logs a debug message if logging is enabled.
   * @param {string} message - The debug message to log.
   * @param {...any} args - Additional arguments.
   */
  debug(message, ...args) {
    if (this.isEnabled) {
      Function.prototype.apply.call(console.debug, console, [message, ...args]);
    }
  }
}

export const logger = new Logger();
