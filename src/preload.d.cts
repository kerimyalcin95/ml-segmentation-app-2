export interface ElectronAPI {
  onMessage: (callback: (message: string) => void) => void;
  sendMessage: (message: string) => void;
  log: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}