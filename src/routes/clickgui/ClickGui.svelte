<script lang="ts">
    import { onMount, onDestroy, tick } from "svelte";
    import { fade } from "svelte/transition";
    import type { GroupedModules, Module } from "../../integration/types";
    import { getModules, setTyping } from "../../integration/rest";
    import { groupByCategory } from "../../integration/util";
    import { listen } from "../../integration/ws";
    import type { ModuleToggleEvent, VirtualScreenEvent } from "../../integration/events";
    import ModuleCard from "./ModuleCard.svelte";
    import Description from "./Description.svelte";
    import IntroOverlay from "./IntroOverlay.svelte";
    import { type ThemeName, saveAndApplyTheme, applyClickGuiTheme, getSavedTheme } from "../../theme/clickgui_theme";
    import ConfigManager from "./ConfigManager.svelte";
    import AboutPanel from "./AboutPanel.svelte";
    import ColorManager from "./ColorManager.svelte";
    import ClickGuiToolTip from "./ClickGuiToolTip.svelte";
    import Changelog from "./Changelog.svelte";
    import { cubicIn, cubicOut } from "svelte/easing";
    import ClickGuiKeybinds from "./ClickGuiKeybinds.svelte";
    import { push } from "svelte-spa-router";
    
    const ORDERED_CATEGORIES = [
        "Combat", 
        "Movement", 
        "Player", 
        "World", 
        "Render", 
        "Misc", 
        "Exploit", 
        "Fun"
    ];

    let moving = $state(false);
    let offsetX = $state(0);
    let offsetY = $state(0);
    let windowLeft = $state<number | null>(null);
    let windowTop = $state<number | null>(null);

    let modules = $state<Module[]>([]);
    let categories = $state<GroupedModules>({});
    let categoryNames = $state<string[]>([]);
    
    let activeCategory = $state<string>("");
    let searchQuery = $state<string>("");

    let refreshCounter = $state(0);

    function handleMouseDown(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button')) {
            return;
        }
        if (e.button !== 0) return;
        
        moving = true;
        if (windowLeft === null || windowTop === null) {
            const rect = document.querySelector('.gui-wrapper')?.getBoundingClientRect();
            if (rect) {
                windowLeft = rect.left;
                windowTop = rect.top;
            }
        }
        
        offsetX = e.clientX - (windowLeft || 0);
        offsetY = e.clientY - (windowTop || 0);
    }

    function handleMouseMove(e: MouseEvent) {
        if (moving) {
            windowLeft = e.clientX - offsetX;
            windowTop = e.clientY - offsetY;
        }
    }

    function handleMouseUp() {
        if (moving) {
            moving = false;
            localStorage.setItem("clickgui_window_pos", JSON.stringify({ x: windowLeft, y: windowTop }));
        }
    }

    onMount(async () => {
        const savedPos = localStorage.getItem("clickgui_window_pos");
        if (savedPos) {
            try {
                const pos = JSON.parse(savedPos);
                windowLeft = pos.x;
                windowTop = pos.y;
            } catch (e) {}
        }

        modules = await getModules();
        const grouped = groupByCategory(modules);
        categories = grouped;

        categoryNames = ORDERED_CATEGORIES.filter(cat => grouped[cat]);

        const extraCats = Object.keys(grouped).filter(cat => !ORDERED_CATEGORIES.includes(cat));
        categoryNames = [...categoryNames, ...extraCats];
        
        if (categoryNames.length > 0) {
            activeCategory = categoryNames[0];
        }

        await tick();
    });

    $effect(() => {
        const handleConfigLoad = async () => {
            modules = await getModules();
            categories = groupByCategory(modules);
            refreshCounter++;
        };

        window.addEventListener("configLoaded", handleConfigLoad);

        return () => {
            window.removeEventListener("configLoaded", handleConfigLoad);
        };
    });

    listen("moduleToggle", (e: ModuleToggleEvent) => {
        const mod = modules.find((m) => m.name === e.moduleName);
        if (mod) {
            mod.enabled = e.enabled;
        }
    });

    listen("virtualScreen", async (e: VirtualScreenEvent) => {
        if (e.action === "close") {
            searchQuery = "";
            searchOpen = false;
            await setTyping(false);
        }
    });

    onDestroy(() => {
        searchQuery = "";
        searchOpen = false;
        setTyping(false).catch(() => {});
    });

    let displayedModules = $derived.by(() => {
        if (!modules.length) return [];
        
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase().trim();
            return modules.filter(m => 
                m.name.toLowerCase().includes(query) || 
                m.aliases.some(a => a.toLowerCase().includes(query))
            );
        } 
        
        if (activeCategory) {
            return categories[activeCategory] || [];
        }

        return [];
    });

    function setCategory(cat: string) {
        activeCategory = cat;
        searchQuery = ""; 
    }

    const themes: Record<ThemeName, { label: string; surface: string; text: string }> = {
        dark:    { label: "Dark",     surface: "#131419", text: "#f5f7fb" },
        light:   { label: "Light",    surface: "#ffffff", text: "#1b1722" },
    };

    let activeTheme = $state<ThemeName>(getSavedTheme());
    let iconFilter = $derived(activeTheme === "light" ? "brightness(0)" : "none");

    async function toggleTheme() {
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        activeTheme = newTheme;
        await saveAndApplyTheme(newTheme);
    }

    let searchOpen = $state(false);
    let configOpen = $state(false);
    let settingsOpen = $state(false);
    let colorOpen = $state(false);
    let aboutOpen = $state(false);
    let keybindsOpen = $state(false);
    
    let configBtnEl: HTMLElement;
    let configDropdownEl: HTMLElement;
    let settingsBtnEl: HTMLElement;
    let settingsPopupEl: HTMLElement;
    let searchBoxEl: HTMLElement;
    let searchInputEl: HTMLInputElement;

    function handleWindowClick(e: MouseEvent) {
        const target = e.target as Node;

        if (settingsOpen && !settingsPopupEl?.contains(target) && !settingsBtnEl?.contains(target)) {
            settingsOpen = false;
        }
        
        if (configOpen && !configDropdownEl?.contains(target) && !configBtnEl?.contains(target)) {
            configOpen = false;
        }
        
        if (searchOpen && !searchBoxEl?.contains(target)) {
            if (searchQuery.trim().length === 0) {
                searchOpen = false;
                searchQuery = "";
            }
        }
    }

    function toggleSearch() {
        searchOpen = !searchOpen;
        if (!searchOpen) {
            searchQuery = "";
        } else {
            setTimeout(() => searchInputEl?.focus(), 50);
        }
    }

    function smoothScroll(node: HTMLElement, resetTrigger?: string) {
        let targetY = node.scrollTop;
        let isAnimating = false;
        let animFrameId: number;

        const updateScroll = () => {
            const dy = targetY - node.scrollTop;
            if (Math.abs(dy) < 0.5) {
                node.scrollTop = targetY;
                isAnimating = false;
                return;
            }
            node.scrollTop += dy * 0.10;
            animFrameId = requestAnimationFrame(updateScroll);
        };

        const onWheel = (e: WheelEvent) => {
            if (node.scrollHeight > node.clientHeight) {
                e.preventDefault();
                if (!isAnimating) targetY = node.scrollTop;
                
                targetY = Math.max(0, Math.min(node.scrollHeight - node.clientHeight, targetY + e.deltaY));
                
                if (!isAnimating) {
                    isAnimating = true;
                    animFrameId = requestAnimationFrame(updateScroll);
                }
            }
        };

        node.addEventListener('wheel', onWheel, { passive: false });
        
        return {
            update(newTrigger?: string) {
                cancelAnimationFrame(animFrameId);
                node.scrollTop = 0;
                targetY = 0;
                isAnimating = false;
            },
            destroy() {
                node.removeEventListener('wheel', onWheel);
                cancelAnimationFrame(animFrameId);
            }
        };
    }
