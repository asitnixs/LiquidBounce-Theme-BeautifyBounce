<script lang="ts">
    import ArmorStatus from "./ArmorStatus.svelte";
    import {listen} from "../../../../integration/ws.js";
    import type {PlayerData} from "../../../../integration/types";
    import {REST_BASE} from "../../../../integration/host";
    import {fade} from "svelte/transition";
    import HealthProgress from "./HealthProgress.svelte";
    import type {TargetChangeEvent, ClientPlayerDataEvent} from "../../../../integration/events";

    let target: PlayerData | null = null;
    let localPlayer: PlayerData | null = null;
    let visible = true;
    let hideTimeout: ReturnType<typeof setTimeout>;

    export let editMode = false;

    function startHideTimeout() {
        hideTimeout = setTimeout(() => {
            if (!editMode) visible = false;
        }, 1000);
    }

    listen("targetChange", (data: TargetChangeEvent) => {
        target = data.target;
        visible = true;
        clearTimeout(hideTimeout);
        startHideTimeout();
    });

    listen("clientPlayerData", (data: ClientPlayerDataEvent) => {
        localPlayer = data.playerData;
    });

    $: hasItems = target !== null && (
        (target.mainHandStack && target.mainHandStack.identifier !== "minecraft:air") || 
        (target.armorItems && target.armorItems.some(i => i.count > 0))
    );

    $: distance = (target && localPlayer) ? 
        Math.hypot(
            target.position.x - localPlayer.position.x,
            target.position.y - localPlayer.position.y,
            target.position.z - localPlayer.position.z
        ).toFixed(1) : "0.0";

    function getArmorValue(identifier: string | undefined): number {
        if (!identifier) return 0;
        const id = identifier.toLowerCase();
        
        if (id.includes('leather_helmet') || id.includes('leather_boots') || id.includes('golden_boots') || id.includes('chainmail_boots')) return 1;
        if (id.includes('leather_leggings') || id.includes('golden_helmet') || id.includes('iron_helmet') || id.includes('iron_boots') || id.includes('chainmail_helmet') || id.includes('turtle_helmet')) return 2;
        if (id.includes('leather_chestplate') || id.includes('diamond_helmet') || id.includes('diamond_boots') || id.includes('golden_leggings') || id.includes('netherite_helmet') || id.includes('netherite_boots')) return 3;
        if (id.includes('chainmail_leggings')) return 4;
        if (id.includes('iron_leggings') || id.includes('golden_chestplate') || id.includes('chainmail_chestplate')) return 5;
        if (id.includes('iron_chestplate') || id.includes('diamond_leggings') || id.includes('netherite_leggings')) return 6;
        if (id.includes('diamond_chestplate') || id.includes('netherite_chestplate')) return 8;
        
        return 0;
    }

    $: calculatedArmor = target?.armorItems?.reduce((acc, item) => acc + (item.count > 0 ? getArmorValue(item.identifier) : 0), 0) || 0;
    $: displayArmor = (target && target.armor > 0) ? target.armor : calculatedArmor;

    $: if (editMode && !target) {
        visible = true;
        target = {
            username: "PreviewTarget123",
            uuid: "8667ba71-b85a-4004-af54-457a9734eed7",
            maxHealth: 20,
            actualHealth: 12,
            absorption: 4,
            armor: 0,
            position: { x: 5, y: 0, z: 0 },
            mainHandStack: { identifier: "minecraft:diamond_sword", count: 1, damage: 950, maxDamage: 1561, displayName: "Diamond Sword" },
            armorItems: [
                { identifier: "minecraft:diamond_boots", count: 1, damage: 196, maxDamage: 429, displayName: "Diamond Boots" },
                { identifier: "minecraft:diamond_leggings", count: 1, damage: 109, maxDamage: 495, displayName: "Diamond Leggings" },
                { identifier: "minecraft:leather_chestplate", count: 1, damage: 201, maxDamage: 528, displayName: "Leather Chestplate" },
                { identifier: "minecraft:diamond_helmet", count: 1, damage: 146, maxDamage: 363, displayName: "Diamond Helmet" }
            ]
        } as PlayerData;
        localPlayer = { position: { x: 0, y: 0, z: 0 } } as PlayerData;
    }
</script>

{#if visible && target != null}
    <div class="targethud-container" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
        
        <div class="header">
            <span class="title">{target.username}</span>
            <div class="distance-badge">
                <span class="val">{distance}</span>
                <span class="unit">m</span>
            </div>
        </div>

        <div class="content">
            <div class="avatar-wrapper">
                <img src="{REST_BASE}/api/v1/client/resource/skin?uuid={target.uuid}" alt="avatar" />
            </div>
    
            <div class="info-column">
                <div class="bars-container">
                    <HealthProgress maxHealth={target.maxHealth + target.absorption} health={target.actualHealth + target.absorption} />

                    {#if displayArmor > 0}
                        <div class="armor-progress-bg">
                            <div class="armor-progress-fill" 
                                 style="width: {Math.min(100, (displayArmor / 20) * 100)}%;">
                            </div>
                        </div>
                    {/if}
                </div>

                {#if hasItems}
                    <div class="equipped-items">
                        {#if target.mainHandStack && target.mainHandStack.identifier !== "minecraft:air"}
                            <ArmorStatus itemStack={target.mainHandStack} />
                        {/if}
                        
                        {#each [3, 2, 1, 0] as i}
                            {#if target.armorItems && target.armorItems[i] && target.armorItems[i].count > 0}
                                <ArmorStatus itemStack={target.armorItems[i]} />
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .targethud-container {
        display: flex;
        flex-direction: column;
        width: 250px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        animation: popAnim 0.4s ease;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
    }

    .title {
        color: var(--clickgui-text-color);
        font-size: 16px;
        font-weight: 500;
        text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }

    .distance-badge {
        display: flex;
        align-items: baseline;

        .val {
            font-size: 12px;
            font-weight: 400;
            color: var(--clickgui-text-color);
            font-variant-numeric: tabular-nums;
        }

        .unit {
            font-size: 12px;
            font-weight: 500;
            color: var(--clickgui-text-dimmed-color);
        }
    }

    .content {
        padding: 4px 12px 12px 12px;
        display: flex;
        gap: 12px;
    }

    .avatar-wrapper {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        position: relative;
        overflow: hidden;
        background-color: var(--clickgui-base-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        flex-shrink: 0;
        
        img {
            position: absolute;
            scale: 5.5;
            left: 100px;
            top: 100px;
            image-rendering: pixelated;
        }
    }

    .info-column {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }

    .bars-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .armor-progress-bg {
        width: 100%;
        height: 4px;
        background-color: var(--clickgui-base-color);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
    }

    .armor-progress-fill {
        height: 100%;
        border-radius: 8px;
        background: linear-gradient(90deg, #4A5BFF, #6B7CFF);
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 6px rgba(90, 110, 255, 0.5);
    }

    .equipped-items {
        display: flex;
        gap: 6px;
        align-items: flex-end;
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