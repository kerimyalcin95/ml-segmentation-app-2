<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { CanvasManager } from '$lib/canvas/canvas';

    import PlusCircleIcon from 'phosphor-svelte/lib/PlusCircleIcon';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();

    function createLabel() {
        // TODO:
        // canvas.document.createLabel();
    }
</script>

<Button onclick={createLabel}>
    <PlusCircleIcon weight="bold" />
    Create Image Label
</Button>