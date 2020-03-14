class Logger {
  log(message, userFn, colorFn) {
    console.log(message);
  }

  debug(message) {
    console.debug(message);
  }

  warn(message) {
    console.warn(message);
  }

  error(message) {
    console.error(message);
  }
}

export default Logger;
