export const FakeProcess = (globalThis as any).process = {
  env: {},
  argv: [],
  exit: (code = 0) => console.log(`Fake process exited with code ${code}`),
  cwd: () => '/',
  nextTick: (callback: Function) => setTimeout(callback, 0),
  on: (...args: any[]) => { },
};
