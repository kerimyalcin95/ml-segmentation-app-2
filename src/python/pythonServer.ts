import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import WebSocket from "ws";
import { once } from "node:events";

export class PythonServer {

    private webSocket: WebSocket | undefined;
    private pythonProcess: ChildProcessWithoutNullStreams | undefined;

    public onMessage?: (message: string) => void;
    public onConnected?: () => void;
    public onDisconnected?: (code: number, reason: string) => void;
    public onError?: (error: Error) => void;

    public onStdout?: (chunk: Buffer) => void;
    public onStderr?: (chunk: Buffer) => void;

    public constructor(
        private readonly pythonPath: string
    ) { }

    public async start(): Promise<void> {

        if (this.pythonProcess) {
            return;
        }

        const process = spawn("python", [
            "-u",
            this.pythonPath
        ]);

        this.pythonProcess = process;

        console.log("Python: Server started.");

        await new Promise<void>((resolve, reject) => {

            process.stdout.on("data", (data: Buffer) => {

                globalThis.process.stdout.write(data);

                this.onStdout?.(data);

                const output = data.toString();

                if (output.includes("Listening on")) {
                    resolve();
                }

            });

            process.stderr.on("data", (data: Buffer) => {

                globalThis.process.stderr.write(data);

                this.onStderr?.(data);

            });

            process.once("error", reject);

            process.once("exit", (code) => {

                console.log("Python: exited with code", code);

                this.pythonProcess = undefined;

                reject(
                    new Error(
                        `Python exited before becoming ready (code ${String(code)}).`
                    )
                );

            });

        });

        await this.connect();
    }

    public async connect(
        url = "ws://localhost:56767"
    ): Promise<void> {

        if (
            this.webSocket &&
            (
                this.webSocket.readyState === WebSocket.OPEN ||
                this.webSocket.readyState === WebSocket.CONNECTING
            )
        ) {
            return;
        }

        const socket = new WebSocket(url);

        this.webSocket = socket;

        console.log(`Electron: Connecting to ${url}`);

        await new Promise<void>((resolve, reject) => {

            function rawDataToString(data: WebSocket.RawData): string {
                if (Buffer.isBuffer(data)) {
                    return data.toString("utf8");
                }

                if (Array.isArray(data)) {
                    return Buffer.concat(data).toString("utf8");
                }

                return Buffer.from(data).toString("utf8");
            }

            socket.once("open", () => {

                console.log("Electron: Connected");

                this.onConnected?.();

                resolve();

            });

            socket.on("message", (data) => {
                this.onMessage?.(rawDataToString(data));
            });

            socket.on("close", (code, reason) => {

                const reasonString = reason.toString();

                console.log(
                    `WebSocket closed: ${String(code)}${reasonString ? `, ${reasonString}` : ""}`
                );

                this.webSocket = undefined;

                this.onDisconnected?.(
                    code,
                    reasonString
                );

            });

            socket.once("error", (error) => {

                this.webSocket = undefined;

                console.error("WebSocket error:", error);

                this.onError?.(error);

                reject(error);

            });

        });

    }

    public async disconnect(): Promise<void> {

        const socket = this.webSocket;

        if (!socket) {
            return;
        }

        this.webSocket = undefined;

        if (
            socket.readyState === WebSocket.CLOSED ||
            socket.readyState === WebSocket.CLOSING
        ) {
            return;
        }

        socket.close();

        await once(socket, "close");
    }

    public async stop(): Promise<void> {

        await this.disconnect();

        const process = this.pythonProcess;

        if (!process) {
            return;
        }

        this.pythonProcess = undefined;

        process.kill();

        await once(process, "exit");
    }

    public send(message: string): void {

        if (
            !this.webSocket ||
            this.webSocket.readyState !== WebSocket.OPEN
        ) {
            console.error("WebSocket not connected");
            return;
        }

        this.webSocket.send(message);
    }

    public isConnected(): boolean {

        return (
            this.webSocket !== undefined &&
            this.webSocket.readyState === WebSocket.OPEN
        );
    }

    public isRunning(): boolean {

        return this.pythonProcess !== undefined;
    }

}