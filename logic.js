/**
 * MIT License
 *
 * Copyright (c) 2025 KHOPAN
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const PATH_MODEL = "https://raw.githubusercontent.com/KHOPAN/mask/refs/heads/main/internal/model.json";
const PATH_METADATA = "https://raw.githubusercontent.com/KHOPAN/mask/refs/heads/main/internal/metadata.json";

let started = false;
let label = null;
let model = null;
let cases = 0;
let webcam = null;

async function startModel() {
	if(started) {
		console.error("Camera already started.");
		alert("Error: The camera has already been started.");
		return;
	}

	started = true;
	label = document.getElementById("label");

	if((model = await tmImage.load(PATH_MODEL, PATH_METADATA)) == null) {
		console.error("Variable 'model' is null.");
		alert("Error: The variable 'model' is null.");
		return;
	}

	for(let i = 0; i < (cases = model.getTotalClasses()); i++) {
		label.appendChild(document.createElement("p"));
	}

	webcam = new tmImage.Webcam(200, 200, true);
	await webcam.setup();
	await webcam.play();
	window.requestAnimationFrame(callback);
	document.getElementById("webcam").appendChild(webcam.canvas);
}

async function callback() {
	if(!started || label == null || model == null || cases <= 0 || webcam == null) {
		console.error("No, this is not right. Why is everything null?");
		window.requestAnimationFrame(callback);
		return;
	}

	webcam.update();
	let result = await model.predict(webcam.canvas);

	if(result == null || !Array.isArray(result)) {
		window.requestAnimationFrame(callback);
		return;
	}

	let longest = 0;
	let highestProbability = 0.0;
	let highestProbabilityElement = null;

	for(let i = 0; i < cases; i++) {
		longest = Math.max(longest, result[i].className.length);

		if(result[i].probability > highestProbability) {
			highestProbability = result[i].probability;
			highestProbabilityElement = label.childNodes[i];
		}
	}

	for(let i = 0; i < cases; i++) {
		let approximate = result[i].probability.toFixed(3);
		let integer = Math.round(approximate * 100.0);
		label.childNodes[i].innerHTML = result[i].className + ("&nbsp".repeat(longest - result[i].className.length + 1)) + ": " + approximate + " - " + ("&nbsp".repeat(Math.max(0, 2 - Math.floor(Math.log10(Math.max(1, integer)))))) + integer + "%";
		label.childNodes[i].id = (label.childNodes[i] == highestProbabilityElement) ? "predicted" : "";
	}

	window.requestAnimationFrame(callback);
}
