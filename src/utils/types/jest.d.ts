// jest.d.ts

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveReceivedCommandWith<T, U>(
        command: new (...args: any[]) => any,
        input: any
      ): R;
      toHaveReceivedCommand<T, U>(command: new (...args: any[]) => any): R;
      toHaveReceivedCommandTimes<T, U>(
        command: new (...args: any[]) => any,
        times: number
      ): R;
    }
  }
}

export {};
