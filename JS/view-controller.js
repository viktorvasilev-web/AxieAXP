import { setupGlobalMenu } from "./global-menu/menu.js";

// 🧠 Конфигурации за изгледи
window.viewOptions = {
    basic: {
        showGeneTable: false,
        showAXP: false,
        showDelegation: false,
        showMemento: false
    },
    axp: {
        showGeneTable: true,
        showAXP: true,
        showDelegation: true,
        showMemento: true
    }
};

// 🧠 Старт при зареждане
window.addEventListener("DOMContentLoaded", () => {
    // 🔧 Показваме глобалното меню веднага
    setupGlobalMenu();

    // 🔧 Настройваме началния изглед
    window.currentView = "basic";
    window.currentViewConfig = window.viewOptions["basic"];

    // 🟢 Зареждаме картите още при старт
    import('./csv-loader.js').then(module => module.loadCSVandRenderAxies());

    // 🟠 Настройваме превключването на изгледи
    const viewSwitcher = document.getElementById("viewSwitcher");
    if (!viewSwitcher) return;

    const views = {
        basic: "Basic View",
        axp: "AXP View"
    };

    Object.entries(views).forEach(([key, label]) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className = "view-btn";
        btn.dataset.view = key;

        btn.addEventListener("click", async () => {
            // 🟨 Смяна на активен бутон
            document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // 🧠 Обновяване на текущия изглед
            window.currentView = key;
            window.currentViewConfig = window.viewOptions[key];

            // ✅ Задаваме клас на <body> според изгледа
            document.body.classList.remove("basic-view", "axp-view");
            document.body.classList.add(`${key}-view`);

            // 🟩 Зареждаме съответните карти
            const module = await import('./csv-loader.js');
            module.loadCSVandRenderAxies();

            // 🔁 Ако е AXP, извикай директно AXP логиката
            if (key === "axp") {
                setTimeout(async () => {
                    const axpModule = await import('./axp-loader.js');
                    axpModule.injectAXPData(window.originalAxieData);
                }, 300); // леко забавяне за сигурност
            }
        });

        viewSwitcher.appendChild(btn);
    });
});
