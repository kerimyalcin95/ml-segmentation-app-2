<script lang="ts">
import { onMount } from 'svelte';

import { CanvasManager } from '$lib/canvas/canvas';
import {
    documentSize,
    workspaceSize,
} from '$lib/components/stores/canvasStore.svelte';

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

let panning = $state(false);

let panStart = {
    x: 0,
    y: 0,
};

let cameraStart = {
    x: 0,
    y: 0,
};

const wheelConfig = {
    scrollSpeed: 1,

    zoom: {
        factor: 1.05,
        min: 0.1,
        max: 5,
    },
} as const;

const panConfig = {
    speed: 1,
} as const;

const contentWidth = $derived(workspaceSize.width * zoom);
const contentHeight = $derived(workspaceSize.height * zoom);

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

function setCamera() {
    canvas.camera.set({
        x: scroll.x,
        y: scroll.y,
        zoom,
    });
}

function setScroll(x: number, y: number) {
    scroll.x = Math.max(0, Math.min(maxScrollX, x));

    scroll.y = Math.max(0, Math.min(maxScrollY, y));

    setCamera();
}

function handleWheel(event: WheelEvent) {
    event.preventDefault();

    if (event.shiftKey) {
        handleHorizontalWheel(event);
        return;
    }

    if (event.altKey) {
        handleVerticalWheel(event);
        return;
    }

    handleZoomWheel(event);
}

function handleHorizontalWheel(event: WheelEvent) {
    setScroll(scroll.x + event.deltaY * wheelConfig.scrollSpeed, scroll.y);
}

function handleVerticalWheel(event: WheelEvent) {
    setScroll(scroll.x, scroll.y + event.deltaY * wheelConfig.scrollSpeed);
}

function handleZoomWheel(event: WheelEvent) {
    const rect = viewport.getBoundingClientRect();

    const centerX = event.clientX - rect.left;
    const centerY = event.clientY - rect.top;

    const { min, max, factor } = wheelConfig.zoom;

    const newZoom =
        event.deltaY < 0
            ? Math.min(max, zoom * factor)
            : Math.max(min, zoom / factor);

    canvas.camera.setZoom(newZoom, centerX, centerY);
}

function handlePointerDown(event: PointerEvent) {
    if (event.button !== 1) {
        return;
    }

    event.preventDefault();

    panning = true;

    panStart.x = event.clientX;
    panStart.y = event.clientY;

    cameraStart.x = scroll.x;
    cameraStart.y = scroll.y;

    viewport.setPointerCapture(event.pointerId);
}

function handlePointerMove(event: PointerEvent) {
    if (!panning) {
        return;
    }

    const dx = (event.clientX - panStart.x) * panConfig.speed;

    const dy = (event.clientY - panStart.y) * panConfig.speed;

    setScroll(cameraStart.x - dx, cameraStart.y - dy);
}

function handlePointerUp(event: PointerEvent) {
    if (!panning) {
        return;
    }

    if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
    }

    stopPanning();
}

function handleLostPointerCapture() {
    stopPanning();
}

function stopPanning() {
    panning = false;
}

onMount(() => {
    canvas = new CanvasManager(canvasElement);

    canvas.camera.events.on('cameraState', ({ state }) => {
        zoom = state.zoom;

        scroll.x = state.x;
        scroll.y = state.y;
    });

    canvas.document.workspace.events.on('workspaceResize', ({ width, height }) => {
        workspaceSize.width = width;
        workspaceSize.height = height;

        console.log("workspaceSize.width",workspaceSize.width);
        console.log("workspaceSize.height",workspaceSize.height);
    });

    canvas.document.events.on('documentResize', ({ width, height }) => {
        documentSize.width = width;
        documentSize.height = height;

        console.log("documentSize.width",documentSize.width);
        console.log("documentSize.height",documentSize.height);
    });

    const observer = new ResizeObserver(() => {
        updateViewport();
    });

    observer.observe(viewport);

    viewport.addEventListener('wheel', handleWheel, {
        passive: false,
    });

    viewport.addEventListener('pointerdown', handlePointerDown);
    viewport.addEventListener('pointermove', handlePointerMove);
    viewport.addEventListener('pointerup', handlePointerUp);
    viewport.addEventListener('pointercancel', handlePointerUp);
    viewport.addEventListener('lostpointercapture', handleLostPointerCapture);

    updateViewport();

    onCanvasReady?.(canvas);

    return () => {
        observer.disconnect();

        viewport.removeEventListener('wheel', handleWheel);
        viewport.removeEventListener('pointerdown', handlePointerDown);
        viewport.removeEventListener('pointermove', handlePointerMove);
        viewport.removeEventListener('pointerup', handlePointerUp);
        viewport.removeEventListener('pointercancel', handlePointerUp);
        viewport.removeEventListener(
            'lostpointercapture',
            handleLostPointerCapture,
        );

        canvas.destroy();
    };
});
</script>

<div data-e2e="canvas" class="flex-1 relative min-h-0 min-w-0">
    <div
        bind:this={viewport}
        id="canvas-viewport"
        class={[
            'absolute',
            'inset-0',
            'overflow-hidden',
            panning ? 'cursor-grabbing' : 'cursor-default',
        ].join(' ')}
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
                setCamera();
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
                setCamera();
            }}
        />
    {/if}
</div>
