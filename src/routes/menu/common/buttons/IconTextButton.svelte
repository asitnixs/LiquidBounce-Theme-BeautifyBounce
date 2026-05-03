<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let title: string;
    export let icon: string;
    export let disabled = false;

    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<button class="icon-text-button" on:click={() => dispatch("click")} {disabled}>
    <div class="icon">
        <img src="img/menu/{icon}" alt={title}>
    </div>
    <div class="title">{title}</div>
</button>

<style lang="scss">
    .icon-text-button {
      display: flex;
      border: none;
      background: transparent;
      border-radius: 12px;
      padding: 6px 16px 6px 6px;
      align-items: center;
      gap: 10px;
      transition: all 0.4s ease;
      cursor: pointer;

      &:not([disabled]):hover {
        background: var(--clickgui-window-background-color);
      }

      &[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .icon {
      height: 44px;
      width: 44px;
      background-color: var(--accent-color);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-color) 40%, transparent);
      
      img {
        width: 20px;
        height: 20px;
      }
    }

    .title {
      font-size: 18px;
      font-weight: 500;
      color: var(--clickgui-text-color);
    }
</style>