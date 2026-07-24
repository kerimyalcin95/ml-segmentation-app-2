<script lang="ts">
import { onMount } from 'svelte';

import { CanvasManager } from '$lib/canvas/canvas';

import HorizontalScrollBar from './HorizontalScrollBar.svelte';
import VerticalScrollBar from './VerticalScrollBar.svelte';


interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
}


let {
    onCanvasReady,
}: Props = $props();


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


const contentWidth = $derived(
    documentSize.width * zoom
);


const contentHeight = $derived(
    documentSize.height * zoom
);


const maxScrollX = $derived(
    Math.max(
        0,
        contentWidth - viewportSize.width
    )
);


const maxScrollY = $derived(
    Math.max(
        0,
        contentHeight - viewportSize.height
    )
);


function updateViewport() {
    viewportSize.width =
        viewport.clientWidth;

    viewportSize.height =
        viewport.clientHeight;


    canvas?.resize(
        viewportSize.width,
        viewportSize.height
    );
}


function updateCamera() {
    canvas?.setCamera({
        x: scroll.x,
        y: scroll.y,
        zoom,
    });
}


function handleWheel(event: WheelEvent) {
    event.preventDefault();

    const factor = 1.1;


    zoom =
        event.deltaY < 0
            ? Math.min(
                5,
                zoom * factor
            )
            : Math.max(
                0.1,
                zoom / factor
            );


    updateCamera();
}


onMount(() => {

    canvas = new CanvasManager(
        canvasElement
    );


    canvas.onDocumentResize(
        (width, height) => {
            documentSize.width = width;
            documentSize.height = height;
        }
    );


    const observer =
        new ResizeObserver(() => {
            updateViewport();
        });


    observer.observe(viewport);


    viewport.addEventListener(
        'wheel',
        handleWheel,
        {
            passive: false,
        }
    );


    updateViewport();


    onCanvasReady?.(canvas);


    return () => {
        observer.disconnect();

        viewport.removeEventListener(
            'wheel',
            handleWheel
        );

        canvas.destroy();
    };
});
</script>


<div class="flex-1 relative min-h-0 min-w-0">

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
            contentSize={contentHeight}
            position={scroll.y}
            onChange={(y) => {
                scroll.y = y;
                updateCamera();
            }}
        />
    {/if}

</div>