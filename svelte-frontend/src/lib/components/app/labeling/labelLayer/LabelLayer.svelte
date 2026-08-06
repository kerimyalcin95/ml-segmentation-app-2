<script lang="ts">
import { Card } from '$lib/components/ui/card';

import { CanvasManager } from '$lib/canvas/canvas';

import type { ActiveLabel } from '$lib/types/label';

import LabelSelect from './LabelSelect.svelte';
import LabelDragList from './LabelDragList.svelte';
import SaveLabelFile from './SaveLabelFile.svelte';
import LoadLabelFile from './LoadLabelFile.svelte';
import Separator from '$lib/components/ui/separator/separator.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let activeLabels = $state<ActiveLabel[]>([]);

const labelsEnabled = $derived(canvas.document.hasLabelImage());
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Labels </span>

        <LabelSelect {activeLabels} enabled={labelsEnabled} />

        <LabelDragList
            {canvas}
            {activeLabels}
            onLabelsChanged={(labels: ActiveLabel[]) => {
                activeLabels = labels;
            }}
            onReorder={(labels: ActiveLabel[]) => {
                activeLabels = labels;
            }}
        />

        <Separator class="mb-2"/>

        <LoadLabelFile {canvas} {activeLabels} enabled={labelsEnabled} />
        <SaveLabelFile {canvas} {activeLabels} enabled={labelsEnabled} />
    </div>
</Card>
