<script lang="ts">
    export let text: string;
</script>

<div class="tag">
    {text}
</div>

<style lang="scss">

  .tag {
    background-color: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    color: var(--clickgui-text-color);
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 10px;
    margin-left: 10px;
    transition: ease color 0.4s, ease background-color 0.4s;
    transform: translateY(-3px);
  }
</style>
