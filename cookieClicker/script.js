let cookies = 0n;
let bytes = 0n;
let bytesDecimal = 0;
let eachCookieByteIncrease = 1n;
let animationStartedTime = null; // アニメーションが開始した時間
let lastTime = 0; // 更新用 最後に更新した時間
let upgradeData = [
	{
		name: "dataMult",
		level: 1,
		maxLevel: Infinity,
		value: 1,
		cost: 100n,
		valIncrease: .1,
		costIncrease: ["*", 1.1]
	},
	{
		name: "agreeChecked",
		level: 0,
		maxLevel: 200,
		value: 0,
		cost: 10n,
		valIncrease: .5,
		costIncrease: ["*", 1.25]
	}
];
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

/** この関数は、表示する値を更新します
 * @param {number} val 更新先の値
 * @param {string} id 更新する要素のID、またはクエリ
 * @param {boolean} doAnimation アニメーションをするかどうか
 */
function update(val, id, doAnimation=true) {
	const target = (id[0] == "#") ? query(id) : el(id);
	if(target.innerHTML == val) return; // すでに同じ値なら更新しない
	target.innerHTML = val;

	if(!doAnimation) return;
	target.classList.remove("valChanged");
	void target.offsetWidth; // リフレッシュ
	target.classList.add("valChanged");
}

/** この関数は、bytesに単位を付け、表示します
 * @param {string} id bytesを表示する要素のID
*/

function byteConvert(val=bytes) {
	let result = val;
	let dividedTimes = 0;
	while(result >= 1000) { // 何回割れるか数える
		dividedTimes++;
		result /= 1000n;
	}
	result = val;
	if(dividedTimes == 0) {
		result = val + UNIT[0];
	} else {
		for(let i=0;i<dividedTimes-1;i++) {result /= 1000n} // 数値型にするときに小数を残すために1回少なく割る
		result = Number(result) / 1000; // 数値型に変換して最後の1回を割る
		result = result.toFixed(2);
		result = result + UNIT[dividedTimes];
	}
	return result;
}

function byteUpdate(id) {
	const beforeResult = el(id).innerHTML;
	let converted = byteConvert(bytes);
	if(beforeResult != converted) update(converted, id);
}

function animationFrame(currentTime) {
	if (!animationStartedTime) {
		animationStartedTime = currentTime;
		lastTime = currentTime;
	}

	const delta = currentTime - lastTime;
	if (delta >= UPDATE_INTERVAL) {
		const beforeBytes = bytes;
		const bytesIncreasePerSec = cookies * eachCookieByteIncrease;
		lastTime = currentTime - (delta % UPDATE_INTERVAL);
		bytes *= 1000n; // /1000する前の値を加えるので、元の値を*1000する
		bytes += BigInt(Math.round(bytesDecimal * 1000)); // 3桁までの小数は格納する
		bytes += bytesIncreasePerSec * BigInt(Math.round(delta)); // 小数部分が消えてしまうので、/1000は後でやる
		bytesDecimal = bytes.toString().slice(-3) / 1000; // 小数部分は別に保存
		bytes /= 1000n; // /1000する
		bytes += BigInt(Math.floor(bytesDecimal)); // 小数部分の整数部分に繰り上がった部分を足す
		bytesDecimal = bytesDecimal % 1; // 小数部分だけにする

		byteUpdate("byteCount");
	}

	requestAnimationFrame(animationFrame);
}

requestAnimationFrame(animationFrame);


function buy(upgradeIndex, times) {
	const upgrade = upgradeData[upgradeIndex];
	changeVal: for(let i=0;i<times;i++) {
		if(bytes >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
			bytes -= upgrade.cost;
			upgrade.level++;
			upgrade.value += upgrade.valIncrease;
			switch(update.costIncrease[0]) {
				case "+":
					upgrade.cost += BigInt(upgrade.costIncrease[1]);
					break;
				case "*":
						const factorDecimalLength = upgrade.costIncrease[1].toString().split(".")[1].length; // 小数点以下の桁数
						upgrade.cost *= 10n ** BigInt(factorDecimalLength); // BigIntで小数を計算するために10^桁数倍する
						upgrade.cost *= BigInt(upgrade.costIncrease[1]) * (10n ** BigInt(factorDecimalLength)); // 小数部分を計算
						upgrade.cost /= 10n ** BigInt(factorDecimalLength); // 小数点以下の桁数を戻す(切り捨てる)
						break;
				default: break;
			}
		} else break changeVal;
	}
	update(upgrade.level, `#${upgrade.name} .level`);
	update(upgrade.value.toFixed(1), `#${upgrade.name} .nowVal`);
	update((upgrade.value+upgrade.valIncrease).toFixed(1), `#${upgrade.name} .nextVal`);
	update(byteConvert(upgrade.cost), `#${upgrade.name} .cost`);
}

el("dataMult").onclick = function() {
	buy(0, 1);
}

el("cookieAgree").addEventListener("change", function() {
	const isChecked = this.checked;
	query("#cookieBts button", true).forEach(bt => bt.disabled = !isChecked);
});

query("#cookieBts button", true).forEach(bt => {
	bt.onclick = () => {
		cookies++;
		update(cookies, "cookieCount");
		update(cookies, "upgradeCookieCount");
		save("cookies", cookies);
		el("cookie").classList.remove("cookieReload");
		void el("cookie").offsetWidth; // リフレッシュ
		el("cookie").classList.add("cookieReload");
		el("cookieAgree").checked = false;
		query("#cookieBts button", true).forEach(bt => bt.disabled = true);
	}
});