const E = {
    game: document.getElementById("game"),
    HUD: {
        devInfo: {
            main: document.getElementById("DevInfo"),
            posX: document.getElementById("DEV_position_x"),
            posY: document.getElementById("DEV_position_y"),
        },
        devConsole: {
            main: document.getElementById("DevConsole"),
            input: document.getElementById("DEV_chat")
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
function renderPlayer(oldX, oldY, x, y) {
    E_WORLD[oldY][oldX].setAttribute("class", WORLD[oldY][oldX]) // 플레이어가 있던 곳을 원래 데이터로 변경
    Player[0] = x
    Player[1] = y
    GameElemTranslate[0] = 20 * (xCount / 2) - (20 * x)
    GameElemTranslate[1] = 20 * (yCount / 2) - (20 * y)
    E.game.style.transform = `translate(${GameElemTranslate[0]}px, ${GameElemTranslate[1]}px)`
    E_WORLD[y][x].setAttribute("class", "player")
}

//#region 이벤트 리스너
document.body.addEventListener('keydown', (e) => {
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
        case "/":
            E.HUD.devConsole.main.classList.toggle("invisibility")
            E.HUD.devConsole.input.focus()
            e.preventDefault()
            break;
    }
})
E.HUD.devConsole.input.addEventListener("keydown", (e) => {
    console.log(e.key)
    if (e.key == "Enter") {
        const v = E.HUD.devConsole.input.value
        if (/^tp \d+ \d+$/gm.test(v)) {
            const vA = v.split(" ")
            renderPlayer(Player[0], Player[1], parseInt(vA[1]), parseInt(vA[2]))
        }
        else return;
        E.HUD.devConsole.input.value = ""
    }
    else if (e.key == "Escape") 
        E.HUD.devConsole.main.classList.toggle("invisibility")
    e.stopImmediatePropagation()
})
//#endregion
function PlayerMOVINGMAN(key) {
    const myPlayer = {...Player};
    switch (key) {
        case "ArrowUp":
            if (Player[1] === 0) return canMovePlayer = false;
            myPlayer[1]--
            break;
        case "ArrowRight":
            if (Player[0] === WORLD[0].length - 1) return canMovePlayer = false;
            myPlayer[0]++
            break;
        case "ArrowDown":
            if (Player[1] === WORLD.length - 1) return canMovePlayer = false;
            myPlayer[1]++
            break;
        case "ArrowLeft":
            if (Player[0] === 0) return canMovePlayer = false;
            myPlayer[0]--
            break;
    }
    renderPlayer(Player[0], Player[1], myPlayer[0], myPlayer[1])
    renderHUD()
}