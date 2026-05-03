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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="icon-button" on:click={() => dispatch("click")}>
    <ToolTip text={title}/>
    <img class="icon-img" src="img/menu/icon-{icon}.svg" alt={icon} style="filter: {iconFilter};">
</div>

<style lang="scss">
  .icon-button {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s ease;

    &:hover {
      background: var(--clickgui-window-background-color);
      
      .icon-img {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }

  .icon-img {
    width: 20px;
    height: 20px;
    opacity: 0.6;
    transition: all 0.4s ease;
  }
</style>