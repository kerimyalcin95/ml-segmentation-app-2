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
    if (!window.electronAPI) {
        console.error('electronAPI is not available');
        return;
    }

    const filePath = await window.electronAPI.openImage(
        sessionStore.lastDirectory,
    );

    if (!filePath) {
        return;
    }

    sessionStore.lastDirectory = dirname(filePath);

    canvas.document.loadImage(filePath);
}
</script>

<Button onclick={loadImage}>
    <ImageSquareIcon weight="bold" />
    Load Image
</Button>
