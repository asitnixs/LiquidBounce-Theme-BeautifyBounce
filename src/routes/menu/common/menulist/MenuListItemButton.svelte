<script lang="ts">
    import { getSavedTheme } from "../../../../theme/clickgui_theme";
    import ToolTip from "../ToolTip.svelte";
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;

    let activeTheme = getSavedTheme();
    $: iconFilter = activeTheme === "light" ? "brightness(0)" : "none";

    const dispatch = createEventDispatcher();
</script>

<button class="item-btn" on:click={() => dispatch("click")} title={title}>
    <ToolTip text={title} />
    <img src="img/menu/icon-{icon}.svg" alt={title} style="filter: {iconFilter};">
</button>

<style lang="scss">
    .item-btn {
        width: 34px; height: 34px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s ease;
        position: relative;
        margin-left: 8px;

        img {
          width: 20px;
          height: 20px;
        }

        &:hover {
            background: color-mix(in srgb, var(--accent-color) 80%, transparent);
        }
    }
</style>