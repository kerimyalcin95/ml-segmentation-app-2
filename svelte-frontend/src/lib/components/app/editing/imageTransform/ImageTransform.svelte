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
        <div class="flex flex-col gap-2 items-center">
            <Button
                class="w-full justify-center gap-2 mb-2 pr-4"
                onclick={() => rotate(90)}
            >
                <ArrowClockwiseIcon size={18} />
                Rotate
            </Button>

            <Button
                class="w-full justify-center gap-2 pr-4"
                onclick={() => flip(true, false)}
            >
                <FlipHorizontalIcon size={18} />
                Flip Horizontal
            </Button>

            <Button
                class="w-full justify-center gap-2 pr-4"
                onclick={() => flip(false, true)}
            >
                <FlipVerticalIcon size={18} />
                Flip Vertical
            </Button>
        </div>
    </div></Card
>
