<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let value: boolean;
    export let title: string;

    const dispatch = createEventDispatcher();
</script>

<label class="switch-setting">
    <span class="switch">
        <input type="checkbox" bind:checked={value} on:change={() => dispatch("change")}/>
        <span class="slider"></span>
    </span>

    <span class="title">{title}</span>
</label>

<style lang="scss">
  .switch-setting {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 12px;
  }

  .title {
    color: var(--clickgui-text-color);
    font-size: 16px;
    margin-left: 10px;
    font-weight: 500;
  }

  .slider {
    position: absolute;
    inset: 0;
    background: var(--clickgui-switch-track-color);
    transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    border-radius: 12px;

    &::before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      top: 3px;
      left: 3px;
      background-color: #ffffff;
      transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
      border-radius: 50%;
    }
  }

  .switch {
    position: relative;
    display: flex;
    width: 44px;
    height: 24px;
    align-items: center;

    input { display: none; }

    input:checked + .slider {
      background-color: var(--accent-color);
    }

    input:checked + .slider::before {
      transform: translateX(20px);
      background: rgb(255, 255, 255);
    }
  }
</style>