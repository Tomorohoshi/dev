let data = [
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: .2,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: .1,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: 1/15, // = .0667
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: .05,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: .04,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: 1/30, // = .0333
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: 1/35, // = .0286
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: .025,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: 1/45, // = .0222
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		mult: 1,
		lapTimes: 0,
		lap: .02,
		multGain: .01
	}
]
let calculatedData = [
	{
		isEnable: true,
		lapProgress: 0,
		lap: .2,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: .1,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: 1/15, // = .0667
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: .05,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: .04,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: 1/30, // = .0333
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: 1/35, // = .0286
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: .025,
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: 1/45, // = .0222
		multGain: .01
	},
	{
		isEnable: true,
		lapProgress: 0,
		lap: .02,
		multGain: .01
	}
]
let globalData = {
	plus: {
		lap: 0,
		multGain: 0
	},
	times: {
		lap: 1,
		multGain: 1
	},
	speed: 1,
	pMult: 1,
	pExp: 1
}
let lapsSum = 0;
let allMult = 1;
let getScore = 1;
let score = 0;
let animationStartedTime = null;
let lastTime = 0;
let spendTime = 0;
const UPDATE_INTERVAL = 1000 / 60;

function el(id) {return document.getElementById(id)}
function query(query, isAll=false) {return isAll ? document.querySelectorAll(query) : document.querySelector(query)}

function update(val, id, suffix="", doAnimation=true) {
	const target = el(id);
	target.innerHTML = val + suffix;
	if(!doAnimation) return;
	target.classList.remove("valChanged");
	void target.offsetWidth; // リフレッシュ
	target.classList.add("valChanged");
}
function calcData() {
	for(let i=0;i<data.length;i++) {
		const targetData = data[i];
		const targetCalculatedData = calculatedData[i];
		targetCalculatedData.lap = (targetData.lap + globalData.plus.lap) * globalData.times.lap;
		targetCalculatedData.multGain = (targetData.multGain + globalData.plus.multGain) * globalData.times.multGain;
	}
}
function calcMult() {
	allMult = 1;
	for(let i=0;i<data.length;i++) {
		const targetData = data[i];
		allMult *= targetData.mult;
	}
	allMult *= globalData.pMult;
	update(allMult.toFixed(2), "allMultDisplay1");
	update(allMult.toFixed(2), "allMultDisplay2");

	getScore = allMult ** globalData.pExp;
	update(getScore.toFixed(2), "getScoreDisplay", "/rev");
}

for(let i=0;i<data.length;i++) {
	const targetData = data[i];

	el(`isEnable${i+1}`).addEventListener("change", function() {
		targetData.isEnable = this.checked;
		query(`#settings>fieldset:nth-of-type(${i+2})`).style.opacity = this.checked ? 1 : .5;
		query(`#main>span:nth-of-type(${i+2})`).style.display = this.checked ? "block" : "none";
	});
	el(`lap${i+1}`).addEventListener("input", function() {
		targetData.lap = Number(this.value);
	});
	el(`mult${i+1}`).addEventListener("input", function() {
		targetData.multGain = Number(this.value);
	});
}
el("gameSpeedMult").addEventListener("input", function() {
	globalData.speed = Number(this.value);
});
el("pMult").addEventListener("input", function() {
	globalData.pMult = Number(this.value);
	update(globalData.pMult.toFixed(2), "pMultDisplay");
});
el("pExp").addEventListener("input", function() {
	globalData.pExp = Number(this.value);
	update(globalData.pExp, "pExpDisplay");
});
el("allLapPlus").addEventListener("input", function() {
	globalData.plus.lap = Number(this.value);
	calcData();
});
el("allLapMulti").addEventListener("input", function() {
	globalData.times.lap = Number(this.value);
	calcData();
});
el("allMultPlus").addEventListener("input", function() {
	globalData.plus.multGain = Number(this.value);
	calcData();
});
el("allMultMulti").addEventListener("input", function() {
	globalData.times.multGain = Number(this.value);
	calcData();
});

function animationFrame(currentTime) {
	if(!animationStartedTime) {
		animationStartedTime = currentTime;
		lastTime = currentTime;
	}

	const delta = (currentTime - lastTime) / 1000 * globalData.speed;
	spendTime += delta;
	spendTime = Math.round(spendTime * 100) / 100;
	const spendTimePadded = spendTime.toString().padEnd(spendTime.toString().split(".")[0].length + 3, "0");
	update(spendTimePadded + "秒プレイ", "spendTimeDisplay", false);
	if(delta >= UPDATE_INTERVAL / 1000) {
		lastTime = currentTime - (delta % UPDATE_INTERVAL);

		for(let i=0;i<data.length;i++) {
			if(!data[i].isEnable) continue;

			const targetData = data[i];
			const targetCalcData = calculatedData[i];
			targetData.lapProgress += delta * targetCalcData.lap;
			if(targetData.lapProgress >= 1) {
				score += getScore;
				score = Math.round(score * 100) / 100;
				update(score + " ◉", "scoreDisplay");
				targetData.mult += targetCalcData.multGain * Math.floor(targetData.lapProgress);
				targetData.mult = Math.round(targetData.mult * 100) / 100;
				update(targetData.mult, `multDisplay${i+1}`);
				calcMult();
				targetData.lapTimes += Math.floor(targetData.lapProgress);
				update(targetData.lapTimes, `laps${i+1}`);
				lapsSum += Math.floor(targetData.lapProgress);
				update(lapsSum, "lapsSumDisplay");
				targetData.lapProgress %= 1;
			}
			el(`bar${i+1}`).style.height = `${targetData.lapProgress * 100}%`;
		}
	}

	requestAnimationFrame(animationFrame);
}

el("startBt").onclick = () => {
	query("#settings input", true).forEach(e => {e.disabled = true});
	calcData();
	calcMult();
	requestAnimationFrame(animationFrame);
};