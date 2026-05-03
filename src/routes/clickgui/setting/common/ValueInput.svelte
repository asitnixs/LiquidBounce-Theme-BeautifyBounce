<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let value: number;
    export let valueType: "int" | "float";

    let inputElement: HTMLElement;
    let inputValue = "";

    $: {
        if (document.activeElement !== inputElement) {
            inputValue = value.toString();
        }
    }

    const dispatch = createEventDispatcher<{
        change: { value: number }
    }>();

    function handleInput() {
        let parsed = valueType === "float" ? parseFloat(inputValue) : parseInt(inputValue);
        if (!isNaN(parsed)) {
            dispatch("change", {value: parsed});
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            inputElement.blur();
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span contenteditable="true" class="value" bind:innerText={inputValue} on:input={handleInput} on:keydown={handleKeyDown} bind:this={inputElement}></span>

<style lang="scss">
  .value {
    color: var(--clickgui-text-color);
    font-weight: 400;
    font-size: 12px;
    display: inline-block;
    text-align: center;
  }
</style>