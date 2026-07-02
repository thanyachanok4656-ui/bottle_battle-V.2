const CONFIG = {
  API_URL: "PASTE_APPS_SCRIPT_EXEC_URL_HERE",
  BOTTLE_PER_KG: 50,
  CO2_PER_KG: 3.96,
  TREE_CO2_PER_YEAR: 22
};

async function api(action, payload = {}) {
  if (CONFIG.API_URL.includes("PASTE_")) {
    return mockApi(action, payload);
  }

  const url =
    CONFIG.API_URL +
    "?action=" + encodeURIComponent(action) +
    "&payload=" + encodeURIComponent(JSON.stringify(payload));

  const res = await fetch(url);
  return await res.json();
}

function mockApi(action, payload) {
  const ranking = [
    { className: "ม.4/3", weightKg: 85.6 },
    { className: "ม.5/2", weightKg: 80.2 },
    { className: "ม.6/1", weightKg: 75.3 },
    { className: "ม.3/2", weightKg: 61.6 }
  ];

  const classrooms = [
    "ม.1/1","ม.1/2","ม.1/3","ม.1/4","ม.1/5","ม.1/6",
    "ม.2/1","ม.2/2","ม.2/3","ม.2/4","ม.2/5","ม.2/6",
    "ม.3/1","ม.3/2","ม.3/3","ม.3/4","ม.3/5","ม.3/6",
    "ม.4/1","ม.4/2","ม.4/3","ม.4/4","ม.4/5","ม.4/6",
    "ม.5/1","ม.5/2","ม.5/3","ม.5/4","ม.5/5","ม.5/6",
    "ม.6/1","ม.6/2","ม.6/3","ม.6/4","ม.6/5","ม.6/6"
  ];

  const totalWeight = ranking.reduce((s, r) => s + r.weightKg, 0);

  if (action === "getSummary") {
    return Promise.resolve({
      success: true,
      data: {
        ranking,
        totalWeight,
        totalBottles: Math.round(totalWeight * CONFIG.BOTTLE_PER_KG),
        co2Saved: totalWeight * CONFIG.CO2_PER_KG,
        treeCount: Math.round((totalWeight * CONFIG.CO2_PER_KG) / CONFIG.TREE_CO2_PER_YEAR),
        topClass: ranking[0]
      }
    });
  }

  if (action === "getClassrooms") {
    return Promise.resolve({
      success: true,
      data: classrooms.map(className => ({ className }))
    });
  }

  if (action === "saveCollection") {
    return Promise.resolve({
      success: true,
      message: "บันทึกตัวอย่างสำเร็จ"
    });
  }

  if (action === "getDaily") {
    return Promise.resolve({
      success: true,
      data: {
        totalWeight: 22.4,
        co2Saved: 88.7,
        topClass: "ม.4/3",
        items: [
          { time: "08:10", className: "ม.4/3", weightKg: 12.6, recorder: "ครูธันยชนก" },
          { time: "09:15", className: "ม.5/2", weightKg: 9.8, recorder: "สภานักเรียน" }
        ]
      }
    });
  }

  if (action === "getHistory") {
    return Promise.resolve({
      success: true,
      data: [
        { date: "2026-07-01", className: "ม.4/3", weightKg: 12.6, recorder: "ครูธันยชนก" },
        { date: "2026-07-01", className: "ม.5/2", weightKg: 9.8, recorder: "สภานักเรียน" }
      ]
    });
  }

  return Promise.resolve({
    success: false,
    message: "unknown action"
  });
}
