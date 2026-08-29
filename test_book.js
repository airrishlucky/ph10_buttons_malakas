(async () => {

    // Load PH10 Access Control
    if (!window.PH10Access) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src =
                "https://airrishlucky.github.io/ph10-access/access.js?v=" +
                Date.now();

            script.onload = resolve;
            script.onerror = () =>
                reject(new Error("PH10 Access Control failed to load"));

            document.documentElement.appendChild(script);
        });
    }

    // PH10 ACCESS CHECK
    await PH10Access.require("TEST_BOOK");

    // ======================================
    // YOUR EXISTING test_book.js CODE HERE
    // ======================================

})();

(() => {
    document.body.innerHTML = `
        <div style="
            min-height:100vh;
            margin:0;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#111;
            font-family:Arial,sans-serif;
        ">
            <div style="
                width:320px;
                padding:30px;
                text-align:center;
                background:#222;
                color:white;
                border-radius:20px;
                box-shadow:0 15px 50px rgba(0,0,0,.5);
            ">
                <h1>🎮 PH10 Game</h1>

                <p style="font-size:24px">
                    Score:
                    <span id="score">0</span>
                </p>

                <button id="clickBtn" style="
                    padding:15px 30px;
                    font-size:18px;
                    border:0;
                    border-radius:10px;
                    cursor:pointer;
                ">
                    CLICK ME
                </button>
            </div>
        </div>
    `;

    let score = 0;

    document.getElementById("clickBtn").onclick = () => {
        score++;
        document.getElementById("score").textContent = score;
    };
})();
