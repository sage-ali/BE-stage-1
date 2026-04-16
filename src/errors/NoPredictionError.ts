export class NoPredictionError extends Error {
  public status: number;

  constructor(message: string, status: number = 422) {
    super(message);
    this.name = 'NoPredictionError';
    this.status = status;

    // Restore prototype chain
    Object.setPrototypeOf(this, NoPredictionError.prototype);
  }
}
