<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {itemTextureUrl} from "../../../../integration/rest";
    import {mapToColor} from "../../../../util/color_utils";

    export let itemStack: ItemStack;

    $: hasDurability = itemStack.maxDamage && itemStack.maxDamage > 0;
    
    $: durabilityPercent = hasDurability 
        ? Math.max(0, Math.min(100, 100 * (itemStack.maxDamage - itemStack.damage) / itemStack.maxDamage)) 
        : 0;
        
    $: color = hasDurability 
        ? mapToColor(120 * (itemStack.maxDamage - itemStack.damage) / itemStack.maxDamage) 
        : "transparent";
</script>

<div class="armor-status">
        {#if itemStack!.enchantments && Object.keys(itemStack!.enchantments).length > 0}
            <div class="mask" style="mask-image: url({itemTextureUrl(itemStack!.identifier)})"></div>
        {/if}
    <img class="icon" src={itemTextureUrl(itemStack.identifier)} alt={itemStack.identifier} />
    
    {#if hasDurability}
        <div class="durability-bar">
            <div class="durability-fill" style="width: {durabilityPercent}%; background-color: {color};"></div>
        </div>
    {/if}
</div>

<style lang="scss">
    .armor-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    .icon {
        height: 18px;
        width: 18px;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
    }

    .durability-bar {
        width: 20px;
        height: 4px;
        background-color: var(--clickgui-base-color);
        border-radius: 4px;
        overflow: hidden;
    }

    .durability-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s ease;
    }
</style>