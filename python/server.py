from __future__ import annotations

import asyncio
import json

import websockets
from websockets.asyncio.server import ServerConnection

from fastaiSegmentation import FastaiSegmentation


class WebSocketServer:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 56767,
    ) -> None:
        self.host = host
        self.port = port

    async def handleConnection(
        self,
        websocket: ServerConnection,
    ) -> None:
        print("Python: Client connected")

        try:
            async for message in websocket:
                response = await self.processMessage(message)
                await websocket.send(json.dumps(response))

        except websockets.exceptions.ConnectionClosed:
            print("Python: Connection closed")

    async def processMessage(
        self,
        message: str,
    ) -> dict:
        try:
            request = json.loads(message)
        except json.JSONDecodeError:
            return {
                "action": "error",
                "error": "Invalid JSON.",
            }

        action = request.get("action")

        if action == "test":
            return {
                "action": "test-success",
            }

        if action == "train":
            return await self.train(request)

        return {
            "action": "error",
            "error": f"Unknown action: {action}",
        }

    async def train(
        self,
        request: dict,
    ) -> dict:
        segmentation = FastaiSegmentation(
            image_path=request["imagePath"],
            label_image_path=["labelImagePath"],
            label_path=request["labelPath"],
            model_path=request["modelPath"],
            batch_size=request["batchSize"],
            num_workers=request["numWorkers"],
            epochs=request["epochs"]
        )

        await asyncio.to_thread(
            segmentation.train
        )

        return {
            "success": True,
            "action": "train"
        }

    async def start(self) -> None:
        async with websockets.serve(
            self.handleConnection,
            self.host,
            self.port,
        ):
            print(
                f"Python: Listening on ws://"
                f"{self.host}:{self.port}"
            )

            await asyncio.Future()


async def main() -> None:
    server = WebSocketServer()
    await server.start()


if __name__ == "__main__":
    asyncio.run(main())
