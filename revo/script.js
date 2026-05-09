let data = [
	{
		isEnable: true,
		lap: .2,
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: .1,
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: 1/15, // = .0667
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: .05,
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: .04,
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: 1/30, // = .0333
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: 1/35, // = .0286
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: .025,
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: 1/45, // = .0222
		ascPow: 10,
		mult: .01
	},
	{
		isEnable: true,
		lap: .02,
		ascPow: 10,
		mult: .01
	}
]
let globalData = {
	plus: {
		lap: 0,
		ascPow: 0,
		mult: 0
	},
	times: {
		lap: 1,
		ascPow: 1,
		mult: 1
	},
	speed: 1,
	pMult: 1,
	pExp: 1
}

function el(id) {return document.getElementById(id)}
function query(query, isAll=false) {return isAll ? document.querySelectorAll(query) : document.querySelector(query)}

for(let i=0;i<data.length;i++) {
	const targetData = data[i];

	el(`isEnable${i+1}`).addEventListener("change", function() {
		targetData.isEnable = this.checked;
		query(`#settings>fieldset:nth-of-type(${i+2})`).style.opacity = this.checked ? 1 : .5;
	});
	el(`lap${i+1}`).addEventListener("input", function() {
		targetData.lap = Number(this.value);
	});
	el(`ascPow${i+1}`).addEventListener("input", function() {
		targetData.ascPow = Number(this.value);
	});
	el(`mult${i+1}`).addEventListener("input", function() {
		targetData.mult = Number(this.value);
	});
}