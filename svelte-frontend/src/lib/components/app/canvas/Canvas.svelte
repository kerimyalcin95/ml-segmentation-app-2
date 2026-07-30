<script lang="ts">
import { onMount } from 'svelte';

import { CanvasManager } from '$lib/canvas/canvas';
import { documentSize } from '$lib/components/stores/canvasStore.svelte';

import HorizontalScrollBar from './HorizontalScrollBar.svelte';
import VerticalScrollBar from './VerticalScrollBar.svelte';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
}

let { onCanvasReady }: Props = $props();

let viewport: HTMLDivElement;
let canvasElement: HTMLDivElement;

let canvas!: CanvasManager;

let viewportSize = $state({
    width: 0,
    height: 0,
});

let zoom = $state(1);

let scroll = $state({
    x: 0,
    y: 0,
});

let transformedDocumentSize = $state({
    width: 0,
    height: 0,
});

const contentWidth = $derived(transformedDocumentSize.width * zoom);

const contentHeight = $derived(transformedDocumentSize.height * zoom);

const maxScrollX = $derived(Math.max(0, contentWidth - viewportSize.width));

const maxScrollY = $derived(Math.max(0, contentHeight - viewportSize.height));

function updateViewport() {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;

    viewportSize.width = width;
    viewportSize.height = height;

    canvas.resize(width, height);

    scroll.x = canvas.camera.state.x;
    scroll.y = canvas.camera.state.y;
}

function updateCamera() {
    canvas.camera.set({
        x: scroll.x,
        y: scroll.y,
        zoom,
    });
}

function handleWheel(event: WheelEvent) {
    event.preventDefault();

    const rect = viewport.getBoundingClientRect();

    const centerX = event.clientX - rect.left;

    const centerY = event.clientY - rect.top;

    const factor = 1.1;

    const newZoom =
        event.deltaY < 0
            ? Math.min(5, zoom * factor)
            : Math.max(0.1, zoom / factor);

    canvas.camera.setZoom(newZoom, centerX, centerY);
}

onMount(() => {
    canvas = new CanvasManager(canvasElement);

    canvas.camera.events.on('cameraChange', ({ state }) => {
        zoom = state.zoom;

        const newMaxScrollX = Math.max(
            0,
            documentSize.width * zoom - viewportSize.width,
        );

        const newMaxScrollY = Math.max(
            0,
            documentSize.height * zoom - viewportSize.height,
        );

        scroll.x = Math.round(Math.max(0, Math.min(state.x, newMaxScrollX)));
        scroll.y = Math.round(Math.max(0, Math.min(state.y, newMaxScrollY)));
    });

    canvas.document._events.on('documentResize', ({ width, height }) => {
        documentSize.width = width;
        documentSize.height = height;

        transformedDocumentSize = canvas.document.getWorkspaceBoundsSize();
    });

    const observer = new ResizeObserver(() => {
        updateViewport();
    });

    observer.observe(viewport);

    viewport.addEventListener('wheel', handleWheel, {
        passive: false,
    });

    updateViewport();

    onCanvasReady?.(canvas);

    return () => {
        observer.disconnect();

        viewport.removeEventListener('wheel', handleWheel);

        canvas.destroy();
    };
});
</script>

<div data-e2e="canvas" class="flex-1 relative min-h-0 min-w-0">
    <div
        bind:this={viewport}
        id="canvas-viewport"
        class="
            absolute
            inset-0
            overflow-hidden
        "
    >
        <div bind:this={canvasElement}></div>
    </div>

    {#if maxScrollX > 0}
        <HorizontalScrollBar
            viewportId="canvas-viewport"
            viewportSize={viewportSize.width}
            contentSize={contentWidth}
            position={scroll.x}
            onChange={(x: number) => {
                scroll.x = x;
                updateCamera();
            }}
        />
    {/if}

    {#if maxScrollY > 0}
        <VerticalScrollBar
            viewportId="canvas-viewport"
            viewportSize={viewportSize.height}
            contentSize={contentHeight}
            position={scroll.y}
            onChange={(y: number) => {
                scroll.y = y;
                updateCamera();
            }}
        />
    {/if}
</div>
