const E = {
    game: document.getElementById("game"),
    HUD: {
        devInfo: {
            main: document.getElementById("DevInfo"),
            posX: document.getElementById("DEV_position_x"),
            posY: document.getElementById("DEV_position_y"),
        }
    }
}
const yCount = Math.ceil(window.innerHeight / 20)
const xCount = Math.ceil(window.innerWidth / 20)
const GameElemTranslate = [20 * (xCount / 2), 20 * (yCount / 2)]
//#region 맵 만들기
/**
 * @type {string[][]}
 */
const WORLD = localStorage.getItem("key") ?? JSON.parse(JSON.stringify(new Array(250).fill(new Array(250).fill("grass"))))
const Player = [0, 0]
/**
 * @type {HTMLDivElement[][]}
 */
const E_WORLD = JSON.parse(JSON.stringify(new Array(250).fill([])))

for (let y = 0; y < 250; y++) {
    const lane = document.createElement("div")
    lane.id = `lane_${y}`
    E.game.append(lane)
    for (let x = 0; x < WORLD[y].length; x++) {
        const block = document.createElement("div")
        if (x == Player[0] && y == Player[1])
            block.setAttribute("class", "player")
        else
            block.setAttribute("class", WORLD[y][x])
        E_WORLD[y][x] = block
        lane.append(block)
    }
}
E.game.style.transform = `translate(${GameElemTranslate[0]}px, ${GameElemTranslate[1]}px)`
renderHUD()
//#endregion

function renderHUD() {
    E.HUD.devInfo.posX.innerText = `x : ${Player[0]}`
    E.HUD.devInfo.posY.innerText = `y : ${Player[1]}`
}

function renderByPos(x, y, data) {
    WORLD[y][x] = data
    E_WORLD[y][x].setAttribute("class", data)
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
        case "ArrowDown":
        case "ArrowLeft":
            PlayerMOVINGMAN(e.key)
            break;
        case "F3":
            E.HUD.devInfo.main.classList.toggle("invisibility")
            e.preventDefault()
            break;
    }
})

function PlayerMOVINGMAN(key) {
    const oldPlayer = {...Player};
    let canMovePlayer = true;
    switch (key) {
        case "ArrowUp":
            if (Player[1] === 0) return canMovePlayer = false;
            Player[1]--
            GameElemTranslate[1] += 20
            break;
        case "ArrowRight":
            if (Player[0] === WORLD[0].length - 1) return canMovePlayer = false;
            Player[0]++
            GameElemTranslate[0] -= 20
            break;
        case "ArrowDown":
            if (Player[1] === WORLD.length - 1) return canMovePlayer = false;
            Player[1]++
            GameElemTranslate[1] -= 20
            break;
        case "ArrowLeft":
            if (Player[0] === 0) return canMovePlayer = false;
            Player[0]--
            GameElemTranslate[0] += 20
            break;
    }
    if (canMovePlayer)
        E_WORLD[oldPlayer[1]][oldPlayer[0]].setAttribute("class", WORLD[oldPlayer[1]][oldPlayer[0]]) // 플레이어가 있던 곳을 원래 데이터로 변경
    // if (Player[0] > Math.ceil(xCount / 2))
    //     GameElemTranslate[0] -= 20
    // if (Player[1] > Math.ceil(yCount / 2))
    //     GameElemTranslate[1] -= 20
    E.game.style.transform = `translate(${GameElemTranslate[0]}px, ${GameElemTranslate[1]}px)`
    E_WORLD[Player[1]][Player[0]].setAttribute("class", "player")
    renderHUD()
}