</script>

<svelte:window onclick={handleWindowClick} onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div class="dashboard-gui">
    <Description />

    <div class="gui-wrapper" style={windowLeft !== null ? `position: absolute; margin: 0; left: ${windowLeft}px; top: ${windowTop}px;` : ''}>
        
        <div class="window">
            <IntroOverlay />
            <aside class="sidebar">
                <div class="sidebar-top">
                    <div class="logo-container">
                        <ClickGuiToolTip text="About LiquidBounce" placement="left" />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" class="logo-bubble" aria-hidden="true">
                            <path d="M79.9,39.948A39.967,39.967,0,0,0,39.947,0H0V39.948a39.948,39.948,0,1,0,79.9,0Z" fill="var(--accent-color)" fill-rule="evenodd" onclick={() => aboutOpen = !aboutOpen} />
                        </svg>
                    </div>
                    {#if aboutOpen}
                        <AboutPanel onClose={() => aboutOpen = false} iconFilter={iconFilter} />
                    {/if}

                    <nav class="categories" use:smoothScroll>
                        {#each categoryNames as cat}
                            <button class="category-btn" class:active={activeCategory === cat && !searchQuery} onclick={() => setCategory(cat)}>
                                <ClickGuiToolTip text={cat} placement="left" />
                                <img class="icon" src="img/clickgui/icon-{cat.toLowerCase()}.svg" alt={cat} style="filter: {iconFilter};" />
                            </button>
                        {/each}
                    </nav>
                </div>

                <div class="sidebar-bottom">
                    <div class="settings-container">
                        <button class="category-btn" bind:this={settingsBtnEl} onclick={() => settingsOpen = !settingsOpen} class:active={settingsOpen}>
                            <ClickGuiToolTip text="Menu Settings" placement="left" />
                            <img class="icon" src="img/clickgui/icon-gear.svg" alt="settings" style="filter: {iconFilter};" />
                        </button>

                        {#if settingsOpen}
                            <div class="settings-popup" bind:this={settingsPopupEl} transition:fade={{ duration: 300 }}>
                                <div class="popup-title">Menu Settings</div>

                                <button class="context-item" onclick={(e) => { 
                                    e.stopPropagation(); 
                                    settingsOpen = false;
                                    push("/hudeditor"); 
                                }}>
                                    <div class="item-left">
                                        <img src="img/clickgui/icon-style-theme.svg" alt="HUD Customization" style="filter: {iconFilter};" />
                                        <span>HUD Customization</span>
                                    </div>
                                </button>
                                
                                <button class="context-item" onclick={(e) => { 
                                    e.stopPropagation(); 
                                    colorOpen = !colorOpen;
                                }}>
                                    <div class="item-left">
                                        <img src="img/clickgui/icon-palette.svg" alt="Color" style="filter: {iconFilter};" />
                                        <span>Accent Color</span>
                                    </div>
                                    <div class="color-preview-box"></div>
                                </button>

                                <button class="context-item" onclick={(e) => { 
                                    e.stopPropagation(); 
                                    toggleTheme(); 
                                }}>
                                    <div class="item-left">
                                        <img src="img/clickgui/icon-{activeTheme === 'light' ? 'moon-theme' : 'sun-theme'}.svg" alt="Theme" style="filter: {iconFilter};" />
                                        <span>Style ({activeTheme === 'light' ? 'Light' : 'Dark'})</span>
                                    </div>
                                    <div class="theme-toggle" class:light={activeTheme === 'light'}></div>
                                </button>

                                <button class="context-item" onclick={(e) => { 
                                    e.stopPropagation(); 
                                    settingsOpen = false;
                                    setCategory("Changelog"); 
                                }}>
                                    <div class="item-left">
                                        <img src="img/clickgui/icon-changelog.svg" alt="Changelog" style="filter: {iconFilter};" />
                                        <span>Changelog</span>
                                    </div>
                                </button>
                                <button class="context-item" onclick={(e) => {
                                    e.stopPropagation();
                                    keybindsOpen = !keybindsOpen;
                                }}>
                                    <div class="item-left">
                                        <img src="img/hud/keybinds/icon-keybinds.svg" alt="Keybinds" style="filter: {iconFilter};" />
                                        <span>Keybinds</span>
                                    </div>
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>

                {#if colorOpen}
                    <ColorManager onClose={() => colorOpen = false}/>
                {/if}
                {#if keybindsOpen}
                    <ClickGuiKeybinds onClose={() => keybindsOpen = false} />
                {/if}
            </aside>

            <main class="main-content">
                <header class="top-bar" onmousedown={handleMouseDown}>
                    <div class="header-info">
                        <h1 class="page-title">{searchQuery ? 'Search Results' : (activeCategory === "Changelog" ? "Changelog" : "")}</h1>
                        {#if activeCategory !== "Changelog" && !searchQuery}
                            <div class="config-dropdown-wrapper">
                                <button class="config-trigger" bind:this={configBtnEl} onclick={() => configOpen = !configOpen} class:active={configOpen}>
                                    <img src="img/clickgui/icon-cloudconfig.svg" alt="Config" style="filter: {iconFilter};" />
                                    <span>Configs</span>
                                    <svg class="chevron" class:open={configOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </button>
                                {#if configOpen}
                                    <div bind:this={configDropdownEl}>
                                        <ConfigManager onClose={() => configOpen = false} iconFilter={iconFilter} />
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                    {#if activeCategory !== "Changelog"}
                    <div class="search-area" bind:this={searchBoxEl} onclick={(e) => e.stopPropagation()}>
                        {#if searchOpen}
                            <div class="search-box">
                                <img src="img/menu/icon-search.svg" alt="Search" class="search-icon" style="filter: {iconFilter};" />
                                <input 
                                    type="text" 
                                    placeholder="Search modules..." 
                                    bind:value={searchQuery}
                                    bind:this={searchInputEl}
                                    onfocusin={async () => await setTyping(true)}
                                    onfocusout={async () => await setTyping(false)}
                                    onkeydown={async (e) => {
                                        if (e.key === "Escape") {
                                            searchQuery = "";
                                            searchOpen = false;
                                            await setTyping(false);
                                        }
                                    }}
                                    spellcheck="false"
                                />
                            </div>
                        {:else}
                            <button class="search-btn" onclick={toggleSearch} title="Search">
                                <img src="img/menu/icon-search.svg" alt="Search" style="filter: {iconFilter};" />
                            </button>
                        {/if}
                    </div>
                    {/if}
                </header>

                {#if activeCategory === "Changelog"}
                <Changelog />

                {:else}
                <div class="modules-grid" use:smoothScroll={activeCategory + searchQuery}>
                    {#key activeCategory + searchQuery + refreshCounter}
                        {#if displayedModules.length === 0}
                            <div class="no-results">No modules found :(</div>
                        {:else}
                        <div class="col">
                            {#each displayedModules.filter((_, i) => i % 2 === 0) as mod (mod.name)}
                                <ModuleCard 
                                    name={mod.name} 
                                    enabled={mod.enabled} 
                                    description={mod.description} 
                                    aliases={mod.aliases} 
                                />
                            {/each}
                            </div>
                                <div class="col">
                                {#each displayedModules.filter((_, i) => i % 2 === 1) as mod (mod.name)}
                                <ModuleCard 
                                    name={mod.name} 
                                    enabled={mod.enabled} 
                                    description={mod.description} 
                                    aliases={mod.aliases} 
                                />
                                {/each}
                            </div>
                        {/if}
                    {/key}
                </div>
                {/if}
            </main>
        </div>
    </div>
</div>

<style lang="scss">
    .dashboard-gui {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
    }

    .gui-wrapper {
        display: flex;
        gap: 10px;
        width: 100%;
        max-width: 1200px;
        height: 800px;
    }

    .window {
        flex: 1;
        max-width: 1000px;
        height: 100%;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: flex;
        position: relative;
        overflow: visible;
    }

    .sidebar {
        width: 80px;
        background: var(--clickgui-base-color);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-radius: 14px 0 0 14px;
        position: relative;
    }

    .sidebar-top {
        display: flex;
        flex-direction: column;
    }

    .sidebar-bottom {
        padding-bottom: 10px;
        display: flex;
        justify-content: center;
    }

    .settings-container {
        position: relative;
    }

    .settings-popup {
        position: absolute;
        bottom: -10px;
        right: calc(100% + 20px);
        background: var(--clickgui-base-color);
        border-radius: 14px;
        width: 220px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        padding: 6px;
        animation: popAnim 0.4s ease;
    }

    .popup-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-dimmed-color);
        text-transform: uppercase;
        padding: 8px 12px;
        align-self: center;
    }

    .context-item {
        all: unset;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        border: 1px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.4s ease;
        box-sizing: border-box;

        .item-left {
            display: flex;
            align-items: center;
            gap: 10px;

            img {
                width: 16px;
                height: 16px;
                opacity: 0.4;
            }

            span {
                font-size: 14px;
                font-weight: 400;
                color: var(--clickgui-text-color);
            }
        }

        .arrow {
            width: 14px;
            height: 14px;
            color: var(--clickgui-text-dimmed-color);
        }

        &:hover {
            background: var(--clickgui-window-background-color);
            
            img {
                opacity: 1;
                transition: opacity 0.4s;
            }
        }
    }

    .header-info {
        display: flex;
        align-items: center;
        gap: 0px;
    }

    .config-dropdown-wrapper {
        position: relative;
    }

    .config-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        padding: 12px 12px;
        border-radius: 14px;
        color: var(--clickgui-text-color);
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.4s ease;

        img {
            width: 16px;
            height: 16px;
        }

        .chevron {
            width: 16px;
            height: 16px;
            color: var(--clickgui-text-dimmed-color);
            transition: transform 0.4s;
        }

        &:hover {
            background-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
        }

        &.active {
            background: color-mix(in srgb, var(--accent-color) 60%, transparent);
            
            .chevron {
                transform: rotate(-180deg);
            }
        }
    }

    .logo-container {
        padding: 20px 20px;
        display: flex;
        justify-content: center;
    }

    .categories {
        padding: 10px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        overflow-y: auto;
    }

    .category-btn {
        background: transparent;
        border-radius: 14px;
        padding: 14px 14px;
        display: flex;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.4s ease;

        .icon {
            width: 24px;
            height: 24px;
            opacity: 0.4;
            transition: opacity 0.4s, filter 0.4s;
        }

        &:hover {
            transform: scale(1.05);
            background-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
            .icon { opacity: 1; }
        }

        &.active {
            transform: scale(1.05);
            background-color: color-mix(in srgb, var(--accent-color) 80%, transparent);
            .icon { opacity: 1; }
            position: relative;
        }
    }

    .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 0 14px 14px 0;
        background: var(--clickgui-window-background-color);
    }

    .top-bar {
        height: 80px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: grab;
        background: var(--clickgui-base-color);

        &:active { cursor: grabbing; }
    }

    .header-info {
        display: flex;
        align-items: baseline;

        .page-title {
            color: var(--clickgui-text-color);
            font-size: 24px;
            font-weight: 500;
            margin: 0;
        }
    }

    .search-area {
        display: flex;
        align-items: center;
    }

    .search-box {
        display: flex;
        align-items: center;
        background-color: var(--clickgui-window-background-color);
        border: 1px solid color-mix(in srgb, var(--accent-color) 40%, transparent);
        border-radius: 14px;
        padding: 10px 14px;
        width: 240px;
        animation: search-expand 0.4s ease;

        .search-icon {
            width: 18px;
            height: 18px;
            opacity: 1;
            margin-right: 12px;
            flex-shrink: 0;
        }

        input {
            background: transparent;
            border: none;
            color: var(--clickgui-text-color);
            font-size: 16px;
            font-weight: 400;
            width: 100%;
            outline: none;

            &::placeholder {
                color: var(--clickgui-text-dimmed-color);
            }
        }
    }

    .search-btn {
        width: 40px;
        height: 40px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.4s;
        animation: search-collapse 0.4s ease;

        img {
            width: 18px;
            height: 18px;
            opacity: 1;
        }

        &:hover {
            background-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
        }
    }

    @keyframes search-expand {
        from { opacity: 0; width: 40px; }
        to   { opacity: 1; width: 240px; }
    }

    @keyframes search-collapse {
        from { opacity: 0; width: 240px; }
        to   { opacity: 1; width: 40px; }
    }

    .modules-grid {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        align-items: start;

        &::-webkit-scrollbar {
            width: 4px;
        }
        
        &::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 8px;
        }
    }

    .col {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-self: start;
        min-width: 0px;
    }

    .no-results {   
        grid-column: 1 / -1;
        text-align: center;
        color: var(--clickgui-text-dimmed-color);
        padding: 40px;
        margin-top: 30%;
        font-size: 24px;
        font-weight: 500;
    }

    .color-preview-box {
        width: 18px;
        height: 18px;
        border-radius: 6px;
        background-color: var(--accent-color);
        transition: transform 0.4s ease, box-shadow 0.4s ease;
    }

    .context-item:hover .color-preview-box {
        transform: scale(1.1);
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