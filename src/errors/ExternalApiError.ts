export class ExternalApiError extends Error {
  public status: number;

  constructor(message: string, status: number = 502) {
    super(message);
    this.name = 'ExternalApiError';
    this.status = status;

    // Restore prototype chain
    Object.setPrototypeOf(this, ExternalApiError.prototype);
  }
}
