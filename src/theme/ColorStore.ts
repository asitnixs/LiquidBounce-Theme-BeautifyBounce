import { writable } from "svelte/store";
import { setItem } from "../integration/persistent_storage";

const KEY_COLOR = "custom_accent_color";

const initialColor = localStorage.getItem(KEY_COLOR) || 
                     localStorage.getItem("cached_accent_color") || 
                     "#4677ff";

export const accentColor = writable<string>(initialColor);

accentColor.subscribe((color) => {
    if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--accent-color", color);
        
        if (localStorage.getItem(KEY_COLOR) !== color) {
            localStorage.setItem(KEY_COLOR, color);
        }
    }
});

export async function saveAccentColor(color: string) {
    accentColor.set(color);
    await setItem(KEY_COLOR, color);
    localStorage.setItem("cached_accent_color", color);
}