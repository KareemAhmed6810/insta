class appError extends Error {
  constructor(msg, status) {
    super(msg);
    this.status = status;
	this.isOperational=true
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { appError };
