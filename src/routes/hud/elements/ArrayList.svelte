<script lang="ts">
    import { onMount, tick } from "svelte";
    import type { Module } from "../../../integration/types";
    import { getModules } from "../../../integration/rest";
    import { listen } from "../../../integration/ws";
    import { getTextWidth } from "../../../integration/text_measurement";
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { convertToSpacedString, spaceSeperatedNames } from "../../../theme/theme_config";

    export let settings: { [name: string]: any };

    const cSettings = settings as HudArrayListSettings;

    let enabledModules: Module[] = [];
    let fontsReady = false;

    function measureWidth(module: Module): number {
        const formattedName = $spaceSeperatedNames
            ? convertToSpacedString(module.name)
            : module.name;

        const fullName =
            module.tag == null || !cSettings.showTags
                ? formattedName
                : formattedName + " " + module.tag;

        return getTextWidth(fullName, "500 15px SFPro");
    }

    async function updateEnabledModules() {
        if (!fontsReady) {
            await document.fonts.ready;
            fontsReady = true;
        }

        const modules = await getModules();
        const visibleModules = modules.filter((m) => m.enabled && !m.hidden);

        const modulesWithWidths = visibleModules.map((module) => ({
            ...module,
            width: measureWidth(module),
        }));

        modulesWithWidths.sort((a, b) =>
            cSettings.order === "Ascending"
                ? a.width - b.width
                : b.width - a.width,
        );

        enabledModules = modulesWithWidths;

        await tick();
    }

    spaceSeperatedNames.subscribe(async () => {
        await updateEnabledModules();
    });

    onMount(async () => {
        await document.fonts.ready;
        fontsReady = true;
        await updateEnabledModules();
    });

    listen("moduleToggle", async () => {
        await updateEnabledModules();
    });

    listen("refreshArrayList", async () => {
        await updateEnabledModules();
    });
</script>

<div class="arraylist">
    {#each enabledModules as { name, tag } (name)}
        <div
            class="module"
            style={cSettings.itemAlignment === "Left" ? "margin-right: auto;" : "margin-left: auto;"}
            animate:flip={{ duration: 300 }}
            transition:fly={{ x: 20, duration: 300, easing: (t) => 1 - Math.pow(1 - t, 3) }}>

            <span class="text">
                {$spaceSeperatedNames ? convertToSpacedString(name) : name}
            </span>

            {#if tag && cSettings.showTags}
                <span class="tag">{tag}</span>
            {/if}
        </div>
    {/each}
</div>

<style lang="scss">
    .module {
        background-color: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        padding: 6px 6px;
        width: max-content;
        position: relative;
    }

    .module::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        right: -1px;
        width: 2px;
        background: var(--accent-color);
        box-shadow: 0 0 6px color-mix(in srgb, var(--accent-color) 80%, transparent);
    }

    .text {
        color: var(--clickgui-text-color);
        text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
        font-size: 15px;
        font-weight: 500;
    }

    .tag {
        color: var(--clickgui-text-dimmed-color);
        text-shadow: 0 0 6px color-mix(in srgb, var(--clickgui-text-dimmed-color) 40%, transparent);
        font-size: 15px;
        font-weight: 500;
    }
</style>