<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

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

    canvas.loadImage(path);
}
</script>

<Button onclick={loadImage}>
    Load Image
</Button>