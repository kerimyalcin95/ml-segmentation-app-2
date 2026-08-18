import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { PythonServer } from "./pythonServer.js";

describe("PythonServer integration", () => {

    let server: PythonServer;

    beforeEach(() => {

        server = new PythonServer(
            "python/server.py"
        );

    });

    afterEach(async () => {

        await server.disconnect();
        await server.stop();

    });

    it("starts the Python server", async () => {

        await server.start(56767);

        expect(server.isRunning()).toBe(true);

    });

});