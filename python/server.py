from __future__ import annotations

import asyncio
import json
from threading import Event

import websockets
from websockets.asyncio.server import ServerConnection

class WebSocketServer:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 56767,
    ) -> None:
        self.host = host
        self.port = port

        self.training_cancel_event: Event | None = None
        self.training_task: asyncio.Task[None] | None = None

    async def handleConnection(
        self,
        websocket: ServerConnection,
    ) -> None:
        print("Python: Client connected")

        try:
            async for message in websocket:
                response = await self.processMessage(
                    message,
                    websocket,
                )

                if response is not None:
                    await websocket.send(
                        json.dumps(response)
                    )

        except websockets.exceptions.ConnectionClosed:
            print("Python: Connection closed")

    async def processMessage(
        self,
        message: str,
        websocket: ServerConnection,
    ) -> dict | None:
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

        if action == "train-start":
            return self.startTraining(
                request,
                websocket,
            )

        if action == "train-stop":
            return self.stopTraining()

        return {
            "action": "error",
            "error": f"Unknown action: {action}",
        }

    def startTraining(
        self,
        request: dict,
        websocket: ServerConnection,
    ) -> dict:
        if self.training_task is not None:
            return {
                "action": "train-error",
                "error": "Training is already running.",
            }

        cancel_event = Event()

        self.training_cancel_event = cancel_event

        self.training_task = asyncio.create_task(
            self.train(
                request,
                websocket,
                cancel_event,
            )
        )

        return {
            "action": "train-started",
        }

    async def train(
        self,
        request: dict,
        websocket: ServerConnection,
        cancel_event: Event,
    ) -> None:
        try:
            from fastaiSegmentation import FastaiSegmentation

            segmentation = FastaiSegmentation(
                image_path=request["imagePath"],
                label_image_path=request["labelImagePath"],
                label_path=request["labelPath"],
                model_path=request["modelPath"],
                batch_size=request["batchSize"],
                num_workers=request["numWorkers"],
                epochs=request["epochs"],
                validationPercent=request["validationPercent"],
                seed=request.get("seed"),
                architecture=request["architecture"],
                pretrained=request["pretrained"],
                cancel_event=cancel_event,
            )

            await asyncio.to_thread(
                segmentation.train
            )

            if cancel_event.is_set():
                response = {
                    "action": "train-cancelled",
                }
            else:
                response = {
                    "action": "train-success",
                }

        except Exception as error:
            print("Python: Training failed.")

            response = {
                "action": "train-error",
                "error": str(error),
            }

        finally:
            self.training_cancel_event = None
            self.training_task = None

        try:
            await websocket.send(
                json.dumps(response)
            )
        except websockets.exceptions.ConnectionClosed:
            print(
                "Python: Could not send training result."
            )

    def stopTraining(self) -> dict:
        """Request cancellation of the active training job."""

        if self.training_cancel_event is None:
            return {
                "action": "train-error",
                "error": "No training is running.",
            }

        self.training_cancel_event.set()

        return {
            "action": "train-stop-requested",
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