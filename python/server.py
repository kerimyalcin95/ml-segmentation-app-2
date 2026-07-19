
import asyncio
import websockets

async def handler(websocket):
    print("Connected")

    try:
        async for message in websocket:
            print(f"'{message}'")
            await websocket.send(message)

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed. \n Error message: {e.code}\n Reason message: {e.reason}")

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("Listening on ws://localhost:8765")
        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(main())