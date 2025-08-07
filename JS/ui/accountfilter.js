const delegationMap = {
    "0x9218f8aa46faae8081d7a2d1e20bd135fcf76aea": "3 Savana Main NM FARM-ViktorAccount1",
    "0xf5b3b8a580778d8723fec48936d6d7c6b1e0f995": "ViktorAccount2",
    "0xb3296808909ea5a910666ecdc1fef1a847d52237": "Kazima",
    "0xe47c02a904b1401f49cef081eef2051423957022": "Account 44 | Projects Eri",
    "0x8b5473032df30aa28df7de86ab28d78551b302e7": "Lopez | Cryptosis",
    "0xb382cc6bda02524ff4cc99a910ec6808118502e0": "Account 56 | Projects Eri",
    "0x7ece291edd644e6566ab5971460d2e2182d961e3": "Lunacian #4",
"0xc2400c69ef9d429a36060ab5037eeaa4eebf3467": "Charizard",
};

export function renderAccountFilterDropdown() {
    const container = document.getElementById("All Accounts");
    if (!container) {
        console.warn("❌ Контейнерът #All Accounts не съществува.");
        return;
    }

    const label = document.createElement("label");
    label.setAttribute("for", "accountDropdown");

    const select = document.createElement("select");
    select.id = "accountDropdown";
    select.className = "account-dropdown";

    const optionAll = document.createElement("option");
    optionAll.value = "all";
    optionAll.textContent = "All Accounts";
    select.appendChild(optionAll);

    // ❌ Премахнато: "Not Delegated"
    // ❌ Премахнато: "Others" и detectUnknownDelegations

    Object.entries(delegationMap).forEach(([wallet, name]) => {
        const option = document.createElement("option");
        option.value = wallet.toLowerCase();
        option.textContent = name;
        select.appendChild(option);
    });

    select.addEventListener("change", () => {
        const selected = select.value.toLowerCase();
        window.__ACTIVE_ACCOUNT_FILTER__ = selected;
        if (typeof window.applyFilters === "function") {
            window.applyFilters();
        }
    });

    if (typeof window.__ACTIVE_ACCOUNT_FILTER__ === "undefined") {
        window.__ACTIVE_ACCOUNT_FILTER__ = "all";
    }

    container.innerHTML = "";
    container.appendChild(label);
    container.appendChild(select);
}
