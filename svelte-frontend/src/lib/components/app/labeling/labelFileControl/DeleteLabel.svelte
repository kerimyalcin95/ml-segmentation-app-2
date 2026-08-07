<script lang="ts">
import { Button } from '$lib/components/ui/button';

import AlertDialog from '$lib/components/app/dialog/AlertDialog.svelte';

import TrashIcon from 'phosphor-svelte/lib/TrashIcon';

import { CanvasManager } from '$lib/canvas/canvas';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let deleteDialogOpen = $state(false);

function deleteLabel(): void {
    deleteDialogOpen = true;
}

function confirmDeleteLabel(): void {
    canvas.document.labelImage.delete();

    deleteDialogOpen = false;
}
</script>

<Button
    onclick={deleteLabel}
    disabled={!sessionStore.hasLabelImage}
    variant="destructive"
>
    <TrashIcon weight="bold" />
    Delete Label Image
</Button>

<AlertDialog
    bind:open={deleteDialogOpen}
    title="Delete Label Image?"
    message="Deleting the label image will permanently remove the current label image and all labels.

This action cannot be undone."
    actionText="Delete"
    destructive
    onAction={confirmDeleteLabel}
/>