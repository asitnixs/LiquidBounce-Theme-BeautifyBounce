<script lang="ts">
    import "nouislider/dist/nouislider.css";
    import "./nouislider.scss";
    import {createEventDispatcher, onMount} from "svelte";
    import noUiSlider, {type API} from "nouislider";
    import type {FloatRangeSetting, ModuleSetting} from "../../../integration/types";
    import ValueInput from "./common/ValueInput.svelte";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";

    export let setting: ModuleSetting;
    const cSetting = setting as FloatRangeSetting;
    const dispatch = createEventDispatcher();

    let slider: HTMLElement;
    let apiSlider: API;

    onMount(() => {
        let step = 0.01;
        if (cSetting.range.to > 100) step = 0.1;
        else if (cSetting.range.to <= 0.1) step = 0.0001;
        else if (cSetting.range.to <= 1.0) step = 0.001;

        apiSlider = noUiSlider.create(slider, {
            start: [cSetting.value.from, cSetting.value.to],
            connect: true,
            range: { min: cSetting.range.from, max: cSetting.range.to },
            step: step,
            format: {
                to: (value) => parseFloat(value.toFixed(4)),
                from: (value) => parseFloat(value),
            }
        });

        apiSlider.on("update", values => {
            const newValue = values.map(v => v.toString()).map(v => parseFloat(v));
            cSetting.value = { from: newValue[0], to: newValue[1] };
            setting = {...cSetting};
        });

        apiSlider.on("set", () => dispatch("change"));
    });
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    
    <div class="slider-container">
        <div bind:this={slider} class="slider"></div>
    </div>

    <div class="value-box">
        <ValueInput valueType="float" value={cSetting.value.from} on:change={(e) => apiSlider.set([e.detail.value, cSetting.value.to])}/>
        <span class="dash">-</span>
        <ValueInput valueType="float" value={cSetting.value.to} on:change={(e) => apiSlider.set([cSetting.value.from, e.detail.value])}/>
    </div>
</div>

<style lang="scss">
    .setting {
        display: grid;
        grid-template-columns: 120px 1fr 100px;
        align-items: center;
        padding: 4px 0;
        gap: 8px;
    }

    .name {
        font-size: 12px;
        font-weight: 500;
        color: var(--clickgui-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .slider-container {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0 4px;
    }

    .slider {
        width: 100%;
    }

    .value-box {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--clickgui-window-background-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 8px;
        padding: 6px 0px;
        width: 100%;
        gap: 4px;
    }

    .dash {
        color: var(--clickgui-text-dimmed-color);
        font-weight: 500;
        font-size: 12px;
    }

    :global(.value-box .value) {
        font-size: 12px;
        font-weight: 400;
        color: var(--clickgui-text-color);
        font-variant-numeric: tabular-nums;
    }
</style>