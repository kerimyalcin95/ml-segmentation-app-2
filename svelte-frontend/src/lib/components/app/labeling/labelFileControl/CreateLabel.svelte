<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as AlertDialog from '$lib/components/ui/alert-dialog';

    import PlusCircleIcon from 'phosphor-svelte/lib/PlusCircleIcon';

    import { CanvasManager } from '$lib/canvas/canvas';

    interface Props {
        canvas: CanvasManager;
    }

    let { canvas }: Props = $props();

    let open = $state(false);

    function createLabel(): void {
        if (!canvas.document.hasLabelImage()) {
            canvas.document.createLabel();
            return;
        }

        open = true;
    }

    function confirmCreateLabel(): void {
        canvas.document.createLabel();
        open = false;
    }
</script>

<Button onclick={createLabel}>
    <PlusCircleIcon weight="bold" />
    Create Label Image
</Button>

<AlertDialog.Root bind:open>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                Replace Label Image?
            </AlertDialog.Title>

            <AlertDialog.Description>
                A label image already exists.
                <br /><br />
                Creating a new label image will permanently delete the current label image.
                This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>

        <AlertDialog.Footer>
            <AlertDialog.Cancel>
                Cancel
            </AlertDialog.Cancel>

            <AlertDialog.Action
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onclick={confirmCreateLabel}
            >
                Replace
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>