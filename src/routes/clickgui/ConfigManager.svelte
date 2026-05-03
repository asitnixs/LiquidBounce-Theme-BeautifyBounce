<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { getModuleSettings, setModuleSettings, getModules, setModuleEnabled } from "../../integration/rest";

    export let onClose: () => void;
    export let iconFilter: string = "none";

    const REPO_API = "https://api.github.com/repos/CCBlueX/LiquidCloud/contents/LiquidBounce/settings/nextgen";

    interface CloudConfig {
        name: string;
        download_url: string;
        displayName: string;
    }

    let configs: CloudConfig[] = [];
    let loading = true;
    let error = "";
    let loadingConfig: string | null = null;
    let successConfig: string | null = null;
    let searchQuery = "";
    let customConfigUrl = "";
    let isApplyingCustom = false;

    $: filtered = configs.filter(c =>
        c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    onMount(async () => {
    const CACHE_KEY = "lb_cloud_configs_cache";
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < 1000 * 60 * 60) {
                    configs = parsedCache.configs;
                    loading = false;
                    return;
                }
            }

            const res = await fetch(REPO_API);
            if (!res.ok) throw new Error("Rate Limit");
            
            const data = await res.json();
            configs = data
                .filter((f: any) => f.name.endsWith(".json"))
                .map((f: any) => ({
                    name: f.name,
                    download_url: f.download_url,
                    displayName: f.name.replace(".json", "")
                }));

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                configs
            }));
            
        } catch (e) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                configs = JSON.parse(cached).configs;
            } else {
                error = "GitHub Rate Limit exceeded. Try again later.";
            }
        } finally {
            loading = false;
        }
    });

    async function loadConfig(config: CloudConfig) {
        loadingConfig = config.name;
        successConfig = null;
        error = "";

        const rawUrl = `https://raw.githubusercontent.com/CCBlueX/LiquidCloud/main/LiquidBounce/settings/nextgen/${config.name}`;
        const result = await applyConfigFromUrl(rawUrl);

        if (result.success) {
            successConfig = config.name;
            setTimeout(() => successConfig = null, 2500);
        } else {
            error = "Failed to apply config";
            setTimeout(() => error = "", 3000);
        }

        loadingConfig = null;
    }

    async function loadCustomConfig() {
        if (!customConfigUrl.trim()) return;

        isApplyingCustom = true;
        error = "";

        const result = await applyConfigFromUrl(customConfigUrl);

        if (result.success) {
            successConfig = "Custom URL";
            setTimeout(() => successConfig = null, 2500);
        } else {
            error = "Failed to apply config from URL";
        }

        isApplyingCustom = false;
    }

    export async function applyConfigFromUrl(directJsonUrl: string) {
        try {
            let fetchUrl = directJsonUrl.trim();

            if (fetchUrl.includes("github.com") && !fetchUrl.includes("raw.githubusercontent.com")) {
                fetchUrl = fetchUrl
                    .replace("github.com", "raw.githubusercontent.com")
                    .replace("/blob/", "/");
            }

            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const modulesToApply: { name: string; value: any[] }[] = [];

            const extractFromArray = (arr: any[]) => {
                for (const item of arr) {
                    if (item && typeof item.name === "string" && Array.isArray(item.value)) {
                        modulesToApply.push({ name: item.name, value: item.value });
                    }
                }
            };

            const extractFromDict = (dict: any) => {
                const ignored = ["name", "author", "version", "description", "date", "clientversion", "spoofer"];
                for (const [key, val] of Object.entries(dict)) {
                    if (ignored.includes(key.toLowerCase())) continue;
                    if (key.toLowerCase() === "value" && Array.isArray(val)) {
                        extractFromArray(val);
                        continue;
                    }
                    if (Array.isArray(val)) {
                        modulesToApply.push({ name: key, value: val });
                    } else if (val && typeof val === "object" && Array.isArray((val as any).value)) {
                        modulesToApply.push({ name: key, value: (val as any).value });
                    }
                }
            };

            if (Array.isArray(data)) {
                extractFromArray(data);
            } else if (data && typeof data === "object") {
                if (data.modules) {
                    Array.isArray(data.modules) ? extractFromArray(data.modules) : extractFromDict(data.modules);
                } else {
                    extractFromDict(data);
                }
            }

            if (modulesToApply.length === 0) throw new Error("No modules found in config");

            function deepMergeSettings(targetArray: any[], sourceArray: any[]) {
                for (const sourceItem of sourceArray) {
                    if (typeof sourceItem !== "object" || sourceItem === null || !sourceItem.name) continue;

                    const targetItem = targetArray.find((t: any) => t.name === sourceItem.name);
                    if (!targetItem) continue;

                    if (sourceItem.active !== undefined) {
                        targetItem.active = sourceItem.active;
                    }

                    if (sourceItem.value !== undefined) {
                        if (Array.isArray(targetItem.value) && Array.isArray(sourceItem.value)) {
                            if (sourceItem.value.length > 0 && typeof sourceItem.value[0] === "object" && "name" in sourceItem.value[0]) {
                                deepMergeSettings(targetItem.value, sourceItem.value);
                            } else {
                                targetItem.value = sourceItem.value;
                            }
                        } else {
                            targetItem.value = sourceItem.value;
                        }
                    }

                    if (targetItem.choices && typeof targetItem.choices === "object" &&
                        sourceItem.choices && typeof sourceItem.choices === "object") {
                        for (const choiceKey in sourceItem.choices) {
                            if (targetItem.choices[choiceKey] && sourceItem.choices[choiceKey]) {
                                const tv = targetItem.choices[choiceKey].value;
                                const sv = sourceItem.choices[choiceKey].value;
                                if (Array.isArray(tv) && Array.isArray(sv)) {
                                    deepMergeSettings(tv, sv);
                                }
                            }
                        }
                    }
                }
            }

            const allClientModules = await getModules();
            for (const mod of allClientModules) {
                if (mod.category.toLowerCase() === "render" || mod.category.toLowerCase() === "client") continue;
                if (mod.enabled) await setModuleEnabled(mod.name, false);
            }

            let appliedCount = 0;
            for (const mod of modulesToApply) {
                try {
                    const currentSettings = await getModuleSettings(mod.name);
                    const configEnabledObj = mod.value.find((s: any) => s.name === "Enabled");
                    const shouldBeEnabled = configEnabledObj !== undefined ? configEnabledObj.value : false;
                    const currentEnabledObj = currentSettings.value.find((s: any) => s.name === "Enabled");
                    const isCurrentlyEnabled = currentEnabledObj ? currentEnabledObj.value : false;

                    if (isCurrentlyEnabled !== shouldBeEnabled) {
                        await setModuleEnabled(mod.name, shouldBeEnabled);
                    }

                    deepMergeSettings(currentSettings.value, mod.value);
                    await setModuleSettings(mod.name, currentSettings);
                    appliedCount++;
                } catch {}
            }

            window.dispatchEvent(new CustomEvent("configLoaded"));
            return { success: true, count: appliedCount };

        } catch (err) {
            return { success: false, error: err };
        }
    }
