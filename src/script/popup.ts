////////////////////////////////////////////
//  各種エレメントの取得
////////////////////////////////////////////
//IDの入力欄
const inputElement = document.getElementById("id-input") as HTMLInputElement
//警告メッセージ
const alertElement = document.getElementById("alert") as HTMLDivElement
//タイマーの表示部分
const timerElements = [
    document.getElementById("timer-1") as HTMLDivElement,
    document.getElementById("timer-2") as HTMLDivElement,
    document.getElementById("timer-3") as HTMLDivElement,
    document.getElementById("timer-4") as HTMLDivElement
]

////////////////////////////////////////////
//  Typeの定義
////////////////////////////////////////////
/**
 * 時間
 */
type Time = {
    minutes: number
    seconds: number
}

////////////////////////////////////////////
//  関数の定義
////////////////////////////////////////////
/**
 * 時間表示のエレメントを作成
 *
 * @param time 表示する時間
 */
function createTimeElement(time: Time) {
    let timeElement = document.createElement("p") as HTMLParagraphElement
    timeElement.textContent = `${time.minutes}:${time.seconds}`
    
    return timerElements
}

//現在表示している警告のテキスト
let alertText = ""

/**
 * 警告を表示する
 *
 * @param test 表示するテキスト
 */
function alert(test: string) {
    //表示中のものと同じ時は何もしない
    if (test === alertText) return
    alertText = test

    //子を削除
    alertElement.innerHTML = ""

    //要素を作成して表示
    let alertTextElement = document.createElement("p") as HTMLDivElement
    alertTextElement.textContent = alertText
    alertElement.appendChild(alertTextElement)
}
/**
 * アラートを削除
 */
function deleteAlert() {
    alertText = ""
    alertElement.innerHTML = ""
}

function task() {
}

////////////////////////////////////////////
//  タスクの実行
////////////////////////////////////////////
//最初に1回実行
task()
//5秒ごとに実行
setInterval(task, 5000)