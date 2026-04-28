function el(id) {return document.getElementById(id)};
let score = 0; // s
let time = 0; // t
let usedScore = 0; // s_u
let scoreError = 0; // e_r
let animationStartedTime = null;
let lastTime = 0;
let updateInterval = 1000 / 30; // 30fps
let shopData = {
	m: {
		name: "m",
		cost: 5,
		value: null,
		level: 0,
		increase: 1,
		costIncrease: ["+", 0]
	}
};

query(".formula", true).forEach(f => renderFormula(f.textContent, f)); // 数式を描画するための処理

function renderFormula(content, target) {
	katex.render(content, target);
}

function query(query, isAll=false) {return isAll ? document.querySelectorAll(query) : document.querySelector(query)};

function updateShop(shopName) {
	const targetShopId = shopName + "Shop";
	const targetShopData = shopData[shopName];
	query(`#${targetShopId} .level`).innerHTML = targetShopData.level;
	renderFormula(`${shopName} ← + ${targetShopData.increase}`, query(`#${targetShopId} .effect`));
	renderFormula(`s_u ← + ${targetShopData.cost}`, query(`#${targetShopId} .cost`));
}

function updateMainFormula(targetId, customValue=null) {
	const targetEl = el(targetId);
	const value = Number((customValue ?? shopData[targetId].value).toFixed(3));
	renderFormula(`${targetId}=${value}`, query(`#${targetId} .label`));
}

function buy(shop, val=1, doError=true) {
	for(let i=0;i<val;i++) {
		if(shop.cost <= score) {
			shop.value += shop.increase;
			shop.level++;
			usedScore += shop.cost;
			// shop.cost *= shop.costMultiplier;
			switch(shop.costIncrease[0]) {
				case "+":
					shop.cost += shop.costIncrease[1];
					break;
				case "*":
						shop.cost *= shop.costIncrease[1];
						break;
				case "^":
					shop.cost **= shop.costIncrease[1];
					break;
				default: break;
			}
			shop.cost = Number(shop.cost.toFixed(2));
			if(doError) {
				switch(shop.name) {
					case "m":
						scoreError += time * shop.increase;
						break;
				}
			}
			updateMainFormula(shop.name);
			updateMainFormula("s_u", usedScore);
			updateMainFormula("e_r", scoreError);
		} else {
			break;
		};
	};
	updateShop(shop.name);
}

function update(currentTime) {
	if(!animationStartedTime) animationStartedTime = currentTime;

	const delta = currentTime - lastTime;

	if(delta >= updateInterval) {
		lastTime = currentTime - (delta % updateInterval);
		const timeDiffSec = (currentTime - animationStartedTime) / 1000;
		time = timeDiffSec;
		score = time * (shopData.m.value ?? 1) - usedScore - scoreError;
		renderFormula(`t=${time.toFixed(2)}`, el("tPinned"));
		renderFormula(`s=${score.toFixed(2)}`, el("sPinned"));
		query("#shop>button", true).forEach(bt => {
			const shop = shopData[bt.id.split("Shop")[0]];
			const scorePercent = Math.min(score / shop.cost, 1) * 100;
			bt.style.setProperty("--beforeWidth", scorePercent + "%");
			bt.style.opacity = scorePercent === 100 ? 1 : .5;
		})
	}

	requestAnimationFrame(update);
}

requestAnimationFrame(update);

el("mShop").onclick = function() {
	const shop = shopData.m;

	if(shop.value == null) {
		if(shop.cost > score) return;
		el("m").style.display = "inline";
		query("#mShop .title>:not(.formula)").innerHTML = "の値を増やす";
		buy(shop, 1, false);
		shop.cost = 5;
		shop.level = 1;
		shop.value = 1;
		shop.increase = .2;
		shop.costIncrease = ["^", 1.05];
		updateShop(shop.name);
		renderFormula("m", query("#mShop .title .formula"));
	} else {
		buy(shop);
	}
}

query("#tabBar>label", true).forEach(e => {
	e.onclick = function() {
		query("#tabBar>label").forEach(e2 => {
			
		})
	}
});