(async function () {
    "use strict";

    const USERS_URL = "./users.json";

    async function loadUsers() {
        const response = await fetch(USERS_URL + "?t=" + Date.now());

        if (!response.ok) {
            throw new Error("Could not load users.json");
        }

        return await response.json();
    }

    function showLogin(message = "") {
        document.body.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                justify-content:center;
                align-items:center;
                background:#111;
                font-family:Arial,sans-serif;
            ">
                <div style="
                    width:340px;
                    padding:30px;
                    background:#222;
                    color:white;
                    border-radius:18px;
                    text-align:center;
                    box-shadow:0 15px 50px rgba(0,0,0,.5);
                ">

                    <h1>🔐 PH10 ACCESS</h1>

                    <p>Enter your access key.</p>

                    <input
                        id="ph10-key"
                        type="text"
                        placeholder="PH10-XXXXXX"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:12px;
                            border-radius:8px;
                            border:1px solid #555;
                            margin:15px 0;
                            font-size:16px;
                        "
                    >

                    <button id="ph10-login" style="
                        width:100%;
                        padding:12px;
                        border:none;
                        border-radius:8px;
                        cursor:pointer;
                        font-size:16px;
                    ">
                        ENTER
                    </button>

                    <div id="ph10-message" style="
                        margin-top:15px;
                        color:#ff7777;
                    ">${message}</div>

                </div>
            </div>
        `;

        document
            .getElementById("ph10-login")
            .addEventListener("click", verifyKey);

        document
            .getElementById("ph10-key")
            .addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    verifyKey();
                }
            });
    }

    async function verifyKey() {
        const input = document.getElementById("ph10-key");
        const message = document.getElementById("ph10-message");

        const key = input.value.trim();

        if (!key) {
            message.textContent = "Please enter your access key.";
            return;
        }

        try {
            const data = await loadUsers();

            const user = data.users.find(
                u => u.key === key
            );

            if (!user) {
                message.textContent = "Invalid access key.";
                return;
            }

            if (!user.enabled) {
                message.textContent =
                    "Your access has been disabled.";
                return;
            }

            localStorage.setItem("ph10_key", user.key);
            localStorage.setItem("ph10_username", user.username);

            launchGame(user.username);

        } catch (error) {
            console.error(error);
            message.textContent =
                "Unable to verify access.";
        }
    }

    async function checkSavedLogin() {
        const savedKey = localStorage.getItem("ph10_key");

        if (!savedKey) {
            showLogin();
            return;
        }

        try {
            const data = await loadUsers();

            const user = data.users.find(
                u => u.key === savedKey
            );

            if (!user || !user.enabled) {
                localStorage.removeItem("ph10_key");
                localStorage.removeItem("ph10_username");

                showLogin("Your access is disabled.");
                return;
            }

            launchGame(user.username);

        } catch (error) {
            console.error(error);
            showLogin("Unable to check access.");
        }
    }

    function launchGame(username) {
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
                    color:white;
                    text-align:center;
                    border-radius:18px;
                ">

                    <h1>🎮 PH10 GAME</h1>

                    <p>
                        Welcome,
                        <strong>${username}</strong>
                    </p>

                    <p style="font-size:25px">
                        Score:
                        <span id="score">0</span>
                    </p>

                    <button id="clickBtn" style="
                        padding:15px 30px;
                        border:none;
                        border-radius:10px;
                        cursor:pointer;
                        font-size:18px;
                    ">
                        CLICK ME
                    </button>

                    <button id="logoutBtn" style="
                        display:block;
                        margin:15px auto 0;
                        padding:8px 15px;
                        border:none;
                        border-radius:7px;
                        cursor:pointer;
                    ">
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
            localStorage.removeItem("ph10_username");
            location.reload();
        };
    }

    checkSavedLogin();

})();
