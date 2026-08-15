<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { CanvasManager } from '$lib/canvas/canvas';

import ImageFileControl from '$lib/components/app/editing/imageFileControl/ImageFileControl.svelte';
import ImageTransform from '../editing/imageTransform/ImageTransform.svelte';
import ImageGeometry from '../editing/imageGeometry/ImageGeometry.svelte';
import VerticalScrollBar from '$lib/components/app/sidebar/VerticalScrollBar.svelte';
import ImageFilter from '../editing/imageFilter/ImageFilter.svelte';

import LabelFileControl from '$lib/components/app/labeling/labelFileControl/LabelFileControl.svelte';
import LabelBrush from '$lib/components/app/labeling/labelBrush/LabelBrush.svelte';
import LabelLayer from '$lib/components/app/labeling/labelLayer/LabelLayer.svelte';
import LabelDisplay from '$lib/components/app/labeling/labelDisplay/LabelDisplay.svelte';

import TrainingControl from '$lib/components/app/training/trainingControl/TrainingControl.svelte';
import DataLoader from '$lib/components/app/training/dataloader/DataLoader.svelte';
import Learner from '$lib/components/app/training/learner/Learner.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let viewport: HTMLDivElement | undefined;

let scrollbar: {
    showScrollbar: () => void;
} | undefined;

let scrollY = $state(0);
let viewportHeight = $state(0);
let contentHeight = $state(0);

const maxScroll = $derived(
    Math.max(0, contentHeight - viewportHeight),
);

let resizeObserver: ResizeObserver | undefined;

$effect(() => {
    if (!viewport) return;

    const content =
        viewport.firstElementChild as HTMLElement | null;

    if (!content) return;

    resizeObserver?.disconnect();

    resizeObserver = new ResizeObserver(() => {
        updateSizes();
    });

    resizeObserver.observe(viewport);
    resizeObserver.observe(content);

    updateSizes();

    window.addEventListener('resize', updateSizes);

    return () => {
        resizeObserver?.disconnect();
        window.removeEventListener('resize', updateSizes);
    };
});

function updateSizes() {
    if (!viewport) return;

    viewportHeight = viewport.clientHeight;

    const content =
        viewport.firstElementChild as HTMLElement | null;

    contentHeight =
        content?.getBoundingClientRect().height ?? 0;

    scrollY = Math.max(
        0,
        Math.min(
            scrollY,
            Math.max(0, contentHeight - viewportHeight),
        ),
    );
}

function handleScroll(value: number) {
    scrollY = Math.max(
        0,
        Math.min(maxScroll, value),
    );
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
    data-e2e="sidebar"
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
        "
        onwheel={handleWheel}
    >
        <div
            class="
                flex
                flex-col
                gap-4
                pb-12
                p-4
            "
            style="
                transform: translateY(-{scrollY}px);
            "
        >
            {#if sessionStore.mode === 'editing'}
                <h2 class="text-md font-bold mb-3">
                    Editing
                </h2>

                <ImageFileControl {canvas} />
                <ImageFilter {canvas} />
                <ImageTransform {canvas} />
                <ImageGeometry {canvas} />

            {:else if sessionStore.mode === 'labeling'}
                <h2 class="text-md font-bold mb-3">
                    Labeling
                </h2>

                <LabelFileControl {canvas} />
                <LabelBrush {canvas} />
                <LabelLayer {canvas} />
                <LabelDisplay {canvas} />

            {:else if sessionStore.mode === 'training'}
                <h2 class="text-md font-bold mb-3">
                    Training
                </h2>

                <TrainingControl />
                <DataLoader />
                <Learner />

            {:else if sessionStore.mode === 'prediction'}
                <h2 class="text-md font-bold mb-3">
                    Prediction
                </h2>

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