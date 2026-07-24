<script lang="ts">
import ModeSelector from '$lib/components/app/ModeSelector.svelte';
import Canvas from '$lib/components/app/canvas/Canvas.svelte';
import { CanvasManager } from '$lib/canvas/canvas';
import type { Mode } from '$lib/types/mode';


interface Props {
    onCanvasReady?: (canvas: CanvasManager) => void;
    mode: Mode;
}

let {
    onCanvasReady,
    mode = $bindable(),
}: Props = $props();

</script>


<div class="flex-1 relative flex flex-col min-h-0 min-w-0">

    <ModeSelector bind:mode />

    <Canvas
        {onCanvasReady}
    />

</div>