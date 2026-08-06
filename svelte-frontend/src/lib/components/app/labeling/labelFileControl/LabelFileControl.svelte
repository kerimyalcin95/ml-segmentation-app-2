<script lang="ts">
    import { Card } from '$lib/components/ui/card';
    import { CanvasManager } from '$lib/canvas/canvas';

    import LoadLabel from './LoadLabel.svelte';
    import SaveLabel from './SaveLabel.svelte';
    import CreateLabel from './CreateLabel.svelte';
import Separator from '$lib/components/ui/separator/separator.svelte';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2">
            File Control
        </span>

        <LoadLabel {canvas} />
        <SaveLabel {canvas} />
        <Separator class="my-2"/>
        <CreateLabel {canvas} />
    </div>
</Card>