<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

import * as localStorage from '$lib/utils/localStorage';

import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

async function saveImage(): Promise<void> {
    const result = await window.electronAPI.showSaveImageDialog(
        sessionStore.editing.savePath
    );

    if (!result) {
        return;
    }

    sessionStore.editing.savePath = result.filePath;

    await localStorage.save();

    let mimeType = 'image/png';
    let quality: number | undefined;

    switch (result.extension) {
        case 'jpg':
        case 'jpeg':
            mimeType = 'image/jpeg';
            quality = 0.95;
            break;

        case 'webp':
            mimeType = 'image/webp';
            quality = 0.95;
            break;
    }

    const hasLabelImage = sessionStore.hasLabelImage;

    const previousGlobalHidden = sessionStore.labeling.globalHidden;

    if (hasLabelImage) {
        sessionStore.labeling.globalHidden = true;

        canvas.document.labelImage.setVisible(false);
        canvas.document.events.emit('layerRedraw');
    }

    try {
        const imageBytes = await canvas.document.saveImage(mimeType, quality);

        await window.electronAPI.writeImage(result.filePath, imageBytes);

        console.log('Saved:', result.filePath);
    } finally {
        if (hasLabelImage) {
            sessionStore.labeling.globalHidden = previousGlobalHidden;

            canvas.document.labelImage.setVisible(!previousGlobalHidden);
            canvas.document.events.emit('layerRedraw');
        }
    }
}
</script>

<Button onclick={saveImage} disabled={!sessionStore.hasImage}>
    <FloppyDiskIcon weight="bold" />
    Save Image
</Button>
