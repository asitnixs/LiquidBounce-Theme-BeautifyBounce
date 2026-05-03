<script lang="ts">
    import { listen } from "../../../integration/ws";
    import type { ClientPlayerDataEvent } from "../../../integration/events";
    import { getClientInfo, getSession, getServers, getModules } from "../../../integration/rest";
    import type { ClientInfo, Session, Server } from "../../../integration/types";
    import { fade } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";
    import { getSavedTheme } from "../../../theme/clickgui_theme";

    export let settings: { [name: string]: any } = {};

    let clientInfo: ClientInfo | null = null;
    let session: Session | null = null;

    let showUsername = true;
    let protectedName = "Protected";

    export let editMode = false;
    
    let x = 0, y = 0, z = 0;

    let activeTheme = getSavedTheme();
    $: iconFilter = activeTheme === "light" ? "brightness(0)" : "none";

    $: show = (settings?.show as string[] | undefined) ?? ["Username", "FPS", "Coords"];
    $: showNick   = show.includes("Username");
    $: showCoords = show.includes("Coords");
    $: showFps    = show.includes("FPS");

    onMount(async () => {
        await updateClientInfo();
        await updateSession();
        await updateShowUsername();
        setInterval(async () => {
            await updateClientInfo();
            await updateSession();
            await updateShowUsername();
        }, 1000);

        window.addEventListener("storage", handleStorageChange);
    });

    onDestroy(() => {
        window.removeEventListener("storage", handleStorageChange);
    });

    function handleStorageChange(e: StorageEvent) {
        if (e.key === "liquidbounce_selected_theme") {
            activeTheme = (e.newValue as any) || "dark";
        }
    }

    listen("clientPlayerData", (e: ClientPlayerDataEvent) => {
        if (editMode) return;
        x = Math.floor(e.playerData.position.x);
        y = Math.floor(e.playerData.position.y);
        z = Math.floor(e.playerData.position.z);
    });

    async function updateClientInfo() {
        clientInfo = await getClientInfo();
    }

    async function updateSession() {
        session = await getSession();
    }

    async function updateShowUsername() {
        const modules = await getModules();
        const np = modules.find(m => m.name === "NameProtect");
        showUsername = !(np && np.enabled);
    }

    listen("session", async () => {
        await updateSession();
    });

    $: dispX = editMode ? 74 : x;
    $: dispY = editMode ? -60 : y;
    $: dispZ = editMode ? -241 : z;
    $: dispFps = editMode ? 120 : (clientInfo?.fps ?? 0);

    $: visibleSections = [showNick, showFps, showCoords].filter(Boolean).length;
</script>

<div class="coordinates-info" transition:fade={{ duration: 300 }}>
    {#if showNick && session}
        <div class="value" style="display:flex;align-items:center;gap:4px;">
            <img class="info-icon" src="img/hud/information/icon-user.svg" alt="user" style="filter: {iconFilter};">
            {showUsername ? session.username : protectedName}
        </div>
    {/if}

    {#if showNick && session && (showFps || showCoords)}
        <span class="dot"></span>
    {/if}

    {#if showFps}
        <div class="fps-wrap">
            <span class="value">{dispFps}</span>
            <span class="unit">FPS</span>
        </div>
    {/if}

    {#if showFps && showCoords}
        <span class="dot"></span>
    {/if}

    {#if showCoords}
        <div class="coords-wrap">
            <img class="info-icon" src="img/hud/information/icon-coords.svg" alt="coords" style="filter: {iconFilter};">
            <span class="value">{dispX} {dispY} {dispZ}</span>
        </div>
    {/if}
</div>

<style lang="scss">
    .coordinates-info {
        display: flex;
        align-items: center;
        gap: 6px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        padding: 10px 10px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        width: max-content;
        animation: popAnim 0.4s ease;
    }

    .info-icon {
        width: 16px;
        height: 16px;
    }

    .value {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-color);
        font-variant-numeric: tabular-nums;
        text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
    }

    .fps-wrap {
        display: flex;
        align-items: baseline;
        gap: 4px;
    }

    .unit {
        font-size: 12px;
        font-weight: 500;
        color: var(--clickgui-text-dimmed-color);
    }

    .coords-wrap {
        display: flex;
        align-items: center;
        gap: 4px;
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