<script lang="ts">
import { Card } from '$lib/components/ui/card';
import Separator from '$lib/components/ui/separator/separator.svelte';

import PredictionFileControl from './PredictionFileControl.svelte';
import PredictionStartStop from './PredictionStartStop.svelte';
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2">
            Prediction
        </span>

        <PredictionFileControl />

        <Separator class="my-2" />

        <PredictionStartStop />
    </div>
</Card>