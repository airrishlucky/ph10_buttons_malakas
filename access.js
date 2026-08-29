/*
 * PH10 ACCESS CONTROL
 *
 * Rules:
 * 1. First device registration automatically becomes trusted.
 * 2. Any new username on a trusted device is active.
 * 3. Existing username on a different/untrusted device becomes pending.
 * 4. Disabled users are denied.
 *
 * GitHub Pages version:
 *   access.js
 *   users.json
 */

(() => {
    "use strict";

    const CONFIG = {
        USERS_URL:
            "https://airrishlucky.github.io/ph10_buttons_malakas/users.json",

        STORAGE_DEVICE:
            "ph10_device_id",

        STORAGE_USER:
            "ph10_username",

        STORAGE_TOOL:
            "ph10_current_tool"
    };

    function getDeviceId() {
        let id = localStorage.getItem(CONFIG.STORAGE_DEVICE);

        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(CONFIG.STORAGE_DEVICE, id);
        }

        return id;
    }

    function getSavedUsername() {
        return localStorage.getItem(CONFIG.STORAGE_USER);
    }

    function saveUsername(username) {
        localStorage.setItem(CONFIG.STORAGE_USER, username);
    }

    async function loadDatabase() {
        const response = await fetch(
            CONFIG.USERS_URL + "?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Could not load users database.");
        }

        return await response.json();
    }

    function normalizeUsername(username) {
        return username
            .trim()
            .toLowerCase();
    }

    function createScreen() {
        const overlay = document.createElement("div");

        overlay.id = "ph10-access-overlay";

        overlay.innerHTML = `
            <div id="ph10-access-box">

                <div class="ph10-title">
                    PH10 ACCESS
                </div>

                <div class="ph10-description">
                    Enter your username to continue.
                </div>

                <input
                    id="ph10-username"
                    type="text"
                    maxlength="40"
                    autocomplete="off"
                    placeholder="Username"
                >

                <button id="ph10-continue">
                    Continue
                </button>

                <div id="ph10-status"></div>

            </div>
        `;

        const style = document.createElement("style");

        style.textContent = `
            #ph10-access-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483647;

                display: flex;
                align-items: center;
                justify-content: center;

                background: rgba(0,0,0,.75);

                font-family: Arial, sans-serif;
            }

            #ph10-access-box {
                width: 340px;
                padding: 30px;

                background: #181818;
                color: white;

                border-radius: 18px;

                box-shadow:
                    0 20px 60px rgba(0,0,0,.6);

                text-align: center;
            }

            .ph10-title {
                font-size: 25px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .ph10-description {
                color: #bbb;
                margin-bottom: 20px;
            }

            #ph10-username {
                width: 100%;
                box-sizing: border-box;

                padding: 12px;

                border: 1px solid #555;
                border-radius: 8px;

                background: #252525;
                color: white;

                font-size: 16px;

                outline: none;
            }

            #ph10-continue {
                width: 100%;

                margin-top: 12px;
                padding: 12px;

                border: 0;
                border-radius: 8px;

                cursor: pointer;

                font-size: 16px;
                font-weight: bold;
            }

            #ph10-status {
                min-height: 20px;
                margin-top: 15px;
                font-size: 14px;
            }

            .ph10-error {
                color: #ff6666;
            }

            .ph10-success {
                color: #66dd88;
            }

            .ph10-pending {
                color: #ffcc66;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        return {
            overlay,
            style,

            username:
                document.getElementById("ph10-username"),

            button:
                document.getElementById("ph10-continue"),

            status:
                document.getElementById("ph10-status")
        };
    }

    function removeScreen(screen) {
        screen.overlay.remove();
        screen.style.remove();
    }

    function setStatus(screen, text, type) {
        screen.status.textContent = text;

        screen.status.className = "";

        if (type) {
            screen.status.classList.add(
                "ph10-" + type
            );
        }
    }

    async function checkAccess(toolName) {

        const deviceId = getDeviceId();

        const db = await loadDatabase();

        if (!db || !Array.isArray(db.users)) {
            throw new Error(
                "Invalid users.json"
            );
        }

        /*
         * Existing saved username
         */
        const savedUsername =
            getSavedUsername();

        if (savedUsername) {

            const normalizedSaved =
                normalizeUsername(
                    savedUsername
                );

            const existingUser =
                db.users.find(
                    user =>
                        normalizeUsername(
                            user.username
                        ) === normalizedSaved
                );

            /*
             * User exists
             */
            if (existingUser) {

                if (existingUser.enabled === false) {
                    return {
                        allowed: false,
                        status: "disabled",
                        username:
                            existingUser.username
                    };
                }

                /*
                 * Device is already registered
                 */
                if (
                    Array.isArray(
                        existingUser.devices
                    ) &&
                    existingUser.devices.includes(
                        deviceId
                    )
                ) {
                    return {
                        allowed: true,
                        status: "active",
                        username:
                            existingUser.username
                    };
                }

                /*
                 * Existing user on another device
                 */
                return {
                    allowed: false,
                    status: "pending_device",
                    username:
                        existingUser.username
                };
            }
        }

        /*
         * No saved user.
         * Show username screen.
         */

        return {
            allowed: false,
            status: "login_required"
        };
    }

    async function require(toolName) {

        CONFIG.STORAGE_TOOL &&
            localStorage.setItem(
                CONFIG.STORAGE_TOOL,
                toolName
            );

        /*
         * First try saved login
         */
        let result =
            await checkAccess(toolName);

        if (result.allowed) {
            return result;
        }

        /*
         * Already disabled
         */
        if (result.status === "disabled") {
            showMessage(
                "Access disabled",
                "Your account has been disabled."
            );

            throw new Error(
                "PH10 access disabled."
            );
        }

        /*
         * New device for existing user
         */
        if (
            result.status ===
            "pending_device"
        ) {
            showMessage(
                "Device pending",
                "This username is already registered on another device. This device needs approval."
            );

            throw new Error(
                "PH10 device pending."
            );
        }

        /*
         * New registration
         */
        return await registerNewUser(
            toolName
        );
    }

    async function registerNewUser(toolName) {

        const screen =
            createScreen();

        return new Promise(
            (resolve, reject) => {

                screen.button.onclick =
                    async () => {

                        const raw =
                            screen.username.value;

                        const username =
                            raw.trim();

                        if (!username) {

                            setStatus(
                                screen,
                                "Please enter a username.",
                                "error"
                            );

                            return;
                        }

                        if (
                            username.length < 2
                        ) {

                            setStatus(
                                screen,
                                "Username is too short.",
                                "error"
                            );

                            return;
                        }

                        screen.button.disabled =
                            true;

                        setStatus(
                            screen,
                            "Checking access...",
                            ""
                        );

                        try {

                            const deviceId =
                                getDeviceId();

                            const db =
                                await loadDatabase();

                            const normalized =
                                normalizeUsername(
                                    username
                                );

                            /*
                             * Check whether
                             * username already exists.
                             */

                            const existing =
                                db.users.find(
                                    user =>
                                        normalizeUsername(
                                            user.username
                                        ) ===
                                        normalized
                                );

                            /*
                             * Existing username
                             */
                            if (existing) {

                                if (
                                    existing.enabled ===
                                    false
                                ) {

                                    setStatus(
                                        screen,
                                        "This account is disabled.",
                                        "error"
                                    );

                                    screen.button.disabled =
                                        false;

                                    return;
                                }

                                const devices =
                                    Array.isArray(
                                        existing.devices
                                    )
                                        ? existing.devices
                                        : [];

                                if (
                                    devices.includes(
                                        deviceId
                                    )
                                ) {

                                    saveUsername(
                                        existing.username
                                    );

                                    removeScreen(
                                        screen
                                    );

                                    resolve({
                                        allowed: true,
                                        status:
                                            "active",
                                        username:
                                            existing.username
                                    });

                                    return;
                                }

                                /*
                                 * Existing user,
                                 * new device.
                                 */
                                setStatus(
                                    screen,
                                    "This username is registered on another device. This device is pending approval.",
                                    "pending"
                                );

                                screen.button.disabled =
                                    false;

                                return;
                            }

                            /*
                             * NEW USER
                             *
                             * The frontend considers
                             * the first device active.
                             *
                             * Server-side registration
                             * will be added next.
                             */

                            saveUsername(
                                username
                            );

                            removeScreen(
                                screen
                            );

                            resolve({
                                allowed: true,
                                status:
                                    "active",
                                username
                            });

                        } catch (error) {

                            console.error(
                                error
                            );

                            setStatus(
                                screen,
                                "Access system error.",
                                "error"
                            );

                            screen.button.disabled =
                                false;

                            reject(error);
                        }
                    };

                screen.username.onkeydown =
                    event => {

                        if (
                            event.key ===
                            "Enter"
                        ) {
                            screen.button.click();
                        }

                    };
            }
        );
    }

    function showMessage(title, message) {

        const screen =
            createScreen();

        screen.username.remove();
        screen.button.remove();

        setStatus(
            screen,
            message,
            "error"
        );

        screen.status.style.marginTop =
            "20px";

        screen.status.style.fontSize =
            "16px";

        screen.status.style.lineHeight =
            "1.5";
    }

    window.PH10Access = {
        require,
        getDeviceId
    };

})();
