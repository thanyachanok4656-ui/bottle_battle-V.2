document.addEventListener("DOMContentLoaded", loadRankingPage);

function fmt(n) {
  return Number(n || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

async function loadRankingPage() {
  highlightActiveMenu();
  const res = await api("getSummary");
  if (!res.success) {
    alert("โหลดข้อมูล Ranking ไม่สำเร็จ: " + (res.message || ""));
    return;
  }
  const ranking = res.data.ranking || [];
  showTopRank("#rank1", ranking[0], 1);
  showTopRank("#rank2", ranking[1], 2);
  showTopRank("#rank3", ranking[2], 3);
  renderRankingTable(ranking.slice(3, 10));
  renderGoal(res.data.totalWeight || 0);
}

function highlightActiveMenu() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".menu a").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
}

function showTopRank(selector, item, rank) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!item) {
    el.innerHTML = `<h2>${rank}</h2><b>-</b><span>0 kg</span>`;
    return;
  }
  el.innerHTML = `<h2>${rank}</h2><b>${item.className}</b><span>${fmt(item.weightKg)} kg</span>`;
}

function renderRankingTable(rows) {
  const tbody = document.querySelector("#rankingTable");
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="4">ยังไม่มีข้อมูลอันดับ 4 - 10</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((item, index) => `
    <tr>
      <td>${index + 4}</td>
      <td>${item.className}</td>
      <td>${fmt(item.weightKg)} kg</td>
      <td>${fmt(item.weightKg * CONFIG.BOTTLE_PER_KG)} ขวด</td>
    </tr>
  `).join("");
}

function renderGoal(totalWeight) {
  const goal = 1600;
  const percent = Math.min(100, (totalWeight / goal) * 100);
  document.querySelector("#goalText").textContent =
    `เก็บแล้ว ${fmt(totalWeight)} kg จากเป้าหมาย ${fmt(goal)} kg`;
  document.querySelector("#goalFill").style.width = percent + "%";
}
