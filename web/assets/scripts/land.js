const E = {
    game: document.getElementById("game"),
    player: document.getElementById("player"),
    HUD: {
        devInfo: {
            main: document.getElementById("DevInfo"),
            posX: document.getElementById("DEV_position_x"),
            posY: document.getElementById("DEV_position_y"),
        },
        devConsole: {
            main: document.getElementById("DevConsole"),
            input: document.getElementById("DEV_chat"),
            list: document.getElementById("DEV_chatList")
        }
    }
}
const BLOCK_SIZE = 50
let Selected_Block = "grass";
const yCount = Math.ceil(window.innerHeight / BLOCK_SIZE)
const xCount = Math.ceil(window.innerWidth / BLOCK_SIZE)
const GameElemTranslate = [BLOCK_SIZE * (xCount / 2), BLOCK_SIZE * (yCount / 2)]
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
        block.setAttribute("class", WORLD[y][x])
        E_WORLD[y][x] = block
        lane.append(block)
    }
}
renderPlayer(0, 0)
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
function renderPlayer(x, y, degree) {
    Player[0] = x
    Player[1] = y
    GameElemTranslate[0] = BLOCK_SIZE * (xCount / 2) - (BLOCK_SIZE * x)
    GameElemTranslate[1] = BLOCK_SIZE * (yCount / 2) - (BLOCK_SIZE * y)
    E.game.style.transform = `translate(${GameElemTranslate[0]}px, ${GameElemTranslate[1]}px)`
    E.player.style.left = `${BLOCK_SIZE * (xCount / 2)}px`
    E.player.style.top = `${BLOCK_SIZE * (yCount / 2)}px`
    E.player.style.transform = `rotateZ(${degree}deg)`
}

//#region 이벤트 리스너
document.body.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "ArrowRight":
        case "ArrowDown":
        case "ArrowLeft":
            PlayerMOVINGMAN(e)
            e.preventDefault()
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
E.HUD.devConsole.main.addEventListener("keydown", (e) => {
    console.log(e.key)
    if (e.key == "Enter") {
        const v = E.HUD.devConsole.input.value
        const vA = v.split(" ")
        if (v == "help") {
            devLog(`=====HELP=====
                tp [x] [y] [degree?] : Player을(를) [x] [y] 위치로 이동하고 [degree]각도로 변경`)
        }
        else if (/^tp (\d+|~) (\d+|~)( \d+(\.\d+)?)?$/gm.test(v)) {
            // TP
            renderPlayer(
                vA[1] == "~" ? Player[0] : parseInt(vA[1]),
                vA[2] == "~" ? Player[1] : parseInt(vA[2]),
                parseFloat(vA[3] ?? "0")
            )
            devSuccess(`Player을(를) (${vA[1].replace("~", Player[0])}, ${vA[2].replace("~", Player[1])})로 이동하고 각도를 ${vA[3] ?? "0"}º로 바꾸는 것`)
        }
        else return devError(`'${vA[0]}'은(는) 존재하는 명령어가 아니거나, 명령어가 올바른지 검증한 다음 다시 시도 하십시오.`);
        E.HUD.devConsole.input.value = ""
    }
    else if (e.key == "Escape") 
        E.HUD.devConsole.main.classList.toggle("invisibility")
    e.stopImmediatePropagation()
})
for (const item of document.getElementById("hotbar").getElementsByClassName("item")) {
    item.addEventListener("mouseup", (e) => {
        Selected_Block = e.target.dataset.id
        console.log(e.target.classList)
        document.querySelectorAll("#hotbar .item").forEach(elem => {
            if (elem.dataset.id === Selected_Block)
                elem.classList.add("selected")
            else
                elem.classList.remove("selected")
        })
    })
}
//#endregion
function PlayerMOVINGMAN(e) {
    const myPlayer = {...Player};
    let degree = 0
    let canMovePlayer = true
    console.log(e)
    switch (e.key) {
        case "ArrowUp":
            degree = 0
            if (Player[1] === 0) {
                canMovePlayer = false;
                break;
            }
            myPlayer[1]--
            break;
        case "ArrowRight":
            degree = 90
            if (Player[0] === WORLD[0].length - 1) {
                canMovePlayer = false;
                break;
            }
            if (e.ctrlKey) {
                degree = 45
                myPlayer[0]++
                if (Player[1] !== 0) myPlayer[1]--
            }
            else if (e.altKey) {
                degree = 135
                myPlayer[0]++
                if (Player[1] !== WORLD.length - 1) myPlayer[1]++
            }
            else myPlayer[0]++
            break;
        case "ArrowDown":
            degree = 180
            if (Player[1] === WORLD.length - 1) {
                canMovePlayer = false;
                break;
            }
            myPlayer[1]++
            break;
        case "ArrowLeft":
            degree = 270
            if (Player[0] === 0) {
                canMovePlayer = false;
                break;
            }
            if (e.ctrlKey) {
                degree = 315
                myPlayer[0]--
                if (Player[1] !== 0) myPlayer[1]--
            }
            else if (e.altKey) {
                degree = 225
                myPlayer[0]--
                if (Player[1] !== WORLD.length - 1) myPlayer[1]++
            }
            else myPlayer[0]--
            break;
    }
    if (canMovePlayer)
        renderPlayer(myPlayer[0], myPlayer[1], degree)
    else
        renderPlayer(Player[0], Player[1], degree)
    renderHUD()
}

function devError(text) {
    callDevLog(text, "#ff0000")
}
function devSuccess(text) {
    callDevLog(`${text}을(를) 성공적으로 수행하였습니다.`, "#00ff00")
}
function devLog(text) {
    callDevLog(text, "#eeeeee")
}
function callDevLog(text, color) {
    const line = document.createElement("span")
    line.innerHTML = text.replaceAll("\n", "<br />")
    line.style.color = color
    E.HUD.devConsole.list.append(line)
}