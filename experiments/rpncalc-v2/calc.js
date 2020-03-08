// Reads the input box for a RPN expression
// Calculates result
// Outputs it as nicely formatted boxes.
function calculateFromInput() {
	var expr = document.getElementById("input").value;
	var output = document.getElementById("output")

	var result = calculateRPN(expr.split(" "));
		
	output.innerHTML = ""; // Clear the output div

	result.stack.forEach(function(num) {
		num = num.toString().replace("NaN", "Error");
		var box = createBox(num);
		box.style["max-width"] = num.length + "em";
		output.appendChild(box);
	});

	if (result.errors.length > 0) { // If errors exist output them separated by line breaks.
			result.errors.forEach(error => {
				output.appendChild(document.createTextNode(error.toString()))
				output.appendChild(document.createElement("br"))
			})
	}
}

function add(x, y) {
	return x + y;
}

function multiply(x, y) {
	return x * y;
}

function divide(x, y) {
	return x / y;
}

function flip(x, y) {
	return [y, x];
}

function subtract(x, y) {
	return x - y;
}

function sum(vals) {
	var acc = 0;

	vals.forEach(function(el) {
		acc += el;
	});

	return acc;
}

function range(low, high) {
	var r = [];

	for (var i = low; i <= high; i++) {
		r.push(i);
	}
	
	return r;
}

function createBox(contents) {
	var el = document.createElement("div");
	el.setAttribute("class", "stack-box");

	el.innerText = contents;

	return el;
}

// Takes a two-argument function and lifts it to a binary stack op
function binaryOp(fun) {
	return function(stack) {
		var x = stack.pop();
		var y = stack.pop();

		stack.push(fun(y, x));
		return stack;
	}
}

// Takes a function and lifts it to a unary op using a stack. Returns new stack.
function unaryOp(fun) {
	return function(stack) {
		var x = stack.pop();
		
		stack.push(fun(x));
		return stack;
	}
}

// Takes a function and lifts it to an op which takes the entire stack and reduces it to one value. Returns new stack.
function greedyOp(fun) {
	return function(stack) {
		return [fun(stack)];
	}
}

// Lifs to an operator which takes two values and adds an array of them to the stack. Returns a new stack.
function binaryMultioutOp(fun) {
	return function(stack) {
		var x = stack.pop();
		var y = stack.pop();
		
		return stack.concat(fun(y, x));
	}
}

function calculateRPN(tokens) {
	var stack = [];
	var errors = [];

	for (var i = 0; i < tokens.length; i++) {
		var token = tokens[i];

		switch (token) {
		case "+":
			stack = binaryOp(add)(stack);
			break;
		case "*":
			stack = binaryOp(multiply)(stack);
			break;
		case "/":
			stack = binaryOp(divide)(stack);
			break;
		case "-":
			stack = binaryOp(subtract)(stack);
			break;
		case "range":
			stack = binaryMultioutOp(range)(stack);
			break;
		case "flip":
			stack = binaryMultioutOp(flip)(stack);
			break;
		case "sum":
			stack = greedyOp(sum)(stack);
			break;
		case "": // This may be entered by accident.
			break;
		default:
			var parsed = parseFloat(token);

			if (parsed === parsed) { // check for NaNs from a failed parse
				stack.push(parsed);
			} else {
				errors.push("Token '" + token + "' (#" + (i + 1) + ")" + " invalid");
			}
		}
	}

	return {stack: stack, errors: errors};
}
