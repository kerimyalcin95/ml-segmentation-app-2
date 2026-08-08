<script lang="ts">
import { Button } from '$lib/components/ui/button';
import * as Select from '$lib/components/ui/select';

import PlusIcon from 'phosphor-svelte/lib/PlusIcon';

import type { ActiveLabel } from '$lib/types/label';
import { LABEL_COLORS, type LabelColor } from '$lib/types/labelColors';

interface Props {
    activeLabels: ActiveLabel[];
    disabled: boolean;
}

let { activeLabels, disabled = false }: Props = $props();

let selectedColor = $state('');

function addLabel(): void {
    const color: LabelColor | undefined = LABEL_COLORS.find(
        (item) => item.name === selectedColor,
    );

    if (activeLabels.some((label) => label.color === color?.color)) {
        return;
    }

    if (!color) {
        return;
    }

    for (const label of activeLabels) {
        label.selected = false;
    }

    activeLabels.push({
        id: Date.now(),
        name: 'Label ' + String(activeLabels.length + 1),
        color: color.color,
        visible: true,
        selected: true,
    });

    selectedColor = '';
}
</script>

<div class="space-y-2">
    <div class="flex gap-2">
        <Select.Root
            {disabled}
            type="single"
            bind:value={selectedColor}
        >
            <Select.Trigger class="flex-1">
                {selectedColor || 'Select label color'}
            </Select.Trigger>

            <Select.Content class="max-h-50">
                {#each LABEL_COLORS.filter((color) => !activeLabels.some((label) => label.color === color.color)) as color (color.name)}
                    <Select.Item value={color.name}>
                        <div class="flex items-center gap-2">
                            <div
                                class="
                                    w-5
                                    h-3
                                    border
                                    border-border
                                    shrink-0
                                "
                                style:background-color={color.color}
                            ></div>

                            <span>{color.name}</span>
                        </div>
                    </Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Button size="icon" onclick={addLabel} {disabled}>
            <PlusIcon weight="bold" />
        </Button>
    </div>
</div>
