from __future__ import annotations

from unittest.mock import AsyncMock, call

import pytest

from server import WebSocketServer


class MockWebSocket:
    def __init__(self, messages: list[str]) -> None:
        self._messages = iter(messages)
        self.send = AsyncMock()

    def __aiter__(self) -> "MockWebSocket":
        return self

    async def __anext__(self) -> str:
        try:
            return next(self._messages)
        except StopIteration:
            raise StopAsyncIteration


def test_constructor_sets_host_and_port() -> None:
    server = WebSocketServer(
        host="127.0.0.1",
        port=12345,
    )

    assert server.host == "127.0.0.1"
    assert server.port == 12345


@pytest.mark.asyncio
async def test_handle_connection_echoes_all_messages() -> None:
    server = WebSocketServer()

    websocket = MockWebSocket(
        [
            "hello",
            "world",
            "!",
        ]
    )

    await server.handleConnection(websocket)

    websocket.send.assert_has_awaits(
        [
            call("hello"),
            call("world"),
            call("!"),
        ]
    )

    assert websocket.send.await_count == 3


@pytest.mark.asyncio
async def test_handle_connection_with_no_messages() -> None:
    server = WebSocketServer()

    websocket = MockWebSocket([])

    await server.handleConnection(websocket)

    websocket.send.assert_not_awaited()