<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { dirname } from '$lib/utils/path';
import * as localStorage from '$lib/utils/localStorage';

import AlertDialog from '$lib/components/app/dialog/AlertDialog.svelte';
import ImageSquareIcon from 'phosphor-svelte/lib/ImageSquareIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let replaceDialogOpen = $state(false);

async function loadSelectedImage(
    filePath: string,
): Promise<void> {
    sessionStore.editing.loadDirectory =
        dirname(filePath);

    await localStorage.save();

    const imageBytes =
        await window.electronAPI.readImage(filePath);

    await canvas.document.loadImage(imageBytes);
}

async function loadImage(): Promise<void> {
    if (sessionStore.hasLabelImage) {
        replaceDialogOpen = true;
        return;
    }

    const filePath =
        await window.electronAPI.showOpenImageDialog(
            sessionStore.editing.loadDirectory,
        );

    if (!filePath) {
        return;
    }

    await loadSelectedImage(filePath);
}

async function confirmLoadImage(): Promise<void> {
    replaceDialogOpen = false;

    const filePath =
        await window.electronAPI.showOpenImageDialog(
            sessionStore.editing.loadDirectory,
        );

    if (!filePath) {
        return;
    }

    canvas.document.labelImage.delete();
    sessionStore.labeling.activeLabels.length = 0;

    await loadSelectedImage(filePath);
}
</script>

<Button onclick={loadImage}>
    <ImageSquareIcon weight="bold" />
    Load Image
</Button>

<AlertDialog
    bind:open={replaceDialogOpen}
    title="Replace Current Image?"
    message="Loading a new image will permanently delete the current label image and all labels.

This action cannot be undone."
    actionText="Load Image"
    cancelText="Cancel"
    destructive
    onAction={confirmLoadImage}
/>