<script lang="ts">
import { Card } from '$lib/components/ui/card';

import { CanvasManager } from '$lib/canvas/canvas';

import type { ActiveLabel } from '$lib/types/label';

import LabelSelect from './LabelSelect.svelte';
import LabelDragList from './LabelDragList.svelte';
import SaveLabelFile from './SaveLabelFile.svelte';
import LoadLabelFile from './LoadLabelFile.svelte';
import Separator from '$lib/components/ui/separator/separator.svelte';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import { onMount } from 'svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

onMount(() => {
    sessionStore.labelsEnabled = canvas.document.hasLabelImage();

    const handler = () => {
        sessionStore.labelsEnabled = canvas.document.hasLabelImage();
    };

    canvas.document.events.on('labelImageCreate', handler);

    return () => {
        canvas.document.events.off('labelImageCreate', handler);
    };
});
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Labels </span>

        <LabelSelect
            activeLabels={sessionStore.activeLabels}
            enabled={sessionStore.labelsEnabled}
        />

        <LabelDragList
            {canvas}
            activeLabels={sessionStore.activeLabels}
            onLabelsChanged={(labels: ActiveLabel[]) => {
                sessionStore.activeLabels = labels;
            }}
            onReorder={(labels: ActiveLabel[]) => {
                sessionStore.activeLabels = labels;
            }}
        />

        <Separator class="mb-2" />

        <LoadLabelFile
            {canvas}
            activeLabels={sessionStore.activeLabels}
            enabled={sessionStore.labelsEnabled}
        />
        <SaveLabelFile
            {canvas}
            activeLabels={sessionStore.activeLabels}
            enabled={sessionStore.labelsEnabled}
        />
    </div>
</Card>
