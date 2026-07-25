<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';

interface Props {
    width: number;
    height: number;
    onclick: () => void;
}

let {
    width = $bindable(),
    height = $bindable(),
    onclick,
}: Props = $props();
</script>


<div class="flex flex-col gap-2">
    <div class="flex gap-2">
        <Input
            type="number"
            placeholder="Width"
            bind:value={width}
        />

        <Input
            type="number"
            placeholder="Height"
            bind:value={height}
        />
    </div>

    <Button onclick={onclick}>
        Resize
    </Button>
</div>