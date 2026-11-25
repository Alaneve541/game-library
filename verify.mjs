import puppeteer from "puppeteer-core";
import fs from "node:fs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const URL = process.env.APP_URL ?? "http://localhost:4178/game-library/";
const OUT = "shots";
fs.mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(...a);
const fail = [];
function check(name, cond, detail = "") {
  if (cond) log(`  PASS  ${name}`);
  else {
    log(`  FAIL  ${name} ${detail}`);
    fail.push(name);
  }
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,1000"],
  defaultViewport: { width: 1440, height: 1000 },
});

const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") log("  [console.error]", m.text());
});
page.on("pageerror", (e) => {
  log("  [pageerror]", e.message);
  fail.push("pageerror: " + e.message);
});

await page.goto(URL, { waitUntil: "networkidle2" });
await page.waitForSelector(".card", { timeout: 10000 });

/* 1. 列表 */
const cards = await page.$$(".card");
const countText = await page.$eval(".count", (el) => el.textContent.trim());
log("\n[1] 列表");
check("首屏渲染 12 张卡（分页 PAGE_SIZE）", cards.length === 12, `实际 ${cards.length}`);
check("总数文案显示 20 款", /20/.test(countText), countText);
await page.screenshot({ path: `${OUT}/01-list.png` });

const titles = await page.$$eval(".card-title", (els) => els.map((e) => e.textContent));
check("卡片有标题文本", titles.every((t) => t && t.length > 0), titles.slice(0, 3).join(" / "));

/* 2. 加载更多 */
log("\n[2] 加载更多");
const moreBtn = await page.$(".more .btn");
check("存在「加载更多」按钮", Boolean(moreBtn));
if (moreBtn) {
  await moreBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  const after = await page.$$(".card");
  check("点击后卡片数增加", after.length > 12, `变为 ${after.length}`);
}

/* 3. 搜索 */
log("\n[3] 搜索");
await page.type(".search input", "原神", { delay: 30 });
await new Promise((r) => setTimeout(r, 400));
const searched = await page.$$eval(".card-title", (els) => els.map((e) => e.textContent));
check("搜索「原神」命中", searched.length === 1 && searched[0].includes("原神"), searched.join("|"));
await page.screenshot({ path: `${OUT}/02-search.png` });

// 搜索无结果 → 空状态
await page.click(".search-clear");
await page.type(".search input", "zzz-not-exist", { delay: 10 });
await new Promise((r) => setTimeout(r, 400));
const emptyBox = await page.$(".empty");
check("无结果显示空状态", Boolean(emptyBox));
await page.click(".search-clear");
await page.keyboard.press("Backspace");
await new Promise((r) => setTimeout(r, 400));

/* 4. 筛选 */
log("\n[4] 筛选");
const beforeFilter = (await page.$$(".card")).length;
const chips = await page.$$eval(".chip", (els) => els.map((e) => e.textContent));
check("筛选区有平台/类型/状态 chips", chips.length >= 8, `共 ${chips.length} 个`);
const mobileChip = await page.$$eval(".chip", (els) => {
  const i = els.findIndex((e) => e.textContent.trim() === "Mobile");
  return i;
});
if (mobileChip >= 0) {
  const chipEls = await page.$$(".chip");
  await chipEls[mobileChip].click();
  await new Promise((r) => setTimeout(r, 300));
  const afterFilter = (await page.$$(".card")).length;
  const countText2 = await page.$eval(".count", (el) => el.textContent.trim());
  check("勾选 Mobile 后结果变化", afterFilter !== beforeFilter || /Mobile/.test(countText2), `前 ${beforeFilter} → 后 ${afterFilter}`);
  const cleared = await page.$(".filters-head .link");
  check("出现「清空」按钮", Boolean(cleared));
  await page.screenshot({ path: `${OUT}/03-filter.png` });
  if (cleared) await cleared.click();
  await new Promise((r) => setTimeout(r, 300));
} else {
  check("找到 Mobile chip", false);
}

/* 5. 详情 */
log("\n[5] 详情");
await page.click(".card");
await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
const dlg = await page.$eval('[role="dialog"]', (el) => ({
  title: el.querySelector("h2")?.textContent || "",
  note: el.querySelector(".detail-note p")?.textContent || "",
  stats: el.querySelectorAll(".detail-stats div").length,
}));
check("详情标题非空", dlg.title.length > 0, dlg.title);
check("详情含机制拆解笔记", dlg.note.length > 10, dlg.note.slice(0, 30) + "…");
check("详情四格数值", dlg.stats === 4, String(dlg.stats));
const overflowHidden = await page.evaluate(() => document.body.style.overflow);
check("打开详情锁定 body 滚动", overflowHidden === "hidden", overflowHidden);
await page.screenshot({ path: `${OUT}/04-detail.png` });

await page.keyboard.press("Escape");
await new Promise((r) => setTimeout(r, 300));
const closed = (await page.$('[role="dialog"]')) === null;
check("Esc 关闭详情", closed);
const overflowRestored = await page.evaluate(() => document.body.style.overflow);
check("关闭后恢复 body 滚动", overflowRestored === "", `"${overflowRestored}"`);

/* 6. 排序 */
log("\n[6] 排序");
const sortSel = await page.$(".sort select");
check("存在排序下拉", Boolean(sortSel));
if (sortSel) {
  await page.select(".sort select", "year");
  await new Promise((r) => setTimeout(r, 300));
  const years = await page.$$eval(".card-year", (els) => els.map((e) => Number(e.textContent)));
  const sorted = [...years].sort((a, b) => b - a);
  check("按年份排序生效", years.join(",") === sorted.join(","), years.slice(0, 5).join(","));
}

/* 7. 响应式 */
log("\n[7] 响应式");
await page.setViewport({ width: 430, height: 900 });
await new Promise((r) => setTimeout(r, 400));
const cols = await page.evaluate(() => getComputedStyle(document.querySelector(".layout")).gridTemplateColumns);
check("移动端单列布局", cols.split(" ").length === 1, cols);
await page.screenshot({ path: `${OUT}/05-mobile.png`, fullPage: false });

await browser.close();

log("\n==== 结果 ====");
if (fail.length === 0) {
  log("全部通过 ✅");
  process.exit(0);
} else {
  log(`失败 ${fail.length} 项:`);
  for (const f of fail) log(" - " + f);
  process.exit(1);
}
