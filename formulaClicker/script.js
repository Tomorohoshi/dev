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
		costMultiplier: 1.15
	}
};

query(".formula", true).forEach(f => katex.render(f.textContent, f));

function query(query, isAll=false) {return isAll ? document.querySelectorAll(query) : document.querySelector(query)};

function updateShop(shopName) {
	const targetShopId = shopName + "Shop";
	const targetShopData = shopData[shopName];
	query(`#${targetShopId} .level`).innerHTML = targetShopData.level;
	katex.render(`${shopName} ← + ${targetShopData.increase}`, query(`#${targetShopId} .effect`));
	katex.render(`s_u ← + ${targetShopData.cost}`, query(`#${targetShopId} .cost`));
}

function buy(shop, val=1, doError=true) {
	for(let i=0;i<val;i++) {
		if(shop.cost <= score) {
			shop.value += shop.increase;
			shop.level++;
			usedScore += shop.cost;
			shop.cost *= shop.costMultiplier;
			shop.cost = Number(shop.cost.toFixed(2));
			if(doError) {
				switch(shop.name) {
					case "m":
						scoreError += score * shop.increase;
						break;
				}
			}
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
		katex.render(`t=${time.toFixed(2)}`, el("tPinned"));
		katex.render(`s=${score.toFixed(2)}`, el("sPinned"));
		query("#shop>button", true).forEach(bt => {
			const shop = shopData[bt.id.split("Shop")[0]];
			bt.style.setProperty("--beforeWidth", Math.min(score / shop.cost, 1) * 100 + "%");
		})
	}

	requestAnimationFrame(update);
}

requestAnimationFrame(update);

el("mShop").onclick = function() {
	const shop = shopData.m;

	if(shop.value == null) {
		el("m").style.display = "inline";
		buy(shop, 1, false);
		shop.cost = 5;
		shop.level = 1;
		shop.value = 1;
		shop.increase = .05;
		updateShop(shop.name);
		katex.render("~~m", query("#mShop .title .formula"));
	} else {
		buy(shop);
	}
}