// 把 dist/ 发布到 GitHub Pages 的 gh-pages 分支。
// 用法：npm run deploy（内部会先 build）
// 为什么单独写：dist 被 .gitignore 排除，vite 每次 build 又会清空 dist，
// 所以每次都在 dist 里重建一个独立仓库再 force push，主仓库不受影响。
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const remote = execSync("git remote get-url origin", { cwd: root }).toString().trim();

if (!existsSync(join(dist, "index.html"))) {
  console.error("dist/index.html 不存在，先跑 npm run build");
  process.exit(1);
}

// 上一次部署留在 dist/.git 里的历史会让 git 认为"无变更"，先清掉
rmSync(join(dist, ".git"), { recursive: true, force: true });

const run = (cmd) => execSync(cmd, { cwd: dist, stdio: "inherit" });
const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);

run("git init -q -b gh-pages");
run("git add -A");
run(
  `git -c user.name=Alaneve541 -c user.email=2064439503@qq.com commit -q --allow-empty -m "deploy: ${stamp}"`,
);
// 直连偶尔会被网络挡住，失败时用本机代理（127.0.0.1:7897）重试一次
const proxy = process.env.HTTPS_PROXY_LOCAL ?? "http://127.0.0.1:7897";
try {
  run(`git push -f ${remote} gh-pages`);
} catch {
  console.warn(`\n直连推送失败，改用本地代理 ${proxy} 重试…`);
  run(`git -c http.proxy=${proxy} push -f ${remote} gh-pages`);
}

console.log("\n已发布。等 GitHub 构建完成后访问 https://alaneve541.github.io/game-library/");
