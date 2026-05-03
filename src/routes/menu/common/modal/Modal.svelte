<script lang="ts">
    import {fade, fly} from "svelte/transition";
    import {createEventDispatcher} from "svelte";
    import { backOut, backIn } from "svelte/easing";

    export let title: string;
    export let visible: boolean;

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("close");
        visible = false;
    }
</script>

{#if visible}
    <div class="modal-wrapper" transition:fade|global={{duration: 200}}>
        <div class="modal" 
             in:fly|global={{duration: 400, y: 50, easing: backOut}} 
             out:fly|global={{duration: 300, y: 30, easing: backIn}}>
            
            <button class="button-modal-close" on:click={handleClick}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div class="title">{title}</div>

            <div class="content">
                <slot />
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
  .modal-wrapper {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 99999;
  }

  .modal {
    background: var(--clickgui-base-color);
    min-width: 500px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 40px;
    display: flex;
    flex-direction: column;
    border-radius: 24px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  }

  .title {
    color: var(--clickgui-text-color);
    font-size: 28px;
    font-weight: 500;
    position: relative;
    width: max-content;
    align-self: center;
    margin-bottom: 40px;

    &::after {
      content: "";
      position: absolute;
      display: block;
      height: 3px;
      width: 140%;
      background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 10px;
      opacity: 0.8;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    row-gap: 30px;
  }

  .button-modal-close {
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--clickgui-window-background-color);
    border: 1px solid transparent;
    color: var(--menu-text-dimmed-color);
    border-radius: 14px;
    cursor: pointer;
    position: absolute;
    top: 20px;
    right: 20px;
    transition: all 0.4s ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: color-mix(in srgb, var(--error-color) 20%, transparent);
      border-color: var(--error-color);
      color: var(--error-color);
    }
  }

  @media screen and (max-width: 1366px) { .modal { zoom: 0.8; } }
  @media screen and (max-width: 1200px) { .modal { zoom: 0.5; } }
  @media screen and (max-height: 1100px) { .modal { zoom: 0.8; } }
  @media screen and (max-height: 700px) { .modal { zoom: 0.5; } }
  @media screen and (max-height: 540px) { .modal { zoom: 0.4; } }
</style>