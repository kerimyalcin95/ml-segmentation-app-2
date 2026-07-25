<script lang="ts">
    import { onMount } from 'svelte';

    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { CanvasManager } from '$lib/canvas/canvas';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();

    let width = $state(0);
    let height = $state(0);


    onMount(() => {
        canvas.onDocumentResize((newWidth, newHeight) => {
            width = newWidth;
            height = newHeight;
        });

        const size = canvas.getDocumentSize();

        width = size.width;
        height = size.height;
    });


    function resize() {
        canvas.resizeImage(
            Number(width),
            Number(height)
        );
    }
</script>

<div class="flex flex-col gap-2">
    <div class="flex gap-2">
        <Input
            type="number"
            placeholder="Width"
            bind:value={width}
        />

        <Input
            type="number"
            placeholder="Height"
            bind:value={height}
        />
    </div>

    <Button onclick={resize}>
        Resize
    </Button>
</div>