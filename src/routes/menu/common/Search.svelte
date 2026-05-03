<script lang="ts">
    import {createEventDispatcher} from "svelte";

    let value = "";

    const dispatch = createEventDispatcher<{
        search: { query: string }
    }>();
</script>

<input class="search" type="text" placeholder="Search..." bind:value={value}
       on:input={() => dispatch("search", {query: value})} spellcheck="false">

<style lang="scss">
  .search {
    background-color: var(--clickgui-base-color);
    border: 1px solid var(--clickgui-border-color);
    color: var(--clickgui-text-color);
    font-size: 16px;
    border-radius: 12px;
    background-image: url("/img/menu/icon-search.svg");
    background-repeat: no-repeat;
    background-position: 16px center;
    background-size: 20px;
    padding: 14px 14px 14px 40px;
    flex: 1;
    transition: all 0.4s ease;
    outline: none;

    &::placeholder {
      color: var(--clickgui-text-dimmed-color);
    }

    &:focus {
      border-color: color-mix(in srgb, var(--accent-color) 60%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }
</style>