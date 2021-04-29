import $ from "jquery";
import "./styles.css";

export class Hud {
    constructor() {

        // Escape key hint
        $('body').append($(
            '<div id="esc-hint" class="hud-message">Press Escape to release the mouse cursor.</div>'
        ));
        $("#esc-hint").hide();

        // Click hint
        $('body').append($(
            '<div id="click-hint" class="hud-message">Click anywhere to play.</div>'
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
}