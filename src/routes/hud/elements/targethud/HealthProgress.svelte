<script lang="ts">
    export let maxHealth: number;
    export let health: number;

    $: percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));

    $: barColor =
        percentage > 50
            ? "var(--success-color)"
            : percentage > 25
              ? "var(--warning-color)"
              : "var(--error-color)";
</script>

<div class="health-progress-wrapper">
    <div class="health-progress-bg">
        <div
            class="damage-trail"
            style="width: {percentage}%; background-color: color-mix(in srgb, {barColor} 40%, transparent);"
        ></div>

        <div
            class="health-progress-fill"
            style="width: {percentage}%; background-color: {barColor}; box-shadow: 0 0 8px color-mix(in srgb, {barColor} 60%, transparent);"
        ></div>
    </div>
</div>

<style lang="scss">
    .health-progress-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
    }

    .health-progress-bg {
        position: relative;
        width: 100%;
        height: 4px;
        background-color: var(--clickgui-base-color);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .damage-trail {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: 8px;
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, background-color 0.3s ease;
        z-index: 1;
    }

    .health-progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: 8px;
        transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
        z-index: 2;
    }
</style>
