<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

import { CanvasManager } from '$lib/canvas/canvas';

import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon';
import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
import FlipHorizontalIcon from 'phosphor-svelte/lib/FlipHorizontalIcon';
import FlipVerticalIcon from 'phosphor-svelte/lib/FlipVerticalIcon';
import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Transform </span>
        <div class="flex flex-col gap-2 items-center">
            <Button
                class="w-full"
                onclick={() => {
                    canvas.document.rotate90();
                }}
                disabled={(!sessionStore.hasImage && !sessionStore.hasLabelImage)}
            >
                <ArrowClockwiseIcon weight="bold" />
                Rotate CW
            </Button>
            <Button
                class="w-full mb-2"
                onclick={() => {
                    canvas.document.rotate90(false);
                }}
                disabled={(!sessionStore.hasImage && !sessionStore.hasLabelImage)}
            >
                <ArrowCounterClockwiseIcon weight="bold" />
                Rotate CCW
            </Button>

            <Button
                class="w-full"
                onclick={() => {
                    canvas.document.flip(true, false);
                }}
                disabled={(!sessionStore.hasImage && !sessionStore.hasLabelImage)}
            >
                <FlipHorizontalIcon weight="bold" />
                Flip Horizontal
            </Button>

            <Button
                class="w-full"
                onclick={() => {
                    canvas.document.flip(false, true);
                }}
                disabled={(!sessionStore.hasImage && !sessionStore.hasLabelImage)}
            >
                <FlipVerticalIcon weight="bold" />
                Flip Vertical
            </Button>
        </div>
    </div></Card
>
