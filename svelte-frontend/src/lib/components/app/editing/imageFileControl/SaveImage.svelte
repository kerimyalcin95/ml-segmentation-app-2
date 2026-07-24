<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();


async function saveImage() {
    if (!window.electronAPI) {
        console.error("electronAPI is not available");
        return;
    }


    const imageData = canvas.saveImage();

    const path = await window.electronAPI.saveImage(imageData);

    if (path) {
        console.log("Saved:", path);
    }
}
</script>


<Button onclick={saveImage}>
    Save Image
</Button>