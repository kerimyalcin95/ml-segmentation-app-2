<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
import * as localStorage from '$lib/utils/localStorage';

interface Props {
    canvas: CanvasManager;
    enabled: boolean;
}

let { canvas, enabled = false }: Props = $props();

let messageDialogOpen = $state(false);
let messageDialogTitle = $state('');
let messageDialogMessage = $state('');

function showError(title: string, message: string): void {
    messageDialogTitle = title;
    messageDialogMessage = message;
    messageDialogOpen = true;
}

async function saveLabel(): Promise<void> {
    try {
        const imageBytes = await canvas.document.saveLabelImage();

        const result = await window.electronAPI.showSaveLabelImageDialog(
            sessionStore.labeling.labelImageSaveDirectory,
        );

        if (!result) {
            return;
        }

        await window.electronAPI.writeImage(result.filePath, imageBytes);

        sessionStore.labeling.labelImageSaveDirectory = result.filePath;
        await localStorage.save();
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to save label image.';

        console.error('Failed to save label image:', error);

        showError('Save Label Image', message);
    }
}
</script>

<Button onclick={saveLabel} disabled={!enabled}>
    <FloppyDiskIcon weight="bold" />
    Save Label Image
</Button>

<MessageDialog
    bind:open={messageDialogOpen}
    title={messageDialogTitle}
    message={messageDialogMessage}
/>
