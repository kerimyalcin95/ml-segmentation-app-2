<script lang="ts">
import { Button } from '$lib/components/ui/button';

import TagSimpleIcon from 'phosphor-svelte/lib/TagSimpleIcon';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';
import { dirname } from '$lib/utils/path';

import { validateLabelFile, type ActiveLabel } from '$lib/types/label';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

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

async function loadLabels(): Promise<void> {
    const filePath = await window.electronAPI.showOpenLabelDialog(
        sessionStore.labeling.labelLoadDirectory,
    );

    if (!filePath) {
        return;
    }

    sessionStore.labeling.labelLoadDirectory = dirname(filePath);

    try {
        const json = await window.electronAPI.readLabels(filePath);

        const labels = validateLabelFile(json);

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

<Button onclick={loadLabels} {disabled}>
    <TagSimpleIcon weight="bold" />
    Load Labels
</Button>

<MessageDialog
    bind:open={dialogOpen}
    title={dialogTitle}
    message={dialogMessage}
/>
