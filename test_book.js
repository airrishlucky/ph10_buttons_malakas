(function () {
    // Prevent duplicate game windows
    const oldGame = document.getElementById("ph10-mini-game");
    if (oldGame) {
        oldGame.remove();
        return;
    }

    // Create game window
    const game = document.createElement("div");
    game.id = "ph10-mini-game";

    game.innerHTML = `
        <div id="ph10-box">
            <h2>🎮 PH10 Mini Game</h2>

            <div class="ph10-score">
                Score: <span id="ph10-score">0</span>
            </div>

            <button id="ph10-click">CLICK ME!</button>

            <button id="ph10-close">Close</button>
        </div>
    `;

    // Add styles
    const style = document.createElement("style");

    style.textContent = `
        #ph10-mini-game {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2147483647;
        }

        #ph10-box {
            width: 320px;
            padding: 25px;
            background: #111;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,.5);
        }

        #ph10-box h2 {
            margin-top: 0;
        }

        .ph10-score {
            font-size: 22px;
            margin: 20px;
        }

        #ph10-click {
            padding: 14px 30px;
            font-size: 18px;
            cursor: pointer;
            border: none;
            border-radius: 10px;
            background: #00c853;
            color: white;
        }

        #ph10-close {
            display: block;
            margin: 15px auto 0;
            padding: 7px 15px;
            cursor: pointer;
            border: none;
            border-radius: 7px;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(game);

    let score = 0;

    // Click button
    document.getElementById("ph10-click").onclick = function () {
        score++;
        document.getElementById("ph10-score").textContent = score;
    };

    // Close button
    document.getElementById("ph10-close").onclick = function () {
        game.remove();
        style.remove();
    };

})();
