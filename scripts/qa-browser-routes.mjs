import { spawn } from "node:child_process";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

const ROUTES_TO_TEST = [
  // Public marketing & legal
  { path: "/", expectedStatus: [200], name: "Landing Page", contentChecks: ["Sanjog", "How it works", "Features", "FAQ"] },
  { path: "/about", expectedStatus: [200], name: "About Page", contentChecks: ["Making sign language practice free", "Our story"] },
  { path: "/privacy", expectedStatus: [200], name: "Privacy Policy", contentChecks: ["Privacy Policy", "Camera"] },
  { path: "/terms", expectedStatus: [200], name: "Terms of Service", contentChecks: ["Terms of Service"] },

  // Auth pages
  { path: "/sign-in", expectedStatus: [200], name: "Sign In Page", contentChecks: ["Welcome back", "Sign in", "Terms"] },
  { path: "/sign-up", expectedStatus: [200], name: "Sign Up Page", contentChecks: ["Terms", "Sanjog"] },

  // Protected dashboard routes (signed-out should redirect to /sign-in with 307/308)
  { path: "/dashboard", expectedStatus: [307, 308], redirectExpected: true, name: "Dashboard Overview (Signed-out 307)" },
  { path: "/dashboard/lessons", expectedStatus: [307, 308], redirectExpected: true, name: "Lessons Catalog (Signed-out 307)" },
  { path: "/dashboard/lessons/interactive?set=alphabet&sign=A", expectedStatus: [307, 308], redirectExpected: true, name: "Practice Engine (Signed-out 307)" },
  { path: "/dashboard/progress", expectedStatus: [307, 308], redirectExpected: true, name: "Progress Analytics (Signed-out 307)" },
  { path: "/dashboard/challenges", expectedStatus: [307, 308], redirectExpected: true, name: "Challenges Page (Signed-out 307)" },
  { path: "/dashboard/achievements", expectedStatus: [307, 308], redirectExpected: true, name: "Achievements Page (Signed-out 307)" },
  { path: "/dashboard/leaderboard", expectedStatus: [307, 308], redirectExpected: true, name: "Leaderboard Page (Signed-out 307)" },
  { path: "/dashboard/settings", expectedStatus: [307, 308], redirectExpected: true, name: "Settings Page (Signed-out 307)" },

  // API Routes (All protected by Clerk authentication when signed out)
  { path: "/api/leaderboard", expectedStatus: [401], name: "Leaderboard API Auth Guard (401)" },
  { path: "/api/community/feed", expectedStatus: [401], name: "Community Feed API Auth Guard (401)" },
  { path: "/api/attempts", method: "POST", expectedStatus: [401], name: "Attempts API Auth Guard (401)" },
  { path: "/api/me", expectedStatus: [401], name: "Me API Auth Guard (401)" },
  { path: "/api/settings", method: "PATCH", expectedStatus: [401], name: "Settings API Auth Guard (401)" },

  // Static Assets
  { path: "/signs/A.svg", expectedStatus: [200], name: "Public Domain Sign (A.svg)", contentChecks: ["<svg"] },
  { path: "/signs/G.svg", expectedStatus: [200], name: "Public Domain Sign (G.svg)", contentChecks: ["<svg"] },
  { path: "/signs/LICENSE.md", expectedStatus: [200], name: "Public Domain Signs License", contentChecks: ["Public domain"] },
  { path: "/S-logo.svg", expectedStatus: [200], name: "Brand Logo SVG", contentChecks: ["<svg"] },
];

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not respond within ${timeoutMs}ms`);
}

async function run() {
  console.log(`Starting Next.js dev server on port ${PORT}...`);
  const env = { ...process.env, PORT: String(PORT), NEXT_DIST_DIR: ".next_dev" };
  const devProcess = spawn("cmd.exe", ["/c", "npx.cmd", "next", "dev", "-p", String(PORT)], {
    stdio: "pipe",
    env,
  });

  try {
    console.log(`Waiting for ${BASE_URL} to be ready...`);
    await waitForServer(BASE_URL);
    console.log("Dev server is ready! Executing route checks...\n");

    const results = [];

    for (const test of ROUTES_TO_TEST) {
      const url = `${BASE_URL}${test.path}`;
      const method = test.method || "GET";
      try {
        const res = await fetch(url, {
          method,
          headers: test.method === "POST" || test.method === "PATCH" ? { "Content-Type": "application/json" } : {},
          redirect: "manual",
        });

        const statusMatch = test.expectedStatus.includes(res.status);
        const text = await res.text();

        let contentOk = true;
        let failReason = "";

        if (!statusMatch) {
          contentOk = false;
          failReason = `Expected status ${test.expectedStatus.join("|")}, got ${res.status}`;
        }

        if (statusMatch && test.contentChecks) {
          for (const snippet of test.contentChecks) {
            if (!text.toLowerCase().includes(snippet.toLowerCase())) {
              contentOk = false;
              failReason = `Missing snippet "${snippet}" in response body`;
              break;
            }
          }
        }

        if (statusMatch && test.redirectExpected) {
          const loc = res.headers.get("location");
          if (!loc || (!loc.includes("sign-in") && !loc.includes("clerk"))) {
            if (!text.includes("sign-in") && !text.includes("clerk")) {
              contentOk = false;
              failReason = `Redirect header or clerk redirect markup missing (Location: ${loc})`;
            }
          }
        }

        results.push({
          name: test.name,
          path: test.path,
          status: res.status,
          pass: contentOk,
          reason: failReason,
        });

        const icon = contentOk ? "PASS" : "FAIL";
        console.log(`[${icon}] ${test.name.padEnd(42)} | ${method.padEnd(5)} ${test.path.padEnd(48)} | Status: ${res.status} ${failReason ? `(${failReason})` : ""}`);
      } catch (err) {
        results.push({
          name: test.name,
          path: test.path,
          status: "ERR",
          pass: false,
          reason: err.message,
        });
        console.log(`[FAIL] ${test.name.padEnd(42)} | ${method.padEnd(5)} ${test.path.padEnd(48)} | Error: ${err.message}`);
      }
    }

    console.log("\n=========================================================================================");
    console.log("                                 BROWSER QA REPORT SUMMARY                               ");
    console.log("=========================================================================================");
    const passed = results.filter((r) => r.pass).length;
    const total = results.length;
    console.log(`Total Route & Flow Checks: ${total}`);
    console.log(`Passed:                   ${passed}`);
    console.log(`Failed:                   ${total - passed}`);
    console.log("=========================================================================================\n");

    if (passed === total) {
      console.log(">>> ALL 23 BROWSER ROUTE & INTEGRITY CHECKS PASSED WITH 100% SUCCESS! <<<");
    }
  } finally {
    console.log("Tearing down test server instance...");
    devProcess.kill();
    try {
      spawn("taskkill", ["/pid", String(devProcess.pid), "/f", "/t"]);
    } catch {}
  }
}

run().catch((e) => {
  console.error("Test runner encountered an error:", e);
  process.exit(1);
});
