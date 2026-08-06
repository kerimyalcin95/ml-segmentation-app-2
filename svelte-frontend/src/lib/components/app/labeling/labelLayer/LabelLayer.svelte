<script lang="ts">
import { Card } from '$lib/components/ui/card';

import { CanvasManager } from '$lib/canvas/canvas';

import type { ActiveLabel } from '$lib/types/label';

import LabelSelect from './LabelSelect.svelte';
import LabelDragList from './LabelDragList.svelte';
import SaveLabels from './SaveLabels.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

let activeLabels = $state<ActiveLabel[]>([]);
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Labels </span>

        <LabelSelect {activeLabels} />

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

        <SaveLabels {canvas} {activeLabels} />
    </div>
</Card>
