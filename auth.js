(async function () {
    "use strict";

    const USERS_URL = "./users.json";

    async function getUsers() {
        const response = await fetch(
            USERS_URL + "?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Unable to load users.json");
        }

        return await response.json();
    }

    function loginScreen(message = "") {
        document.body.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#111;
                font-family:Arial,sans-serif;
            ">
                <div style="
                    width:340px;
                    padding:30px;
                    background:#222;
                    color:#fff;
                    border-radius:16px;
                    text-align:center;
                ">
                    <h2>🔐 PH10 ACCESS</h2>

                    <input
                        id="ph10-key"
                        placeholder="Enter access key"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:12px;
                            margin:15px 0;
                            border-radius:8px;
                            border:1px solid #555;
                        "
                    >

                    <button id="ph10-login" style="
                        padding:12px 25px;
                        border:0;
                        border-radius:8px;
                        cursor:pointer;
                    ">
                        ENTER
                    </button>

                    <div id="ph10-message" style="
                        margin-top:15px;
                        color:#ff6666;
                    ">${message}</div>
                </div>
            </div>
        `;

        document.getElementById("ph10-login")
            .onclick = checkLogin;

        document.getElementById("ph10-key")
            .onkeydown = e => {
                if (e.key === "Enter") {
                    checkLogin();
                }
            };
    }

    async function checkLogin() {
        const key = document
            .getElementById("ph10-key")
            .value
            .trim();

        const message =
            document.getElementById("ph10-message");

        if (!key) {
            message.textContent = "Enter your access key.";
            return;
        }

        try {
            const data = await getUsers();

            const user = data.users.find(
                u => u.key === key
            );

            if (!user) {
                message.textContent = "Invalid access key.";
                return;
            }

            if (!user.enabled) {
                message.textContent = "Your access is disabled.";
                return;
            }

            localStorage.setItem("ph10_key", user.key);
            localStorage.setItem("ph10_user", user.username);

            startGame(user.username);

        } catch (error) {
            console.error(error);
            message.textContent = "Access system error.";
        }
    }

    async function checkSavedAccess() {
        const savedKey =
            localStorage.getItem("ph10_key");

        if (!savedKey) {
            loginScreen();
            return;
        }

        try {
            const data = await getUsers();

            const user = data.users.find(
                u => u.key === savedKey
            );

            if (!user || !user.enabled) {
                localStorage.removeItem("ph10_key");
                localStorage.removeItem("ph10_user");

                loginScreen("Your access has been disabled.");
                return;
            }

            startGame(user.username);

        } catch (error) {
            console.error(error);
            loginScreen("Unable to verify access.");
        }
    }

    function startGame(username) {

        document.body.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#111;
                font-family:Arial,sans-serif;
            ">
                <div style="
                    width:320px;
                    padding:30px;
                    background:#222;
                    color:#fff;
                    text-align:center;
                    border-radius:18px;
                ">
                    <h1>🎮 PH10 GAME</h1>

                    <p>
                        Welcome <b>${username}</b>
                    </p>

                    <p style="font-size:24px">
                        Score:
                        <span id="score">0</span>
                    </p>

                    <button id="clickBtn" style="
                        padding:14px 28px;
                        border:0;
                        border-radius:10px;
                        cursor:pointer;
                        font-size:18px;
                    ">
                        CLICK ME
                    </button>

                    <br><br>

                    <button id="logoutBtn">
                        Logout
                    </button>
                </div>
            </div>
        `;

        let score = 0;

        document.getElementById("clickBtn").onclick = () => {
            score++;
            document.getElementById("score").textContent = score;
        };

        document.getElementById("logoutBtn").onclick = () => {
            localStorage.removeItem("ph10_key");
            localStorage.removeItem("ph10_user");
            location.reload();
        };
    }

    checkSavedAccess();

})();
