(() => {
    const existing = document.getElementById("ph10-game");

    if (existing) {
        existing.remove();
        return;
    }

    const game = document.createElement("div");

    game.id = "ph10-game";

    game.innerHTML = `
        <div style="
            position:fixed;
            top:30px;
            right:30px;
            width:300px;
            padding:20px;
            background:#111;
            color:white;
            border-radius:15px;
            z-index:999999;
            font-family:Arial,sans-serif;
            text-align:center;
            box-shadow:0 10px 30px rgba(0,0,0,.4);
        ">

            <div style="font-size:22px;font-weight:bold">
                PH10 MINI GAME
            </div>

            <div style="margin:15px 0">
                Score: <span id="ph10-score">0</span>
            </div>

            <button id="ph10-click" style="
                padding:12px 25px;
                border:0;
                border-radius:8px;
                cursor:pointer;
                font-size:16px;
            ">
                CLICK ME
            </button>

            <button id="ph10-close" style="
                display:block;
                margin:15px auto 0;
                padding:6px 12px;
                border:0;
                border-radius:6px;
                cursor:pointer;
            ">
                Close
            </button>

        </div>
    `;

    document.body.appendChild(game);

    let score = 0;

    document
        .getElementById("ph10-click")
        .addEventListener("click", () => {

            score++;

            document.getElementById("ph10-score").textContent = score;
        });

    document
        .getElementById("ph10-close")
        .addEventListener("click", () => {

            game.remove();
        });

})();
