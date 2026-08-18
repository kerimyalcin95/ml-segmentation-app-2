<script lang="ts">
import * as AlertDialog from '$lib/components/ui/alert-dialog';

interface Props {
    open: boolean;

    title: string;
    message: string;

    actionText?: string;
    cancelText?: string;

    destructive?: boolean;

    onAction: () => void;
}

let {
    open = $bindable(),

    title,
    message,

    actionText = 'OK',
    cancelText = 'Cancel',

    destructive = false,

    onAction,
}: Props = $props();
</script>

<AlertDialog.Root bind:open>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                {title}
            </AlertDialog.Title>

            <AlertDialog.Description
                class="max-h-[60vh] min-w-0 max-w-full overflow-y-auto whitespace-pre-line pr-2 [overflow-wrap:anywhere]"
            >
                {message}
            </AlertDialog.Description>
        </AlertDialog.Header>

        <AlertDialog.Footer>
            <AlertDialog.Cancel>
                {cancelText}
            </AlertDialog.Cancel>

            <AlertDialog.Action
                class={destructive
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : ''}
                onclick={onAction}
            >
                {actionText}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
