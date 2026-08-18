import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import WebSocket from "ws";
import { once } from "node:events";

export class PythonServer {

    private webSocket: WebSocket | undefined;
    private pythonProcess: ChildProcessWithoutNullStreams | undefined;

    private pendingError: string | undefined;

    public onMessage?: (message: string) => void;
    public onConnected?: () => void;
    public onDisconnected?: (code: number, reason: string) => void;
    public onError?: (error: Error) => void;

    public onStdout?: (chunk: Buffer) => void;
    public onStderr?: (chunk: Buffer) => void;

    public constructor(
        private readonly pythonPath: string
    ) { }

    public async start(port: number): Promise<void> {
        if (this.pythonProcess) {
            return;
        }

        const python = this.getPythonCommand();

        const process = spawn(python.command, [
            ...python.args,
            "-u",
            this.pythonPath,
            "--port",
            String(port),
        ]);

        this.pythonProcess = process;

        console.log(
            `Electron: Python server starting on port ${String(port)}`
        );

        await new Promise<void>((resolve, reject) => {
            let stderr = "";
            let settled = false;

            const fail = (error: Error): void => {
                if (settled) {
                    return;
                }

                settled = true;
                this.pythonProcess = undefined;

                this.onError?.(error);

                this.pendingError = error.message;

                this.onError?.(error);

                reject(error);
            };

            process.stdout.on("data", (data: Buffer) => {
                globalThis.process.stdout.write(data);

                this.onStdout?.(data);

                const output = data.toString();

                if (output.includes("Listening on")) {
                    settled = true;
                    resolve();
                }
            });

            process.stderr.on("data", (data: Buffer) => {
                globalThis.process.stderr.write(data);

                this.onStderr?.(data);

                stderr += data.toString();
            });

            process.once("error", (error) => {
                fail(error);
            });

            process.once("exit", (code) => {
                console.log("Python: exited with code", code);

                this.pythonProcess = undefined;

                if (settled) {
                    return;
                }

                const output = stderr.toLowerCase();

                if (
                    output.includes("winerror 10013") ||
                    (
                        output.includes("port") &&
                        output.includes("unavailable") &&
                        output.includes("reserved")
                    )
                ) {
                    fail(
                        new Error(
                            `The Python server could not start because port ${String(port)} is unavailable.\n` +
                            "The port may already be in use or reserved by the operating system."
                        )
                    );

                    return;
                }

                if (
                    output.includes("winerror 10048") ||
                    output.includes("address already in use") ||
                    output.includes("only one usage of each socket address")
                ) {
                    fail(
                        new Error(
                            `The Python server could not start because port ${String(port)} is already in use.\n` +
                            "Please choose another port and try again."
                        )
                    );

                    return;
                }

                if (
                    output.includes("no runtime installed") ||
                    output.includes("requested python version") ||
                    output.includes("not installed") ||
                    output.includes("could not be found")
                ) {
                    fail(
                        new Error(
                            "Python 3.12 is required to run ML-Segmentation.\n" +
                            "Download Python 3.12.10:\n" +
                            "https://www.python.org/downloads/release/python-31210/"
                        )
                    );

                    return;
                }

                if (
                    output.includes("modulenotfounderror") ||
                    output.includes("no module named")
                ) {
                    fail(
                        new Error(
                            "Required Python packages are missing.\n" +
                            "Please install the required packages for Python 3.12.\n" +
                            "For more information see\n" +
                            "https://github.com/kerimyalcin95/ml-segmentation-app-2#install-python-packages"
                        )
                    );

                    return;
                }

                fail(
                    new Error(
                        stderr.trim() ||
                        `Python server exited before becoming ready (code ${String(code)}).`
                    )
                );
            });
        });

        await this.connect(port);
    }

    public async connect(port: number): Promise<void> {
        if (
            this.webSocket &&
            (
                this.webSocket.readyState === WebSocket.OPEN ||
                this.webSocket.readyState === WebSocket.CONNECTING
            )
        ) {
            return;
        }

        const url = `ws://localhost:${String(port)}`;
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
                console.log("Electron: WebSocket connected");

                this.onConnected?.();

                resolve();
            });

            socket.on("message", (data) => {
                this.onMessage?.(rawDataToString(data));
            });

            socket.on("close", (code, reason) => {
                const reasonString = reason.toString();

                console.log(
                    `WebSocket closed: ${String(code)}${reasonString ? `, ${reasonString}` : ""
                    }`
                );

                this.webSocket = undefined;

                this.onDisconnected?.(
                    code,
                    reasonString,
                );
            });

            socket.once("error", (error) => {
                this.webSocket = undefined;

                console.error(
                    "Electron: WebSocket error:",
                    error,
                );

                this.onError?.(error);

                reject(error);
            });
        });
    }

    public async restart(port: number): Promise<void> {
        await this.stop();
        await this.start(port);
    }

    private getPythonCommand(): {
        command: string;
        args: string[];
    } {
        switch (globalThis.process.platform) {
            case "win32":
                return {
                    command: "py",
                    args: ["-3.12"],
                };

            case "linux":
            case "darwin":
                return {
                    command: "python3.12",
                    args: [],
                };

            default:
                throw new Error(
                    `Unsupported operating system: ${globalThis.process.platform}`,
                );
        }
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

        if (process.killed) {
            return;
        }

        if (globalThis.process.platform === "win32") {
            await new Promise<void>((resolve) => {
                const killer = spawn(
                    "taskkill",
                    [
                        "/pid",
                        String(process.pid),
                        "/t",
                        "/f",
                    ],
                    {
                        stdio: "ignore",
                        windowsHide: true,
                    },
                );

                killer.once("exit", () => {
                    resolve();
                });

                killer.once("error", () => {
                    resolve();
                });
            });

            return;
        }

        process.kill();

        await once(process, "exit").catch(() => undefined);
    }

    public send(message: string): void {

        if (
            !this.webSocket ||
            this.webSocket.readyState !== WebSocket.OPEN
        ) {
            console.error("Electron: WebSocket not connected");
            return;
        }

        this.webSocket.send(message);
    }

    public getPendingError(): string | undefined {
        return this.pendingError;
    }

    public clearPendingError(): void {
        this.pendingError = undefined;
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