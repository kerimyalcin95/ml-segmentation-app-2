<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpenIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import * as localStorage from '$lib/utils/localStorage';

async function selectImagePath(): Promise<void> {
    const path = await window.electronAPI.showOpenDirectoryDialog(
        sessionStore.training.imagePath,
    );

    if (path !== null) {
        sessionStore.training.imagePath = path;
        await localStorage.save();
    }
}

async function selectLabelImagePath(): Promise<void> {
    const path = await window.electronAPI.showOpenDirectoryDialog(
        sessionStore.training.labelImagePath,
    );

    if (path !== null) {
        sessionStore.training.labelImagePath = path;
        await localStorage.save();
    }
}

async function selectLabelPath(): Promise<void> {
    const path = await window.electronAPI.showOpenLabelDialog(
        sessionStore.training.labelPath
    );

    if (path !== null) {
        sessionStore.training.labelPath = path;
        await localStorage.save();
    }
}
</script>

<div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
        <Label for="training-image-path">Image Path</Label>

        <div class="flex items-center gap-2">
            <Input
                id="training-image-path"
                class="flex-1"
                bind:value={sessionStore.training.imagePath}
                placeholder="./image/"
                disabled={sessionStore.training.running}
            />

            <Button
                size="icon"
                disabled={sessionStore.training.running}
                onclick={selectImagePath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>
    <div class="flex flex-col gap-1">
        <Label for="training-label-image-path">Label Image Path</Label>

        <div class="flex items-center gap-2">
            <Input
                id="training-label-image-path"
                class="flex-1"
                bind:value={sessionStore.training.labelImagePath}
                placeholder="./label/"
                disabled={sessionStore.training.running}
            />

            <Button
                size="icon"
                disabled={sessionStore.training.running}
                onclick={selectLabelImagePath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>
    <div class="flex flex-col gap-1">
        <Label for="training-label-path">Label File</Label>

        <div class="flex items-center gap-2">
            <Input
                id="training-label-path"
                class="flex-1"
                bind:value={sessionStore.training.labelPath}
                placeholder="./labels.json"
                disabled={sessionStore.training.running}
            />

            <Button
                size="icon"
                disabled={sessionStore.training.running}
                onclick={selectLabelPath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>
</div>
