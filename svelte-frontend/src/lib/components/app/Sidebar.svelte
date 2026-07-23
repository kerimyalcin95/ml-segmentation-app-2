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

let { canvas, mode = 'editing'}: Props = $props();

let opacity = $state(50);
let threshold = $state(50);

async function loadImage() {
    const path = await window.electronAPI!.openImage();

    if (!path) return;

    canvas.loadImage(path);
}

function setGrayscale() {
    canvas.setGrayscale(true);
}
</script>

<aside class="w-72 p-4">
    <Card class="h-full p-4 flex flex-col gap-4 overflow-auto">
        {#if mode === 'editing'}
            <h2 class="text-sm font-semibold">Editing</h2>

            <Button onclick={loadImage}>Load Image</Button>

            <Button onclick={setGrayscale} variant="secondary">Grayscale</Button
            >

            <div class="space-y-2">
                <span class="text-sm"> Threshold </span>

                <Slider
                    type="single"
                    bind:value={threshold}
                    max={100}
                    step={1}
                />
            </div>

            <div class="space-y-2">
                <span class="text-sm"> Opacity </span>

                <Slider type="single" bind:value={opacity} max={100} step={1} />
            </div>
        {:else if mode === 'annotation'}
            <h2 class="text-sm font-semibold">Annotation</h2>

            <Button>Add Label</Button>

            <Button variant="secondary">Delete Label</Button>
        {:else if mode === 'training'}
            <h2 class="text-sm font-semibold">Training</h2>

            <Button>Start Training</Button>

            <div class="text-sm text-muted-foreground">
                Dataset configuration and training parameters.
            </div>
        {:else if mode === 'prediction'}
            <h2 class="text-sm font-semibold">Prediction</h2>

            <Button>Run Prediction</Button>

            <div class="text-sm text-muted-foreground">
                Model output and prediction controls.
            </div>
        {/if}
    </Card>
</aside>
