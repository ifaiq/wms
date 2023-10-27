declare global {
  namespace Express {
    export interface User {
      foobar: string;
    }
  }
}
