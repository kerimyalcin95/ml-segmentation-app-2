<script lang="ts">
    import { Card } from '$lib/components/ui/card';

    import CropImage from '$lib/components/app/editing/imageGeometry/CropImage.svelte';
    import ResizeImage from '$lib/components/app/editing/imageGeometry/ResizeImage.svelte';

    import { CanvasManager } from '$lib/canvas/canvas';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="mx-4 flex flex-col gap-2">
        <span class="mb-2 text-sm font-medium">
            Geometry
        </span>

        <ResizeImage {canvas} />
        <CropImage {canvas} />
    </div>
</Card>