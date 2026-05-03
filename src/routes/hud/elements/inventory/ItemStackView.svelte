<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {mapToColor} from "../../../../util/color_utils";
    import {itemTextureUrl} from "../../../../integration/rest";

    export let stack: ItemStack | undefined | null;

    $: isAir = !stack || stack.identifier === "minecraft:air";
    
    $: count = stack ? stack.count : 0;
    $: damage = stack ? stack.damage : 0;
    $: maxDamage = stack ? stack.maxDamage : 0;
    $: identifier = stack ? stack.identifier : "minecraft:air";
    $: enchantments = stack ? stack.enchantments : null;

    $: hasDurability = maxDamage > 0;
    $: durabilityPercent = hasDurability ? Math.max(0, Math.min(100, 100 * (maxDamage - damage) / maxDamage)) : 0;
    $: valueColor = hasDurability ? mapToColor(120 * (maxDamage - damage) / maxDamage) : "transparent";
</script>

<div class="item-stack">
    {#if !isAir}
        <div class="icon-wrapper">
            {#if enchantments && Object.keys(enchantments).length > 0}
                <div class="mask" style="mask-image: url({itemTextureUrl(identifier)})"></div>
            {/if}
            <img class="item-icon" src={itemTextureUrl(identifier)} alt={identifier}/>
        </div>

        {#if hasDurability && damage > 0}
            <div class="durability-bar-bg">
                <div class="durability-fill" style="width: {durabilityPercent}%; background-color: {valueColor};"></div>
            </div>
        {/if}

        {#if count > 1 || count <= 0}
            <div class="count" class:zero={count <= 0}>{count}</div>
        {/if}
    {/if}
</div>

<style lang="scss">
    .item-stack {
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-wrapper {
        position: relative;
        width: 26px;
        height: 26px;
    }

    .item-icon {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .mask {
        position: absolute;
        background: radial-gradient(circle, var(--item-enchant-glow-start-color), var(--item-enchant-glow-end-color) 100%);
        mix-blend-mode: screen;
        scale: 105%;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        mask-size: cover;
        z-index: 2;
    }

    .durability-bar-bg {
        position: absolute;
        bottom: -2px;
        left: 2px;
        right: 2px;
        height: 2px;
        background-color: var(--clickgui-base-color);
        border-radius: 4px;
        overflow: hidden;
    }

    .durability-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s ease;
    }

    .count {
        position: absolute;
        bottom: -4px;
        right: -2px;
        font-size: 14px;
        font-weight: bold;
        color: var(--clickgui-text-color);
        z-index: 3;
        font-variant-numeric: tabular-nums;
        font-family: monospace;

        &.zero {
            color: #ff5555;
        }
    }
</style>