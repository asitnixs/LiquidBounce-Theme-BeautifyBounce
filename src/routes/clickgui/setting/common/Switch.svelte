<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let value: boolean;
    export let name: string;

    const dispatch = createEventDispatcher();
</script>

<label class="switch-container">
    <span class="switch">
        <input type="checkbox" bind:checked={value} on:change={() => dispatch("change")}/>
        <span class="slider"></span>
    </span>
    {#if name !== ""}
        <span class="name">{name}</span>
    {/if}
</label>

<style lang="scss">
  .switch-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 6px;
    user-select: none;
  }

  .name {
    font-weight: 500;
    font-size: 12px;
    color: var(--clickgui-text-color);
    transition: color 0.4s;
  }

  .switch {
    position: relative;
    width: 32px;
    height: 18px;
    flex-shrink: 0;

    input { display: none; }
  }

  .slider {
    position: absolute;
    inset: 0;
    background: var(--clickgui-switch-track-color);
    border-radius: 10px;
    transition: background 0.4s ease;

    &::before {
      content: "";
      position: absolute;
      height: 14px;
      width: 14px;
      top: 2px;
      left: 2px;
      border-radius: 50%;
      background: rgb(255, 255, 255);
      transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), background 0.4s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  }

  input:checked + .slider {
    background: var(--accent-color);
  }

  input:checked + .slider::before {
    transform: translateX(14px);
    background: rgb(255, 255, 255);
  }
</style>