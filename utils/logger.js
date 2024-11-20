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
   * Logs a message if logging is enabled.
   * Uses console.log directly to avoid recursion.
   * @param {string} message - The message to log.
   * @param {...any} args - Additional arguments.
   */
  log(message, ...args) {
    if (this.isEnabled) {
      // Use console.log directly to avoid recursion
      Function.prototype.apply.call(console.log, console, [message, ...args]);
    }
  }

  /**
   * Logs an error if logging is enabled.
   * Uses console.error directly to avoid recursion.
   * @param {string} message - The error message to log.
   * @param {...any} args - Additional arguments.
   */
  error(message, ...args) {
    if (this.isEnabled) {
      // Use console.error directly to avoid recursion
      Function.prototype.apply.call(console.error, console, [message, ...args]);
    }
  }
}

export const logger = new Logger();
