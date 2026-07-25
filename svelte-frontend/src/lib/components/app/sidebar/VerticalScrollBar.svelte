<!-- svelte-frontend/src/lib/components/app/sidebar/VerticalScrollBar.svelte -->
<script lang="ts">
interface Props {
    viewportId: string;
    viewportSize: number;
    contentSize: number;
    position: number;
    onChange: (value: number) => void;
}

let { viewportId, viewportSize, contentSize, position, onChange }: Props =
    $props();

let track: HTMLDivElement;

let dragging = $state(false);
let visible = $state(false);

let startY = 0;
let startPosition = 0;

let hideTimer: ReturnType<typeof setTimeout>;

const maxPosition = $derived(Math.max(0, contentSize - viewportSize));

const thumbHeight = $derived(
    contentSize <= 0
        ? 100
        : Math.max(20, Math.min(100, (viewportSize / contentSize) * 100)),
);

const thumbPosition = $derived(
    maxPosition === 0 ? 0 : (position / maxPosition) * (100 - thumbHeight),
);

const thumbClass = $derived(
    dragging ? 'bg-primary' : 'bg-primary/40 hover:bg-primary/70',
);

export function showScrollbar() {
    visible = true;

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {
        if (!dragging) {
            visible = false;
        }
    }, 800);
}

function pointerDown(event: PointerEvent) {
    showScrollbar();

    const rect = track.getBoundingClientRect();

    const clickY = event.clientY - rect.top;

    const thumbStart = (thumbPosition / 100) * rect.height;

    const thumbEnd = thumbStart + (thumbHeight / 100) * rect.height;

    if (clickY >= thumbStart && clickY <= thumbEnd) {
        dragging = true;

        startY = event.clientY;
        startPosition = position;

        track.setPointerCapture(event.pointerId);

        return;
    }

    jumpToPosition(event);
}

function moveDrag(event: PointerEvent) {
    showScrollbar();

    if (!dragging) return;

    const rect = track.getBoundingClientRect();

    const usableHeight = rect.height * (1 - thumbHeight / 100);

    const delta = event.clientY - startY;

    const value = startPosition + (delta / usableHeight) * maxPosition;

    onChange(Math.max(0, Math.min(maxPosition, value)));
}

function endDrag(event: PointerEvent) {
    dragging = false;

    showScrollbar();

    if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
    }
}

function jumpToPosition(event: PointerEvent) {
    showScrollbar();

    const rect = track.getBoundingClientRect();

    const click = event.clientY - rect.top;

    const ratio = click / rect.height;

    onChange(Math.max(0, Math.min(maxPosition, ratio * maxPosition)));
}
</script>

<div
    bind:this={track}
    role="scrollbar"
    aria-controls={viewportId}
    aria-orientation="vertical"
    aria-valuemin="0"
    aria-valuemax={maxPosition}
    aria-valuenow={position}
    tabindex="0"
    class="
        absolute
        top-1
        right-0
        bottom-1
        w-2
        cursor-pointer
        select-none
        z-50
        transition-opacity
        duration-500
    "
    style="
        opacity: {visible ? 1 : 0};
        pointer-events: {visible ? 'auto' : 'none'};
    "
    onpointerdown={pointerDown}
    onpointermove={moveDrag}
    onpointerup={endDrag}
    onpointercancel={endDrag}
>
    <div
        class={[
            'absolute',
            'right-0',
            'w-1',
            'rounded-full',
            'pointer-events-none',
            thumbClass,
        ].join(' ')}
        style="
            height: {thumbHeight}%;
            top: {thumbPosition}%;
        "
    ></div>
</div>
