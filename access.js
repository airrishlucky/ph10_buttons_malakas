(function () {
    "use strict";

    const CONFIG =
        window.PH10_ACCESS_CONFIG || {};

    const STORAGE = {
        deviceId: "ph10_device_id",
        username: "ph10_username"
    };

    function getDeviceId() {
        let deviceId =
            localStorage.getItem(
                STORAGE.deviceId
            );

        if (!deviceId) {
            deviceId =
                crypto.randomUUID();

            localStorage.setItem(
                STORAGE.deviceId,
                deviceId
            );
        }

        return deviceId;
    }

    function getUsername() {
        return localStorage.getItem(
            STORAGE.username
        );
    }

    function saveUsername(username) {
        localStorage.setItem(
            STORAGE.username,
            username
        );
    }

    function normalize(value) {
        return value
            .trim()
            .toLowerCase();
    }

    async function loadUsers() {

        const response =
            await fetch(
                CONFIG.usersUrl +
                "?v=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load PH10 user database."
            );
        }

        return await response.json();
    }

    function showAccessWindow() {

        const overlay =
            document.createElement("div");

        overlay.id =
            "ph10-access-control";

        overlay.innerHTML = `
            <div class="ph10-access-box">

                <h2>PH10 Access Control</h2>

                <p>
                    Enter your username
                    to continue.
                </p>

                <input
                    id="ph10-username"
                    type="text"
                    maxlength="50"
                    placeholder="Username"
                    autocomplete="off"
                >

                <button id="ph10-continue">
                    Continue
                </button>

                <div id="ph10-message"></div>

            </div>
        `;

        const style =
            document.createElement("style");

        style.textContent = `
            #ph10-access-control {
                position: fixed;
                inset: 0;
                z-index: 2147483647;

                display: flex;
                align-items: center;
                justify-content: center;

                background: rgba(0,0,0,.75);

                font-family: Arial, sans-serif;
            }

            .ph10-access-box {
                width: 350px;
                padding: 30px;

                background: #181818;
                color: white;

                border-radius: 18px;

                text-align: center;

                box-shadow:
                    0 20px 60px
                    rgba(0,0,0,.6);
            }

            .ph10-access-box h2 {
                margin-top: 0;
            }

            #ph10-username {
                width: 100%;
                box-sizing: border-box;

                padding: 12px;

                background: #222;
                color: white;

                border: 1px solid #555;
                border-radius: 8px;

                font-size: 16px;
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

            #ph10-message {
                margin-top: 15px;
                line-height: 1.5;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        return {
            overlay,
            style,

            username:
                document.getElementById(
                    "ph10-username"
                ),

            button:
                document.getElementById(
                    "ph10-continue"
                ),

            message:
                document.getElementById(
                    "ph10-message"
                )
        };
    }

    function removeAccessWindow(screen) {
        screen.overlay.remove();
        screen.style.remove();
    }

    function message(
        screen,
        text
    ) {
        screen.message.textContent =
            text;
    }

    async function require(toolId) {

        if (!CONFIG.usersUrl) {
            throw new Error(
                "PH10 Access Control: usersUrl is not configured."
            );
        }

        const deviceId =
            getDeviceId();

        const database =
            await loadUsers();

        /*
         * Check existing saved username.
         */

        const saved =
            getUsername();

        if (saved) {

            const user =
                database.users.find(
                    item =>
                        normalize(
                            item.username
                        ) ===
                        normalize(saved)
                );

            if (user) {

                if (
                    user.enabled ===
                    false
                ) {
                    deny(
                        "Your account has been disabled."
                    );

                    throw new Error(
                        "PH10 user disabled."
                    );
                }

                if (
                    Array.isArray(
                        user.devices
                    ) &&
                    user.devices.includes(
                        deviceId
                    )
                ) {

                    return {
                        allowed: true,
                        username:
                            user.username,
                        deviceId
                    };
                }

                /*
                 * Existing username,
                 * different device.
                 */

                deny(
                    "This device is not registered for this username. The device is pending approval."
                );

                throw new Error(
                    "PH10 device pending."
                );
            }
        }

        /*
         * Ask for username.
         */

        const screen =
            showAccessWindow();

        return new Promise(
            async (resolve, reject) => {

                screen.button.onclick =
                    async () => {

                        const username =
                            screen.username.value
                                .trim();

                        if (!username) {
                            message(
                                screen,
                                "Please enter a username."
                            );
                            return;
                        }

                        try {

                            /*
                             * Reload database so
                             * we have the newest
                             * information.
                             */

                            const latest =
                                await loadUsers();

                            const existing =
                                latest.users.find(
                                    item =>
                                        normalize(
                                            item.username
                                        ) ===
                                        normalize(
                                            username
                                        )
                                );

                            /*
                             * USER ALREADY EXISTS
                             */

                            if (existing) {

                                if (
                                    existing.enabled ===
                                    false
                                ) {

                                    message(
                                        screen,
                                        "This account is disabled."
                                    );

                                    return;
                                }

                                const knownDevices =
                                    Array.isArray(
                                        existing.devices
                                    )
                                        ? existing.devices
                                        : [];

                                if (
                                    knownDevices.includes(
                                        deviceId
                                    )
                                ) {

                                    saveUsername(
                                        existing.username
                                    );

                                    removeAccessWindow(
                                        screen
                                    );

                                    resolve({
                                        allowed: true,
                                        username:
                                            existing.username,
                                        deviceId
                                    });

                                    return;
                                }

                                /*
                                 * Existing user +
                                 * new device.
                                 */

                                await submitDeviceRequest(
                                    existing.username,
                                    deviceId,
                                    toolId
                                );

                                message(
                                    screen,
                                    "This username already exists on another device. This device has been submitted for approval."
                                );

                                return;
                            }

                            /*
                             * NEW USER
                             *
                             * Registration will be
                             * performed by GitHub Actions.
                             */

                            await submitRegistration(
                                username,
                                deviceId,
                                toolId
                            );

                            /*
                             * For the browser UI we
                             * show registration
                             * submitted.
                             *
                             * The secure GitHub
                             * registration process
                             * is the next part.
                             */

                            saveUsername(
                                username
                            );

                            removeAccessWindow(
                                screen
                            );

                            resolve({
                                allowed: true,
                                username,
                                deviceId
                            });

                        } catch (error) {

                            console.error(
                                error
                            );

                            message(
                                screen,
                                "PH10 registration error."
                            );

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

    async function submitRegistration(
        username,
        deviceId,
        toolId
    ) {

        /*
         * Placeholder.
         *
         * GitHub-only registration
         * will be connected here.
         */

        console.log(
            "PH10 registration:",
            {
                username,
                deviceId,
                toolId
            }
        );
    }

    async function submitDeviceRequest(
        username,
        deviceId,
        toolId
    ) {

        /*
         * Placeholder.
         *
         * GitHub-only device request
         * will be connected here.
         */

        console.log(
            "PH10 device request:",
            {
                username,
                deviceId,
                toolId
            }
        );
    }

    function deny(text) {

        alert(
            "PH10 Access Control\n\n" +
            text
        );
    }

    window.PH10Access = {
        require,
        getDeviceId
    };

})();
