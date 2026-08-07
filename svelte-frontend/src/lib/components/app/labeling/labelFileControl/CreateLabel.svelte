<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

import PlusCircleIcon from 'phosphor-svelte/lib/PlusCircleIcon';

import { CanvasManager } from '$lib/canvas/canvas';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

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
        canvas.document.createLabel();
        return;
    }

    replaceDialogOpen = true;
}

function confirmCreateLabel(): void {
    canvas.document.createLabel();
    sessionStore.activeLabels = [];
    replaceDialogOpen = false;
}
</script>

<Button onclick={createLabel}>
    <PlusCircleIcon weight="bold" />
    Create Label Image
</Button>

<!-- No image loaded -->

<AlertDialog.Root bind:open={noImageDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>No Image Loaded</AlertDialog.Title>

            <AlertDialog.Description>
                Load an image before creating a label image.
            </AlertDialog.Description>
        </AlertDialog.Header>

        <AlertDialog.Footer>
            <AlertDialog.Action
                onclick={() => {
                    noImageDialogOpen = false;
                }}
            >
                OK
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<!-- Replace existing label -->

<AlertDialog.Root bind:open={replaceDialogOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Replace Label Image?</AlertDialog.Title>

            <AlertDialog.Description>
                A label image already exists.
                <br /><br />
                Creating a new label image will permanently delete the existing label
                image. This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>

        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>

            <AlertDialog.Action
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onclick={confirmCreateLabel}
            >
                Replace
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
