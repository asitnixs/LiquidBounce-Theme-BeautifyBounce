<script lang="ts">
    import type {BindAction} from "../../../../integration/types";
    import {fly} from "svelte/transition";

    export let choices: BindAction[];
    export let chosen: typeof choices[number];
    export let onchange: () => any;

    function switchAction() {
        const currentIndex = choices.indexOf(chosen);
        const nextIndex = (currentIndex + 1) % choices.length;
        chosen = choices[nextIndex];
        onchange();
    }
</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button class="action-btn" on:click|stopPropagation={switchAction}>
    <span class="text">
        {#key chosen}
            <span class="anim-span" in:fly={{ y: -5, duration: 150 }} out:fly={{ y: 5, duration: 150 }}>{chosen}</span>
        {/key}
    </span>
</button>

<style lang="scss">
  .action-btn {
    all: unset;
    cursor: pointer;
    background: transparent;
    padding: 4px 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    color: var(--clickgui-text-dimmed-color);
    transition: background 0.4s, color 0.4s;

    &:hover {
      background: var(--clickgui-input-background-color);
      color: var(--clickgui-text-color);
    }
  }

  .text {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    display: grid;
    overflow: hidden;

    .anim-span {
      grid-column: 1/1;
      grid-row: 1/1;
    }
  }
</style>