
import asyncio
import websockets

async def handler(websocket):
    print("Connected", end='')

    try:
        async for message in websocket:
            print(f"'{message}'", end='')
            await websocket.send(message)

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed. \n Error message: {e.code}\n Reason message: {e.reason}", end='')

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("Listening on ws://localhost:8765", end='')
        await asyncio.Future() 

if __name__ == "__main__":
    asyncio.run(main())