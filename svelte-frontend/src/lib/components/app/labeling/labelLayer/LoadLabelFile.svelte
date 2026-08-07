<script lang="ts">
import { Button } from '$lib/components/ui/button';

import TagSimpleIcon from 'phosphor-svelte/lib/TagSimpleIcon';

import { CanvasManager } from '$lib/canvas/canvas';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

import {
    validateLabelFile,
    type ActiveLabel,
} from '$lib/types/label';

interface Props {
    canvas: CanvasManager;
    activeLabels: ActiveLabel[];
    enabled: boolean;
}

let { canvas, activeLabels, enabled = false }: Props = $props();

let dialogOpen = $state(false);

let dialogTitle = $state('');
let dialogMessage = $state('');

function showDialog(
    title: string,
    message: string,
): void {
    dialogTitle = title;
    dialogMessage = message;
    dialogOpen = true;
}

async function loadLabels(): Promise<void> {
    const filePath =
        await window.electronAPI.showOpenLabelDialog();

    if (!filePath) {
        return;
    }

    try {
        const json =
            await window.electronAPI.readLabels(
                filePath,
            );

        const labels =
            validateLabelFile(json);

        activeLabels.length = 0;
        activeLabels.push(...labels);
    } catch (error) {
        showDialog(
            'Invalid Label File',
            error instanceof Error
                ? error.message
                : 'An unknown error occurred.',
        );
    }
}
</script>

<Button
    onclick={loadLabels}
    disabled={!enabled}
>
    <TagSimpleIcon weight="bold" />
    Load Labels
</Button>

<MessageDialog
    bind:open={dialogOpen}
    title={dialogTitle}
    message={dialogMessage}
/>