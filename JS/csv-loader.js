import { generateClassButtons } from '/JS/ui/generateClassButtons.js';
import { generateBreedButtons } from '/JS/ui/generateBreedButtons.js';
import { generateLevelButtons } from '/JS/ui/generateLevelButtons.js';
import { generateLevelSlider } from '/JS/ui/generateLevelSlider.js'; // Импортиране на слайдера

import { updateAxieCount } from '/JS/global-menu/menu.js';
import { renderAxieCard } from '/JS/renderAxieCard.js';
import { classColors, collectionIcons } from '/JS/config.js';
import { generateCollectionSwitch } from '/JS/ui/generateCollectionSwitch.js'; // ✅ НОВО: правилен път

import { toggleAscendFilter } from '/JS/filter-utils.js'; // ✅ Импортираме филтъра
import { generatePuritySlider } from '/JS/ui/generatePuritySlider.js';

import { renderAccountFilterDropdown } from '/JS/ui/accountfilter.js'; // ✅ ДОБАВЕНО

export function loadCSVandRenderAxies() {
    fetch("decoded_axies.csv")
        .then(response => {
            if (!response.ok) throw new Error("CSV файлът не беше намерен.");
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    const container = $("#axieContainer").empty();
                    const classSet = new Set();
                    const breedSet = new Set();
                    const levelSet = new Set();
                    const seenIds = new Set();
                    const duplicates = [];

                    // ✅ Запазваме оригиналните Axie данни глобално
                    window.originalAxieData = results.data;

                    results.data
                        .sort((a, b) => {
                            const levelA = parseInt(a.Level) || 0;
                            const levelB = parseInt(b.Level) || 0;
                            return levelB - levelA;
                        })
                        .forEach((row) => {
                            const rawId = row.ID?.toString().trim();
                            if (!rawId) return;

                            if (seenIds.has(rawId)) {
                                duplicates.push(rawId);
                                return;
                            }

                            seenIds.add(rawId);
                            container.append(renderAxieCard(row, classColors, collectionIcons, window.currentViewConfig));

                            classSet.add(row.Class);
                            breedSet.add(row.BreedCount);
                            levelSet.add(row.Level);
                        });

                    updateAxieCount($(".axie-card").length);

                    if (duplicates.length > 0) {
                        console.warn("⚠️ Дублирани Axie ID-та:", duplicates);
                    } else {
                        console.log("✅ Няма дублирани Axie ID-та");
                    }

                    // 👉 Генериране на UI филтри
                    generateClassButtons(classSet);
                    generateBreedButtons();
                    generateLevelButtons();
                    generateCollectionSwitch(); // ✅ Генерира и активира суича за колекции

                    generateLevelSlider(); // Генерираме слайдера за ниво
                    generatePuritySlider(); // 👉 след generateLevelSlider()

                    // ✅ Закачаме бутона за Ascend филтър
                    const ascendBtn = document.getElementById('ascendFilterBtn');
                    if (ascendBtn) {
                        ascendBtn.addEventListener('click', toggleAscendFilter);
                    }

                    renderAccountFilterDropdown(); // ✅ ДОБАВЕНО
                }
            });
        })
        .catch(err => console.error("Грешка при зареждане на CSV:", err));
}
