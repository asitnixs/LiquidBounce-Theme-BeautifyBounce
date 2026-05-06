<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { getComponents, getGameWindow, getMetadata, getModuleSettings, setModuleSettings, getModules, setModuleEnabled } from "../../integration/rest";
    import { type HudComponent, type Metadata, type Alignment, type Module, HorizontalAlignment, VerticalAlignment } from "../../integration/types";
    import { setItem } from "../../integration/persistent_storage";
    import { push } from "svelte-spa-router";
    import { fade } from "svelte/transition";
    import ArrayList from "../hud/elements/ArrayList.svelte";
    import TargetHud from "../hud/elements/targethud/TargetHud.svelte";
    import Watermark from "../hud/elements/Watermark.svelte";
    import Notifications from "../hud/elements/notifications/Notifications.svelte";
    import HotBar from "../hud/elements/hotbar/HotBar.svelte";
    import Scoreboard from "../hud/elements/Scoreboard.svelte";
    import Taco from "../hud/elements/taco/Taco.svelte";
    import Keystrokes from "../hud/elements/keystrokes/Keystrokes.svelte";
    import Effects from "../hud/elements/Effects.svelte";
    import BlockCounter from "../hud/elements/BlockCounter.svelte";
    import Text from "../hud/elements/Text.svelte";
    import DraggableComponent from "../hud/elements/DraggableComponent.svelte";
    import KeyBinds from "../hud/elements/KeyBinds.svelte";
    import GenericPlayerInventory from "../hud/elements/inventory/GenericPlayerInventory.svelte";
    import InventoryStatistics from "../hud/elements/inventory/InventoryStatistics.svelte";
    import MotionGraph from "../hud/elements/MotionGraph.svelte";
    import Information from "../hud/elements/Information.svelte";
    import GenericSetting from "../clickgui/setting/common/GenericSetting.svelte";
    import ClickGuiToolTip from "../clickgui/ClickGuiToolTip.svelte";
    import BedTracker from "../hud/elements/BedTracker.svelte";

    let zoom = 100;
    let metadata: Metadata;
    let components: HudComponent[] = [];
    
    let originalHudState = true;
    let hudMod: Module | null = null;
    let hudSettings: any = null;

    let selectedComponentSettings: any = null;
    
    let popupOriginX = "left";
    let popupOriginY = "top";
    let popupX = 0;
    let popupY = 0;

    let refreshKey = 0;

    let componentsPanel = false;
    let panelX = 0;
    let panelY = 0;

    let allComponents: HudComponent[] = [];

    function applyStoredAlignments(comps: HudComponent[]): HudComponent[] {
        return comps.map(c => {
            let settings = { ...c.settings };

            const storedPos = localStorage.getItem(`hud_pos_${c.name}`);
            if (storedPos) {
                try { settings.alignment = JSON.parse(storedPos); } catch {}
            }

            const storedEnabled = localStorage.getItem(`hud_enabled_${c.name}`);
            if (storedEnabled !== null) {
                settings.enabled = storedEnabled === "true";
            }

            return { ...c, settings };
        });
    }

    onMount(async () => {
        const modules = await getModules();
        hudMod = modules.find(m => m.name.toLowerCase() === "hud") || null;
        
        if (hudMod) {
            originalHudState = hudMod.enabled;
            if (originalHudState) await setModuleEnabled(hudMod.name, false);
            hudSettings = await getModuleSettings(hudMod.name);
        }

        const gameWindow = await getGameWindow();
        zoom = gameWindow.scaleFactor * 50;

        metadata = await getMetadata();
        components = applyStoredAlignments(await getComponents(metadata.id));
    });

    onDestroy(() => {
        if (hudMod && originalHudState) {
            setModuleEnabled(hudMod.name, true).catch(console.error);
        }
    });

    async function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            selectedComponentSettings = null;
            if (hudMod && originalHudState) {
                await setModuleEnabled(hudMod.name, true);
                hudMod = null;
            }
            push("/clickgui");
        }
    }

    function handleBackgroundMouseDown(e: MouseEvent) {
        if (e.target !== e.currentTarget) return;
        if (e.button === 0) {
            selectedComponentSettings = null;
            componentsPanel = false;
        }
    }

    function handleBackgroundContextMenu(e: MouseEvent) {
        if (e.target !== e.currentTarget) return;
        if (selectedComponentSettings) {
            selectedComponentSettings = null;
            return;
        }
        const scale = zoom / 100;
        panelX = e.clientX / scale;
        panelY = e.clientY / scale;
        componentsPanel = !componentsPanel;
    }

    function applyAlignmentToSettings(settings: any[], compName: string, align: Alignment): boolean {
        if (!Array.isArray(settings)) return false;
        let updated = false;

        for (const s of settings) {
            if (s.name && s.name.toLowerCase() === compName.toLowerCase() && Array.isArray(s.value)) {
                const alignGroup = s.value.find((x: any) => x.name && x.name.toLowerCase() === "alignment");
                if (alignGroup && Array.isArray(alignGroup.value)) {
                    const hOff = alignGroup.value.find((x: any) => x.name.includes("Horizontal") && x.name.includes("Offset"));
                    const vOff = alignGroup.value.find((x: any) => x.name.includes("Vertical") && x.name.includes("Offset"));
                    const hAlign = alignGroup.value.find((x: any) => x.name === "Horizontal" || x.name === "Horizontal Alignment");
                    const vAlign = alignGroup.value.find((x: any) => x.name === "Vertical" || x.name === "Vertical Alignment");

                    if (hOff) { hOff.value = Math.round(align.horizontalOffset); updated = true; }
                    if (vOff) { vOff.value = Math.round(align.verticalOffset); updated = true; }
                    if (hAlign) { hAlign.value = align.horizontalAlignment; updated = true; }
                    if (vAlign) { vAlign.value = align.verticalAlignment; updated = true; }
                }
            }

            if (Array.isArray(s.value)) {
                if (applyAlignmentToSettings(s.value, compName, align)) updated = true;
            }
            if (s.choices && typeof s.choices === 'object') {
                for (const key in s.choices) {
                    if (s.choices[key] && Array.isArray(s.choices[key].value)) {
                        if (applyAlignmentToSettings(s.choices[key].value, compName, align)) updated = true;
                    }
                }
            }
        }
        return updated;
    }

    function findComponentSettings(settings: any[], compName: string): any {
        if (!Array.isArray(settings)) return null;
        for (const s of settings) {
            if (s.name && s.name.toLowerCase() === compName.toLowerCase() && Array.isArray(s.value)) {
                return s;
            }
            if (Array.isArray(s.value)) {
                const found = findComponentSettings(s.value, compName);
                if (found) return found;
            }
            if (s.choices && typeof s.choices === 'object') {
                for (const key in s.choices) {
                    if (s.choices[key] && Array.isArray(s.choices[key].value)) {
                        const found = findComponentSettings(s.choices[key].value, compName);
                        if (found) return found;
                    }
                }
            }
        }
        return null;
    }

    async function handleAlignmentUpdate(name: string, event: CustomEvent) {
        const newAlign = event.detail;
        try {
            if (!hudMod || !hudSettings) return;

            const applied = applyAlignmentToSettings(hudSettings.value, name, newAlign);
            if (applied) {
                await setItem(`hud_pos_${name}`, JSON.stringify(newAlign));
                await setModuleSettings(hudMod.name, hudSettings);
                window.dispatchEvent(new CustomEvent("configLoaded"));
            }
        } catch (e) {
            console.error("Failed to sync component position", e);
        }
    }

    function handleRightClick(name: string, event: CustomEvent<MouseEvent>) {
        componentsPanel = false;
        if (!hudSettings) return;
        const mouseEvent = event.detail;
        
        const foundSettings = findComponentSettings(hudSettings.value, name);
        if (foundSettings && foundSettings.value.length > 0) {
            selectedComponentSettings = foundSettings;
            
            const scale = zoom / 100;
            const px = mouseEvent.clientX / scale;
            const py = mouseEvent.clientY / scale;
            
            const screenW = window.innerWidth / scale;
            const screenH = window.innerHeight / scale;

            if (px > screenW / 2) {
                popupOriginX = "right";
                popupX = screenW - px;
            } else {
                popupOriginX = "left";
                popupX = px;
            }

            if (py > screenH / 2) {
                popupOriginY = "bottom";
                popupY = screenH - py;
            } else {
                popupOriginY = "top";
                popupY = py;
            }
        }
    }

    async function handleSettingChange() {
        if (hudMod && hudSettings) {
            await setModuleSettings(hudMod.name, hudSettings);
            components = applyStoredAlignments(await getComponents(metadata.id));
            refreshKey++;
            window.dispatchEvent(new CustomEvent("configLoaded"));
        }
    }

    async function resetPosition() {
        if (!hudMod || !hudSettings || !selectedComponentSettings) return;

        const compName = selectedComponentSettings.name;
        localStorage.removeItem(`hud_pos_${compName}`);

        let defaultAlign: Alignment = {
            horizontalAlignment: HorizontalAlignment.CENTER_TRANSLATED,
            verticalAlignment: VerticalAlignment.CENTER_TRANSLATED,
            horizontalOffset: 0,
            verticalOffset: 0
        };

        let defaultValues: any[] | null = null;

        try {
            const res = await fetch(`components/${compName.toLowerCase()}.json`);
            if (res.ok) {
                const data = await res.json();
                if (data.alignment) defaultAlign = data.alignment as Alignment;
                if (data.values && Array.isArray(data.values)) defaultValues = data.values;
            } else {
                console.warn(`Default JSON not found for ${compName}, falling back to center.`);
            }
        } catch (e) {
            console.warn("Error fetching default JSON", e);
        }

        applyAlignmentToSettings(hudSettings.value, compName, defaultAlign);

        if (defaultValues) {
            for (const setting of selectedComponentSettings.value) {
                const nameLower = setting.name.toLowerCase();
                if (nameLower === "alignment" || nameLower === "enabled") continue;
                const def = defaultValues.find((d: any) => d.name?.toLowerCase() === nameLower);
                if (def !== undefined) setting.value = def.value;
            }
        }

    await setModuleSettings(hudMod.name, hudSettings);
        components = applyStoredAlignments(await getComponents(metadata.id));
        refreshKey++;
        window.dispatchEvent(new CustomEvent("configLoaded"));
        selectedComponentSettings = null;
    }

    async function toggleComponent(name: string) {
        const comp = components.find(c => c.name === name);
        if (!comp) return;

        const newEnabled = !comp.settings.enabled;

        comp.settings.enabled = newEnabled;
        components = components;

        await setItem(`hud_enabled_${name}`, String(newEnabled));

        if (hudMod && hudSettings) {
            const found = findComponentSettings(hudSettings.value, name);
            if (found) {
                const enabledSetting = found.value?.find((s: any) => s.name?.toLowerCase() === "enabled");
                if (enabledSetting) enabledSetting.value = newEnabled;
            }
            await setModuleSettings(hudMod.name, hudSettings);
            refreshKey++;
            window.dispatchEvent(new CustomEvent("configLoaded"));
        }
    }
    

    $: hasActualSettings = selectedComponentSettings?.value.some((s: any) => {
        const n = s.name ? s.name.toLowerCase() : "";
        return n !== "alignment" && n !== "enabled";
    });
