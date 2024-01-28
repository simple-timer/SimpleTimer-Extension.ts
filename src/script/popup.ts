//APIサーバーのURL
const apiUrl = "http://localhost:8080/timers/"

////////////////////////////////////////////
//  各種エレメントの取得
////////////////////////////////////////////

//IDの入力欄
const inputElement = document.getElementById("id-input") as HTMLInputElement
//ローカルのストレージから値を代入
inputElement.value = localStorage.getItem("input") as string

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

/**
 * タイマーの基本的なデータ
 */
type TimerData = {
    id: number
    channelId: number
    numberIndex: number
    seconds: number
    displayMessageBase: string
    timerServiceData: TimerServiceData
}

/**
 * タイマーの稼働のデータ
 */
type TimerServiceData = {
    isStarted: boolean
    isMove: boolean
    isFinish: boolean
    startMilliTime: number
    adjustTime: number
    stopTime: number
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
    //要素を作成
    let timeElement = document.createElement("p") as HTMLParagraphElement

    //分秒を文字列にする(1桁の場合は2桁に)
    let minutes = time.minutes.toString()
    if (minutes.length < 2) minutes = "0" + minutes
    let seconds = time.seconds.toString()
    if (seconds.length < 2) seconds = "0" + seconds

    //要素に適用
    timeElement.textContent = `${minutes}:${seconds}`

    return timeElement
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


/**
 * TimerDataを現在時刻からTimeに変換
 * @param timerData
 */
function timerDataToTime(timerData: TimerData) {
    //現在の時間を取得
    let time = (new Date()).getTime()

    //終了しているかを確認
    if (timerData.timerServiceData.isFinish) {
        //0分0秒で返す
        return {minutes: 0, seconds: 0} as Time
    }

    //一時停止中かを確認
    if (!timerData.timerServiceData.isMove) {
        //停止した時間を用いる
        time = timerData.timerServiceData.stopTime
    }

    //経過時間
    let elapsedTime = time - timerData.timerServiceData.startMilliTime
    //残りの秒数
    let seconds = timerData.seconds - Math.floor(((elapsedTime - timerData.timerServiceData.adjustTime) / 1000))

    //秒数がマイナスの時
    if (seconds < 0) {
        //0分0秒で返す
        return {minutes: 0, seconds: 0} as Time
    }

    //60で割り、小数点を切り捨てで分にする
    let minutes = Math.floor(seconds / 60)
    //分数をのぞいた秒数を取得
    seconds = Math.floor(seconds % 60)

    //Timeにして返す
    return {minutes: minutes, seconds: seconds} as Time
}


////////////////////////////////////////////
//  定期実行のタスクの関数
////////////////////////////////////////////
//表示するタイマーのデータの配列
let timerDataArray: TimerData[] = []

/**
 * APIサーバーへのリクエストのタスク
 *
 */
function requestTask() {
    //入力欄が空白かを確認
    let input = inputElement.value

    if (input == null || input == "") {
        //すでにあるのを空にする
        timerDataArray = []
        //警告が出ていたら消す
        deleteAlert()
        return
    }

    //入力の値が数値かを確認
    let channelIdInput = Number(input)
    if (channelIdInput == 0) {
        alert("無効なIDです")
        //すでにあるのを空にする
        timerDataArray = []
        return;
    }

    //URLを作成
    let requestUrl = apiUrl + input

    //リクエストを送信
    let request = new XMLHttpRequest()
    request.open("GET", requestUrl)
    request.responseType = "json"
    request.onload = () => {
        //ステータスを確認
        if (request.readyState == 4 && request.status == 200) {
            let response = request.response

            //タイマーの情報が取得できたかを確認
            if (response == "" || response == null) {
                alert("タイマーが動いていません")
                //すでにあるのを空にする
                timerDataArray = []
                return
            }

            //タイマーの情報を更新
            timerDataArray = JSON.parse(JSON.stringify(response)) as TimerData[]

            //警告が出ていたら消す
            deleteAlert()
        }
    }
    request.send()
}


/**
 * 表示を更新するタスク
 *
 */
function updateDisplayTask() {
    //時間の更新を行ったかのフラグ
    let updateFlagArray: boolean[] = [false, false, false, false]

    //TimerDataを用いて表示を更新
    timerDataArray.forEach((timerData) => {
        //残り時刻を取得
        let time = timerDataToTime(timerData)
        //要素を作成
        let timeElement = createTimeElement(time)

        //親となる要素を取得
        let parentElement = timerElements[timerData.numberIndex]
        //中身を削除
        parentElement.innerHTML = ""
        //表示を変更
        parentElement.appendChild(timeElement)

        //表示を行ったフラグを立てる
        updateFlagArray[timerData.numberIndex] = true
    })

    //forのカウント用
    let count = 0;
    //アップデートしたかのフラグ
    updateFlagArray.forEach((updated) => {
        //時間表示をしたかを確認
        if (updated) {
            //インクリメント
            count++
            return
        }

        //親となる要素を取得
        let parentElement = timerElements[count]
        //中身を削除
        parentElement.innerHTML = ""
        //0分0秒を表示
        parentElement.appendChild(createTimeElement({minutes: 0, seconds: 0}))

        //インクリメント
        count++
    })
}

////////////////////////////////////////////
//  タスクの実行
////////////////////////////////////////////

//最初に1回実行
requestTask()
//5秒ごとに実行
setInterval(requestTask, 5000)

//表示の更新
updateDisplayTask()
//0.1秒ごとに実行
setInterval(updateDisplayTask, 500)

////////////////////////////////////////////
//  イベントリスナー
////////////////////////////////////////////

//Inputの変更
inputElement.addEventListener("input", () => {
    //リクエストを送る
    requestTask()
    //ローカルストレージに保管
    localStorage.setItem("input", inputElement.value)
})


