<script lang="ts">
    import type { KeySetting, ModuleSetting } from "../../../integration/types";
    import {
        convertToSpacedString,
        spaceSeperatedNames,
    } from "../../../theme/theme_config";
    import { getPrintableKeyName } from "../../../integration/rest";
    import { createEventDispatcher } from "svelte";
    import { listen } from "../../../integration/ws";
    import type {
        KeyboardKeyEvent,
        MouseButtonEvent,
    } from "../../../integration/events";
    import { isClickGuiScreen, UNKNOWN_KEY } from "../../../util/utils";

    export let setting: ModuleSetting;
    const cSetting = setting as KeySetting;
    const dispatch = createEventDispatcher();

    let isHovered = false;
    let binding = false;
    let printableKeyName = "";

    $: {
        if (cSetting.value !== UNKNOWN_KEY) {
            getPrintableKeyName(cSetting.value).then(
                (key) => (printableKeyName = key.localized),
            );
        }
    }

    function toggleBinding() {
        if (binding) cSetting.value = UNKNOWN_KEY;
        binding = !binding;
        setting = { ...cSetting };
        dispatch("change");
    }

    listen("keyboardKey", async (e: KeyboardKeyEvent) => {
        if (!isClickGuiScreen(e.screen) || !binding) return;
        binding = false;
        cSetting.value = e.keyCode !== 256 ? e.key : UNKNOWN_KEY;
        setting = { ...cSetting };
        dispatch("change");
    });

    listen("mouseButton", async (e: MouseButtonEvent) => {
        if (
            !isClickGuiScreen(e.screen) ||
            !binding ||
            (e.button === 0 && isHovered)
        )
            return;
        binding = false;
        cSetting.value = e.key;
        setting = { ...cSetting };
        dispatch("change");
    });
</script>

<div class="setting-row">
    <div class="name">
        {$spaceSeperatedNames
            ? convertToSpacedString(cSetting.name)
            : cSetting.name}
    </div>

    <button
        class="key-btn"
        class:binding
        on:click={toggleBinding}
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
    >
        {#if !binding}
            {#if cSetting.value === UNKNOWN_KEY}
                <span class="none">None</span>
            {:else}
                <span class="bound">{printableKeyName}</span>
            {/if}
        {:else}
            <span class="listening">...</span>
        {/if}
    </button>
</div>

<style lang="scss">
    .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
    }

    .name {
        font-size: 12px;
        font-weight: 500;
        color: var(--clickgui-text-dimmed-color);
    }

    .key-btn {
        all: unset;
        background: var(--clickgui-window-background-color);
        border: 1px solid var(--clickgui-border-color);
        padding: 4px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.4s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;

        .none {
            color: var(--clickgui-text-dimmed-color);
            font-weight: 500;
        }

        .bound {
            color: var(--clickgui-text-color);
            font-weight: 600;
            text-transform: uppercase;
        }

        &:hover {
            border-color: var(--accent-color);
        }

        &.binding {
            border-color: var(--accent-color);
            background: color-mix(
                in srgb,
                var(--accent-color) 20%,
                transparent
            );
            color: var(--accent-color);
        }
    }

    .listening {
        animation: pulse 1s infinite alternate;
        font-weight: 500;
        color: var(--accent-color);
    }

    @keyframes pulse {
        from {
            opacity: 0.5;
        }
        to {
            opacity: 1;
        }
    }
</style>
