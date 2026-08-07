<script lang="ts">
import { Button } from '$lib/components/ui/button';
import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
import { CanvasManager } from '$lib/canvas/canvas';
import type { ActiveLabel } from '$lib/types/label';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

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

async function saveLabels(): Promise<void> {
    if (activeLabels.length === 0) {
        showDialog(
            'No Labels',
            'There are no labels to save.',
        );

        return;
    }

    const result =
        await window.electronAPI.showSaveLabelDialog();

    if (!result) {
        return;
    }

    try {
        await window.electronAPI.writeLabels(
            result.filePath,
            JSON.stringify(
                {
                    labels: activeLabels,
                },
                null,
                4,
            ),
        );
    } catch {
        showDialog(
            'Save Failed',
            'The labels could not be saved.',
        );
    }
}
</script>

<Button onclick={saveLabels} disabled={!enabled}>
    <FloppyDiskIcon weight="bold" />
    Save Labels
</Button>

<MessageDialog
    bind:open={dialogOpen}
    title={dialogTitle}
    message={dialogMessage}
/>
