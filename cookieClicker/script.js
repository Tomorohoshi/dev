let cookies = 0;
let bytes = 0n;
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

query("#cookieBts button", true).forEach(bt => {
	bt.onclick = () => {
		cookies++;
		update(cookies, "cookieCount");
		save("cookies", cookies);
		el("cookie").classList.remove("cookieReload");
		void el("cookie").offsetWidth; // リフレッシュ
		el("cookie").classList.add("cookieReload");
	}
})