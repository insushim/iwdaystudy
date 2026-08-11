#!/usr/bin/env node
// package.json의 version을 단일 진실원(single source of truth)으로 삼아
// android/app/build.gradle 과 functions/api/version.ts 에 동일한 버전을 주입한다.
//
// 배경: package.json / android/app/build.gradle / functions/api/version.ts
// 세 곳에 버전이 각각 하드코딩되어 있어 서로 어긋났고(v1.0.30까지 릴리스되는 동안
// 세 파일 모두 "1.0.0"에 박제) 안드로이드 앱이 매번 "새 버전이 있습니다" 팝업을 반복했다.
//
// 사용:
//   node scripts/sync-version.mjs          # 현재 package.json 버전 기준 동기화
//   (scripts/bump-version.sh 가 버전 변경 시 자동 호출)
//   (CI: cf-deploy.yml / deploy.yml 이 빌드 직전 자동 호출)

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const version = pkg.version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`[sync-version] package.json version이 semver(x.y.z) 형식이 아닙니다: "${version}"`);
  process.exit(1);
}

const [major, minor, patch] = version.split(".").map(Number);
// major/minor는 100 미만을 전제로 한 결정론적 versionCode. semver가 증가하는 한
// versionCode도 항상 증가한다 (Android 요구사항).
const versionCode = major * 10000 + minor * 100 + patch;

// --- android/app/build.gradle ---
const gradlePath = join(ROOT, "android/app/build.gradle");
let gradle = readFileSync(gradlePath, "utf8");
const beforeGradle = gradle;
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
if (gradle !== beforeGradle) {
  writeFileSync(gradlePath, gradle);
}
console.log(`[sync-version] android/app/build.gradle -> versionName "${version}", versionCode ${versionCode}`);

// --- functions/api/version.ts ---
const versionTsPath = join(ROOT, "functions/api/version.ts");
let versionTs = readFileSync(versionTsPath, "utf8");
const beforeVersionTs = versionTs;
versionTs = versionTs.replace(/const APP_VERSION = "[^"]*";/, `const APP_VERSION = "${version}";`);
if (versionTs !== beforeVersionTs) {
  writeFileSync(versionTsPath, versionTs);
}
console.log(`[sync-version] functions/api/version.ts -> APP_VERSION "${version}"`);

console.log(`[sync-version] 완료: package.json(${version}) 기준으로 3곳 동기화됨`);
