<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import { dndzone } from 'svelte-dnd-action';
import type { DndEvent } from 'svelte-dnd-action';

import type { ActiveLabel } from '$lib/types/label';
import { Input } from '$lib/components/ui/input';

import EyeIcon from 'phosphor-svelte/lib/EyeIcon';
import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon';

interface Props {
    activeLabels: ActiveLabel[];

    onLabelsChanged: (labels: ActiveLabel[]) => void;
    onReorder: (labels: ActiveLabel[]) => void;
}

let { activeLabels, onLabelsChanged, onReorder}: Props = $props();

let editingLabelId = $state<number | null>(null);
let editingName = $state('');

function beginRename(label: ActiveLabel): void {
    editingLabelId = label.id;
    editingName = label.name;
}

function finishRename(): void {
    if (editingLabelId === null) {
        return;
    }

    const label = activeLabels.find((item) => item.id === editingLabelId);

    if (label) {
        label.name = editingName.trim() || label.name;
    }

    editingLabelId = null;
}

function cancelRename(): void {
    editingLabelId = null;
}

function handleLabelReorder(event: CustomEvent<DndEvent<ActiveLabel>>): void {
    onReorder(event.detail.items);
}

function removeLabel(id: number): void {
    const newLabels = activeLabels.filter((label) => label.id !== id);

    onLabelsChanged(newLabels);
}

function toggleVisibility(id: number): void {
    const label = activeLabels.find((item) => item.id === id);

    if (!label) {
        return;
    }

    label.visible = !label.visible;
}

function selectLabel(id: number): void {
    for (const label of activeLabels) {
        label.selected = label.id === id;
    }
}
</script>

<div
    class="space-y-4"
    use:dndzone={{
        items: activeLabels,
        flipDurationMs: 200,
        dropTargetStyle: {},
    }}
    onconsider={handleLabelReorder}
    onfinalize={handleLabelReorder}
>
    {#each activeLabels as label (label.id)}
        <Card
            class="
                p-3
                my-2
                transition-colors
                cursor-pointer
                hover:bg-primary/10
                {label.visible ? '' : 'opacity-50'}
                {label.selected ? 'ring-2 bg-primary/10 ring-primary/40' : ''}
            "
            onclick={() => {
                selectLabel(label.id);
            }}
        >
            <div class="flex items-center gap-3">
                <span
                    class="
            cursor-grab
            select-none
            text-muted-foreground
        "
                >
                    ☰
                </span>

                <div
                    class="
            h-3
            w-5
            border
            border-border
            shrink-0
        "
                    style:background-color={label.color}
                ></div>

                {#if editingLabelId === label.id}
                    <Input
                        bind:value={editingName}
                        class="flex-1"
                        autofocus
                        onclick={(event: MouseEvent) => {
                            event.stopPropagation();
                        }}
                        onblur={finishRename}
                        onkeydown={(event: KeyboardEvent) => {
                            event.stopPropagation();

                            if (event.key === 'Enter') {
                                finishRename();
                            }

                            if (event.key === 'Escape') {
                                cancelRename();
                            }
                        }}
                    />
                {:else}
                    <button
                        type="button"
                        class="
                flex-1
                text-left
                font-medium
                bg-transparent
                border-none
                p-0
                cursor-text
            "
                        ondblclick={(event: MouseEvent) => {
                            event.stopPropagation();
                            beginRename(label);
                        }}
                    >
                        {label.name}
                    </button>
                {/if}

                <div class="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="outline"
                        onclick={(event: MouseEvent) => {
                            event.stopPropagation();
                            toggleVisibility(label.id);
                        }}
                    >
                        {#if label.visible}
                            <EyeIcon weight="bold" />
                        {:else}
                            <EyeSlashIcon weight="bold" />
                        {/if}
                    </Button>

                    <Button
                        size="icon"
                        variant="destructive"
                        onclick={(event: MouseEvent) => {
                            event.stopPropagation();
                            removeLabel(label.id);
                        }}
                    >
                        ×
                    </Button>
                </div>
            </div>
        </Card>
    {/each}
</div>
