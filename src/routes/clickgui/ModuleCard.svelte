<script lang="ts">
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { getModuleSettings, setModuleSettings, setModuleEnabled } from "../../integration/rest";
    import type { ConfigurableSetting } from "../../integration/types";
    import GenericSetting from "./setting/common/GenericSetting.svelte";
    import { convertToSpacedString, spaceSeperatedNames } from "../../theme/theme_config";
    import BindSetting from "./setting/bind/BindSetting.svelte";
    import type { BindSetting as TBindSetting, ModuleSetting } from "../../integration/types";
    import Switch from "./setting/common/Switch.svelte";
    import SwitchBindAction from "./setting/bind/SwitchBindAction.svelte";
    import ClickGuiToolTip from "./ClickGuiToolTip.svelte";
    import PreviewESP from "./PreviewESP.svelte"; 

    export let name: string;
    export let enabled: boolean;
    export let description: string;
    export let aliases: string[];

    let bindPopupOpen = false;
    let bindSetting: TBindSetting | null = null;

    $: bindSettingIndex = configurable?.value.findIndex(s => s.name === "Bind") ?? -1;
    $: bindSetting = bindSettingIndex >= 0 ? configurable.value[bindSettingIndex] as TBindSetting : null;

    let configurable: ConfigurableSetting;
    let hasSettings = false;
    let expanded = false;
    const path = `clickgui.${name}`;

    onMount(async () => {
        await fetchModuleSettings();
        setTimeout(() => {
            expanded = localStorage.getItem(path + "_expanded") === "true";
        }, 100);
    });

    async function fetchModuleSettings() {
        configurable = await getModuleSettings(name);
        hasSettings = configurable.value.filter(v => v.name !== "Bind" && v.name !== "Hidden").length > 0;
    }

    async function updateModuleSettings() {
        await setModuleSettings(name, configurable);
        await fetchModuleSettings();
    }

    async function toggleModule(e?: Event) {
        if (e) e.stopPropagation();
        await setModuleEnabled(name, !enabled);
    }

    function toggleExpanded() {
        if (!hasSettings) return;
        expanded = !expanded;
        localStorage.setItem(path + "_expanded", expanded.toString());
    }

    async function updateBindSettings() {
        await setModuleSettings(name, configurable);
    }

    function getHidden(): Set<string> {
        try { return new Set(JSON.parse(localStorage.getItem("keybinds_hidden") ?? "[]")); }
        catch { return new Set(); }
    }

    let isHidden = getHidden().has(name);

    function toggleHiddenBind() {
        const set = getHidden();
        if (set.has(name)) set.delete(name);
        else set.add(name);
        localStorage.setItem("keybinds_hidden", JSON.stringify([...set]));
        isHidden = set.has(name);
        setTimeout(() => window.dispatchEvent(new Event("keybinds-hidden-change")), 0);
    }

    function toggleBindPopup(e: MouseEvent) {
        e.stopPropagation();
        bindPopupOpen = !bindPopupOpen;
    }

    function handleWindowClick() {
        bindPopupOpen = false;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="module-card" 
    class:enabled
    class:expanded
>
    <div class="card-header" on:click={toggleModule} on:contextmenu|preventDefault={toggleExpanded}>
        <div class="info">
            <h3 class="name">{$spaceSeperatedNames ? convertToSpacedString(name) : name}</h3>
            <p class="desc">{description}</p> 
        </div>

        <div class="controls">
            {#if bindSetting}
                <div class="bind-btn-wrap" style="position: relative;">
                    <button class="bind-icon-btn" on:click={toggleBindPopup} class:active={bindPopupOpen}>
                    <ClickGuiToolTip text="Bind" placement="top"/>
                        <img class="bind-icon" src="img/hud/keybinds/icon-keybinds.svg" alt="keybinds">
                    </button>

                    {#if bindPopupOpen}
                        <div class="bind-popup" on:click|stopPropagation in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
                            <div class="bind-popup-title">Key Bind</div>
                            <BindSetting bind:setting={configurable.value[bindSettingIndex]} moduleName={name} hideAction={true} on:change={updateBindSettings}/>
                            <div class="bind-popup-divider"></div>
                            {#if bindSetting}
                                <div class="bind-setting-row">
                                    <span class="bind-setting-label">Mode</span>
                                    <SwitchBindAction
                                        choices={["Toggle", "Hold", "Smart"]}
                                        bind:chosen={(configurable.value[bindSettingIndex] as TBindSetting).value.action}
                                        onchange={updateBindSettings}
                                    />
                                </div>
                            {/if}
                            <div class="bind-popup-divider"></div>
                            <div class="bind-setting-row">
                                <span class="bind-setting-label">Hide</span>
                                <Switch value={isHidden} name="" on:change={toggleHiddenBind}/>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}

            {#if hasSettings}
                <div class="expand-btn" class:rotated={expanded}>
                    <img src="img/clickgui/icon-settings-expand.svg" alt="Expand" />
                </div>
            {/if}
        </div>
    </div>
    {#if expanded && configurable}
        <div class="settings-wrapper">
            <div class="divider"></div>
            <div class="card-settings">
                
                {#if name === "ESP"}
                    <PreviewESP settings={configurable.value} />
                {/if}

                {#each configurable.value as setting (setting.name)}
                    <GenericSetting {path} bind:setting on:change={updateModuleSettings}/>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    .module-card {
        background-color: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 14px;
        transition: border-color 0.4s, box-shadow 0.4s;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px var(--clickgui-modulecard-box-shadow-color);

        &:hover {
            box-shadow: 0 10px 40px color-mix(in srgb, var(--accent-color) 20%, transparent);
        }

        &.enabled {
            border-color: color-mix(in srgb, var(--accent-color) 100%, transparent);
            background-color: color-mix(in srgb, var(--accent-color) 20%, transparent);
        }
    }

    .card-header {
        padding: 20px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
    }

    .info {
        flex: 1;
        overflow: hidden;

        .name {
            margin: 0 0 6px 0;
            font-size: 18px;
            font-weight: 500;
            color: var(--clickgui-text-color);
        }

        .desc {
            margin: 0;
            font-size: 12px;
            font-weight: 400;
            color: var(--clickgui-text-dimmed-color);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: 14px;
    }

    .expand-btn {
        width: 28px;
        height: 28px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(50, 50, 50, 0.4);
        transition: all 0.4s ease;

        &.rotated {
            transform: rotate(-180deg);
            background: var(--accent-color);
            color: #000;
        }
    }

    .bind-icon-btn {
        all: unset;
        width: 28px;
        height: 28px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(50, 50, 50, 0.4);
        transition: all 0.4s;

        img {
            width: 14px;
            height: 14px;
        }

        &:hover, &.active {
            background: var(--accent-color);
        }
    }

    .bind-popup {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 260px;
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .bind-popup-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--clickgui-text-dimmed-color);
        opacity: 0.6;
    }

    .bind-popup-divider {
        height: 1px;
        background: var(--clickgui-border-color);
    }

    .bind-setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 2px;
    }

    .bind-setting-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--clickgui-text-dimmed-color);
    }

    .settings-wrapper {
        animation: expand 0.8s ease;
    }

    .divider {
        height: 1px;
        width: 95%;
        margin: 0 auto;
        background-color: var(--clickgui-border-color);
    }

    .card-settings {
        border-radius: 0 0 14px 14px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        background: var(--clickgui-base-color);
    }

    @keyframes expand {
        from { opacity: 0; max-height: 0; }
        to   { opacity: 1; max-height: 1000px; }
     }
</style>
