<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { getModules, setModuleSettings, getModuleSettings } from "../../integration/rest";
    import { listen } from "../../integration/ws";
    import { convertToSpacedString, spaceSeperatedNames } from "../../theme/theme_config";
    import type { Module } from "../../integration/types";
    import { UNKNOWN_KEY } from "../../util/utils";
    import BindDisplay from "./setting/bind/BindDisplay.svelte";
    import Switch from "./setting/common/Switch.svelte";
    import ClickGuiToolTip from "./ClickGuiToolTip.svelte";

    export let onClose: () => void;
    export let iconFilter: string = "none";

    let modules: Module[] = [];

    function getHidden(): Set<string> {
        try { return new Set(JSON.parse(localStorage.getItem("keybinds_hidden") ?? "[]")); }
        catch { return new Set(); }
    }

    let hiddenSet = getHidden();

    async function loadModules() {
        modules = (await getModules()).filter(m => m.keyBind.boundKey !== UNKNOWN_KEY);
        hiddenSet = getHidden();
    }

    async function removeBind(mod: Module) {
        const settings = await getModuleSettings(mod.name);
        const bindSetting = settings.value.find(s => s.name === "Bind") as any;
        if (!bindSetting) return;
        bindSetting.value.boundKey = UNKNOWN_KEY;
        bindSetting.value.modifiers = [];
        await setModuleSettings(mod.name, settings);
        await loadModules();
    }

    function toggleHidden(modName: string) {
        const set = getHidden();
        if (set.has(modName)) set.delete(modName);
        else set.add(modName);
        localStorage.setItem("keybinds_hidden", JSON.stringify([...set]));
        hiddenSet = set;
        setTimeout(() => window.dispatchEvent(new Event("keybinds-hidden-change")), 0);
    }

    listen("valueChanged", async (e) => {
        if (e.value.name === "Bind") await loadModules();
    });

    onMount(loadModules);

    let containerEl: HTMLElement;

    function handleWindowClick(e: MouseEvent) {
        if (containerEl && !containerEl.contains(e.target as Node)) {
            onClose();
        }
    }
</script>

<svelte:window on:click={handleWindowClick} />

<div
    class="keybinds-panel"
    bind:this={containerEl}
    transition:fade={{ duration: 300 }}
    on:click|stopPropagation
>
    <div class="panel-header">
        <span class="panel-title">Key Binds</span>
    </div>

    <div class="panel-body">
        {#if modules.length === 0}
            <div class="empty">No key bindings configured</div>
        {:else}
            {#each modules as mod (mod.name)}
                <div class="bind-row">
                    <span class="mod-name" class:enabled={mod.enabled}>
                        {$spaceSeperatedNames ? convertToSpacedString(mod.name) : mod.name}
                    </span>

                    <div class="actions">
                        <div class="bind-chip">
                            <BindDisplay boundKey={mod.keyBind.boundKey} modifiers={mod.keyBind.modifiers}/>
                        </div>

                        <div class="action-btn" title={hiddenSet.has(mod.name) ? "Show in HUD" : "Hide in HUD"}>
                            <ClickGuiToolTip text={hiddenSet.has(mod.name) ? "Hidden" : "Visible"} placement="top"/>
                            <Switch
                                value={hiddenSet.has(mod.name)}
                                name=""
                                on:change={() => toggleHidden(mod.name)}
                            />
                        </div>

                        <button class="remove-btn" title="Remove bind" on:click={() => removeBind(mod)}>
                            <ClickGuiToolTip text="Delete Bind" placement="top"/>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">
    .keybinds-panel {
        position: absolute;
        bottom: -60px;
        left: calc(100% + -90px);
        width: 300px;
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 99999;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 12px;
    }

    .panel-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--clickgui-text-color);
    }

    .panel-body {
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        max-height: 400px;
        overflow-y: auto;

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 8px;
        }
    }

    .empty {
        font-size: 12px;
        font-weight: 500;
        color: var(--clickgui-text-dimmed-color);
        text-align: center;
        padding: 20px;
    }

    .bind-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 8px;
        transition: background 0.4s;

        &:hover {
            background: var(--clickgui-base-color);
        }
    }

    .mod-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-color);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .bind-chip {
        display: inline-flex;
        align-items: center;
        font-size: 12px;
        color: var(--clickgui-text-color);
        background: var(--clickgui-window-background-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 8px;
        padding: 4px 6px;
        text-transform: uppercase;
        min-width: 28px;
        justify-content: center;
    }

    .action-btn {
        display: flex;
        align-items: center;
    }

    .remove-btn {
        all: unset;
        cursor: pointer;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: var(--clickgui-text-color);
        transition: all 0.4s;

        svg {
            width: 14px;
            height: 14px;
        }

        &:hover {
            background: color-mix(in srgb, var(--error-color, #fc4130) 20%, transparent);
            color: var(--error-color, #fc4130);
        }
    }

    .keybinds-panel {
        animation: popAnim 0.4s ease
    }

    @keyframes popAnim {
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
</style>