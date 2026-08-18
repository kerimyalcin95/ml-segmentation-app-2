from __future__ import annotations

import asyncio
import json
import sys
from threading import Event

import argparse

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

        self.prediction_cancel_event: Event | None = None
        self.prediction_task: asyncio.Task[None] | None = None

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

        if action == "predict-start":
            return self.startPrediction(
                request,
                websocket,
            )

        if action == "predict-stop":
            return self.stopPrediction()

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
            from fastaiSegmentation import (
                FastaiSegmentationTraining
            )

            segmentation = FastaiSegmentationTraining(
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

    def startPrediction(
        self,
        request: dict,
        websocket: ServerConnection,
    ) -> dict:
        if self.prediction_task is not None:
            return {
                "action": "predict-error",
                "error": "Prediction is already running.",
            }

        cancel_event = Event()

        self.prediction_cancel_event = cancel_event

        self.prediction_task = asyncio.create_task(
            self.predict(
                request,
                websocket,
                cancel_event,
            )
        )

        return {
            "action": "predict-started",
        }

    async def predict(
        self,
        request: dict,
        websocket: ServerConnection,
        cancel_event: Event,
    ) -> None:
        try:
            from fastaiSegmentation import (
                FastaiSegmentationPrediction
            )

            segmentation = FastaiSegmentationPrediction(
                image_path=request["imagePath"],
                label_image_path=request["labelImagePath"],
                model_path=request["modelPath"],
                cancel_event=cancel_event,
            )

            await asyncio.to_thread(
                segmentation.predict
            )

            if cancel_event.is_set():
                response = {
                    "action": "predict-cancelled",
                }
            else:
                response = {
                    "action": "predict-success",
                }

        except Exception as error:
            print("Python: Prediction failed.")

            response = {
                "action": "predict-error",
                "error": str(error),
            }

        finally:
            self.prediction_cancel_event = None
            self.prediction_task = None

        try:
            await websocket.send(
                json.dumps(response)
            )
        except websockets.exceptions.ConnectionClosed:
            print(
                "Python: Could not send prediction result."
            )

    def stopPrediction(self) -> dict:
        """Request cancellation of the active prediction job."""

        if self.prediction_cancel_event is None:
            return {
                "action": "predict-error",
                "error": "No prediction is running.",
            }

        self.prediction_cancel_event.set()

        return {
            "action": "predict-stop-requested",
        }

    async def start(self) -> bool:
        try:
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

        except OSError as error:
            if error.errno == 13:
                print(
                    f"Python: Port {self.port} is unavailable. "
                    "It is already in use or reserved by the operating system.",
                    file=sys.stderr,
                    flush=True,
                )
                return False

            if error.errno == 10048:
                print(
                    f"Python: Port {self.port} is already in use.",
                    file=sys.stderr,
                    flush=True,
                )
                return False

            raise


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--port",
        type=int,
        default=56767,
    )

    args = parser.parse_args()

    server = WebSocketServer(
        port=args.port,
    )

    if not await server.start():
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))