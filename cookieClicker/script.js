let cookies = 0n;
let bytes = 0n;
let bytesDecimal = 0;
let increasePerSec = 1n;
let increasePerSecDecimal = 0;
let animationStartedTime = null; // アニメーションが開始した時間
let lastTime = 0; // 更新用 最後に更新した時間
let upgradeData = {
	agreeChecked: {
		level: 0,
		maxLevel: 200,
		value: 0,
		cost: 20n,
		valIncrease: .5,
		costIncrease: ["*", 1.25]
	},
	dataMult: {
		level: 0,
		maxLevel: Infinity,
		value: 1,
		cost: 100n,
		valIncrease: .1,
		costIncrease: ["*", 1.15],
	},
	doubleCookie: {
		level: 0,
		maxLevel: Infinity,
		value: 0,
		cost: 200n,
		valIncrease: 1,
		costIncrease: ["*", 1.25]
	}
};
const UPDATE_INTERVAL = 1000 / 60; // 更新頻度 60fpsで更新

const UNIT = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
const BINARY_UNIT = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB", "RiB", "QiB"];

for(const key in upgradeData) upgradeUpdate(key, false);
update(cookies, "cookieCount", false);
increasePerSecUpdate(false);
update(cookies, "upgradeCookieCount", false);

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

/** この関数は、BigInt型*小数を計算する関数です。
 * @param {bigint} [bigVal=1n] 被乗数(BigInt型)
 * @param {number} [val2=1] かける数
 */
function multipleBigInt(bigVal=1n, val2=1) {
	const factorDecimalLength = (val2.toString().includes(".")) ? val2.toString().split(".")[1].length : 0;
	let result = bigVal;
	result *= BigInt(val2.toString().replace(".", ""));
	result /= 10n ** BigInt(factorDecimalLength);
	return result;
}

/** この関数は、表示する値を更新します
 * @param {number} val 更新先の値
 * @param {string} id 更新する要素のID、またはクエリ
 * @param {boolean} doAnimation アニメーションをするかどうか
 */
function update(val, id, doAnimation=true) {
	const target = (id[0] == "#") ? query(id) : el(id);
	if(target.innerHTML === val) return; // すでに同じ値なら更新しない
	target.innerHTML = val;

	if(!doAnimation) return;
	target.classList.remove("valChanged");
	void target.offsetWidth; // リフレッシュ
	target.classList.add("valChanged");
}

/** この関数は、アップグレードの情報を更新します
 * @param {string} name 更新するアップグレードの名前
 * @param {boolean} doAnimation アニメーションをするかどうか
 */
function upgradeUpdate(name, doAnimation=true) {
	const upgrade = upgradeData[name];
	update(upgrade.level, `#${name} .level`, doAnimation);
	update(upgrade.value.toFixed(1), `#${name} .nowVal`, doAnimation);
	update((upgrade.value+upgrade.valIncrease).toFixed(1), `#${name} .nextVal`, doAnimation);
	update(byteConvert(upgrade.cost), `#${name} .cost`, doAnimation);
	el(name).disabled = !(bytes >= upgrade.cost);
}

/** この関数は、バイトの増加量の値を更新します
 * @param {boolean} doAnimation アニメーションをするかどうか
 */
function increasePerSecUpdate(doAnimation=true) {
	increasePerSec = multipleBigInt(1n, upgradeData.dataMult.value);
	increasePerSecDecimal = upgradeData.dataMult.value % 1; // 便宜上のため置いとく
	increasePerSec += BigInt(Math.floor(increasePerSecDecimal));
	increasePerSecDecimal %= 1;

	let display;
	if(increasePerSec <= 1000n && increasePerSecDecimal != 0) {
		display = increasePerSec.toString();
		display += increasePerSecDecimal.toFixed(2).toString().slice(1) + "B";
	} else {
		display = byteConvert(increasePerSec);
	}
	update(display, "perSecCount", doAnimation);
}

