// Tip 1:
// "yes" will be wrapped in a Promise, by javascript
var foo = async function() {
	return "yes";
}

// note foo() is exec'd without await, this is perfectly valid, but it is a Promise
var t = foo();
console.log(t instanceof Promise, t === "yes"); // true, false
var t = await foo();
console.log(t instanceof Promise, t === "yes"); // false, true

// Tip 2:
var foo = async function() {
	var rec = await someDbQuery({ recid : 5 });
	
	console.log("rec", rec);
	
	return rec.title;
}

var t = foo();
// this log will occur BEFORE the "rec" log above because we did not await on foo() and foo() will return synchronously, but it's promise will resolve async
console.log("after");

// Tip 3:
var foo = async function(arg1) {
	if (typeof arg1 !== "string") { throw new Error("arg1 must be a string"); }
	return "yay, it's a string";
}

// the throw error above will be automatically caught by the promise .catch()
foo(1).catch(function(e) {
	console.log("caught it!");
});

// if we want to catch via await we need to
try {
	var t = await foo(1);
} catch(e) {
	console.log("caught it"); // will log
}

// Tip 4: Handling errors
// wrong: went off the event loop, without handling errors properly
var foo = async function() {
	// bounces off the event loop
	fs.readFile("/tmp/someFile.txt", function(err, result) {
		if (err) { throw err; } // this won't be caught be our try catch, because our promise chain is lost by going off the event loop
		
		return resolve(result);
	});
}

// right: utilizing a promise
var foo = async function() {
	return new Promise(function(resolve, reject) {
		fs.readFile("/tmp/someFile.txt", function(err, result) {
			if (err) { return reject(err); }
			
			return resolve(result);
		});
	});
}

// even better: utilizing a promisified method
var readFileP = util.promisify(fs.readFile);
var foo = async function() {
	var result = await readFileP("/tmp/someFile.txt"); // if this file doesn't exist, it throws, which is then wrapped in a promise rejection and able to be handled
	return result;
}

// Tip 7: async in async
async.series({
	first : function(cb) {
		db.table.find({}, cb);
	},
	// note when using an async function as a step in a series/parallel we no longer receive a cb argument
	second : async function() {
		return await dbPromise.find({});
	}
}, function(err, result) {
	
});