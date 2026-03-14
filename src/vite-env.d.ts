/// <reference types="vite/client" />

declare module "solid-js" {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface HTMLAttributes<T> {
      commandfor?: string;
      command?: string;
    }
  }
}
