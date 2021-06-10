import { GameManager, GameManagerOptions } from "./managers/gameManager";

// Game manager options.
const options: GameManagerOptions = {
    // Provide the directory path of scenes.
    // Doesn't works well so far.
    sceneDirectoryPath: 'scenes',
};

const manager: GameManager = GameManager.Initialization(options);
manager.start()
    .then(() => {
    console.log('Game started successfully.')
}).catch(e => {
    console.error('Game started failed: ', e);
})

const socket = new WebSocket("ws://localhost:9999");
socket.binaryType = 'arraybuffer';

const state = {
    DISCONNECTED: 'disconnected',
    CONNECTED: 'connected',
    SENT_PSEED: 'sent_pseed',
    LOGGED_IN: 'logged_in',
}
let currentState = state.DISCONNECTED;
const changeState = (newState: string) => {
    currentState = newState;
    console.log("Current state: ", currentState);

    switch (currentState) {
        case state.CONNECTED:
            // 239 is the packet id.
            const pSeedArray = [
                239, 1, 0, 0,
                127, 0, 0, 0, 7,
                0, 0, 0, 0, 0, 0, 0,
                15, 0, 0, 0, 1
            ];
            const pSeedPacket = {
                type: "data",
                payload: pSeedArray,
            }
            socket.send(JSON.stringify(pSeedPacket));
            // FIXME: get success response from WebTPC before state change.
            changeState(state.SENT_PSEED);
            break;
        case state.SENT_PSEED:
            const acc = Array.from("birdinforest");
            const pwd = Array.from("Sandy.1984");
            const loginData = new Array(62).fill(0);
            // 128 is the packet id.
            loginData[0] = 128;
            for (let i = 0; i < 30; i++) {
                if(i < acc.length) {
                    loginData[i+1] = acc[i].charCodeAt(0);
                    console.log(acc[i], ':', acc[i].charCodeAt(0));
                } else {
                    loginData[i] = 0;
                }
            }
            for (let i = 0; i < pwd.length && i < 30; i++) {
                if(i < pwd.length) {
                    loginData[31 + i] = pwd[i].charCodeAt(0);
                    console.log(pwd[i], ':', pwd[i].charCodeAt(0));
                } else {
                    loginData[30 + i] = 0;
                }
            }
            loginData[60] = 0;
            loginData[61] = 255;

            const loginPacket = {
                type: "data",
                payload: loginData,
            }

            console.log(loginData);
            socket.send(JSON.stringify(loginPacket));
            // FIXME: get success response from WebTPC before state change.
            changeState(state.LOGGED_IN);
        default:
            break;
    }
}

console.log("Connecting.");
socket.onopen = () => {
    console.log("Connection established.");
    const host = {
        type: "connect",
        host: "play.uoevolution.com",
        port: 2593,
        ssl: false,
        // encoding: "utf8",
        timeout: 0,
        noDelay: false,
        keepAlive: true,
        initialDelay:0,
    };

    // const host = {
    //     type: "connect",
    //     host: "play.uooutlands.com",
    //     port: 2593,
    //     ssl: false,
    //     encoding: "utf8",
    //     timeout: 0,
    //     noDelay: false,
    //     keepAlive: true,
    //     initialDelay:0,
    // };

    // const host = {
    //     type: "connect",
    //     host: "127.0.0.1",
    //     port: 1337
    // };
    socket.send(JSON.stringify(host));
    console.log("Connected to host: ", host.host, host.port);
}

socket.onmessage = (e) => {
    console.log('Socket message:', e);
    if(e && typeof e.data === 'string' && JSON.parse(e.data).type === 'connect') {
        changeState(state.CONNECTED);
    }
}
