<script lang="ts">
import { Button } from '$lib/components/ui/button';

import TagSimpleIcon from 'phosphor-svelte/lib/TagSimpleIcon';
import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';
import AlertDialog from '$lib/components/app/dialog/AlertDialog.svelte';
import { dirname } from '$lib/utils/path';

import {
    validateLabelFile,
    type ActiveLabel,
} from '$lib/types/label';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import type { CanvasManager } from '$lib/canvas/canvas';
import { tick } from 'svelte';

interface Props {
    activeLabels: ActiveLabel[];
    disabled: boolean;
    canvas: CanvasManager;
}

let {
    activeLabels,
    disabled = false,
    canvas,
}: Props = $props();

let dialogOpen = $state(false);
let dialogTitle = $state('');
let dialogMessage = $state('');

let warningOpen = $state(false);
let pendingLabels = $state<ActiveLabel[] | null>(null);

function showDialog(
    title: string,
    message: string,
): void {
    dialogTitle = title;
    dialogMessage = message;
    dialogOpen = true;
}

function applyLabels(
    labels: ActiveLabel[],
): void {
    activeLabels.length = 0;
    activeLabels.push(...labels);
}

async function refreshAfterLabelChange(): Promise<void> {
    await tick();

    canvas.document.labelImage.refreshOutput();
}

function confirmLoadLabels(): void {
    if (!pendingLabels) {
        warningOpen = false;
        return;
    }

    const labels = pendingLabels;

    pendingLabels = null;
    warningOpen = false;

    applyLabels(labels);

    void refreshAfterLabelChange();
}

async function loadLabels(): Promise<void> {
    const filePath =
        await window.electronAPI.showOpenLabelDialog(
            sessionStore.labeling.labelLoadDirectory,
        );

    if (!filePath) {
        return;
    }

    sessionStore.labeling.labelLoadDirectory =
        dirname(filePath);

    try {
        const json =
            await window.electronAPI.readLabels(
                filePath,
            );

        const labels =
            validateLabelFile(json);

        const highestMaskValue =
            canvas.document.labelImage.getHighestLabelValue();

        /*
         * Label indices are:
         *
         * 0 ... labels.length - 1
         *
         * Therefore, any mask value >= labels.length
         * has no corresponding label.
         */
        if (
            highestMaskValue >= labels.length
        ) {
            pendingLabels = labels;
            warningOpen = true;

            return;
        }

        applyLabels(labels);

        await refreshAfterLabelChange();
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
    {disabled}
>
    <TagSimpleIcon weight="bold" />
    Load Labels
</Button>

<MessageDialog
    bind:open={dialogOpen}
    title={dialogTitle}
    message={dialogMessage}
/>

<AlertDialog
    bind:open={warningOpen}
    title="Label data will be lost"
    message="The current label image contains pixels belonging to labels that are not present in the label file. If you continue, those pixels will be deleted."
    actionText="Load Anyway"
    cancelText="Cancel"
    destructive={true}
    onAction={confirmLoadLabels}
/>
