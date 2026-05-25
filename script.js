function el(id) {return document.getElementById(id)}

function query(query, isAll=false) {return isAll ? document.querySelectorAll(query) : document.querySelector(query)}

function firstLoad() {
	const fieldWidth = window.getComputedStyle(el("field")).width.replace("px", "");
	let spanWidthSum = 0;
	while(spanWidthSum < fieldWidth) {
		const span = document.createElement("span");
		const spanMargin = 10;
		spanWidthSum += spanMargin + 5;
		if(Math.random() > .5) {
			span.style.height = "95px";
			span.style.filter = `brightness(.95)`;
		} else {
			span.style.height = "100px";
		}
		span.style.marginLeft = spanMargin + "px";
		// span.style.height = (95 + Math.random() * 5) + "px";
		// span.style.filter = `brightness(${.95 + Math.random() * .1})`;
		el("field").appendChild(span);
	}
}

firstLoad();

// query("#field>span", true).forEach(e => {
	// e.style.height = (80 + Math.random() * 20) + "px";
// });