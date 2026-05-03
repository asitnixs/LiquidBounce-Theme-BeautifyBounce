<script lang="ts">
    import {listen} from "../../../../integration/ws";
    import type {KeyEvent} from "../../../../integration/events";
    import type {MinecraftKeybind} from "../../../../integration/types";

    export let gridArea: string;
    export let key: MinecraftKeybind | undefined;

    let active = false;

    listen("key", (e: KeyEvent) => {
        if (e.key !== key?.key.translationKey) {
            return;
        }

        active = e.action === 1 || e.action === 2;
    });

    $: displayName = getFormattedName(key?.key.localized);

    function getFormattedName(name: string | undefined): string {
        if (!name) return "—";
        
        if (name.toLowerCase() === "space") return "Space";
        return name.toUpperCase();
    }
</script>

<div class="key" style="grid-area: {gridArea};" class:active>
    {displayName}
</div>

<style lang="scss">

  .key {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    border-radius: 12px;
    color: var(--clickgui-text-dimmed-color);
    text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-dimmed-color) 40%, transparent);
    font-size: 16px;
    font-weight: 500;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    &.active {
      background-color: var(--accent-color);
      color: var(--clickgui-text-color);
      text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
      transform: scale(0.92);
      box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color) 60%, transparent);
    }
  }

</style>