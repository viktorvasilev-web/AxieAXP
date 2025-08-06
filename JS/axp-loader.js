export function injectAXPData(axieData) {
    const delegateAddressMap = {
        "0x9218f8aa46faae8081d7a2d1e20bd135fcf76aea": "3 Savana Main NM FARM-ViktorAccount1",
        "0xb3296808909ea5a910666ecdc1fef1a847d52237": "Kazima",
        "0x61272ff9db3da124029d29fefa3dd773d8f67a74": "9-9",
        "0x037dc10b4c530e9a0735249d0f41efc25f727912": "Metis | Cryptosis",
        "0xf5b3b8a580778d8723fec48936d6d7c6b1e0f995": "ViktorAccount2",
        "0xb9bb961a410117b32f50c997dd68d0a68f0a8a53": "TOYOIN 9",
        "0x6416c37a5ae79c82d5c447f3e75976fdeffa377e": "Chaechae",
    };

    for (const row of axieData) {
        const id = row.ID;
        const card = document.querySelector(`.axie-card[data-id='${id}']`);
        if (!card) continue;

        const axpList = parseAXP18days(row.AXP18days || "").slice(-18);
        const xpForGraph = axpList.length > 0 ? axpList[axpList.length - 1].xp : 0;

        // ✅ Използваме AXPtoday колоната само за сортиране
        const xpTodayFromCSV = parseTodayFromAXPtoday(row.AXPtoday || "");
        card.setAttribute("data-xp-today", xpTodayFromCSV);

        const maxHeight = 50;
        const svgWidth = 180;
        const barWidth = 8;
        const spacing = 2;
        const graphHeight = maxHeight + 15;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", graphHeight);
        svg.classList.add("axp-svg-graph");

        axpList.forEach((entry, i) => {
            const x = i * (barWidth + spacing);
            const xp = entry?.xp ?? 0;
            const height = (xp / 10000) * maxHeight;
            const y = maxHeight - height;

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", height);
            rect.setAttribute("fill", getColorForXP(xp));
            rect.setAttribute("rx", 1);

            rect.addEventListener("mouseenter", () => {
                const tooltip = document.createElement("div");
                tooltip.className = "custom-axp-tooltip";
                tooltip.textContent = `${entry.date || "N/A"}: ${entry.xp ?? "N/A"} AXP`;
                document.body.appendChild(tooltip);

                const onMove = (e) => {
                    tooltip.style.left = `${e.pageX + 10}px`;
                    tooltip.style.top = `${e.pageY - 30}px`;
                };

                document.addEventListener("mousemove", onMove);

                rect.addEventListener("mouseleave", () => {
                    tooltip.remove();
                    document.removeEventListener("mousemove", onMove);
                }, { once: true });
            });

            svg.appendChild(rect);
        });

        const labelTop = document.createElement("div");
        labelTop.textContent = "↑ 10 000 AXP";
        labelTop.className = "axp-label-top";

        const labelRight = document.createElement("div");
        labelRight.textContent = "→ Today";
        labelRight.className = "axp-label-right";

        const wrapper = document.createElement("div");
        wrapper.className = "axp-graph-wrapper";
        wrapper.appendChild(labelTop);
        wrapper.appendChild(svg);
        wrapper.appendChild(labelRight);
        card.appendChild(wrapper);

        const rawAddress = row.Delegation?.trim().toLowerCase();
        let displayName = "Not Delegated";
        if (rawAddress) {
            displayName = delegateAddressMap[rawAddress] || "Others";
        }

        const div = document.createElement("div");
        div.className = "delegate-address";
        div.textContent = `👤 ${displayName}`;
        div.style.fontSize = "0.9em";
        div.style.marginTop = "6px";
        div.style.textAlign = "center";
        div.style.color = "#aaa";
        card.appendChild(div);

        card.setAttribute("data-should-ascend", row.ShouldAscend?.toLowerCase() || "false");
        const isEgg = row.Level === "1" && (!row.Purity || row.Purity.trim() === "");
        card.setAttribute("data-is-egg", isEgg ? "true" : "false");
    }

    sortAxieCardsByXpToday();

    // ✅ Активира бутона ⬇️ AXP/Today визуално
    document.querySelectorAll(".sort-controls button").forEach(btn => btn.classList.remove("active"));
    const axpTodayBtn = document.getElementById("sortAxpTodayAsc");
    if (axpTodayBtn) axpTodayBtn.classList.add("active");

    // ✅ Обнови тоталната стойност на AXP/Today
    if (typeof window.updateTotalAxpToday === "function") {
        window.updateTotalAxpToday();
    }
}

function sortAxieCardsByXpToday() {
    const container = document.getElementById("axieContainer");
    if (!container) return;

    const cards = Array.from(container.querySelectorAll(".axie-card"));

    cards.sort((a, b) => {
        const aXP = parseInt(a.getAttribute("data-xp-today")) || 0;
        const bXP = parseInt(b.getAttribute("data-xp-today")) || 0;

        const aAscend = (a.getAttribute("data-should-ascend") || "").toLowerCase() === "true";
        const bAscend = (b.getAttribute("data-should-ascend") || "").toLowerCase() === "true";

        if (aXP === 0 && bXP !== 0) return -1;
        if (aXP !== 0 && bXP === 0) return 1;
        if (aXP !== bXP) return aXP - bXP;

        if (aAscend && !bAscend) return 1;
        if (!aAscend && bAscend) return -1;

        return 0;
    });

    for (const card of cards) {
        container.appendChild(card);
    }
}

function parseAXP18days(str) {
    return str.trim().split("\n").map(line => {
        const [date, xp] = line.split(":");
        return { date: date?.trim(), xp: parseInt(xp?.trim()) || 0 };
    }).filter(entry => entry.date);
}

function parseTodayFromAXPtoday(rawStr) {
    if (!rawStr) return 0;
    const match = rawStr.match(/Today:\s*(\d+)/i);
    return match ? parseInt(match[1]) || 0 : 0;
}

function getColorForXP(xp) {
    if (xp === 0) return "#555";
    if (xp < 3000) return "#f0c674";
    if (xp < 7000) return "#f4a261";
    if (xp < 9000) return "#e76f51";
    return "#2aa9ff";
}
