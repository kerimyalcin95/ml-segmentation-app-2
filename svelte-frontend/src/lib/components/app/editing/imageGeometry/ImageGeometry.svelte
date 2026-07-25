<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

import CropImage from '$lib/components/app/editing/imageGeometry/CropImage.svelte';
import ResizeImage from '$lib/components/app/editing/imageGeometry/ResizeImage.svelte';

import { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let width = $state(0);
let height = $state(0);

function resizeImage() {
    canvas.resizeImage(width, height);
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2">
            Geometry
        </span>

        <ResizeImage
            bind:width
            bind:height
            onclick={resizeImage}
        />

        <CropImage {canvas} />
    </div>
</Card>