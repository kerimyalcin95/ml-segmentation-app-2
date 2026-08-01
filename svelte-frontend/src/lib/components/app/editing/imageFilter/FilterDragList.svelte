<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import { dndzone } from 'svelte-dnd-action';
import type { DndEvent } from 'svelte-dnd-action';

import { type ActiveFilter, FilterType } from '$lib/types/filter';

interface Props {
    activeFilters: ActiveFilter[];
    selectedFilterId: number | null;

    onSelectFilter: (id: number | null) => void;
    onFiltersChanged: (filters: ActiveFilter[]) => void;
    onReorder: (filters: ActiveFilter[]) => void;
}

let {
    activeFilters,
    selectedFilterId,
    onSelectFilter,
    onFiltersChanged,
    onReorder,
}: Props = $props();

function handleFilterReorder(event: CustomEvent<DndEvent<ActiveFilter>>): void {
    onReorder(event.detail.items);
}

function removeFilter(id: number) {
    const newFilters = activeFilters.filter((filter) => filter.id !== id);

    onFiltersChanged(newFilters);

    if (selectedFilterId === id) {
        onSelectFilter(null);
    }
}
</script>

<div
    class="space-y-4"
    use:dndzone={{
        items: activeFilters,
        flipDurationMs: 200,
        dropTargetStyle: {},
    }}
    onconsider={handleFilterReorder}
    onfinalize={handleFilterReorder}
>
    {#each activeFilters as filter (filter.id)}
        <Card
            class="
            p-3
            my-2
            cursor-pointer
            transition-colors
            hover:bg-accent
            {selectedFilterId === filter.id ? 'bg-accent' : ''}
            "
            onclick={() => {
                onSelectFilter(
                    selectedFilterId === filter.id ? null : filter.id,
                );
            }}
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="cursor-grab select-none text-muted-foreground">
                        ☰
                    </span>

                    <span class="font-medium">
                        {FilterType[filter.type]}
                    </span>
                </div>

                <Button
                    size="icon"
                    variant="destructive"
                    onclick={(event: MouseEvent) => {
                        event.stopPropagation();
                        removeFilter(filter.id);
                    }}
                >
                    ×
                </Button>
            </div>
        </Card>
    {/each}
</div>
