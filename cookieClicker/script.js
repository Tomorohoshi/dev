let cookies = 0n;
let bytes = 0n;
let bytesDecimal = 0;
let eachCookieByteIncrease = 1n;
let animationStartedTime = null; // アニメーションが開始した時間
let lastTime = 0; // 更新用 最後に更新した時間
const UPDATE_INTERVAL = 1000 / 60; // 更新頻度 60fpsで更新

const UNIT = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
const BINARY_UNIT = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB", "RiB", "QiB"];

/** この関数は、idから要素を取得します
 * @param {string} id 要素のID
 * @return {HTMLElement} 取得された要素
 */
function el(id) {return document.getElementById(id)}
/** この関数は、クエリを指定して、要素を取得します
 * @param {string} query 要素のクエリ
 * @param {boolean} isAll すべての要素を取得するかどうか
 */
function query(query, isAll=false) {
	return isAll ? document.querySelectorAll(query) : document.querySelector(query)
}

/** この関数は、keyとvalueを指定して、cookieを保存します
 * @param {string} key cookieの名前
 * @param {string} value cookieの値
 * @returns {string} 保存されたcookie
 */
function save(key, value) {
	document.cookie = `${key}=${value}; max-age=${60*60*24*365};`;
	return document.cookie;
}
/** この関数は、keyを指定して、cookieを取得します
 * @param {string} key cookieの名前
 * @returns {string} 取得されたcookie
 */
function load(key) {
	const value = document.cookie.match(`(^|;) ?${key}=([^;]*)(;|$)`);
	return value ? value[2] : null;
}

/** この関数は、bytesに単位を付けます
 * @return {string} 単位付きのbytes
 */
function byteConvert() {
	let val = bytes;
	let dividedTimes = 0;
	while(val >= 1024) { // 何回割れるか数える
		dividedTimes++;
		val /= 1000n;
	}
	val = bytes;
	for(let i=0;i<dividedTimes-1;i++) {val /= 1000n} // 数値型にするときに小数を残すために1回少なく割る
	val = Number(val) / 1000; // 数値型に変換して最後の1回を割る
	return val + UNIT[dividedTimes];
}

/** この関数は、表示する値を更新します
 * @param {number} val 更新先の値
 * @param {string} id 値を表示する要素のID
 */
function update(val, id) {
	const target = el(id);
	target.innerHTML = val;
	target.classList.remove("valChanged");
	void target.offsetWidth; // リフレッシュ
	target.classList.add("valChanged");
}

function animationFrame(currentTime) {
	if (!animationStartedTime) {
		animationStartedTime = currentTime;
		lastTime = currentTime;
	}

	const delta = currentTime - lastTime;
	if (delta >= UPDATE_INTERVAL) {
		lastTime = currentTime - (delta % UPDATE_INTERVAL);
		const bytesIncreasePerSec = cookies * eachCookieByteIncrease;
		bytes *= 1000n; // /1000する前の値を加えるので、元の値を*1000する
		bytes += bytesIncreasePerSec * BigInt(Math.round(delta)); // 小数部分が消えてしまうので、/1000は後でやる
		bytesDecimal += bytes.toString().slice(-3) / 1000; // 小数部分は別に保存
		bytes /= 1000n; // /1000する
		bytes += BigInt(Math.floor(bytesDecimal)); // 小数部分の整数部分に繰り上がった部分を足す
		bytesDecimal = bytesDecimal % 1; // 小数部分だけにする
	}

	requestAnimationFrame(animationFrame);
}

requestAnimationFrame(animationFrame);

el("cookieAgree").addEventListener("change", function() {
	const isChecked = this.checked;
	query("#cookieBts button", true).forEach(bt => bt.disabled = !isChecked);
})

query("#cookieBts button", true).forEach(bt => {
	bt.onclick = () => {
		cookies++;
		update(cookies, "cookieCount");
		save("cookies", cookies);
		el("cookie").classList.remove("cookieReload");
		void el("cookie").offsetWidth; // リフレッシュ
		el("cookie").classList.add("cookieReload");
		el("cookieAgree").checked = false;
		query("#cookieBts button", true).forEach(bt => bt.disabled = true);
	}
})