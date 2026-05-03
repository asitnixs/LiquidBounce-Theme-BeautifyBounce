<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {getModules} from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import type {Module} from "../../../integration/types";
    import {UNKNOWN_KEY} from "../../../util/utils";
    import BindDisplay from "../../clickgui/setting/bind/BindDisplay.svelte";
    import { fade } from "svelte/transition";
    import { getSavedTheme } from "../../../theme/clickgui_theme";

    let modules: Module[] = $state([]);

    let activeTheme = $state(getSavedTheme());
    let iconFilter = $derived( activeTheme === "light" ? "brightness(0)" : "none" );

    function getHidden(): Set<string> {
        try { return new Set(JSON.parse(localStorage.getItem("keybinds_hidden") ?? "[]")); }
        catch { return new Set(); }
    }

    async function updateModulesWithBinds() {
        modules = (await getModules()).filter(m => m.keyBind.boundKey !== UNKNOWN_KEY && !getHidden().has(m.name));
    }

    listen("moduleToggle", updateModulesWithBinds);
    listen("valueChanged", async (e) => {
        if (e.value.name === "Bind") {
            await updateModulesWithBinds();
        }
    })

    onMount(() => {
        updateModulesWithBinds();
        const onHiddenChange = () => updateModulesWithBinds();
        const onStorageChange = (e: StorageEvent) => {
            if (e.key === "keybinds_hidden") updateModulesWithBinds();
        };

        window.addEventListener("keybinds-hidden-change", onHiddenChange);
        window.addEventListener("storage", onStorageChange);
        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("keybinds-hidden-change", onHiddenChange);
            window.removeEventListener("storage", onStorageChange);
        };
    });

    onDestroy(() => {
        window.removeEventListener("storage", handleStorageChange);
    });

    function handleStorageChange(e: StorageEvent) {
        if (e.key === "liquidbounce_selected_theme") {
            activeTheme = (e.newValue as any) || "dark";
        }
    }

    let lastEnabled = new Map<string, boolean>();

    function getStateChange(m: Module) {
        const prev = lastEnabled.get(m.name);
        lastEnabled.set(m.name, m.enabled);

        return {
            enabled: m.enabled && !prev,
            disabled: !m.enabled && prev
        };
    }
</script>

<div class="keybinds-container">
    <div class="header">
        <img class="icon" src="img/hud/keybinds/icon-keybinds.svg" alt="keybinds" style="filter: {iconFilter};">
        <span class="title">Hotkeys</span>
    </div>
    
    <div class="entries">
      {#each modules as m, i (m.name)}
        {@const state = getStateChange(m)}
          <div class="row"
              class:enabled={m.enabled}
              class:just-enabled={state.enabled}
              class:just-disabled={state.disabled}
              in:fade={{ duration: 300 }}
              out:fade={{ duration: 300 }}>
                <span class="module-name">{$spaceSeperatedNames ? convertToSpacedString(m.name) : m.name}</span>
                <span class="key-bind" class:muted={!m.enabled}>
                    <BindDisplay boundKey={m.keyBind.boundKey} modifiers={m.keyBind.modifiers}/>
                </span>
            </div>
        {:else}
            <div class="no-binds">No key bindings</div>
        {/each}
    </div>
</div>

<style lang="scss">
    .keybinds-container {
        display: flex;
        flex-direction: column;
        width: max-content;
        min-width: 160px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        animation: popAnim 0.4s ease;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 14px;
    }

    .icon {
        width: 16px;
        height: 16px;
    }

    .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--clickgui-text-color);
    }

    .entries {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 2px 12px 8px 12px;
    }

    .no-binds {
        font-size: 12px;
        color: var(--clickgui-text-dimmed-color);
        text-align: center;
        padding: 4px 0;
    }

    .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        transition: all 0.4s ease;
        opacity: 0.8;

        &.enabled {
            opacity: 1;

            .module-name {
                color: var(--accent-color);
                text-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 40%, transparent);
            }
            
            .key-bind {
                color: var(--clickgui-text-color);
                text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
            }
        }
    }

    .module-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-color);
        transition: color 0.4s ease, text-shadow 0.4s ease;
        white-space: nowrap;
    }

    .key-bind {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 0;
        color: var(--clickgui-text-dimmed-color);
        font-size: 12px;
        transition: all 0.4s ease;
    }

  .row.just-enabled {
    animation: enablePop 0.4s ease;
  }

  @keyframes enablePop {
    0% {
      transform: scale(0.98);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }

  .row.just-disabled {
    animation: disablePop 0.4s ease;
  }

  @keyframes disablePop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.98);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
