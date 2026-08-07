<script lang="ts">
import * as AlertDialog from '$lib/components/ui/alert-dialog';

interface Props {
    open: boolean;
    title: string;
    message: string;
    buttonText?: string;
}

let { open = $bindable(), title, message, buttonText = 'OK' }: Props = $props();
</script>

<AlertDialog.Root bind:open>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>
                {title}
            </AlertDialog.Title>

            <AlertDialog.Description class="whitespace-pre-line">
                {message}
            </AlertDialog.Description>
        </AlertDialog.Header>

        <AlertDialog.Footer>
            <AlertDialog.Action
                onclick={() => {
                    open = false;
                }}
            >
                {buttonText}
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
