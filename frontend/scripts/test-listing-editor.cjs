const assert = require("node:assert/strict");
const fs = require("node:fs"); const vm = require("node:vm"); const ts = require("typescript");
function load(path) {
  const code = ts.transpileModule(fs.readFileSync(require.resolve(path), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  const context = { exports: {} }; vm.runInNewContext(code, context); return context.exports;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const { rebaseForm } = load("../lib/utils/form-state.ts");
const original = { title: "Old", price: 100, public: true, address: "Address" };
const edited = { ...original, title: "Draft", price: 0, public: false, address: "" };
assert.deepEqual(plain(rebaseForm(original, edited, { ...original, title: "Server" })), edited);
assert.deepEqual(plain(rebaseForm(original, original, { ...original, price: 200 })), { ...original, price: 200 });
assert.deepEqual(plain(rebaseForm(original, { ...original, title: "Draft" }, { ...original, price: 200 })), { ...original, title: "Draft", price: 200 });
assert.deepEqual(plain(rebaseForm(edited, edited, { ...edited, title: "Saved" })), { ...edited, title: "Saved" });
const { moveItem, supportedImage } = load("../lib/image-upload.ts");
const photos = [1, 2, 3];
assert.deepEqual(plain(moveItem(photos, 2, 0)), [3, 1, 2]);
assert.deepEqual(plain(moveItem(photos, 0, 2)), [2, 3, 1]);
for (const [from, to] of [[-1, 0], [0, 3], [1, 1]]) assert.equal(moveItem(photos, from, to), photos);
assert.deepEqual(photos, [1, 2, 3]);
for (const type of ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"]) assert.equal(supportedImage(type), true);
for (const type of ["image/svg+xml", "application/pdf", "text/html", ""]) assert.equal(supportedImage(type), false);
const { parseLocation } = load("../lib/utils/location.ts");
assert.deepEqual(plain(parseLocation("41.64, 41.61")), { lat: 41.64, lng: 41.61 });
assert.deepEqual(plain(parseLocation("0,0")), { lat: 0, lng: 0 });
for (const value of [null, "", "41", "41,", ",41", "0,0,0", "NaN,41", "Infinity,41", "91,41", "41,-181"]) assert.equal(parseLocation(value), null);
console.log("Editor regression checks passed: preserve unsaved fields, rebase server updates, image ordering/formats and map coordinates.");

const { invalidPropertyNumbers } = load("../lib/utils/property-validation.ts");
assert.deepEqual(plain(invalidPropertyNumbers({ price: 0, totalArea: 58, ceilingHeight: 2.7, balconyArea: 6.5, rooms: "", floors: null })), []);
assert.deepEqual(plain(invalidPropertyNumbers({ price: Infinity, totalArea: 58.5, bedrooms: -1, floors: 2147483648, ceilingHeight: NaN })), ["price", "totalArea", "bedrooms", "floors", "ceilingHeight"]);
const { nearbySlide } = load("../lib/utils/gallery.ts");
assert.deepEqual(Array.from({length: 22}, (_, i) => i).filter(i => nearbySlide(i, 0, 22)), [0, 1, 21]);
assert.deepEqual(Array.from({length: 22}, (_, i) => i).filter(i => nearbySlide(i, 7, 22)), [6, 7, 8]);
console.log("Numeric validation and gallery loading passed");
