/// <reference types="vite/client" />

declare module "solid-js" {
  namespace JSX {
    interface HTMLAttributes<T> {
      commandfor?: string;
      command?: string;
    }
  }
}
