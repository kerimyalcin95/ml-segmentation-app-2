<script lang="ts">
import { Card } from '$lib/components/ui/card';

import type { ActiveLabel } from '$lib/types/label';

import LabelSelect from './LabelSelect.svelte';
import LabelDragList from './LabelDragList.svelte';
import SaveLabelFile from './SaveLabelFile.svelte';
import LoadLabelFile from './LoadLabelFile.svelte';
import Separator from '$lib/components/ui/separator/separator.svelte';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import type { CanvasManager } from '$lib/canvas/canvas';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Labels </span>

        <LabelSelect
            activeLabels={sessionStore.labeling.activeLabels}
            disabled={!sessionStore.labeling.enabled}
        />

        <LabelDragList
            activeLabels={sessionStore.labeling.activeLabels}
            onLabelsChanged={(labels: ActiveLabel[]) => {
                sessionStore.labeling.activeLabels = labels;
            }}
            onReorder={(labels: ActiveLabel[]) => {
                sessionStore.labeling.activeLabels = labels;
            }}
            {canvas}
        />

        <Separator class="mb-2" />

        <LoadLabelFile
            activeLabels={sessionStore.labeling.activeLabels}
            disabled={!sessionStore.labeling.enabled}
            {canvas}
        />
        <SaveLabelFile
            activeLabels={sessionStore.labeling.activeLabels}
            disabled={!sessionStore.labeling.enabled}
        />
    </div>
</Card>
