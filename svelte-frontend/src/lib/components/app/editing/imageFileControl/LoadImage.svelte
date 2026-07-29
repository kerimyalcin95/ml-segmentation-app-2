<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

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

    const path = await window.electronAPI.openImage();

    if (!path) return;

    canvas.document.loadImage(path);
}
</script>

<Button onclick={loadImage}>
    <ImageSquareIcon weight="bold" />
    Load Image
</Button>
