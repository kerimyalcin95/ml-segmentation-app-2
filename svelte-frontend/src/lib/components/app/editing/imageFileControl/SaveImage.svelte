<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon'

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

async function saveImage() {
    if (!window.electronAPI) {
        console.error("electronAPI is not available");
        return;
    }

    const imageData = canvas.document.saveImage();

    const path = await window.electronAPI.saveImage(imageData);

    if (path) {
        console.log("Saved:", path);
    }
}
</script>

<Button onclick={saveImage}>
    <FloppyDiskIcon weight="bold" />
    Save Image
</Button>