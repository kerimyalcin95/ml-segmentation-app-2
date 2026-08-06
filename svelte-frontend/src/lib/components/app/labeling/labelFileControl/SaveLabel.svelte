<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { CanvasManager } from '$lib/canvas/canvas';

    import FloppyDiskIcon from 'phosphor-svelte/lib/FloppyDiskIcon';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();

    async function saveLabel() {
        // TODO:
        // const result = await window.electronAPI.showSaveImageDialog(...);
        // const imageBytes = await canvas.document.saveAsset("label");
        // await window.electronAPI.writeImage(result.filePath, imageBytes);
    }
</script>

<Button onclick={saveLabel}>
    <FloppyDiskIcon weight="bold" />
    Save Image Label
</Button>