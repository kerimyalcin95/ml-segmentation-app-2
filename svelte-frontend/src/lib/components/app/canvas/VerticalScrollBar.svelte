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

let startY = 0;
let startPosition = 0;


const maxPosition = $derived(
    Math.max(
        0,
        contentSize - viewportSize
    )
);


const thumbHeight = $derived(
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
          (100 - thumbHeight)
);


const thumbClass = $derived(
    dragging
        ? 'bg-primary'
        : 'bg-primary/40 hover:bg-primary/70'
);


function pointerDown(event: PointerEvent) {
    const rect =
        track.getBoundingClientRect();


    const clickY =
        event.clientY - rect.top;


    const thumbStart =
        (thumbPosition / 100) *
        rect.height;


    const thumbEnd =
        thumbStart +
        (thumbHeight / 100) *
        rect.height;


    if (
        clickY >= thumbStart &&
        clickY <= thumbEnd
    ) {
        dragging = true;

        startY = event.clientY;
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


    const usableHeight =
        rect.height *
        (1 - thumbHeight / 100);


    const delta =
        event.clientY - startY;


    const value =
        startPosition +
        (delta / usableHeight) *
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
        event.clientY - rect.top;


    const ratio =
        click / rect.height;


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


    if (event.key === 'ArrowDown') {
        onChange(
            Math.min(
                maxPosition,
                position + step
            )
        );
    }


    if (event.key === 'ArrowUp') {
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
    aria-orientation="vertical"
    aria-valuemin="0"
    aria-valuemax={maxPosition}
    aria-valuenow={position}
    tabindex="0"
    class="
        absolute
        top-0
        right-0
        bottom-3
        w-3
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
            'left-0',
            'w-full',
            'pointer-events-none',
            thumbClass,
        ].join(' ')}
        style="
            height: {thumbHeight}%;
            top: {thumbPosition}%;
        "
    ></div>
</div>