/** この関数は、値をバイト数とみなし、単位を付けます
 * @param {string} id bytesを表示する要素のID
 */
function byteConvert(val=bytes) {
	let result = val;
	let dividedTimes = 0;
	while(result >= 1000n) { // 何回割れるか数える
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

/** この関数は、requestAnimationFrameで呼び出される、常に更新するための関数です
 * @param {number} currentTime 現在時刻(ミリ秒)
 */
function animationFrame(currentTime) {
	if (!animationStartedTime) {
		animationStartedTime = currentTime;
		lastTime = currentTime;
	}

	const delta = currentTime - lastTime;
	if (delta >= UPDATE_INTERVAL) {
		const beforeBytes = bytes;
		const allIncreasePerSec = (cookies * increasePerSec) + multipleBigInt(cookies, increasePerSecDecimal);
		lastTime = currentTime - (delta % UPDATE_INTERVAL);
		bytes *= 1000n; // /1000する前の値を加えるので、元の値を*1000する
		bytes += BigInt(Math.round(bytesDecimal * 1000)); // 3桁までの小数は格納する
		bytes += allIncreasePerSec * BigInt(Math.round(delta)); // 小数部分が消えてしまうので、/1000は後でやる
		bytesDecimal = bytes.toString().slice(-3) / 1000; // 小数部分は別に保存
		bytes /= 1000n; // /1000する
		bytes += BigInt(Math.floor(bytesDecimal)); // 小数部分の整数部分に繰り上がった部分を足す
		bytesDecimal = bytesDecimal % 1; // 小数部分だけにする

		const beforeResult = el("byteCount").innerHTML;
		let converted = byteConvert(bytes);
		if(beforeResult != converted) {
			update(converted, "byteCount");
			for(let i=0;i<Object.keys(upgradeData).length;i++) {
				const upgradeKeys = Object.keys(upgradeData);
				upgradeUpdate(upgradeKeys[i], false);
			}
		}
	}

	requestAnimationFrame(animationFrame);
}

requestAnimationFrame(animationFrame);

/** この関数は、アップグレードを購入するための関数です
 * @param {string} upgradeIndex アップグレードのインデックス
 * @param {number} times 購入する回数
 */
function buy(upgradeIndex, times=1) {
	const upgrade = upgradeData[upgradeIndex];
	changeVal: for(let i=0;i<times;i++) {
		if(bytes >= upgrade.cost && upgrade.level < upgrade.maxLevel) {
			bytes -= upgrade.cost;
			upgrade.level++;
			upgrade.value += upgrade.valIncrease;
			switch(upgrade.costIncrease[0]) {
				case "+":
					upgrade.cost += BigInt(upgrade.costIncrease[1]);
					break;
				case "*":
					upgrade.cost = multipleBigInt(upgrade.cost, upgrade.costIncrease[1]);
						break;
				default: break;
			}
		} else break changeVal;
	}
	upgrade.value = Math.round(upgrade.value*1000)/1000;
}

el("dataMult").onclick = function() {
	buy("dataMult");
	increasePerSecUpdate();
}

el("cookieAgree").addEventListener("change", function() {
	const isChecked = this.checked;
	query("#cookieBts button", true).forEach(bt => bt.disabled = !isChecked);
});

// Cookieが許可されたときの処理
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

		setTimeout(() => {
			// アップグレードの値によってすでにチェックされているかどうかを決める
			const isChecked = Math.random()*100 < upgradeData.agreeChecked.value;
			el("cookieAgree").checked = isChecked;
			query("#cookieBts button", true).forEach(bt => bt.disabled = !isChecked);

			const isDouble = Math.random()*100 < upgradeData.doubleCookie.value;
			if(isDouble) {
				// el("cookieNum").display = "flex";
				el("cookieNum").style.opacity = 1;
			} else {
				// el("cookieNum").display = "none";
				el("cookieNum").style.opacity = 0;
			}
		}, 400);
	}
});