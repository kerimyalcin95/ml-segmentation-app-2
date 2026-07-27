from __future__ import annotations

import asyncio

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

    async def handleConnection(self, websocket: ServerConnection) -> None:
        print("Connected", end="")

        try:
            async for message in websocket:
                print(f"'{message}'", end="")
                await websocket.send(message)

        except websockets.exceptions.ConnectionClosedOK as e:
            print(
                "Connection closed.\n"
                f"Error message: {e.code}\n"
                f"Reason message: {e.reason}",
                end="",
            )

    async def start(self) -> None:
        async with websockets.serve(
            self.handleConnection,
            self.host,
            self.port,
        ):
            print(f"Listening on ws://{self.host}:{self.port}", end="")
            await asyncio.Future()


async def main() -> None:
    server = WebSocketServer()
    await server.start()


if __name__ == "__main__":
    asyncio.run(main())