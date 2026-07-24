<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Slider } from '$lib/components/ui/slider';
import { Card } from '$lib/components/ui/card';
import type { Mode } from '$lib/types/mode';
import { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
    mode: Mode;
}

let { canvas, mode = $bindable()}: Props = $props();

async function loadImage() {
    if (!window.electronAPI) {
        console.error('electronAPI is not available');
        return;
    }

    const path = await window.electronAPI.openImage();

    if (!path) return;

    canvas.loadImage(path);
}

function applyFilters() {
    canvas.setGrayscale(true);
}
</script>

<aside class="w-72 p-4">
    <Card class="h-full p-4 flex flex-col gap-4 overflow-auto">
        {#if mode === 'editing'}
            <h2 class="text-sm font-semibold">Editing</h2>

            <Button onclick={loadImage}>Load Image</Button>

            <Button onclick={applyFilters} variant="secondary">Apply filters</Button
            >
        {:else if mode === 'annotation'}
            <h2 class="text-sm font-semibold">Annotation</h2>
        {:else if mode === 'training'}
            <h2 class="text-sm font-semibold">Training</h2>
        {:else if mode === 'prediction'}
            <h2 class="text-sm font-semibold">Prediction</h2>
        {/if}
    </Card>
</aside>
