<script lang="ts">
    import { fly } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";

    let { text, placement = "left", color = "var(--tooltip-background-color)" } = $props<{
        text: string;
        placement?: "top" | "left" | "right";
        color?: string;
    }>();

    let element: HTMLElement | undefined = $state();
    let tooltipNode: HTMLElement | undefined = $state();
    let shown = $state(false);
    let topPos = $state(0);
    let leftPos = $state(0);

    function updatePosition() {
        if (!element) return;
        
        const parent = element.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        
        if (placement === "left") {
            topPos = rect.top + (rect.height / 2);
            leftPos = rect.left - 15;
        } else if (placement === "right") {
            topPos = rect.top + (rect.height / 2);
            leftPos = rect.right + 15;
        } else {
            topPos = rect.top - 10;
            leftPos = rect.left + (rect.width / 2);
        }
    }

    function portal(node: HTMLElement) {
        document.body.appendChild(node);
        return {
            destroy() {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
        };
    }

    let handleEnter: () => void;
    let handleLeave: () => void;

    $effect(() => {
        if (!element) return;
        
        const parent = element.parentElement;
        if (!parent) return;

        handleEnter = () => {
            updatePosition();
            shown = true;
        };
        
        handleLeave = () => {
            shown = false;
        };

        parent.addEventListener("mouseenter", handleEnter);
        parent.addEventListener("mouseleave", handleLeave);
        
        window.addEventListener("resize", updatePosition);

        return () => {
            parent.removeEventListener("mouseenter", handleEnter);
            parent.removeEventListener("mouseleave", handleLeave);
            window.removeEventListener("resize", updatePosition);
        };
    });
</script>

<div bind:this={element} style="display: none;"></div>

{#if shown}
    <div 
        use:portal 
        class="cg-tooltip {placement}" 
        style="background-color: {color}; top: {topPos}px; left: {leftPos}px;"
        transition:fly={{ 
            y: placement === 'top' ? 10 : 0, 
            x: placement === 'left' ? 15 : (placement === 'right' ? -15 : 0), 
            duration: 300 
        }} 
    >
        {text}
    </div>
{/if}

<style lang="scss">
  :global(.cg-tooltip) {
    color: var(--tooltip-text-color);
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    position: fixed;
    white-space: nowrap;
    z-index: 99999999;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    &::after {
      content: "";
      display: block;
      height: 10px;
      width: 10px;
      background-color: inherit;
      position: absolute;
    }

    &.left {
      transform: translate(-100%, -50%);
      
      &::after {
        right: -4px;
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
      }
    }

    &.right {
      transform: translateY(-50%);
      
      &::after {
        left: -4px;
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
      }
    }

    &.top {
      transform: translate(-50%, -100%);
      
      &::after {
        left: 50%;
        bottom: -4px;
        transform: translateX(-50%) rotate(45deg);
      }
    }
  }
</style>