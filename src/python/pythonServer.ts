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

    public start(): void {

        if (this.pythonProcess) {
            return;
        }

        this.pythonProcess = spawn("python", [
            "-u",
            this.pythonPath
        ]);

        console.log("Python: Server started.");

        this.pythonProcess.stdout.on("data", (data: Buffer) => {
            console.log(`Python: ${data}`);
        });

        this.pythonProcess.stderr.on("data", (data: Buffer) => {
            console.error(`Python Error: ${data}`);
        });

        this.pythonProcess.on("exit", (code) => {
            console.log(`Python: exited with code ${code}`);
            this.pythonProcess = undefined;
        });
    }

    public connect(url = "ws://localhost:56767"): void {

        if (this.webSocket) {
            return;
        }

        this.webSocket = new WebSocket(url);

        console.log(`Electron: Listening on ${url}`);

        this.webSocket.on("open", () => {
            console.log("Electron: Connected");
            this.onConnected?.();
        });

        this.webSocket.on("message", (data) => {
            this.onMessage?.(data.toString());
        });

        this.webSocket.on("close", (code, reason) => {

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

        this.webSocket.on("error", (error) => {

            console.error("WebSocket error:", error);

            this.onError?.(error);
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