</script>

<svelte:window on:keydown={handleKeyDown} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="hud-editor" style="zoom: {zoom}%"
     on:mousedown={handleBackgroundMouseDown}
     on:contextmenu|preventDefault={handleBackgroundContextMenu}>
    <div class="hint" style="zoom: {10000/zoom}%">
        Press <span>ESC</span> to exit
    </div>

    {#if selectedComponentSettings}
        <div class="settings-popup" 
             style="{popupOriginX}: {popupX}px; {popupOriginY}: {popupY}px;" 
             transition:fade={{ duration: 300 }} 
             on:mousedown|stopPropagation>
             
            <div class="popup-header" class:no-body={!hasActualSettings}>
                <div class="title-wrap">
                    <span class="title">{selectedComponentSettings.name} Settings</span>
                </div>
                <div class="header-actions">
                    <button class="action-btn" on:click={resetPosition}>
                    <ClickGuiToolTip text="Reset to Default Position" placement="top"/>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                    </button>
                    <button class="action-btn close" on:click={() => selectedComponentSettings = null}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            
            {#if hasActualSettings}
                <div class="popup-body">
                    {#each selectedComponentSettings.value as setting, i}
                        {#if setting.name.toLowerCase() !== "alignment" && setting.name.toLowerCase() !== "enabled"}
                            <GenericSetting path="hud.{selectedComponentSettings.name}" bind:setting={selectedComponentSettings.value[i]} on:change={handleSettingChange} />
                        {/if}
                    {/each}
                </div>
            {/if}
        </div>
    {/if}

    {#if componentsPanel}
        <div class="components-panel"
            style="left: {panelX}px; top: {panelY}px;"
            transition:fade={{ duration: 300 }}
            on:mousedown|stopPropagation>

            <div class="comp-header">
                <span class="comp-title">Components</span>
                <button class="action-btn close" on:click={() => componentsPanel = false}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div class="comp-list">
                {#each components as c}
                    <button class="comp-item" class:enabled={c.settings.enabled} on:click={() => toggleComponent(c.name)}>
                        <svg class="comp-check" class:on={c.settings.enabled} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span class="comp-name">{c.name}</span>
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    {#key refreshKey}
        {#each components as c}
            {#if c.settings.enabled}
                <DraggableComponent alignment={c.settings.alignment} editMode={true} {zoom} 
                    on:updateAlignment={(e) => handleAlignmentUpdate(c.name, e)}
                    on:rightclick={(e) => handleRightClick(c.name, e)}
                    on:dragstart={() => { selectedComponentSettings = null; componentsPanel = false; }}>
                    {#if c.name === "Watermark"}
                        <Watermark/>
                    {:else if c.name === "ArrayList"}
                        <ArrayList settings={c.settings}/>
                    {:else if c.name === "Notifications"}
                        <Notifications editMode={true} />
                    {:else if c.name === "TargetHud"}
                        <TargetHud editMode={true} />
                    {:else if c.name === "BlockCounter"}
                        <BlockCounter settings={c.settings} editMode={true} />
                    {:else if c.name === "Hotbar"}
                        <HotBar/>
                    {:else if c.name === "Scoreboard"}
                        <Scoreboard settings={c.settings} editMode={true} />
                    {:else if c.name === "ArmorItems"}
                        <GenericPlayerInventory rowLength={1} gap="2px" getRenderedStacks={it => Array.from(it.armor).reverse()} />
                    {:else if c.name === "InventoryStatistics"}
                        <InventoryStatistics settings={c.settings} />
                    {:else if c.name === "Inventory"}
                        <GenericPlayerInventory rowLength={9} getRenderedStacks={it => it.main.slice(9)} />
                    {:else if c.name === "CraftingInventory"}
                        <GenericPlayerInventory rowLength={2} getRenderedStacks={it => it.crafting} />
                    {:else if c.name === "EnderChestInventory"}
                        <GenericPlayerInventory rowLength={9} getRenderedStacks={it => it.enderChest} />
                    {:else if c.name === "Taco"}
                        <Taco/>
                    {:else if c.name === "Keystrokes"}
                        <Keystrokes/>
                    {:else if c.name === "Effects"}
                        <Effects editMode={true} />
                    {:else if c.name === "Text"}
                        <Text settings={c.settings} />
                    {:else if c.name === "Image"}
                        <img alt="" src="{c.settings.uRL}" style="scale: {c.settings.scale};">
                    {:else if c.name === "KeyBinds"}
                        <KeyBinds/>
                    {:else if c.name === "MotionGraph"}
                        <MotionGraph settings={c.settings} />
                    {:else if c.name === "Information"}
                        <Information settings={c.settings} editMode={true} />
                    {:else if c.name === "BedTracker"}
                        <BedTracker settings={c.settings} editMode={true} />
                    {/if}
                </DraggableComponent>
            {/if}
        {/each}
    {/key}
</div>

<style lang="scss">
  .hud-editor {
    height: 100vh;
    width: 100vw;
    background: rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
  }

  .hint {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--clickgui-base-color);
    color: var(--text-dimmed-color);
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 1000000;
    pointer-events: none;

    span {
        color: var(--accent-color);
        font-weight: 600;
    }
  }

  .settings-popup {
    position: absolute;
    width: 280px;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 10000000;
    display: flex;
    flex-direction: column;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: var(--clickgui-base-color);
    border-radius: 14px 14px 0 0;

    &.no-body {
        border-radius: 14px;
    }
    
    .title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;

        .title {
            color: var(--clickgui-text-color);
            font-weight: 500;
            font-size: 14px;
        }
    }

    .header-actions {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .action-btn {
        background: transparent;
        border: none;
        color: var(--clickgui-text-dimmed-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 8px;
        transition: all 0.4s;

        svg {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background: var(--clickgui-window-background-color);
            color: var(--clickgui-text-color);
        }

        &.close:hover {
            background: color-mix(in srgb, var(--error-color) 20%, transparent);
            color: var(--error-color);
        }
    }
  }

  .popup-body {
    padding: 6px 8px;
    border-radius: 0 0 14px 14px;
    background: var(--clickgui-window-background-color);
  }

  .components-panel {
    position: absolute;
    width: 200px;
    border-radius: 12px;
    background: var(--clickgui-base-color);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 10000000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: popAnim 0.4s ease;
  }

  .comp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;

    .comp-title {
        color: var(--clickgui-text-color);
        font-weight: 500;
        font-size: 14px;
    }
  }

    .action-btn {
        background: transparent;
        border: none;
        color: var(--clickgui-text-dimmed-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 8px;
        transition: all 0.4s;

        svg {
            width: 16px;
            height: 16px;
        }

        &:hover {
            background: var(--clickgui-window-background-color);
            color: var(--clickgui-text-color);
        }

        &.close:hover {
            background: color-mix(in srgb, var(--error-color) 20%, transparent);
            color: var(--error-color);
        }
    }

  .comp-list {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
    max-height: 320px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: var(--accent-color); border-radius: 8px; }
  }

  .comp-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.4s;
    width: 100%;

    &:hover {
        background: var(--clickgui-window-background-color);
    }

    .comp-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-color);
    }

    &:not(.enabled) .comp-name {
        color: var(--clickgui-text-dimmed-color);
    }
  }

  .comp-check {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    color: var(--clickgui-text-dimmed-color);
    opacity: 0.4;
    transition: color 0.4s, opacity 0.4s;

    &.on {
        color: var(--accent-color);
        opacity: 1;
    }
  }

  .settings-popup {
    animation: popAnim 0.4s ease;
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