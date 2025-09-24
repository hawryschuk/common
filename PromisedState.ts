
export class PromisedState<A extends any[] = any[], T = any> {
  constructor(private f: (...args: A) => Promise<T>) { }
  reset() { this.started = this.result = this.error = this.finished = undefined; }
  submit(...args: A) {
    this.reset();
    this.started = Date.now();
    return this.f(...args)
      .then(r => this.result = r)
      .catch(e => this.error = e)
      .finally(() => this.finished = Date.now());
  }
  get pending() { return !!this.started && !this.finished; }
  get succeeded() { return !!this.started && !!this.finished && !this.error }
  promise?: Promise<T>;
  started?: number;
  result?: T;
  error?: any;
  finished?: number;
}
