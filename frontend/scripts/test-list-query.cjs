const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const code = ts.transpileModule(fs.readFileSync(require.resolve("../lib/utils/list-query.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(code, context);
const { listPage, listChoice } = context.exports;
for (const input of [null, "", "0", "-1", "2oops", "1.5", "Infinity", "1e4", "100001", "9007199254740993"]) {
  assert.equal(listPage(input), 1, `Invalid page: ${input}`);
}
assert.equal(listPage("2"), 2);
assert.equal(listPage("100000"), 100000);
assert.equal(listChoice("ADMIN", ["", "ADMIN", "REGULAR"], ""), "ADMIN");
assert.equal(listChoice("owner", ["", "ADMIN", "REGULAR"], ""), "");
assert.equal(listChoice(null, ["", "NEW", "CLOSED"], ""), "");
console.log("List URL validation passed");
