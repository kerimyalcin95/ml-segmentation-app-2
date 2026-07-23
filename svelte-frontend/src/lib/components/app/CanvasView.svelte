<script lang="ts">
import { onMount } from 'svelte';
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import { CanvasManager } from '$lib/canvas/canvas';
import type { Mode } from '$lib/types/mode';

interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
    mode: Mode;
}

let { onCanvasReady, mode = 'editing' } = $props<Props>();

let viewport: HTMLDivElement;
let container: HTMLDivElement;
let canvas: CanvasManager;

onMount(() => {
    canvas = new CanvasManager(container, viewport);

    onCanvasReady?.(canvas);

    const resizeHandler = () => {
        canvas.resize(viewport);
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
        window.removeEventListener('resize', resizeHandler);
        canvas.destroy();
    };
});
</script>

<div bind:this={viewport} class="flex-1 relative overflow-auto">
    <ModeSelector bind:mode></ModeSelector>
    <div bind:this={container} class="relative w-full h-full"></div>
</div>
