<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import * as ToggleGroup from '$lib/components/ui/toggle-group';

import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpenIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import path from 'node:path';

let modelMode = $state<'new' | 'existing'>(
    sessionStore.training.trainExistingModel ? 'existing' : 'new',
);

let lastMode: 'new' | 'existing' = 'new';

function onValueChange(value: string) {
    if (value === '') {
        modelMode = lastMode;
        return;
    }

    if (value !== 'new' && value !== 'existing') {
        return;
    }

    lastMode = value;
    modelMode = value;
    sessionStore.training.trainExistingModel = value === 'existing';
}

async function selectModelPath(): Promise<void> {
    if (modelMode === 'new') {
        const path = await window.electronAPI.showOpenDirectoryDialog(
            sessionStore.training.modelPath,
        );

        if (path !== null) {
            sessionStore.training.modelPath = path;
        }

        return;
    }

    const path = await window.electronAPI.showOpenModelDialog(
        sessionStore.training.modelPath,
    );

    if (path !== null) {
        sessionStore.training.modelPath = path;
    }
}

function onModelFileInput(
    event: Event & {
        currentTarget: EventTarget & HTMLInputElement;
    },
): void {
    const value = event.currentTarget.value;

    sessionStore.training.modelPath = path.join(
        sessionStore.training.modelPath,
        value,
    );
}

$effect(() => {
    sessionStore.training.trainExistingModel = modelMode === 'existing';
});
</script>

<div class="flex flex-col gap-3">
    {#if modelMode === 'new'}
        <div class="flex flex-col gap-1">
            <Label for="training-model-path">Model Path</Label>

            <div class="flex items-center gap-2">
                <Input
                    id="training-model-path"
                    class="flex-1"
                    bind:value={sessionStore.training.modelPath}
                    placeholder="./model/"
                    disabled={sessionStore.training.running}
                />

                <Button
                    size="icon"
                    disabled={sessionStore.training.running}
                    onclick={selectModelPath}
                >
                    <FolderOpenIcon weight="bold" />
                </Button>
            </div>
        </div>

        <div class="flex flex-col gap-1">
            <Label for="training-model-name">Model Name</Label>

            <Input
                id="training-model-name"
                bind:value={sessionStore.training.modelName}
                placeholder="resnet34_224x224.pkl"
                disabled={sessionStore.training.running}
            />
        </div>
    {:else}
        <div class="flex flex-col gap-1">
            <Label for="training-model-file">Model File</Label>

            <div class="flex items-center gap-2">
                <Input
                    id="training-model-file"
                    class="flex-1"
                    bind:value={sessionStore.training.modelPath}
                    oninput={onModelFileInput}
                    placeholder="./model/resnet34_224x224.pkl"
                    disabled={sessionStore.training.running}
                />

                <Button
                    size="icon"
                    disabled={sessionStore.training.running}
                    onclick={selectModelPath}
                >
                    <FolderOpenIcon weight="bold" />
                </Button>
            </div>
        </div>
    {/if}

    <ToggleGroup.Root
        type="single"
        bind:value={modelMode}
        {onValueChange}
        disabled={sessionStore.training.running}
        class="w-full mt-2 ring-1 ring-primary/50"
    >
        <ToggleGroup.Item
            value="new"
            class="
            flex-1
            relative
            pt-0.5
            data-[state=on]:bg-primary/10
            data-[state=on]:ring-1
            data-[state=on]:ring-primary/70
            data-[state=on]:ring-offset-0
            data-[state=on]:z-11
            data-[state=off]:hover:bg-primary/10
            data-[state=off]:text-foreground/50
        "
        >
            New Model
        </ToggleGroup.Item>

        <ToggleGroup.Item
            value="existing"
            class="
            flex-1
            relative
            pt-0.5
            data-[state=on]:bg-primary/10
            data-[state=on]:ring-1
            data-[state=on]:ring-primary/70
            data-[state=on]:ring-offset-0
            data-[state=on]:z-10
            data-[state=off]:hover:bg-primary/10
            data-[state=off]:text-foreground/50
        "
        >
            Existing Model
        </ToggleGroup.Item>
    </ToggleGroup.Root>
</div>
