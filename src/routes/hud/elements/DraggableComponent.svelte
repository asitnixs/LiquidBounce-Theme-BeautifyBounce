<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { type Alignment, HorizontalAlignment, VerticalAlignment } from "../../../integration/types";

    export let alignment: Alignment;
    export let editMode = false;
    export let zoom = 100;

    const dispatch = createEventDispatcher();

    let currentOffsetX = alignment.horizontalOffset;
    let currentOffsetY = alignment.verticalOffset;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    let containerWidth = 0;
    let containerHeight = 0;

    let snapFractionX: number | null = null;
    let snapFractionY: number | null = null;

    const SNAP_THRESHOLD = 5;

    $: if (!dragging && !editMode) {
        currentOffsetX = alignment.horizontalOffset;
        currentOffsetY = alignment.verticalOffset;
    }

    $: styleString = generateStyleString({
        ...alignment,
        horizontalOffset: currentOffsetX,
        verticalOffset: currentOffsetY
    });

    function generateStyleString(align: Alignment): string {
        let style = "position: fixed;";

        switch (align.horizontalAlignment) {
            case HorizontalAlignment.LEFT: style += `left: ${align.horizontalOffset}px;`; break;
            case HorizontalAlignment.RIGHT: style += `right: ${align.horizontalOffset}px;`; break;
            case HorizontalAlignment.CENTER:
            case HorizontalAlignment.CENTER_TRANSLATED: style += `left: calc(50% + ${align.horizontalOffset}px);`; break;
        }

        switch (align.verticalAlignment) {
            case VerticalAlignment.TOP: style += `top: ${align.verticalOffset}px;`; break;
            case VerticalAlignment.BOTTOM: style += `bottom: ${align.verticalOffset}px;`; break;
            case VerticalAlignment.CENTER:
            case VerticalAlignment.CENTER_TRANSLATED: style += `top: calc(50% + ${align.verticalOffset}px);`; break;
        }

        style += "transform: translate(";
        style += align.horizontalAlignment === HorizontalAlignment.CENTER_TRANSLATED ? "-50%," : "0,";
        style += align.verticalAlignment === VerticalAlignment.CENTER_TRANSLATED ? "-50%);" : "0);";

        return style;
    }

    function getBaseAbsoluteCenter(align: Alignment, offX: number, offY: number) {
        const sw = window.innerWidth / (zoom / 100);
        const sh = window.innerHeight / (zoom / 100);
        let cx = 0; let cy = 0;

        switch (align.horizontalAlignment) {
            case HorizontalAlignment.LEFT: cx = offX + containerWidth / 2; break;
            case HorizontalAlignment.RIGHT: cx = sw - offX - containerWidth / 2; break;
            case HorizontalAlignment.CENTER: cx = (sw / 2) + offX + containerWidth / 2; break;
            case HorizontalAlignment.CENTER_TRANSLATED: cx = (sw / 2) + offX; break;
        }

        switch (align.verticalAlignment) {
            case VerticalAlignment.TOP: cy = offY + containerHeight / 2; break;
            case VerticalAlignment.BOTTOM: cy = sh - offY - containerHeight / 2; break;
            case VerticalAlignment.CENTER: cy = (sh / 2) + offY + containerHeight / 2; break;
            case VerticalAlignment.CENTER_TRANSLATED: cy = (sh / 2) + offY; break;
        }

        return { cx, cy };
    }

    function setOffsetFromAbsoluteCenter(align: Alignment, cx: number, cy: number) {
        const sw = window.innerWidth / (zoom / 100);
        const sh = window.innerHeight / (zoom / 100);
        let offX = 0; let offY = 0;

        switch (align.horizontalAlignment) {
            case HorizontalAlignment.LEFT: offX = cx - containerWidth / 2; break;
            case HorizontalAlignment.RIGHT: offX = sw - cx - containerWidth / 2; break;
            case HorizontalAlignment.CENTER: offX = cx - (sw / 2) - containerWidth / 2; break;
            case HorizontalAlignment.CENTER_TRANSLATED: offX = cx - (sw / 2); break;
        }

        switch (align.verticalAlignment) {
            case VerticalAlignment.TOP: offY = cy - containerHeight / 2; break;
            case VerticalAlignment.BOTTOM: offY = sh - cy - containerHeight / 2; break;
            case VerticalAlignment.CENTER: offY = cy - (sh / 2) - containerHeight / 2; break;
            case VerticalAlignment.CENTER_TRANSLATED: offY = cy - (sh / 2); break;
        }

        return { offX, offY };
    }

    function onMouseDown(e: MouseEvent) {
        if (!editMode || e.button !== 0) return;
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startOffsetX = currentOffsetX;
        startOffsetY = currentOffsetY;
        dispatch("dragstart");
    }

    function onMouseMove(e: MouseEvent) {
        if (!dragging) return;

        const scale = zoom / 100;
        let dx = (e.clientX - startX) / scale;
        let dy = (e.clientY - startY) / scale;

        if (alignment.horizontalAlignment === HorizontalAlignment.RIGHT) dx = -dx;
        if (alignment.verticalAlignment === VerticalAlignment.BOTTOM) dy = -dy;

        let rawOffsetX = startOffsetX + dx;
        let rawOffsetY = startOffsetY + dy;

        const sw = window.innerWidth / scale;
        const sh = window.innerHeight / scale;

        let { cx, cy } = getBaseAbsoluteCenter(alignment, rawOffsetX, rawOffsetY);

        snapFractionX = null;
        snapFractionY = null;
        let snappedX = false;
        let snappedY = false;

        if (!e.shiftKey) {
            if (Math.abs(cx - sw / 2) <= SNAP_THRESHOLD) {
                cx = sw / 2; snapFractionX = 50; snappedX = true;
            }
            if (Math.abs(cy - sh / 2) <= SNAP_THRESHOLD) {
                cy = sh / 2; snapFractionY = 50; snappedY = true;
            }
        }

        let elLeft = cx - containerWidth / 2;
        let elRight = cx + containerWidth / 2;
        let elTop = cy - containerHeight / 2;
        let elBottom = cy + containerHeight / 2;

        if (elLeft <= 0) {
            cx = containerWidth / 2;
            if (!snappedX && !e.shiftKey) snapFractionX = 0;
        } else if (elRight >= sw) {
            cx = sw - containerWidth / 2;
            if (!snappedX && !e.shiftKey) snapFractionX = 100;
        }

        if (elTop <= 0) {
            cy = containerHeight / 2;
            if (!snappedY && !e.shiftKey) snapFractionY = 0;
        } else if (elBottom >= sh) {
            cy = sh - containerHeight / 2;
            if (!snappedY && !e.shiftKey) snapFractionY = 100;
        }

        const finalOffsets = setOffsetFromAbsoluteCenter(alignment, cx, cy);
        currentOffsetX = finalOffsets.offX;
        currentOffsetY = finalOffsets.offY;
    }

    function onMouseUp() {
        if (!dragging) return;
        dragging = false;
        snapFractionX = null;
        snapFractionY = null;
        
        dispatch("updateAlignment", {
            horizontalAlignment: alignment.horizontalAlignment,
            verticalAlignment: alignment.verticalAlignment,
            horizontalOffset: currentOffsetX,
            verticalOffset: currentOffsetY
        });
    }

    function onContextMenu(e: MouseEvent) {
        if (!editMode) return;
        e.preventDefault(); 
        e.stopPropagation();
        dispatch("rightclick", e);
    }
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

