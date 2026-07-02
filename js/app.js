document.addEventListener("DOMContentLoaded", init);

function fmt(n) {
  return Number(n || 0).toLocaleString("th-TH", {
    maximumFractionDigits: 2
  });
}

async function init() {
  const current = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".menu a").forEach(a => {
    if (a.getAttribute("href") === current) {
      a.classList.add("active");
    }
  });

  if (document.querySelector("#totalWeight")) loadSummary();
  if (document.querySelector("#rankingTable")) loadRanking();
  if (document.querySelector("#submitForm")) initSubmit();
  if (document.querySelector("#dailyBtn")) initDaily();
  if (document.querySelector("#historyBtn")) initHistory();
  if (document.querySelector("#carbonTotal")) loadCarbon();
}

async function loadSummary() {
  const res = await api("getSummary");
  if (!res.success) return;

  const d = res.data;

  document.querySelector("#totalWeight").textContent = fmt(d.totalWeight) + " kg";
  document.querySelector("#totalBottles").textContent = fmt(d.totalBottles) + " ขวด";
  document.querySelector("#co2Saved").textContent = fmt(d.co2Saved) + " kgCO₂e";
  document.querySelector("#treeCount").textContent = fmt(d.treeCount) + " ต้น";
  document.querySelector("#topClass").textContent = d.topClass.className;
  document.querySelector("#topClassWeight").textContent = fmt(d.topClass.weightKg) + " kg";

  renderPodium(d.ranking);
}

function renderPodium(ranking) {
  const el = document.querySelector("#podium");
  if (!el) return;

  const top = ranking.slice(0, 3);
  const faces = ["🐼", "🐰", "🐧"];

  el.innerHTML = top.map((row, index) => {
    return `
      <div class="podium-item rank${index + 1}">
        <div class="face">${faces[index]}</div>
        <h2>${index + 1}</h2>
        <b>${row.className}</b>
        <p>${fmt(row.weightKg)} kg</p>
      </div>
    `;
  }).join("");
}

async function loadRanking() {
  const res = await api("getSummary");
  if (!res.success) return;

  const ranking = res.data.ranking || [];

  const rank1 = ranking[0];
  const rank2 = ranking[1];
  const rank3 = ranking[2];

  if (rank1) {
    document.querySelector("#rank1").innerHTML =
      `<h2>1</h2><b>${rank1.className}</b><span>${fmt(rank1.weightKg)} kg</span>`;
  }

  if (rank2) {
    document.querySelector("#rank2").innerHTML =
      `<h2>2</h2><b>${rank2.className}</b><span>${fmt(rank2.weightKg)} kg</span>`;
  }

  if (rank3) {
    document.querySelector("#rank3").innerHTML =
      `<h2>3</h2><b>${rank3.className}</b><span>${fmt(rank3.weightKg)} kg</span>`;
  }

  const rows = ranking.slice(3, 10);

  document.querySelector("#rankingTable").innerHTML = rows.map((r, i) => `
    <tr>
      <td>${i + 4}</td>
      <td>${r.className}</td>
      <td>${fmt(r.weightKg)} kg</td>
    </tr>
  `).join("");

  const goal = 1600;
  const total = res.data.totalWeight || 0;
  const percent = Math.min(100, (total / goal) * 100);

  document.querySelector("#goalText").textContent =
    `เก็บแล้ว ${fmt(total)} kg จากเป้าหมาย ${fmt(goal)} kg`;

  document.querySelector("#goalFill").style.width = percent + "%";
}
async function initSubmit() {
  const classrooms = await api("getClassrooms");

  document.querySelector("#classSelect").innerHTML =
    `<option value="">เลือกห้องเรียน</option>` +
    classrooms.data.map(c => `<option>${c.className}</option>`).join("");

  document.querySelector("[name=date]").value = new Date().toISOString().slice(0, 10);

  document.querySelector("#submitForm").addEventListener("submit", async e => {
    e.preventDefault();

    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.weightKg = Number(payload.weightKg);

    const res = await api("saveCollection", payload);

    document.querySelector("#submitMsg").textContent =
      res.success ? "✅ บันทึกข้อมูลเรียบร้อย" : "❌ " + res.message;

    if (res.success) e.target.reset();
  });
}

function initDaily() {
  document.querySelector("#dailyDate").value = new Date().toISOString().slice(0, 10);
  document.querySelector("#dailyBtn").addEventListener("click", loadDaily);
  loadDaily();
}

async function loadDaily() {
  const res = await api("getDaily", {
    date: document.querySelector("#dailyDate").value
  });

  if (!res.success) return;

  const d = res.data;

  document.querySelector("#todayWeight").textContent = fmt(d.totalWeight) + " kg";
  document.querySelector("#todayCo2").textContent = fmt(d.co2Saved) + " kgCO₂e";
  document.querySelector("#todayTop").textContent = d.topClass;
  document.querySelector("#todayCount").textContent = d.items.length;

  document.querySelector("#dailyTable").innerHTML = d.items.map(x => `
    <tr>
      <td>${x.time}</td>
      <td>${x.className}</td>
      <td>${fmt(x.weightKg)} kg</td>
      <td>${x.recorder}</td>
    </tr>
  `).join("");
}

function initHistory() {
  document.querySelector("#historyBtn").addEventListener("click", loadHistory);
  loadHistory();
}

async function loadHistory() {
  const res = await api("getHistory", {
    date: document.querySelector("#historyDate")?.value,
    className: document.querySelector("#historyClass")?.value
  });

  if (!res.success) return;

  document.querySelector("#historyTable").innerHTML = res.data.map(x => `
    <tr>
      <td>${x.date}</td>
      <td>${x.className}</td>
      <td>${fmt(x.weightKg)} kg</td>
      <td>${x.recorder}</td>
    </tr>
  `).join("");
}

async function loadCarbon() {
  const res = await api("getSummary");
  const d = res.data;

  document.querySelector("#carbonTotal").textContent = fmt(d.co2Saved);
  document.querySelector("#carbonText").textContent =
    `น้ำหนักขวดสะสม ${fmt(d.totalWeight)} kg ลดคาร์บอนประมาณ ${fmt(d.co2Saved)} kgCO₂e`;
}
