<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { CanvasManager } from '$lib/canvas/canvas';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import CropIcon from 'phosphor-svelte/lib/CropIcon';

import { documentSize } from '$lib/components/stores/canvasStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let cropMode = $state(false);

let x = $state(0);
let y = $state(0);
let width = $state(0);
let height = $state(0);

$effect(() => {
    if (!cropMode) {
        width = documentSize.width;
        height = documentSize.height;
    }

    canvas.document.events.on("documentResize", ({width: newWidth, height: newHeight}) => {
        width = newWidth;
        height = newHeight;
    });
});

function crop() {
    canvas.document.cropImage(x, y, width, height);
}
</script>

<div class="flex flex-col gap-2">
    <ToggleGroup.Root
        type="single"
        class="w-full border rounded-md"
        value={cropMode ? 'crop' : ''}
        onValueChange={(value) => {
            cropMode = value === 'crop';
        }}
    >
        <ToggleGroup.Item
            value="crop"
            class="w-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
            <CropIcon weight="bold" />Crop
        </ToggleGroup.Item>
    </ToggleGroup.Root>
    <div class="grid grid-cols-2 gap-2">
        <Input
            type="number"
            placeholder="Width"
            bind:value={width}
            disabled={!cropMode}
        />

        <Input
            type="number"
            placeholder="Height"
            bind:value={height}
            disabled={!cropMode}
        />
    </div>
    <Button onclick={crop}>Apply Crop</Button>
</div>
