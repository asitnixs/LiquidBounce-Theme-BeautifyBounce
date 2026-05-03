<script lang="ts">
    import { getSavedTheme } from "../../../../theme/clickgui_theme";

    export let icon: string;
    export let title: string;
    export let type = "text";
    export let value = "";
    export let maxLength: number | null = null;
    export let pattern: string | null = null;

    let activeTheme = getSavedTheme();
    $: iconFilter = activeTheme === "light" ? "brightness(0)" : "none";
</script>

<div class="icon-text-input">
    <div class="icon">
        <img src="img/menu/icon-{icon}.svg" alt={icon} style="filter: {iconFilter};">
    </div>
    {#if type === "text"}
        <input {pattern} maxlength={maxLength} class="input" spellcheck="false" type="text" placeholder={title} bind:value={value} autocomplete="off">
    {:else if type === "password"}
        <input {pattern} maxlength={maxLength} class="input" type="password" placeholder={title} bind:value={value} autocomplete="off">
    {/if}
    <div class="button-container">
        <slot />
    </div>
</div>

<style lang="scss">
  .icon-text-input {
    display: flex;
    background: var(--clickgui-base-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.4s ease;

    &:focus-within {
        border-color: var(--accent-color);
        box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color) 40%, transparent);

        .icon { background-color: var(--accent-color); }
        .icon img { filter: brightness(0) invert(1); }
    }
  }

  .icon {
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--clickgui-window-background-color);
    transition: all 0.4s ease;

    img {
        width: 20px;
        height: 20px;
        opacity: 0.8;
        transition: all 0.4s ease;
    }
  }

  .input {
    flex: 1;
    color: var(--clickgui-text-color);
    font-size: 16px;
    background-color: transparent;
    border: none;
    padding: 16px 12px;
    outline: none;

    &::placeholder { color: var(--clickgui-text-dimmed-color); }
    &:invalid { color: var(--error-color); }
  }

  .button-container {
    display: flex;
    align-items: center;
    padding-right: 8px;
  }
</style>