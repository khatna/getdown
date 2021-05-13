import $ from "jquery";
import "./styles.css";

const scorePerFallDistanceUnit = 1.75 / 5;

class Hud {
    constructor() {

        this.score = 0;

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

        // Score up
        $('body').append($(
            '<div id="score-up">+000</div>'
        ));
        $("#score-up").hide();

        // Ceiling distance bar
        $('body').append($(
            '<div id="distance" class="vertical-bar"><span>🧍</span></div>'
        ));

        // Health bar
        $('body').append($(
            '<div id="health" class="vertical-bar"><span>❤️</span></div>'
        ));

        // Debug
        // $('body').append($(
        //     '<div id="debug" class="hud-message">Debug</div>'
        // ));

        // Falling cover
        $('body').append($(
            '<div id="falling" class="cover"></div>'
        ));

        // Damage cover
        $('body').append($(
            '<div id="damage" class="cover"></div>'
        ));
        $("#damage").hide();

        // Health-up cover
        $('body').append($(
            '<div id="health-up" class="cover"></div>'
        ));
        $("#health-up").hide();

        // Crosshair
        $('body').append($(
            '<div id="crosshair"><img src="/src/components/assets/crosshairRed.png" alt="crosshair"></div>'
        ));

    }

    resumeGame() {
        $("#esc-hint").show();
        this.escKeyTimeout = setTimeout(function () {
            $("#esc-hint").hide();
        }, 3000);
        $("#click-hint").hide();
    }

    pauseGame() {
        clearTimeout(this.escKeyTimeout);
        $("#esc-hint").hide();
        $("#click-hint").show();
    }

    setDebugMsg(s) {
        $("#debug").text(s);
    }

    addFallDistanceToScore(fallDistance) {
        let scoreUp = Math.round(fallDistance * scorePerFallDistanceUnit);
        this.score += scoreUp
        $("#score #value").text(this.score);
        // Score up
        let score = this.score;
        let left = 40;
        while (score >= 1) {
            score /= 10;
            left += 40;
        }
        clearTimeout(this.scoreUpTimeout);
        $("#score-up").css("left", left + "px");
        $("#score-up").show();
        $("#score-up").text("+" + scoreUp);
        this.scoreUpTimeout = setTimeout(function () {
            $("#score-up").hide();
        }, 3000);
    }

    updateHealth(health) {
        health *= 100;
        let colorTop = "rgba(67,204,71,1)";
        let colorBottom = "rgba(30,109,32,1)";
        let colorBack = "rgba(77,77,77,1)";
        $('#health').css(
            'background',
            'linear-gradient(0deg, ' +
                colorBottom +
                ' 0%, ' +
                colorTop +
                ' ' +
                health +
                '%, ' +
                colorBack +
                ' ' +
                health +
                '%)'
        );
    }

    updateCeilingDistance(ceilingDistance) {
        // Ref: https://cssgradient.io
        ceilingDistance = Math.min(100, ceilingDistance);
        let colorTop = "rgba(140,0,0,1)";
        let colorBottom = "rgba(255,0,0,1)";
        let colorBack = "rgba(77,77,77,1)";
        $('#distance').css(
            'background',
            'linear-gradient(0deg, ' +
                colorBack +
                ' ' +
                ceilingDistance +
                '%, ' +
                colorBottom +
                ' ' +
                ceilingDistance +
                '%, ' +
                colorTop +
                ' 100%)'
        );
    }

    gameOver() {
        $("#esc-hint").text("🛈 Game over; double-click to reload");
        $("#click-hint").text("🛈 Game over; double-click to reload");
        $("#esc-hint").show();
    }

    setFallingCoverOpacity(opacity) {
        $("#falling").css("opacity", opacity);
    }

    setDamageCoverOpacity(opacity) {
        $("#damage").css("opacity", opacity);
        $("#damage").show();
        $("#damage").fadeOut();
    }

    setHealthUpCoverOpacity(opacity) {
        $("#health-up").css("opacity", opacity);
        $("#health-up").show();
        $("#health-up").fadeOut();
    }
}

export default Hud;
