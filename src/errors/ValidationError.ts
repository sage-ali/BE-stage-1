export class ValidationError extends Error {
  public status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;

    // Restore prototype chain
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
