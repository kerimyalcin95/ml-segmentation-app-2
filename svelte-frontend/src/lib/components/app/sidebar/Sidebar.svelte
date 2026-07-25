<!-- svelte-frontend/src/lib/components/app/sidebar/Sidebar.svelte -->
<script lang="ts">
import { tick } from 'svelte';

import { Card } from '$lib/components/ui/card';
import type { Mode } from '$lib/types/mode';
import { CanvasManager } from '$lib/canvas/canvas';

import ImageFileControl from '$lib/components/app/editing/imageFileControl/ImageFileControl.svelte';
import ImageTransform from '../editing/imageTransform/ImageTransform.svelte';
import ImageGeometry from '../editing/imageGeometry/ImageGeometry.svelte';
import VerticalScrollBar from '$lib/components/app/sidebar/VerticalScrollBar.svelte';
import ImageFilter from '../editing/imageFilter/ImageFilter.svelte';

interface Props {
    canvas: CanvasManager;
    mode: Mode;
}

let { canvas, mode }: Props = $props();

let viewport: HTMLDivElement;

let scrollbar: {
    showScrollbar: () => void;
};

let scrollY = $state(0);
let viewportHeight = $state(0);
let contentHeight = $state(0);

const maxScroll = $derived(Math.max(0, contentHeight - viewportHeight));

let resizeObserver: ResizeObserver;

$effect(() => {
    if (!viewport) return;

    const content = viewport.firstElementChild as HTMLElement | null;

    if (!content) return;

    resizeObserver?.disconnect();

    resizeObserver = new ResizeObserver(() => {
        updateSizes();
    });

    resizeObserver.observe(content);

    tick().then(() => {
        updateSizes();
    });

    return () => {
        resizeObserver.disconnect();
    };
});

function updateSizes() {
    if (!viewport) return;

    viewportHeight = viewport.clientHeight;

    const content = viewport.firstElementChild as HTMLElement | null;

    contentHeight = content?.getBoundingClientRect().height ?? 0;

    scrollY = Math.max(
        0,
        Math.min(scrollY, Math.max(0, contentHeight - viewportHeight)),
    );
}

function handleScroll(value: number) {
    scrollY = Math.max(0, Math.min(maxScroll, value));
}

function handleWheel(event: WheelEvent) {
    event.preventDefault();

    scrollbar?.showScrollbar();

    handleScroll(scrollY + event.deltaY);
}

function handleMouseMove() {
    scrollbar?.showScrollbar();
}
</script>

<aside
    class="
        relative
        w-84
        h-full
    "
    onmouseenter={handleMouseMove}
    onmousemove={handleMouseMove}
>
    <div
        bind:this={viewport}
        class="
            relative
            h-full
            overflow-hidden
            p-4
        "
        onwheel={handleWheel}
    >
        <div
            class="
                flex
                flex-col
                gap-4
                pb-12
            "
            style="
                transform: translateY(-{scrollY}px);
            "
        >
            {#if mode === 'editing'}
                <h2 class="text-md font-bold mb-3">Editing</h2>

                <ImageFileControl {canvas} />
                <ImageFilter {canvas} />
                <ImageTransform {canvas} />
                <ImageGeometry {canvas} />
            {:else if mode === 'annotation'}
                <h2 class="text-md font-bold mb-3">Annotation</h2>

                <Card class="h-min flex flex-col gap-4"></Card>
            {:else if mode === 'training'}
                <h2 class="text-md font-bold mb-3">Training</h2>

                <Card class="h-min flex flex-col gap-4"></Card>
            {:else if mode === 'prediction'}
                <h2 class="text-md font-bold mb-3">Prediction</h2>

                <Card class="h-min flex flex-col gap-4"></Card>
            {/if}
        </div>
    </div>

    <VerticalScrollBar
        bind:this={scrollbar}
        viewportId="sidebar"
        viewportSize={viewportHeight}
        contentSize={contentHeight}
        position={scrollY}
        onChange={handleScroll}
    />
</aside>
