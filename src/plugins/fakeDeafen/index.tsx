import { disableStyle, enableStyle } from "@api/Styles";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findByCodeLazy } from "@webpack";

import { settings } from "./settings";
import style from "./style.css";

export let faked = false;

function mute() {
    const muteBtn = document.querySelector('[aria-label="Mute"]') as HTMLElement;
    if (muteBtn) {
        muteBtn.click();

    } else {
        console.error("Error");
    }
}

function deafen() {
    const deafenBtn = document.querySelector('[aria-label="Deafen"]') as HTMLElement;
    if (deafenBtn) {
        deafenBtn.click();

    } else {
        console.error("Error");
    }
}
const toggleFakeVoiceOptions = () => {
    try {
        faked = !faked;

        deafen();
        setTimeout(deafen, 200);

        if (settings.store.muteOnFakeDeafen && faked) {
            setTimeout(mute, 350);
        }

    } catch (error) {
        console.error(error);
    }
};

export default definePlugin({
    name: "FakeMuteAndDeafen",
    description: "Fake mute and deafen for VCs",
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
                match: /self_mute:([^,]+),self_deaf:([^,]+)/,
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
    },
    stop() {
        disableStyle(style);
    },
});