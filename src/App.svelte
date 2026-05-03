<script lang="ts">
    import Router, {push} from "svelte-spa-router";
    import Hud from "./routes/hud/Hud.svelte";
    import {getMetadata, getTheme, getVirtualScreen} from "./integration/rest";
    import {cleanupListeners, listenAlways} from "./integration/ws";
    import {onMount} from "svelte";
    import {insertPersistentData} from "./integration/persistent_storage";
    import {isStatic} from "./integration/host";
    import Inventory from "./routes/inventory/Inventory.svelte";
    import Title from "./routes/menu/title/Title.svelte";
    import Multiplayer from "./routes/menu/multiplayer/Multiplayer.svelte";
    import AltManager from "./routes/menu/altmanager/AltManager.svelte";
    import Singleplayer from "./routes/menu/singleplayer/Singleplayer.svelte";
    import ProxyManager from "./routes/menu/proxymanager/ProxyManager.svelte";
    import None from "./routes/none/None.svelte";
    import Disconnected from "./routes/menu/disconnected/Disconnected.svelte";
    import Browser from "./routes/browser/Browser.svelte";
    import TabbedClickGui from "./routes/clickgui/TabbedClickGui.svelte";
    import {intToRgba, rgbaToHex} from "./integration/util";
    import type {ThemeColorChangeEvent} from "./integration/events";
    import HudEditor from "./routes/hudeditor/HudEditor.svelte";

    const routes = {
        "/clickgui": TabbedClickGui,
        "/hudeditor": HudEditor,
        "/hud": Hud,
        "/inventory": Inventory,
        "/title": Title,
        "/multiplayer": Multiplayer,
        "/altmanager": AltManager,
        "/singleplayer": Singleplayer,
        "/proxymanager": ProxyManager,
        "/none": None,
        "/disconnected": Disconnected,
        "/browser": Browser
    };

    const SURFACE_TINT_MIX = 18;

    async function changeRoute(name: string) {
        cleanupListeners();
        console.log(`[Router] Redirecting to ${name}`);
        await push(`/${name}`);
    }

    function setThemeColor(name: string, value: string) {
        document.documentElement.style.setProperty(`--${name}`, value);
    }

    function themeColorToHex(value: number) {
        return rgbaToHex(intToRgba(value));
    }

    function mixColors(leftColor: string, rightColor: string, strength: number) {
        return `color-mix(in srgb, ${leftColor} ${100 - strength}%, ${rightColor})`;
    }

    function applyAccentColor(color: number) {
        if (localStorage.getItem("custom_accent_color")) return;

        const hexColor = themeColorToHex(color);
        setThemeColor("accent-color", hexColor);
        localStorage.setItem("cached_accent_color", hexColor);
    }

    function applyTintColor(defaultSurfaceColor: string, color: number) {
        const hexColor = mixColors(defaultSurfaceColor, themeColorToHex(color), SURFACE_TINT_MIX);
        setThemeColor("surface-color", hexColor);
        localStorage.setItem("cached_surface_color", hexColor);
    }

    onMount(async () => {
        let metadata = await getMetadata();
        let defaultSurfaceColor = metadata.colors.Tint;

        let theme = await getTheme(metadata.id);

        applyAccentColor(theme.colors.accent);

        const customColor = localStorage.getItem("custom_accent_color");
        if (customColor) {
            setThemeColor("accent-color", customColor);
        }
        
        applyTintColor(defaultSurfaceColor, theme.colors.tint);

        const savedTheme = localStorage.getItem("liquidbounce_selected_theme") || "dark";
        document.documentElement.classList.add(`clickgui-theme-${savedTheme}`);

        await insertPersistentData();

        window.addEventListener("storage", (e) => {
            if (e.key === "custom_accent_color" && e.newValue) {
                setThemeColor("accent-color", e.newValue);
            }
            if (e.key === "liquidbounce_selected_theme" && e.newValue) {
                document.documentElement.classList.remove("clickgui-theme-light", "clickgui-theme-dark");
                document.documentElement.classList.add(`clickgui-theme-${e.newValue}`);
            }
        });

        listenAlways("themeColorChange", async (event: ThemeColorChangeEvent) => {
            if (event.themeId !== metadata?.id) {
                return;
            }

            switch (event.name) {
                case "Accent":
                    applyAccentColor(event.value);
                    break;
                case "Tint":
                    applyTintColor(defaultSurfaceColor, event.value);
                    break;
            }
        });

        if (isStatic) {
            return;
        }

        listenAlways("socketReady", async () => {
            const virtualScreen = await getVirtualScreen();
            await changeRoute(virtualScreen.name || "none");
        });

        listenAlways("virtualScreen", async (event: any) => {
            console.log(`[Router] Virtual screen change to ${event.screenName}`);
            const action = event.action;

            switch (action) {
                case "close":
                    await changeRoute("none");
                    break;
                case "open":
                    await changeRoute(event.screenName || "none");
                    break;
            }
        });

        const virtualScreen = await getVirtualScreen();
        await changeRoute(virtualScreen.name || "none");
    });
</script>

<main>
    <Router {routes}/>
</main>