</script>

<div class="config-dropdown-panel" transition:fly={{ y: 10, duration: 250, easing: quintOut }} on:click|stopPropagation>
    <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search configs..." bind:value={searchQuery} spellcheck="false" />
    </div>

    <div class="custom-url-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        <input type="text" placeholder="Paste config URL..." bind:value={customConfigUrl} spellcheck="false" />
        <button class="action-btn load" on:click={loadCustomConfig} disabled={isApplyingCustom || customConfigUrl.trim() === ""}>
            {#if isApplyingCustom}
                <span class="btn-spinner"></span>
            {:else if successConfig === "Custom URL"}
                ✓
            {:else}
                Load
            {/if}
        </button>
    </div>

    <div class="config-list">
        {#if loading}
            <div class="state-msg"><div class="spinner"></div><span>Loading...</span></div>
        {:else if error}
            <div class="state-msg error">{error}</div>
        {:else if filtered.length === 0}
            <div class="state-msg">Nothing found</div>
        {:else}
            {#each filtered as config (config.name)}
                <div class="config-item" class:success={successConfig === config.name}>
                    <div class="config-name">{config.displayName}</div>
                    <button class="action-btn" class:loading={loadingConfig === config.name} on:click={() => loadConfig(config)} disabled={loadingConfig !== null}>
                        {#if loadingConfig === config.name}
                            <span class="btn-spinner"></span>
                        {:else if successConfig === config.name}
                            ✓
                        {:else}
                            Load
                        {/if}
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">
    .config-dropdown-panel {
        position: absolute;
        top: calc(100% + 8px);
        left: -10px;
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 14px;
        width: 300px;
        max-height: 400px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 99999;
        overflow: hidden;
    }

    .icon {
        width: 16px;
        height: 16px;
        color: var(--clickgui-text-dimmed-color);
        flex-shrink: 0;
    }

    .search-bar, .custom-url-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px 10px 0;
        background: var(--clickgui-window-background-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 8px;
        padding: 8px 10px;
        transition: border-color 0.4s;

        &:focus-within {
            border-color: var(--accent-color);
        }

        input {
            background: transparent;
            border: none;
            outline: none;
            color: var(--clickgui-text-color);
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            &::placeholder { color: var(--clickgui-text-dimmed-color); }
        }
    }

    .custom-url-bar {
        margin-bottom: 10px;
        padding-right: 4px;
    }

    .config-list {
        flex: 1;
        overflow-y: auto;
        padding: 0 10px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb { background: var(--accent-color); border-radius: 8px; }
    }

    .state-msg {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 30px;
        color: var(--clickgui-text-dimmed-color);
        font-size: 12px;
        font-weight: 500;

        &.error { color: #EF4444; }
    }

    .config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 6px 6px 10px;
        border-radius: 8px;
        transition: background 0.4s;

        &:hover {
            background: var(--clickgui-window-background-color);
        }

        &.success {
            background: color-mix(in srgb, var(--success-color) 20%, transparent);
        }
    }

    .config-name {
        font-size: 14px;
        font-weight: 400;
        color: var(--clickgui-text-color);
        text-transform: capitalize;
    }

    .action-btn {
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        padding: 4px 10px;
        transition: all 0.4s;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--clickgui-window-background-color);
        color: var(--clickgui-text-color);
        border: 1px solid var(--clickgui-border-color);

        svg {
            width: 14px;
            height: 14px;
        }

        &:hover:not(:disabled) {
            background: var(--accent-color);
            border-color: var(--accent-color);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    .spinner {
        width: 24px; height: 24px;
        border: 3px solid rgba(128,128,128,0.2);
        border-top-color: var(--accent-color);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    .btn-spinner {
        width: 12px; height: 12px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
</style>