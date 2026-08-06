<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { CanvasManager } from '$lib/canvas/canvas';

import LoadLabelImage from './LoadLabelImage.svelte';
import SaveLabelImage from './SaveLabelImage.svelte';
import CreateLabel from './CreateLabel.svelte';
import Separator from '$lib/components/ui/separator/separator.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

const labelsEnabled = $derived(canvas.document.hasLabelImage());
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> File Control </span>

        <LoadLabelImage {canvas} />
        <SaveLabelImage {canvas} enabled={labelsEnabled} />
        <Separator />
        <CreateLabel {canvas} />
    </div>
</Card>
