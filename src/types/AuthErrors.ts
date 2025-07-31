export class MissingJWTSecretError extends Error {
  constructor() {
    super();
    this.name = 'MissingJWTSecretError';
    Object.setPrototypeOf(this, MissingJWTSecretError.prototype);
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super();
    this.name = 'InvalidTokenError';
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}
