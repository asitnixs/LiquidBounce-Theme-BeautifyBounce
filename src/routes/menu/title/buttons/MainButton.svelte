<script lang="ts">
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import { backIn, backOut } from "svelte/easing";
    import TitleButtonIcon from "./TitleButtonIcon.svelte";

    export let title: string;
    export let icon: string;
    export let index: number;

    let hovered = false;
    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="main-button"
     on:mouseenter={() => hovered = true}
     on:mouseleave={() => hovered = false}
     on:click={() => { hovered = false; dispatch("click"); }}
     out:fly|global={{ x: -40, opacity: 0, duration: 280, delay: index * 40, easing: backIn }}
     in:fly|global={{ x: -40, opacity: 0, duration: 380, delay: index * 70, easing: backOut }}>

    <div class="icon">
        <TitleButtonIcon {icon} />
    </div>

    <span class="title">{title}</span>

    <slot parentHovered={hovered}/>
</div>

<style lang="scss">
    .main-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 14px;
        border-radius: 14px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        transition: background 0.4s ease, border-color 0.4s ease, transform 0.4s ease;

        &:hover {
            transform: translateX(4px);

            &::before {
                opacity: 1;
                transform: scaleY(1);
            }

            .icon {
                background: var(--accent-color);
                color: var(--clickgui-text-color);
                box-shadow: 0 0 14px color-mix(in srgb, var(--accent-color) 40%, transparent);
            }

            .title {
                color: var(--clickgui-text-color);
            }
        }
    }

    .icon {
        width: 40px;
        height: 40px;
        border-radius: 11px;
        background: var(--clickgui-window-background-color);
        color: var(--clickgui-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;

        :global(span.title-button-icon) {
            width: 18px;
            height: 18px;
        }
    }

    .title {
        flex: 1;
        font-size: 16px;
        font-weight: 500;
        color: var(--clickgui-text-dimmed-color);
        transition: color 0.4s ease;
    }
</style>