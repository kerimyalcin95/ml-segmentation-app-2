import { BrowserWindow } from "electron";
import util from "node:util";

export class ConsoleMirror {
    private window?: BrowserWindow;

    private readonly original = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };

    public attach(window: BrowserWindow): void {
        this.window = window;
    }

    public install(): void {
        console.log = (...args: unknown[]) => {
            this.original.log(...args);
            this.write(util.format(...args) + "\n");
        };

        console.info = (...args: unknown[]) => {
            this.original.info(...args);
            this.write(util.format(...args) + "\n");
        };

        console.warn = (...args: unknown[]) => {
            this.original.warn(...args);
            this.write(util.format(...args) + "\n");
        };

        console.error = (...args: unknown[]) => {
            this.original.error(...args);
            this.write(util.format(...args) + "\n");
        };
    }

    public write(text: string): void {
        if (
            !this.window ||
            this.window.isDestroyed() ||
            this.window.webContents.isDestroyed() ||
            this.window.webContents.isLoading()
        ) {
            return;
        }

        this.window.webContents.send(
            "terminal-data",
            Buffer.from(text, "utf8"),
        );
    }
}