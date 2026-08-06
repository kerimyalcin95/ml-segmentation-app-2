<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { CanvasManager } from '$lib/canvas/canvas';

import ImageSquareIcon from 'phosphor-svelte/lib/ImageSquareIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

async function loadLabel() {
    // TODO:
    // const filePath = await window.electronAPI.openImage(...);
    // const imageBytes = await window.electronAPI.readImage(filePath);
    // await canvas.document.loadAsset(imageBytes, "label");
}
</script>

<Button onclick={loadLabel}>
    <ImageSquareIcon weight="bold" />
    Load Label Image
</Button>
