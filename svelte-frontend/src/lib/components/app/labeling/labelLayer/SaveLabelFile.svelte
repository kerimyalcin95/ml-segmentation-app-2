<script lang="ts">
import { Button } from '$lib/components/ui/button';
import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';
import type { ActiveLabel } from '$lib/types/label';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { dirname } from '$lib/utils/path';

interface Props {
    activeLabels: ActiveLabel[];
    disabled: boolean;
}

let { activeLabels, disabled = false }: Props = $props();

let dialogOpen = $state(false);

let dialogTitle = $state('');
let dialogMessage = $state('');

function showDialog(title: string, message: string): void {
    dialogTitle = title;
    dialogMessage = message;
    dialogOpen = true;
}

async function saveLabels(): Promise<void> {
    if (activeLabels.length === 0) {
        showDialog('No Labels', 'There are no labels to save.');

        return;
    }

    const result = await window.electronAPI.showSaveLabelDialog(
        sessionStore.labeling.labelSaveDirectory,
    );

    if (!result) {
        return;
    }

    sessionStore.labeling.labelSaveDirectory = dirname(result.filePath);

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
        showDialog('Save Failed', 'The labels could not be saved.');
    }
}
</script>

<Button onclick={saveLabels} {disabled}>
    <FloppyDiskIcon weight="bold" />
    Save Labels
</Button>

<MessageDialog
    bind:open={dialogOpen}
    title={dialogTitle}
    message={dialogMessage}
/>
