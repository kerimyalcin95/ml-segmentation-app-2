<script lang="ts">
import { Card } from '$lib/components/ui/card';
import type { Mode } from '$lib/types/mode';
import { CanvasManager } from '$lib/canvas/canvas';
import ImageFileControl from '$lib/components/app/editing/imageFileControl/ImageFileControl.svelte';
import FilterSystem from './editing/filters/FilterSystem.svelte';

interface Props {
    canvas: CanvasManager;
    mode: Mode;
}

let { canvas, mode }: Props = $props();
</script>

<aside class="w-84 p-4">
    {#if mode === 'editing'}
        <h2 class="text-md font-bold mb-3">Editing</h2>
        <div class="flex flex-col gap-4">
            <ImageFileControl {canvas} />
            <FilterSystem {canvas} />
        </div>
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
</aside>
