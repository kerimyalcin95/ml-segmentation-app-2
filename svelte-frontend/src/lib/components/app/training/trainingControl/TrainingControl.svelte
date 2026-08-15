<script lang="ts">
import { Card } from '$lib/components/ui/card';
import Separator from '$lib/components/ui/separator/separator.svelte';

import TrainingParameters from './TrainingParameters.svelte';
import TrainingStartStop from './TrainingStartStop.svelte';
import ModelControl from './ModelControl.svelte';
import LabelControl from './LabelControl.svelte';
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2">
            Training
        </span>

        <LabelControl />

        <Separator class="my-2" />

        <TrainingParameters />

        <Separator class="my-2" />

        <ModelControl />

        <Separator class="my-2" />

        <TrainingStartStop />
    </div>
</Card>