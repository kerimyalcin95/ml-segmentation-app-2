<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { dirname } from '$lib/utils/path';

import ImageSquareIcon from 'phosphor-svelte/lib/ImageSquareIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

async function loadImage() {
    const filePath = await window.electronAPI.showOpenImageDialog(
        sessionStore.editing.loadDirectory,
    );

    if (!filePath) {
        return;
    }

    sessionStore.editing.loadDirectory = dirname(filePath);

    const imageBytes = await window.electronAPI.readImage(filePath);

    await canvas.document.loadImage(imageBytes);
}
</script>

<Button onclick={loadImage}>
    <ImageSquareIcon weight="bold" />
    Load Image
</Button>