{#if snapFractionX !== null}
    <div class="snap-line vertical" style="left: {snapFractionX}%;"></div>
{/if}
{#if snapFractionY !== null}
    <div class="snap-line horizontal" style="top: {snapFractionY}%;"></div>
{/if}

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="draggable-element" class:editing={editMode} style={styleString} on:mousedown={onMouseDown} on:contextmenu={onContextMenu}>
    <div class="contained-element" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
        <slot/>
    </div>
    {#if editMode}
        <div class="edit-overlay"></div>
    {/if}
</div>

<style lang="scss">
  .draggable-element {
    position: relative;
  }

  .contained-element {
    min-width: 50px;
    min-height: 50px;
  }

  .editing {
    cursor: move;
    z-index: 999999;
  }

  .edit-overlay {
    position: absolute;
    inset: -4px;
    border: 2px dashed rgba(255, 255, 255, 0.5);
    pointer-events: auto;
    transition: all 0.4s ease;
  }

  .editing:hover .edit-overlay {
    border: 2px solid var(--accent-color);
    background: color-mix(in srgb, var(--accent-color) 20%, transparent);
  }

  .snap-line {
    position: fixed;
    z-index: 9999999;
    pointer-events: none;
    background-color: var(--accent-color);
    box-shadow: 0 0 6px var(--accent-color);
  }

  .snap-line.vertical {
    top: 0;
    bottom: 0;
    width: 1px;
    transform: translateX(-50%);
  }

  .snap-line.horizontal {
    left: 0;
    right: 0;
    height: 2px;
    transform: translateY(-50%);
  }
</style>