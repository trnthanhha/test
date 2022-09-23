export class PrepareError extends Error {
  constructor(ex: any, msg: string) {
    super(ex);
    this.stack = ex.stack;
    this.message = msg;
    this.name = 'PrepareError';
  }
}