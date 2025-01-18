/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { disableStyle, enableStyle } from "@api/Styles";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findByCodeLazy } from "@webpack";

import { settings } from "./settings";
import style from "./style.css";

export let faked = false;

const debug = true;
function logDebug(message: string) {
    if (debug) console.log("[FakeVoiceOptions]", message);
}

function mute() {
    const muteBtn = document.querySelector('[aria-label="Mute"]') as HTMLElement;
    if (muteBtn) {
        muteBtn.click();
        logDebug("Mute button clicked.");
    } else {
        console.error("[FakeVoiceOptions] Mute button not found.");
    }
}

function deafen() {
    const deafenBtn = document.querySelector('[aria-label="Deafen"]') as HTMLElement;
    if (deafenBtn) {
        deafenBtn.click();
        logDebug("Deafen button clicked.");
    } else {
        console.error("[FakeVoiceOptions] Deafen button not found.");
    }
}

const Button = findByCodeLazy("Button.Sizes.NONE,disabled:");

const toggleFakeVoiceOptions = () => {
    try {
        faked = !faked;

        deafen();
        setTimeout(deafen, 200);

        if (settings.store.muteOnFakeDeafen && faked) {
            setTimeout(mute, 350);
        }

        logDebug(`Fake Voice Options toggled: ${faked}`);
    } catch (error) {
        console.error("[FakeVoiceOptions] Error toggling options:", error);
    }
};

export default definePlugin({
    name: "FakeVoiceOptions",
    description: "Fake mute, deafen, and camera for VCs",
    authors: [Devs.HaddajiDev],
    patches: [
        {
            find: ".Messages.ACCOUNT_SPEAKING_WHILE_MUTED",
            replacement: {
                match: /this\.renderNameZone\(\).+?children:\[/,
                replace: "$&$self.FakeVoiceOptionToggleButton(),",
            },
        },
        {
            find: "}voiceStateUpdate(",
            replacement: {
                match: /self_mute:([^,]+),self_deaf:([^,]+),self_video:([^,]+)/,
                replace: "self_mute:$self.toggle($1,'fakeMute'),self_deaf:$self.toggle($2,'fakeDeafen')",
            },
        },
    ],
    settings,
    toggle: (_o: any, key: string) => {
        return faked ? settings.store[key] : _o;
    },
    start() {
        const m_button = document.createElement("button");
        m_button.onclick = toggleFakeVoiceOptions;
        m_button.className = "button-container";

        m_button.innerHTML = "Click me";
        document.body.appendChild(m_button);
        enableStyle(style);
        logDebug("FakeVoiceOptions plugin started.");
    },
    stop() {
        disableStyle(style);
        logDebug("FakeVoiceOptions plugin stopped.");
    },
});