<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { CanvasManager } from '$lib/canvas/canvas';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import CropIcon from 'phosphor-svelte/lib/CropIcon';

import {
    documentCrop,
    documentSize,
} from '$lib/components/stores/canvasStore.svelte';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let cropMode = $state(false);

let width = $state(0);
let height = $state(0);

$effect(() => {
    if (!cropMode) {
        width = documentSize.width;
        height = documentSize.height;
    } else {
        width = documentCrop.width;
        height = documentCrop.height;
    }

    canvas.document.events.on(
        'documentResize',
        ({ width: newWidth, height: newHeight }) => {
            width = newWidth;
            height = newHeight;
        },
    );
});

$effect(() => {
    if (cropMode && width !== 0 && height !== 0) {
        canvas.cropOverlay.show();
    } else {
        canvas.cropOverlay.hide();
    }
});

function crop() {
    canvas.document.crop(
        documentCrop.x,
        documentCrop.y,
        documentCrop.width,
        documentCrop.height,
    );
}
</script>

<div class="flex flex-col gap-2">
    <ToggleGroup.Root
        type="single"
        class="w-full rounded-md"
        value={cropMode ? 'crop' : ''}
        onValueChange={(value) => {
            cropMode = value === 'crop';
        }}
        disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
        >
        <ToggleGroup.Item
            value="crop"
            class="
                w-full
                data-[state=on]:bg-primary/10
                data-[state=on]:ring-2
                data-[state=on]:ring-offset-0
                data-[state=on]:ring-primary/40
                data-[state=on]:hover:bg-primary/30
                data-[state=on]:text-foreground

                data-[state=off]:text-foreground
                data-[state=off]:bg-input/50
                data-[state=off]:hover:bg-primary/10
            "
        >
            <CropIcon weight="bold" />Crop
        </ToggleGroup.Item>
    </ToggleGroup.Root>
    <div class="grid grid-cols-2 gap-2">
        <Input
            type="number"
            placeholder="Width"
            bind:value={width}
            disabled={!sessionStore.hasImage ||
                sessionStore.hasLabelImage ||
                !cropMode}
        />

        <Input
            type="number"
            placeholder="Height"
            bind:value={height}
            disabled={!sessionStore.hasImage ||
                sessionStore.hasLabelImage ||
                !cropMode}
        />
    </div>
    <Button
        onclick={crop}
        disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
        >Apply Crop</Button
    >
</div>
