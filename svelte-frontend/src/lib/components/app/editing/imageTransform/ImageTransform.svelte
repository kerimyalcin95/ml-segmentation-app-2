<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';

import { CanvasManager } from '$lib/canvas/canvas';

import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon';
import FlipHorizontalIcon from 'phosphor-svelte/lib/FlipHorizontalIcon';
import FlipVerticalIcon from 'phosphor-svelte/lib/FlipVerticalIcon';

interface Props {
    canvas: CanvasManager;
}

let { canvas }: Props = $props();

function rotate(angle: number) {
    canvas.rotate(angle);
}

function flip(horizontal: boolean, vertical: boolean) {
    canvas.flip(horizontal, vertical);
}
</script>

<Card class="h-min flex flex-col gap-4 py-4">
    <div class="flex flex-col gap-2 mx-4">
        <span class="text-sm font-medium mb-2"> Transform </span>
        <div class="flex flex-row gap-2 justify-center">
            <Button
                size="icon"
                title="Rotate 90°"
                onclick={() => rotate(90)}
            >
                <ArrowClockwiseIcon size={24} weight="bold" />
            </Button>

            <Button
                size="icon"
                title="Flip Horizontal"
                onclick={() => flip(true, false)}
            >
                <FlipHorizontalIcon size={20} weight="bold" />
            </Button>

            <Button
                size="icon"
                title="Flip Vertical"
                onclick={() => flip(false, true)}
            >
                <FlipVerticalIcon size={20} weight="bold" />
            </Button>
        </div>
    </div></Card
>
