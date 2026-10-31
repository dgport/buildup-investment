const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const code = ts.transpileModule(fs.readFileSync(require.resolve("../lib/utils/auth-flow.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
const context = { exports: {}, URL, URLSearchParams }; vm.runInNewContext(code, context);
const redirect = context.exports.expiredSessionRedirect;
for (const prefix of ["", "/ka", "/en"]) {
  for (const path of ["/dashboard", "/admin/users", "/properties/new", "/properties/abc/edit"]) {
    const result = new URL(redirect(prefix + path, "?page=2&market=rent"), "https://buildup.ge");
    assert.equal(result.pathname, prefix + "/signin");
    assert.equal(result.searchParams.get("next"), path + "?page=2&market=rent");
  }
  for (const path of ["/", "/properties/abc", "/projects", "/saved", "/admin-not-a-route", "/properties/new-building"]) {
    assert.equal(redirect(prefix + path), null);
  }
}
assert.equal(context.exports.safeAuthNext("//evil.test"), "/dashboard");
assert.equal(context.exports.safeAuthNext("/\\evil.test"), "/dashboard");
console.log("Session navigation checks passed: localized protected pages, preserved destination, public routes and redirect safety.");
