<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { CanvasManager } from '$lib/canvas/canvas';
    import { sessionStore } from '$lib/components/stores/sessionStore.svelte';

    import MessageDialog from '$lib/components/app/dialog/MessageDialog.svelte';

    import ImageSquareIcon from 'phosphor-svelte/lib/ImageSquareIcon';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();

    let messageDialogOpen = $state(false);
    let messageDialogTitle = $state('');
    let messageDialogMessage = $state('');

    function showError(
        title: string,
        message: string,
    ): void {
        messageDialogTitle = title;
        messageDialogMessage = message;
        messageDialogOpen = true;
    }

    async function loadLabel(): Promise<void> {
        try {
            const filePath =
                await window.electronAPI.showOpenLabelImageDialog(
                    sessionStore.labeling.labelImageLoadDirectory,
                );

            if (!filePath) {
                return;
            }

            const imageBytes =
                await window.electronAPI.readLabelImage(
                    filePath,
                );

            if (!sessionStore.hasLabelImage) {
                canvas.document.labelImage.new();
            }

            await canvas.document.loadLabelImage(
                imageBytes,
            );

            sessionStore.labeling.labelImageLoadDirectory =
                filePath;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to load label image.';

            console.error(
                'Failed to load label image:',
                error,
            );

            showError(
                'Load Label Image',
                message,
            );

            canvas.document.labelImage.delete();
        }
    }
</script>

<Button onclick={loadLabel}>
    <ImageSquareIcon weight="bold" />
    Load Label Image
</Button>

<MessageDialog
    bind:open={messageDialogOpen}
    title={messageDialogTitle}
    message={messageDialogMessage}
/>
