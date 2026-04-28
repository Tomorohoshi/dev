function el(id) {return document.getElementById(id)};
let score = 0; // s
let time = 0; // t
let usedScore = 0; // s_u
let scoreError = 0; // e_r
let animationStartedTime = null; // アニメーションの開始時間
let lastTime = 0; // 更新用 最後に更新した時間
let updateInterval = 1000 / 30; // 30fpsで更新
let openingTab = "upgrade";
let upgradeData = {
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

function updateUpgrade(upgradeName) {
	const targetUpgradeId = upgradeName + "Upgrade";
	const targetUpgradeData = upgradeData[upgradeName];
	query(`#${targetUpgradeId} .level`).innerHTML = targetUpgradeData.level;
	renderFormula(`${upgradeName} ← + ${targetUpgradeData.increase}`, query(`#${targetUpgradeId} .effect`));
	renderFormula(`s_u ← + ${targetUpgradeData.cost}`, query(`#${targetUpgradeId} .cost`));
}

function updateMainFormula(targetId, customValue=null) {
	const targetEl = el(targetId);
	const value = Number((customValue ?? upgradeData[targetId].value).toFixed(3));
	renderFormula(`${targetId}=${value}`, query(`#${targetId} .label`));
}

function buy(upgrade, val=1, doError=true) {
	for(let i=0;i<val;i++) {
		if(upgrade.cost <= score) {
			upgrade.value += upgrade.increase;
			upgrade.level++;
			usedScore += upgrade.cost;
			// upgrade.cost *= upgrade.costMultiplier;
			switch(upgrade.costIncrease[0]) {
				case "+":
					upgrade.cost += upgrade.costIncrease[1];
					break;
				case "*":
						upgrade.cost *= upgrade.costIncrease[1];
						break;
				case "^":
					upgrade.cost **= upgrade.costIncrease[1];
					break;
				default: break;
			}
			upgrade.cost = Number(upgrade.cost.toFixed(2));
			if(doError) {
				switch(upgrade.name) {
					case "m":
						scoreError += time * upgrade.increase;
						break;
				}
			}
			updateMainFormula(upgrade.name);
			updateMainFormula("s_u", usedScore);
			updateMainFormula("e_r", scoreError);
		} else {
			break;
		};
	};
	updateUpgrade(upgrade.name);
}

function update(currentTime) {
	if(!animationStartedTime) animationStartedTime = currentTime;

	const delta = currentTime - lastTime;

	if(delta >= updateInterval) {
		lastTime = currentTime - (delta % updateInterval);
		const timeDiffSec = (currentTime - animationStartedTime) / 1000;
		time = timeDiffSec;
		score = time * (upgradeData.m.value ?? 1) - usedScore - scoreError;
		renderFormula(`t=${time.toFixed(2)}`, el("tPinned"));
		renderFormula(`s=${score.toFixed(2)}`, el("sPinned"));
		query("#upgrade>button", true).forEach(bt => {
			const upgrade = upgradeData[bt.id.split("Upgrade")[0]];
			const scorePercent = Math.min(score / upgrade.cost, 1) * 100;
			bt.style.setProperty("--beforeWidth", scorePercent + "%");
			bt.style.opacity = scorePercent === 100 ? 1 : .5;
		})
	}

	requestAnimationFrame(update);
}

requestAnimationFrame(update);

el("mUpgrade").onclick = function() {
	const upgrade = upgradeData.m;

	if(upgrade.value == null) {
		if(upgrade.cost > score) return;
		el("m").style.display = "inline";
		query("#mUpgrade .title>:not(.formula)").innerHTML = "の値を増やす";
		buy(upgrade, 1, false);
		upgrade.cost = 5;
		upgrade.level = 1;
		upgrade.value = 1;
		upgrade.increase = .2;
		upgrade.costIncrease = ["*", 1.15];
		updateUpgrade(upgrade.name);
		renderFormula("m", query("#mUpgrade .title .formula"));
	} else {
		buy(upgrade);
	}
}

query("#tabBar>label", true).forEach(e => {
	e.onclick = function() {
		const target = e.dataset.target;
		query(`#${openingTab}`).style.display = "none";
		query(`#${target}`).style.display = "block";
		openingTab = target;
	}
});