<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { CanvasManager } from '$lib/canvas/canvas';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import CropIcon from 'phosphor-svelte/lib/CropIcon';
import { onDestroy } from 'svelte';

import {
    documentCrop,
    documentSize,
} from '$lib/components/stores/canvasStore.svelte';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let width = $state(0);
let height = $state(0);

$effect(() => {
    if (!sessionStore.editing.cropMode) {
        width = documentSize.width;
        height = documentSize.height;
    } else {
        width = documentCrop.width;
        height = documentCrop.height;
    }
});

$effect(() => {
    const shouldShowCropOverlay =
        sessionStore.editing.cropMode &&
        sessionStore.mode === 'editing' &&
        width !== 0 &&
        height !== 0;

    if (shouldShowCropOverlay) {
        canvas.cropOverlay.show();
    } else {
        canvas.cropOverlay.hide();
    }
});

$effect(() => {
    const handleDocumentResize = ({
        width: newWidth,
        height: newHeight,
    }: {
        width: number;
        height: number;
    }) => {
        width = newWidth;
        height = newHeight;
    };

    canvas.document.events.on('documentResize', handleDocumentResize);

    return () => {
        canvas.document.events.off('documentResize', handleDocumentResize);
    };
});

onDestroy(() => {
    canvas.cropOverlay.hide();
});

function setCropWidth(value: string | number) {
    const newWidth = Number(value);

    if (!Number.isFinite(newWidth) || newWidth <= 0) {
        return;
    }

    const crop = canvas.cropOverlay.setSize(newWidth, documentCrop.height);

    width = crop.width;
    height = crop.height;
}

function setCropHeight(value: string | number) {
    const newHeight = Number(value);

    if (!Number.isFinite(newHeight) || newHeight <= 0) {
        return;
    }

    const crop = canvas.cropOverlay.setSize(documentCrop.width, newHeight);

    width = crop.width;
    height = crop.height;
}

function crop() {
    canvas.document.crop(
        documentCrop.x,
        documentCrop.y,
        documentCrop.width,
        documentCrop.height,
    );

    sessionStore.editing.cropMode = false;
}
</script>

<div class="flex flex-col gap-2">
    <ToggleGroup.Root
        type="single"
        class="w-full rounded-md"
        value={sessionStore.editing.cropMode ? 'crop' : ''}
        onValueChange={(value) => {
            sessionStore.editing.cropMode = value === 'crop';
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
            oninput={() => {
                setCropWidth(width);
            }}
            disabled={!sessionStore.hasImage ||
                sessionStore.hasLabelImage ||
                !sessionStore.editing.cropMode}
        />

        <Input
            type="number"
            placeholder="Height"
            bind:value={height}
            oninput={() => {
                setCropHeight(height);
            }}
            disabled={!sessionStore.hasImage ||
                sessionStore.hasLabelImage ||
                !sessionStore.editing.cropMode}
        />
    </div>

    <Button
        onclick={crop}
        disabled={!sessionStore.hasImage || sessionStore.hasLabelImage}
    >
        Apply Crop
    </Button>
</div>
