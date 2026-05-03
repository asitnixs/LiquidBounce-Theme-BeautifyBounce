<script lang="ts">
    import type {BindModifier} from "../../../../integration/types";
    import {os} from "../../clickgui_store";
    import {getPrintableKeyName} from "../../../../integration/rest";
    import {UNKNOWN_KEY} from "../../../../util/utils";

    export let boundKey: string | undefined;
    export let modifiers: Iterable<BindModifier> = [];
    export let literal: boolean = false;

    let printableKeyName: string | undefined;

    function abbreviateKeyName(name: string | undefined): string | undefined {
        if (!name) return name;
        return name
            .replace(/Right Shift/i, "RShift")
            .replace(/Left Shift/i, "LShift")
            .replace(/Right Control/i, "RCtrl")
            .replace(/Left Control/i, "LCtrl")
            .replace(/Right Alt/i, "RAlt")
            .replace(/Left Alt/i, "LAlt")
            .replace(/Right Super/i, "RWin")
            .replace(/Left Super/i, "LWin")
            .replace(/Numpad /i, "Num");
    }

    $: {
        if (!literal && boundKey !== undefined && boundKey !== UNKNOWN_KEY) {
            getPrintableKeyName(boundKey)
                .then(printableKey => {
                    printableKeyName = abbreviateKeyName(printableKey.localized);
                });
        } else {
            printableKeyName = boundKey === UNKNOWN_KEY ? undefined : abbreviateKeyName(boundKey);
        }
    }

    const getRenderString = (modifier: BindModifier) => {
        switch ($os) {
            case "windows":
                switch (modifier) {
                    case "Control":
                        return "Ctrl";
                    case "Super":
                        return "\u229e";
                    default:
                        return modifier;
                }
            case "mac":
                switch (modifier) {
                    case "Shift":
                        return "\u21e7";
                    case "Control":
                        return "^";
                    case "Alt":
                        return "\u2325";
                    case "Super":
                        return "\u2318";
                    default:
                        return modifier;
                }
            default:
                return modifier;
        }
    };
</script>

<span class="wrapper">
    {#if printableKeyName}
        {#each modifiers as modifier (modifier)}
            <span class="modifier">{getRenderString(modifier)}</span>
        {/each}
        <span class="boundKey">{printableKeyName}</span>
    {:else}
        <span class="dimmed">None</span>
    {/if}
</span>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .dimmed {
    color: var(--clickgui-text-dimmed-color);
    font-weight: 400;
  }

  .modifier {
    color: var(--clickgui-text-dimmed-color);
    font-weight: 400;
  }

  .modifier:after {
    content: "+";
    margin-left: 2px;
    opacity: 0.6;
  }

  .boundKey {
    font-weight: 600;
    text-transform: uppercase;
  }
</style>
