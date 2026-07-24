<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { CanvasManager } from '$lib/canvas/canvas';
import LoadImage from '$lib/components/app/imageEditing/LoadImage.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Image Editing </span>
        <LoadImage {canvas} />
    </div>
</Card>
