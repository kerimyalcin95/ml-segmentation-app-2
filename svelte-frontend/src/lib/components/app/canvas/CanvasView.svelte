<!-- svelte-frontend/src/lib/components/app/CanvasView.svelte -->
<script lang="ts">
import { onMount } from 'svelte';
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import { CanvasManager } from '$lib/canvas/canvas';
import type { Mode } from '$lib/types/mode';
import HorizontalScrollBar from '$lib/components/app/canvas/HorizontalScrollBar.svelte';
import VerticalScrollBar from '$lib/components/app/canvas/VerticalScrollBar.svelte';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
    mode: Mode;
}

let { onCanvasReady, mode = $bindable() }: Props = $props();

let viewport: HTMLDivElement;
let canvasElement: HTMLDivElement;

let canvas: CanvasManager;

let viewportSize = $state({
    width: 0,
    height: 0,
});

let documentSize = $state({
    width: 0,
    height: 0,
});

let zoom = $state(1);

let scroll = $state({
    x: 0,
    y: 0,
});

const maxScrollX = $derived(
    Math.max(0, documentSize.width * zoom - viewportSize.width),
);

const maxScrollY = $derived(
    Math.max(0, documentSize.height * zoom - viewportSize.height),
);

function updateViewport() {
    viewportSize.width = viewport.clientWidth;
    viewportSize.height = viewport.clientHeight;

    canvas?.resize(viewportSize.width, viewportSize.height);
}

function updateCamera() {
    canvas?.setCamera({
        x: scroll.x,
        y: scroll.y,
        zoom,
    });
}

function setZoom(value: number) {
    zoom = value;

    canvas?.setCamera({
        x: scroll.x,
        y: scroll.y,
        zoom,
    });
}

function handleWheel(event: WheelEvent) {
    if (!canvas) return;

    event.preventDefault();

    const factor = 1.1;

    zoom =
        event.deltaY < 0
            ? Math.min(5, zoom * factor)
            : Math.max(0.1, zoom / factor);

    updateCamera();
}

onMount(() => {
    canvas = new CanvasManager(canvasElement);

    canvas.onDocumentResize((width, height) => {
        documentSize.width = width;
        documentSize.height = height;
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

<div class="flex-1 relative flex flex-col min-h-0 min-w-0">
    <ModeSelector bind:mode />

    <div class="flex-1 relative min-h-0 min-w-0">
        <div bind:this={viewport} class="absolute inset-0 overflow-hidden">
            <div bind:this={canvasElement}></div>
        </div>

        {#if maxScrollX > 0}
            <HorizontalScrollBar
                viewportId="canvas-viewport"
                viewportSize={viewportSize.width}
                contentSize={documentSize.width * zoom}
                position={scroll.x}
                onChange={(x) => {
                    scroll.x = x;
                    updateCamera();
                }}
            />
        {/if}

        {#if maxScrollY > 0}
            <VerticalScrollBar
                viewportId="canvas-viewport"
                viewportSize={viewportSize.height}
                contentSize={documentSize.height * zoom}
                position={scroll.y}
                onChange={(y) => {
                    scroll.y = y;
                    updateCamera();
                }}
            />
        {/if}
    </div>
</div>
