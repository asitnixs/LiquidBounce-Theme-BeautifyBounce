<script lang="ts">
    export let max: number;
    export let value: number;
    export let color: string;
    export let alignRight: boolean;

    export let label: string | null = null;
    export let icon: string | null = null;

    export let showText: boolean = true;
    export let showPercent: boolean = false;

    $: percentage = Math.max(0, Math.min(100, (value / max) * 100));
    $: displayValue = Math.ceil(value);
    $: displayMax = Math.ceil(max);
</script>

<div class="progress" class:align-right={alignRight}>
    {#if showText}
        <div class="label">
            {#if label}
                {label}
            {:else if showPercent}
                {Math.floor(percentage)}%
            {:else}
                {displayValue} / {displayMax}
            {/if}
        </div>
    {/if}
    {#if icon}
        <img class="icon" src="img/hud/hotbar/icon-{icon}.svg" alt={icon}>
    {/if}
    <div
            class:align-right={alignRight}
            class="progress-bar"
            style="width: {Math.floor(
            (value / max) * 100,
        )}%; background-color: {color};"
    ></div>
</div>

<style lang="scss">

  .label {
    color: var(--clickgui-text-color);
    position: absolute;
    font-size: 12px;
    font-weight: 500;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    font-variant-numeric: tabular-nums;
  }

  .icon {
    position: absolute;
    left: 6px;
    top: 50%;
    transform: translateY(-50%);
  }

  .progress {
    position: relative;
    border-radius: 8px;
    background-color: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);

    &.align-right {
      .label {
        left: 6px;
        right: unset;
      }

      .icon {
        right: 6px;
        left: unset;
      }
    }
  }

  .progress-bar {
    border-radius: 8px;
    height: 18px;
    will-change: width;
    transition: ease width 0.4s;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);

    &.align-right {
      margin-left: auto;
    }
  }
</style>
