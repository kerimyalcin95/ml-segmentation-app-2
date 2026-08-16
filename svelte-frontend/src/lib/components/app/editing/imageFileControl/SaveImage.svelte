<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { dirname } from '$lib/utils/path';

import * as localStorage from '$lib/utils/localStorage';

import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

async function saveImage() {
    const result = await window.electronAPI.showSaveImageDialog(
        sessionStore.editing.saveDirectory,
    );

    if (!result) {
        return;
    }

    sessionStore.editing.saveDirectory = dirname(result.filePath);
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

    const imageBytes = await canvas.document.saveImage(mimeType, quality);

    await window.electronAPI.writeImage(result.filePath, imageBytes);

    console.log('Saved:', result.filePath);
}
</script>

<Button onclick={saveImage} disabled={!sessionStore.hasImage}>
    <FloppyDiskIcon weight="bold" />
    Save Image
</Button>
