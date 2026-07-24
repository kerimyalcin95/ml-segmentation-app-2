<script lang="ts">
import { onMount } from 'svelte';
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import { CanvasManager } from '$lib/canvas/canvas';
import type { Mode } from '$lib/types/mode';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
    mode: Mode;
}

let { onCanvasReady, mode = $bindable()}: Props = $props();

let viewport: HTMLDivElement;
let container: HTMLDivElement;
let canvas: CanvasManager;

onMount(() => {
    canvas = new CanvasManager(container, viewport);

    const observer = new ResizeObserver(() => {
        canvas.resize(viewport);
    });

    observer.observe(viewport);

    onCanvasReady?.(canvas);

    return () => {
        observer.disconnect();
        canvas.destroy();
    };
});
</script>

<div class="flex-1 relative">
    <ModeSelector bind:mode />

    <div bind:this={viewport} class="absolute inset-0 overflow-auto">
        <div bind:this={container} class="relative w-full h-full"></div>
    </div>
</div>
