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
const yCount = Math.ceil(window.innerHeight / BLOCK_SIZE)
const xCount = Math.ceil(window.innerWidth / BLOCK_SIZE)
const GameElemTranslate = [BLOCK_SIZE * (xCount / 2), BLOCK_SIZE * (yCount / 2)]
//#region 맵 만들기
/**
 * @type {string[][]}
 */
const WORLD = localStorage.getItem("key") ?? JSON.parse(JSON.stringify(new Array(250).fill(new Array(250).fill("grass"))))
const Player = {
    position: [0, 0],
    block: "grass",
    speed: 1,
}
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
    E.HUD.devInfo.posX.innerText = `x : ${Player.position[0]}`
    E.HUD.devInfo.posY.innerText = `y : ${Player.position[1]}`
}

function renderByPos(x, y, data) {
    WORLD[y][x] = data
    E_WORLD[y][x].setAttribute("class", data)
}
function renderPlayer(x, y, degree) {
    Player.position[0] = x
    Player.position[1] = y
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
        case "Shift":
            renderByPos(Player.position[0], Player.position[1], Player.block)
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
                tp [x|~] [y|~] [degree?] : Player을(를) [x] [y] 위치로 이동하고 [degree]각도로 변경
                setspeed [speed|*] Player을(를) [speed]속도로 변경`)
        }
        else if (/^tp (\d+|~) (\d+|~)( \d+(\.\d+)?)?$/gm.test(v)) {
            // TP
            renderPlayer(
                vA[1] == "~" ? Player.position[0] : parseInt(vA[1]),
                vA[2] == "~" ? Player.position[1] : parseInt(vA[2]),
                parseFloat(vA[3] ?? "0")
            )
            devSuccess(`Player을(를) (${vA[1].replace("~", Player.position[0])}, ${vA[2].replace("~", Player.position[1])})로 이동하고 각도를 ${vA[3] ?? "0"}º로 바꾸는 것`)
        }
        else if (/^setspeed (\d+|\*)$/gm.test(v)) {
            // SetSpeed
            Player.speed = parseInt(vA[1].replace("*", "1"))
            devSuccess(`Player의 속도를 '${vA[1].replace("*", "1")}'(으)로 바꾸는 것`)
        }
        else return devError(`'${vA[0]}'은(는) 존재하는 명령어가 아니거나, 명령어가 올바른지 검증한 다음 다시 시도 하십시오.`);
        E.HUD.devConsole.input.value = ""
        renderHUD()
    }
    else if (e.key == "Escape") 
        E.HUD.devConsole.main.classList.toggle("invisibility")
    e.stopImmediatePropagation()
})
for (const item of document.getElementById("hotbar").getElementsByClassName("item")) {
    item.addEventListener("mouseup", (e) => {
        Player.block = e.target.dataset.id
        console.log(e.target.classList)
        document.querySelectorAll("#hotbar .item").forEach(elem => {
            if (elem.dataset.id === Player.block)
                elem.classList.add("selected")
            else
                elem.classList.remove("selected")
        })
    })
}
//#endregion
function PlayerMOVINGMAN(e) {
    const myPlayer = {...Player.position};
    let degree = 0
    let canMovePlayer = true
    console.log(e)
    const isOverTop = Player.position[1] <= 0
    const isOverRight = Player.position[0] >= WORLD[0].length - 1
    const isOverBottom = Player.position[1] >= WORLD.length - 1
    const isOverLeft = Player.position[0] <= 0
    switch (e.key) {
        case "ArrowUp":
            degree = 0
            if (isOverTop) {
                canMovePlayer = false;
                break;
            }
            myPlayer[1] -= 1 * Player.speed
            break;
        case "ArrowRight":
            degree = 90
            if (isOverRight) {
                canMovePlayer = false;
                break;
            }
            if (e.ctrlKey) {
                degree = 45
                myPlayer[0] += 1 * Player.speed
                if (!isOverTop) myPlayer[1] -= 1 * Player.speed
            }
            else if (e.altKey) {
                degree = 135
                myPlayer[0] += 1 * Player.speed
                if (!isOverBottom) myPlayer[1] += 1 * Player.speed
            }
            else myPlayer[0] += 1 * Player.speed
            break;
        case "ArrowDown":
            degree = 180
            if (isOverBottom) {
                canMovePlayer = false;
                break;
            }
            myPlayer[1] += 1 * Player.speed
            break;
        case "ArrowLeft":
            degree = 270
            if (isOverLeft) {
                canMovePlayer = false;
                break;
            }
            if (e.ctrlKey) {
                degree = 315
                myPlayer[0] -= 1 * Player.speed
                if (!isOverTop)  myPlayer[1] -= 1 * Player.speed
            }
            else if (e.altKey) {
                degree = 225
                myPlayer[0] -= 1 * Player.speed
                if (!isOverBottom)  myPlayer[1] += 1 * Player.speed
            }
            else myPlayer[0] -= 1 * Player.speed
            break;
    }
    if (canMovePlayer)
        renderPlayer(myPlayer[0], myPlayer[1], degree)
    else
        renderPlayer(Player.position[0], Player.position[1], degree)
    renderHUD()
}

function devError(text) {
    callDevLog(text, "#ff0000")
}
function devSuccess(text) {
    callDevLog(`${text}을 성공적으로 수행하였습니다.`, "#00ff00")
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