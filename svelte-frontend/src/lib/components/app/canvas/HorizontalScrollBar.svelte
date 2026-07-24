<!-- svelte-frontend/src/lib/components/app/canvas/HorizontalScrollBar.svelte -->
<script lang="ts">
interface Props {
    viewportId: string;
    viewportSize: number;
    contentSize: number;
    position: number;
    onChange: (value: number) => void;
}

let {
    viewportId,
    viewportSize,
    contentSize,
    position,
    onChange,
}: Props = $props();


let track: HTMLDivElement;

let dragging = $state(false);

let startX = 0;
let startPosition = 0;


const maxPosition = $derived(
    Math.max(
        0,
        contentSize - viewportSize
    )
);


const thumbWidth = $derived(
    Math.max(
        20,
        Math.min(
            100,
            (viewportSize / contentSize) * 100
        )
    )
);


const thumbPosition = $derived(
    maxPosition === 0
        ? 0
        : (position / maxPosition) *
          (100 - thumbWidth)
);


const thumbClass = $derived(
    dragging
        ? 'bg-primary'
        : 'bg-primary/40 hover:bg-primary/70'
);


function pointerDown(event: PointerEvent) {
    const rect =
        track.getBoundingClientRect();


    const clickX =
        event.clientX - rect.left;


    const thumbStart =
        (thumbPosition / 100) *
        rect.width;


    const thumbEnd =
        thumbStart +
        (thumbWidth / 100) *
        rect.width;


    if (
        clickX >= thumbStart &&
        clickX <= thumbEnd
    ) {
        dragging = true;

        startX = event.clientX;
        startPosition = position;

        track.setPointerCapture(
            event.pointerId
        );

        return;
    }


    jumpToPosition(event);
}


function moveDrag(event: PointerEvent) {
    if (!dragging) return;


    const rect =
        track.getBoundingClientRect();


    const usableWidth =
        rect.width *
        (1 - thumbWidth / 100);


    const delta =
        event.clientX - startX;


    const value =
        startPosition +
        (delta / usableWidth) *
        maxPosition;


    onChange(
        Math.max(
            0,
            Math.min(
                maxPosition,
                value
            )
        )
    );
}


function endDrag(event: PointerEvent) {
    dragging = false;


    if (
        track.hasPointerCapture(
            event.pointerId
        )
    ) {
        track.releasePointerCapture(
            event.pointerId
        );
    }
}


function jumpToPosition(event: PointerEvent) {
    const rect =
        track.getBoundingClientRect();


    const click =
        event.clientX - rect.left;


    const ratio =
        click / rect.width;


    onChange(
        Math.max(
            0,
            Math.min(
                maxPosition,
                ratio * maxPosition
            )
        )
    );
}


function handleKey(event: KeyboardEvent) {
    const step = 50;


    if (event.key === 'ArrowRight') {
        onChange(
            Math.min(
                maxPosition,
                position + step
            )
        );
    }


    if (event.key === 'ArrowLeft') {
        onChange(
            Math.max(
                0,
                position - step
            )
        );
    }


    if (event.key === 'Home') {
        onChange(0);
    }


    if (event.key === 'End') {
        onChange(maxPosition);
    }
}
</script>


<div
    bind:this={track}
    role="scrollbar"
    aria-controls={viewportId}
    aria-orientation="horizontal"
    aria-valuemin="0"
    aria-valuemax={maxPosition}
    aria-valuenow={position}
    tabindex="0"
    class="
        absolute
        bottom-0
        left-0
        right-3
        h-3
        bg-foreground/20
        cursor-pointer
        select-none
    "
    onpointerdown={pointerDown}
    onpointermove={moveDrag}
    onpointerup={endDrag}
    onpointercancel={endDrag}
    onkeydown={handleKey}
>
    <div
        class={[
            'absolute',
            'top-0',
            'h-full',
            'pointer-events-none',
            thumbClass,
        ].join(' ')}
        style="
            width: {thumbWidth}%;
            left: {thumbPosition}%;
        "
    ></div>
</div>