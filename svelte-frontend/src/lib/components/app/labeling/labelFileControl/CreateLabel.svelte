<script lang="ts">
import { Button } from '$lib/components/ui/button';
import AlertDialog from '$lib/components/app/dialog/AlertDialog.svelte';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

import PlusCircleIcon from 'phosphor-svelte/lib/PlusCircleIcon';

import { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let noImageDialogOpen = $state(false);
let replaceDialogOpen = $state(false);

function createLabel(): void {
    if (!canvas.document.hasImage()) {
        noImageDialogOpen = true;
        return;
    }

    if (!canvas.document.hasLabelImage()) {
        canvas.document.labelImage.new();
        return;
    }

    replaceDialogOpen = true;
}

function confirmCreateLabel(): void {
    canvas.document.labelImage.new();
    
    replaceDialogOpen = false;
}
</script>

<Button onclick={createLabel}>
    <PlusCircleIcon weight="bold" />
    Create Label Image
</Button>

<!-- No image loaded -->

<MessageDialog
    bind:open={noImageDialogOpen}
    title="No Image Loaded"
    message="Load an image before creating a label image."
/>

<!-- Replace existing label -->

<AlertDialog
    bind:open={replaceDialogOpen}
    title="Replace Label Image?"
    message="A label image already exists.

Creating a new label image will permanently delete the existing label image. This action cannot be undone."
    actionText="Replace"
    destructive
    onAction={confirmCreateLabel}
/>
