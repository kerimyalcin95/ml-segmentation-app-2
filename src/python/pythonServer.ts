import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import WebSocket from "ws";

export class PythonServer {

    private webSocket?: WebSocket;
    private pythonProcess?: ChildProcessWithoutNullStreams;
    private readonly pythonPath: string;

    public onMessage?: (message: string) => void;
    public onConnected?: () => void;
    public onDisconnected?: (code: number, reason: string) => void;
    public onError?: (error: Error) => void;

    public constructor(
        private readonly pythonPath: string
    ) {
        this.pythonPath = pythonPath;
    }

    public async start(): Promise<void> {

        if (this.pythonProcess) {
            return;
        }

        this.pythonProcess = spawn("python", [
            "-u",
            this.pythonPath
        ]);

        console.log("Python: Server started.");

        await new Promise<void>((resolve, reject) => {

            this.pythonProcess!.stdout.on("data", (data: Buffer) => {

                const output = data.toString();

                console.log(`Python: ${output}`);

                if (output.includes("Listening on")) {
                    resolve();
                }

            });

            this.pythonProcess!.stderr.on("data", (data: Buffer) => {
                console.error(`Python Error: ${data}`);
            });

            this.pythonProcess!.once("error", reject);

            this.pythonProcess!.once("exit", (code) => {

                console.log(`Python: exited with code ${code}`);

                this.pythonProcess = undefined;

                reject(
                    new Error(
                        `Python exited before becoming ready (code ${code}).`
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

        this.webSocket = new WebSocket(url);

        console.log(`Electron: Connecting to ${url}`);

        await new Promise<void>((resolve, reject) => {

            this.webSocket!.once("open", () => {

                console.log("Electron: Connected");

                this.onConnected?.();

                resolve();

            });

            this.webSocket!.on("message", (data) => {
                this.onMessage?.(data.toString());
            });

            this.webSocket!.on("close", (code, reason) => {

                const reasonString = reason.toString();

                console.log(
                    `WebSocket closed: ${code}${reasonString ? `, ${reasonString}` : ""}`
                );

                this.webSocket = undefined;

                this.onDisconnected?.(
                    code,
                    reasonString
                );

            });

            this.webSocket!.once("error", (error) => {

                this.webSocket = undefined;

                console.error("WebSocket error:", error);

                this.onError?.(error);

                reject(error);

            });

        });

    }

    public disconnect(): void {

        this.webSocket?.close();
        this.webSocket = undefined;
    }

    public stop(): void {

        this.disconnect();

        this.pythonProcess?.kill();
        this.pythonProcess = undefined;
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