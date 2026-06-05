function el(id) {
	return document.getElementById(id);
}
let val;
let nextVal;
let times = {
	all: 0,
	odd: 0, // 奇数が出てきた数
	even: 0 // 偶数が出てきた数
};

el("executeBt").addEventListener("click", execute);
function execute() {
	try {
	val = BigInt(el("input").value);
	index = 0;
	el("output").value = "";
	el("indexOutput").innerHTML = "計算回数: "
	while (val != 1n) {
		index++;
		console.log(String(val))
		if(val % 2n == 0n) {
			nextVal = val / 2n;
			el("output").value += `${val}は偶数なので${val}/2=${nextVal}\n`;
			val = val / 2n;
		} else {
			nextVal = val * 3n + 1n;
			el("output").value += `${val}は奇数なので${val}*3+1=${nextVal}\n`;
			val = val * 3n + 1n;
		}
	}
	el("indexOutput").innerHTML = "計算回数: " + index;
}catch(error) {console.log(`${error.name}\n${error.stack}`)}
}