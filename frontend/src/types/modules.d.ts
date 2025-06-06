// Module declarations for packages without TypeScript definitions

declare module "expo-print" {
  interface PrintOptions {
    html?: string;
    width?: number;
    height?: number;
    base64?: boolean;
  }

  interface PrintResult {
    uri: string;
  }

  export function printAsync(options: PrintOptions): Promise<PrintResult>;
  export function printToFileAsync(options: PrintOptions): Promise<PrintResult>;
}

declare module "socket.io-client" {
  export interface Socket {
    connected: boolean;
    on(event: string, callback: (...args: unknown[]) => void): Socket;
    emit(event: string, ...args: unknown[]): Socket;
    disconnect(): Socket;
    removeAllListeners(event?: string): Socket;
  }

  interface SocketOptions {
    autoConnect?: boolean;
    timeout?: number;
  }

  export function io(uri: string, options?: SocketOptions): Socket;
}
