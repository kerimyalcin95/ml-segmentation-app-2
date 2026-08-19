<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';

import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpenIcon';

import { sessionStore } from '$lib/components/stores/sessionStore.svelte';
import * as localStorage from '$lib/utils/localStorage';

async function selectImagePath(): Promise<void> {
    const path =
        await window.electronAPI.showOpenImageDialog(
            sessionStore.prediction.imagePath,
        );

    if (path !== null) {
        sessionStore.prediction.imagePath = path;
        await localStorage.save();
    }
}

async function selectModelPath(): Promise<void> {
    const path =
        await window.electronAPI.showOpenModelDialog(
            sessionStore.prediction.modelPath
        );

    if (path !== null) {
        sessionStore.prediction.modelPath = path;
        await localStorage.save();
    }
}

async function selectLabelImagePath(): Promise<void> {
    const result =
        await window.electronAPI.showSaveLabelImageDialog(
            sessionStore.prediction.labelImagePath,
        );

    if (result !== null) {
        sessionStore.prediction.labelImagePath =
            result.filePath;

        await localStorage.save();
    }
}
</script>

<div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
        <Label for="prediction-image-path">
            Image File
        </Label>

        <div class="flex items-center gap-2">
            <Input
                id="prediction-image-path"
                class="flex-1"
                bind:value={sessionStore.prediction.imagePath}
                placeholder="./image.png"
                disabled={sessionStore.prediction.running}
            />

            <Button
                size="icon"
                disabled={sessionStore.prediction.running}
                onclick={selectImagePath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>

    <div class="flex flex-col gap-1">
        <Label for="prediction-label-image-path">
            Label Image File
        </Label>

        <div class="flex items-center gap-2">
            <Input
                id="prediction-label-image-path"
                class="flex-1"
                bind:value={
                    sessionStore.prediction.labelImagePath
                }
                placeholder="./label-image.png"
                disabled={sessionStore.prediction.running}
                readonly
            />

            <Button
                size="icon"
                disabled={sessionStore.prediction.running}
                onclick={selectLabelImagePath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>

    <div class="flex flex-col gap-1">
        <Label for="prediction-model-path">
            Model File
        </Label>

        <div class="flex items-center gap-2">
            <Input
                id="prediction-model-path"
                class="flex-1"
                bind:value={sessionStore.prediction.modelPath}
                placeholder="./model/model.pkl"
                disabled={sessionStore.prediction.running}
                readonly
            />

            <Button
                size="icon"
                disabled={sessionStore.prediction.running}
                onclick={selectModelPath}
            >
                <FolderOpenIcon weight="bold" />
            </Button>
        </div>
    </div>
</div>