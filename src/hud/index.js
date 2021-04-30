import $ from "jquery";
import "./styles.css";

export class Hud {
    constructor() {

        // Escape key hint
        $('body').append($(
            '<div id="esc-hint" class="hud-message">🛈 Press Esc key to pause and reclaim the mouse cursor.</div>'
        ));
        $("#esc-hint").hide();

        // Click hint
        $('body').append($(
            '<div id="click-hint" class="hud-message">🛈 Click anywhere to play.</div>'
        ));

        // Score
        $('body').append($(
            '<div id="score"><span id="value">0</span><span id="unit">m</span></div>'
        ));

        // Ceiling distance bar
        $('body').append($(
            '<div id="distance" class="vertical-bar"><span>🧍</span></div>'
        ));

        // Health bar
        $('body').append($(
            '<div id="health" class="vertical-bar"><span>❤️</span></div>'
        ));

        // Debug
        $('body').append($(
            '<div id="debug" class="hud-message">Debug</div>'
        ));

    }

    resumeGame() {
        $("#esc-hint").css("display", "block");
        this.esc_key_timeout = setTimeout(function () {
            $("#esc-hint").hide();
        }, 3000);
        $("#click-hint").hide();
    }

    pauseGame() {
        clearTimeout(this.esc_key_timeout);
        $("#esc-hint").hide();
        $("#click-hint").css("display", "block");
    }

    setDebugMsg(s) {
        $("#debug").text(s);
    }
}