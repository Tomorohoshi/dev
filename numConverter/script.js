function el(id) {return document.getElementById(id)};
var nowEl = 1;
const englishNum = [
	["","K","M","B","T","q","Q","s","S","O","N",""],
	["","U","D","T","q","Q","s","S","O","N",""],
	["","D","V","Tr","Qu","Qi","Sx","Sp","Oc","No",""],
	["","Ce","Du","Te","Qr","Qn","Ss","St","Ot","Nn",""],
	"Mi"
];
/* 順番
	[2がないなら0,あるなら1][2][3]
	[4]はラスト(それしかつけない)
	[0] 1=10^0 ~ 1N=10^30
	[1] 1D = 10^33 ~ 1ND=10^60
	[2] 1D = 10^33 ~ 1No = 10^273
	[3] 1Ce = 10^303 ~ 1Nn = 10^2703
	[4] 1Mi = 10^3003
*/
const japaneseNum = [
	["","万","億","兆","京","垓","𥝱","穣","溝","澗","正","載","極","恒河沙","阿僧祇","那由他","不可思議","無量大数"],
	"洛叉",
	["倶胝","阿庾多","那由他","頻波羅","矜羯羅","阿伽羅","最勝","摩婆羅","阿婆羅","多婆羅","界分","普摩","禰摩","阿婆鈐","弥伽婆","毘攞伽","毘伽婆","僧羯邏摩","毘薩羅","毘贍婆","毘盛伽","毘素陀","毘婆訶","毘薄底","毘佉擔","称量","一持","異路","顛倒","三末耶","毘睹羅","奚婆羅","伺察","周広","高出","最妙","泥羅婆","訶理婆","一動","訶理蒲","訶理三","奚魯伽","達攞歩陀","訶魯那","摩魯陀","懺慕陀","瑿攞陀","摩魯摩","調伏","離憍慢","不動","極量","阿麼怛羅","勃麼怛羅","伽麼怛羅","那麼怛羅","奚麼怛羅","鞞麼怛羅","鉢羅麼怛羅","尸婆麼怛羅","翳羅","薜羅","諦羅","偈羅","窣歩羅","泥羅","計羅","細羅","睥羅","謎羅","娑攞荼","訶羅荼","嚩羅荼","室羅荼","一羅荼","須婆羅","阿婆羅","奚婆羅","毘婆羅","極羅","阿伽羅","摩伽羅","須陀羅","阿蘇羅","婆蘇羅","婆訶羅","阿訶羅","婆蘇訶羅","阿蘇訶羅","摩訶訶羅","須摩訶羅","波摩訶羅","摩訶摩訶羅","須摩訶摩訶羅","波摩訶摩訶羅","阿僧祇","那由他","頻波羅","恒河沙","阿僧祇恒河沙","不可説","不可説転","不可説不可説","不可説不可説転"]
];
/*
	[1][0]=10^5
	[1][1]=10^7
	[1][1+n]=10^(7*2^n)
*/

function conversion(num) {
	const value = String(num);
	const length = value.length;

	el("length").innerHTML = length + "桁";
	el("power").innerHTML = "≒ 10^" + (length-1);

	switch(el("mode").value) {
		case "english":
			el("output").innerHTML = englishConv(value,length);
			break;
		case "japanese":
			el("output").innerHTML = japaneseConv(value,length);
			break;
		case "power":
			el("output").innerHTML = powerConv(value,length);
			break;
		case "unicode":
			el("output").innerHTML = unicodeConv(value,length)
	};
};

function englishConv(value,length) {
	const valLog = length - 1; // 10の何乗か(切り捨て)
	const valLogM3 = valLog - 3; // 1D=10^33, 1Ce=10^303など、毎回3が余るからこれを用意したほうが分かりやすい
	switch (true) { // caseの条件に合うものを実行する
		case (valLog >= 3006):
			return `≧1000${englishNum[4]}`;
		case (valLog >= 3003):
			const miUnitLength = length - 3003;
			const miUnit = value.slice(0, miUnitLength);
			const miDecimal = value.slice(miUnitLength, miUnitLength+3);
			return `${miUnit}.${miDecimal}${englishNum[4]}`;
		case (valLog < 3):
			return value;
		default:
			const displayLength = (length - 1) % 3 + 1;
			const decimal = value.slice(displayLength, displayLength+3);
			const display = value.slice(0, displayLength) + "." + decimal;
			let firstUnit;
			if (valLog < 33) { // 10^33以下なら([2]以降がつかないなら)
				firstUnit = englishNum[0][Math.trunc(((valLog-3)%30+3)/3)] // 0を使う
			} else {
				firstUnit = englishNum[1][Math.trunc(((valLogM3-3)%30+3)/3)] // 1を使う
			}
			const secondUnit = englishNum[2][Math.trunc(((valLogM3-3)%300+3)/30)] // [2]
			const thirdUnit = englishNum[3][Math.trunc(((valLogM3-3)%3000+3)/300)] // [3]
			return display + firstUnit + secondUnit + thirdUnit
	}
}

function japaneseConv(value,length) {
	const valLog = length - 1;
	switch (true) {
		case (valLog < 4):
			return value;
		case (valLog < 72):
			const displayLength = (length - 1) % 4 + 1;
			const decimal = value.slice(displayLength, displayLength+3);
			const display = value.slice(0, displayLength) + "." + decimal;
			return display + japaneseNum[0][Math.trunc((valLog)/4)];
		default:
			let unitPart = "";
			let binary = Math.trunc((length-1)/7).toString(2);
			const longDisplayLength = (length - 1) % 7 + 1;
			for(let i=0;i<binary.length;i++) {
				if (Number(binary.slice(-(i+1))[0])) { // binaryの最後からi+1文字目が1だったら
					unitPart += japaneseNum[2][i];
				}
			}
			let longDisplay;
			if ((length-1)%7+1 <= 5) {
				longDisplay = `${value.slice(0, longDisplayLength)}.${value.slice(longDisplayLength, longDisplayLength+3)}`
			} else {
				longDisplay = `${value.slice(0, longDisplayLength-5)}.${value.slice(longDisplayLength-5, longDisplayLength-2)}` + japaneseNum[1]
			}
			return longDisplay + unitPart
	}
}

function powerConv(value,length) {
	if (length == 1) {
		return value + " × 10^0"
	} else {
		return `${value[0]}.${value.slice(1,4)} × 10^${length-1}`;
	}
}

function unicodeConv(value,length) {
	let
		before = BigInt(value).toString(16),//16進数に変換したもの
		result = "";
	el("subP").innerHTML = `${BigInt(value).toString(16)},${before.length/4}`;
	// 桁数が足りなければ先頭に"0"を追加
	while (before.length % 4 !== 0) {
		before = '0' + before;
	};
	// 4桁ごとに分割してUnicodeに変換
	for(let i=0;i<before.length;i+=4) {
		if (parseInt(before.substring(i,i+4),16) == "0") {result += "(0)"
		} else {
			result += String.fromCharCode(parseInt(before.substring(i,i+4),16));
		}
	};
	return result;
}

conversion(el("input").value);