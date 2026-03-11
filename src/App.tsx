import { useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

declare global {
  interface Window {
    lucide: any;
    forceNextSlide: (num: number) => void;
    selectGoal: (btn: HTMLElement, goal: string) => void;
    initializeDatabase: () => void;
    switchTab: (viewId: string, index: number) => void;
    logMeal: (mealId: string, amount: number) => void;
    logWaterNode: (index: number) => void;
    logFood: (food: string) => void;
    editFood: (id: string) => void;
    deleteFood: (id: string) => void;
    toggleSet: (exId: string, setIndex: number) => void;
    openResetModal: () => void;
    openAddExerciseModal: () => void;
    addCustomExercise: () => void;
    editExercise: (exId: string) => void;
    updateCustomExercise: (exId: string) => void;
    deleteExercise: (exId: string) => void;
    completeAllExercises: () => void;
    switchDay: (dayIdx: number) => void;
    closeModals: () => void;
    executeFactoryReset: () => void;
    saveData: () => void;
    getDailyData: (dateStr?: string) => any;
    fireToast: (msg: string, iconName?: string, color?: string) => void;
  }
}

// System Constants
const DB_KEY = 'coachv_apex_v3';
const TARGET_PROTEIN = 85;
const DAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function App() {
  useEffect(() => {
    // Database State
    const FULL_ROUTINE: any = {
        0: [], // Sunday: Full Rest
        1: [ // Monday: Shoulder + Back
            { id: 'ex1', title: 'Pike Push-up', target: '3x10', desc: 'Hips high, dive head between hands.', sets: [10,10,10] },
            { id: 'ex2', title: 'Backpack Pike', target: '3x8', desc: 'Same form, wear loaded backpack.', sets: [8,8,8] },
            { id: 'ex3', title: 'Doorframe Row', target: '4x12', desc: 'Key Lat builder. Pull chest to frame.', sets: [12,12,12,12], gold: true },
            { id: 'ex4', title: 'Superman Hold', target: '3x12', desc: 'Lie on stomach. Hold top position 3s.', sets: [12,12,12] },
            { id: 'ex5', title: 'Single Arm Row', target: '3x10', desc: 'LEFT SIDE FIRST. Match right to left.', sets: [10,10,10], red: true },
            { id: 'ex6', title: 'Lateral Raise', target: '3x15', desc: 'Water bottles/bags. Slow descent.', sets: [15,15,15] },
            { id: 'ex7', title: 'Wall Angels', target: '2x15', desc: 'Posture fix. Keep arms glued to wall.', sets: [15,15] },
            { id: 'ex8', title: 'Rear Delt Row', target: '3x12', desc: 'Towel on door handle. Keep elbows wide.', sets: [12,12,12] }
        ],
        2: [], // Tuesday: Aaraam
        3: [ // Wednesday: Chest + Triceps
            { id: 'ex9', title: 'Normal Push-up', target: '3x15', desc: 'Straight body, full range of motion.', sets: [15,15,15] },
            { id: 'ex10', title: 'Wide Push-up', target: '3x12', desc: 'Double shoulder width for chest stretch.', sets: [12,12,12], gold: true },
            { id: 'ex11', title: 'Diamond Push-up', target: '3x10', desc: 'Hands under chest, target triceps.', sets: [10,10,10] },
            { id: 'ex12', title: 'Decline Push-up', target: '3x10', desc: 'Feet on chair. Upper chest focus.', sets: [10,10,10] },
            { id: 'ex13', title: 'Backpack Push-up', target: '3x8', desc: 'Progressive overload. Load backpack.', sets: [8,8,8] },
            { id: 'ex14', title: 'Chair Dips', target: '3x12', desc: 'Hands on chair, feet forward.', sets: [12,12,12] },
            { id: 'ex15', title: 'Left Wall Push', target: '2x8', desc: 'LEFT SIDE FIRST. Fix imbalance.', sets: [8,8], red: true },
            { id: 'ex16', title: 'Pike Hold', target: '3x20s', desc: 'Hold pike position for 20 seconds.', sets: ['20s','20s','20s'] }
        ],
        4: [], // Thursday: Aaraam
        5: [ // Friday: Back + Biceps
            { id: 'ex17', title: 'Doorframe Row', target: '4x12', desc: 'Keep back entirely straight.', sets: [12,12,12,12], gold: true },
            { id: 'ex18', title: 'Backpack Bent Row', target: '4x10', desc: '45 degree bend. Squeeze lats at top.', sets: [10,10,10,10] },
            { id: 'ex19', title: 'Towel Row', target: '3x12', desc: 'Towel on handle, elbows tight to body.', sets: [12,12,12] },
            { id: 'ex20', title: 'Single Arm Row', target: '3x10', desc: 'LEFT SIDE FIRST. Heavy weight.', sets: [10,10,10], red: true },
            { id: 'ex21', title: 'Superman', target: '3x15', desc: 'Arms and legs up, 3s hold.', sets: [15,15,15] },
            { id: 'ex22', title: 'Bicep Curl', target: '3x12', desc: 'Use bags/bottles. Slow control.', sets: [12,12,12] },
            { id: 'ex23', title: 'Reverse Snow Angel', target: '3x15', desc: 'Lie on stomach, sweep arms up.', sets: [15,15,15] },
            { id: 'ex24', title: 'Isometric Row Hold', target: '3x5s', desc: 'Hold doorframe row at peak contraction.', sets: ['5s','5s','5s'] }
        ],
        6: [ // Saturday: Legs + Core
            { id: 'ex25', title: 'Bodyweight Squat', target: '4x20', desc: 'Thighs parallel, chest up.', sets: [20,20,20,20] },
            { id: 'ex26', title: 'Backpack Squat', target: '3x15', desc: 'Wear loaded bag for resistance.', sets: [15,15,15], gold: true },
            { id: 'ex27', title: 'Lunges', target: '3x10', desc: 'LEFT LEG FIRST.', sets: [10,10,10], red: true },
            { id: 'ex28', title: 'Calf Raise', target: '3x25', desc: 'Slow up, slow down.', sets: [25,25,25] },
            { id: 'ex29', title: 'Plank', target: '3x45s', desc: 'Body in straight line, abs tight.', sets: ['45s','45s','45s'] },
            { id: 'ex30', title: 'Side Plank', target: '2x30s', desc: 'Left side first. Hit obliques.', sets: ['30s','30s'] },
            { id: 'ex31', title: 'Leg Raise', target: '3x15', desc: 'Lie flat, raise legs 90 degrees.', sets: [15,15,15] },
            { id: 'ex32', title: 'Bicycle Crunches', target: '3x20', desc: 'Elbow to opposite knee. Twist waist.', sets: [20,20,20] },
            { id: 'ex33', title: 'Hollow Body Hold', target: '3x25s', desc: 'Arms up, legs up. Core tight.', sets: ['25s','25s','25s'] }
        ]
    };

    let db: any = {
        user: null, goal: null, lastDate: null, streak: 0, 
        history: {}, 
        dailyData: {}, // New: stores { protein, water, mealsLogged, setsDone, nutrition } per date
        customExercises: [],
        deletedExercises: []
    };

    let currentDayIdx = new Date().getDay();

    const getMonday = (d: Date) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const getViewedDate = () => {
        const now = new Date();
        const monday = getMonday(new Date(now));
        const targetDate = new Date(monday);
        // currentDayIdx: 0=Sun, 1=Mon, ..., 6=Sat
        // Our week starts Mon (1), Tue (2), ..., Sat (6), Sun (0)
        // Adjust currentDayIdx to match Mon-Sun sequence for date calculation
        let offset = currentDayIdx - 1;
        if (currentDayIdx === 0) offset = 6; 
        targetDate.setDate(monday.getDate() + offset);
        return targetDate.toDateString();
    };

    const getDailyData = (dateStr?: string) => {
        const date = dateStr || getViewedDate();
        if (!db.dailyData) db.dailyData = {};
        if (!db.dailyData[date]) {
            db.dailyData[date] = {
                protein: 0,
                water: 0,
                mealsLogged: { sehri: false, iftar: false, post: false, sleep: false },
                setsDone: [],
                nutrition: []
            };
        }
        return db.dailyData[date];
    };

    const getTodaysRoutines = () => {
        return [...(FULL_ROUTINE[currentDayIdx] || []), ...(db.customExercises || []).filter((ex: any) => ex.day === currentDayIdx)]
            .filter((ex: any) => !(db.deletedExercises || []).includes(ex.id));
    };

    window.fireToast = (msg: string, iconName = 'bell', color = 'var(--text-pure)') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i data-lucide="${iconName}" style="color: ${color}" class="w-5 h-5 icon-sharp"></i> <span>${msg}</span>`;
        
        container.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 600); 
        }, 2500);
    };

    const domCache: Record<string, HTMLElement | null> = {};
    const getCachedElement = (id: string, forceRefresh = false) => {
        if (forceRefresh || !domCache[id]) {
            domCache[id] = document.getElementById(id);
        }
        return domCache[id];
    };

    let hydratePending = false;
    let lastNutritionHash = '';
    const hydrateUI = () => {
        if (hydratePending) return;
        hydratePending = true;
        requestAnimationFrame(() => {
            if(!db.user) {
                hydratePending = false;
                return;
            }
            
            // Clear dynamic parts of cache that might be recreated
            const dynamicPrefixes = ['water-', 'day-btn-', 'btn-', 'card-', 'master-badge-'];
            Object.keys(domCache).forEach(key => {
                if (dynamicPrefixes.some(p => key.startsWith(p))) {
                    delete domCache[key];
                }
            });

            const todaysRoutines = getTodaysRoutines();
            const dayData = getDailyData();
            const todayStr = new Date().toDateString();

            const hour = new Date().getHours();
            let greeting = "COACH,";
            if (hour < 12) greeting = "MORNING,";
            else if (hour < 18) greeting = "AFTERNOON,";
            else greeting = "EVENING,";

            const uiGreeting = getCachedElement('ui-greeting');
            if (uiGreeting) uiGreeting.innerText = greeting;

            const uiName = getCachedElement('ui-name');
            if (uiName) uiName.innerText = db.user;
            
            const uiGoalDisplay = getCachedElement('ui-goal-display');
            if (uiGoalDisplay) uiGoalDisplay.innerText = `Target: ${db.goal || 'V-Shape Engine'}`;
            
            const uiAvatar = getCachedElement('ui-avatar') as HTMLImageElement;
            if (uiAvatar) uiAvatar.src = `https://ui-avatars.com/api/?name=${db.user}&background=111&color=EAB308&bold=true`;
            
            const dashStreak = getCachedElement('dash-streak');
            if (dashStreak) dashStreak.innerText = `${db.streak} Day Streak`;
            
            const dashStreakSettings = getCachedElement('dash-streak-settings');
            if (dashStreakSettings) dashStreakSettings.innerText = `${db.streak} Day Streak`;
            
            const uiNameSettings = getCachedElement('ui-name-settings');
            if (uiNameSettings) uiNameSettings.innerText = db.user;
            
            const uiGoalDisplaySettings = getCachedElement('ui-goal-display-settings');
            if (uiGoalDisplaySettings) uiGoalDisplaySettings.innerText = `Target: ${db.goal || 'V-Shape Engine'}`;
            
            const uiAvatarSettings = getCachedElement('ui-avatar-settings') as HTMLImageElement;
            if (uiAvatarSettings) uiAvatarSettings.src = `https://ui-avatars.com/api/?name=${db.user}&background=111&color=EAB308&bold=true`;
            
            let totalExCompleted = 0;
            const totalExCount = todaysRoutines.length;
            todaysRoutines.forEach((ex: any) => {
                let cardCompleted = true;
                ex.sets.forEach((_: any, index: number) => {
                    const setId = `${ex.id}-${index}`;
                    const isDone = dayData.setsDone.includes(setId);
                    
                    const pill = getCachedElement(setId);
                    if(pill) {
                        if(isDone) pill.classList.add('done'); 
                        else pill.classList.remove('done'); 
                    }
                    
                    if(!isDone) cardCompleted = false;
                });
                
                if(cardCompleted) totalExCompleted++;

                const card = getCachedElement(ex.id);
                const masterBadge = getCachedElement(`master-badge-${ex.id}`);
                if(card) {
                    if(cardCompleted) { 
                        card.classList.add('master-done'); 
                        if(masterBadge) masterBadge.classList.remove('hidden');
                    } else { 
                        card.classList.remove('master-done'); 
                        if(masterBadge) masterBadge.classList.add('hidden');
                    }
                }
            });

            Object.keys(dayData.mealsLogged).forEach(mealId => {
                const btn = getCachedElement(`btn-${mealId}`);
                const card = getCachedElement(`card-${mealId}`);
                if(btn) {
                    if(dayData.mealsLogged[mealId]) {
                        btn.innerText = "✓ LOGGED";
                        btn.className = "btn-primary disabled";
                        if(card) card.classList.add('border-gold');
                    } else {
                        btn.className = "btn-primary";
                        if(card) card.classList.remove('border-gold');
                    }
                }
            });

            const waterCount = getCachedElement('water-count');
            if (waterCount) waterCount.innerText = `${dayData.water}/8 Glasses`;
            for(let i=0; i<8; i++) {
                const drop = getCachedElement(`water-${i}`);
                if(drop) { 
                    if(i < dayData.water) {
                        drop.classList.add('filled');
                    } else {
                        drop.classList.remove('filled');
                    }
                }
            }

            const nutritionContainer = getCachedElement('nutrition-list');
            if (nutritionContainer) {
                const currentNutritionHash = JSON.stringify(dayData.nutrition);
                if (currentNutritionHash !== lastNutritionHash) {
                    let nutritionHtml = '';
                    dayData.nutrition.forEach((f: any) => {
                        nutritionHtml += `
                        <div class="flex justify-between items-center p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)] mb-2" style="contain: layout style;">
                                <div>
                                    <h4 class="font-bold">${f.food}</h4>
                                    <p class="text-[12px] text-[var(--text-muted)]">${f.calories} kcal | P:${f.protein} C:${f.carbs} F:${f.fats}</p>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="editFood('${f.id}')" class="text-[var(--text-muted)] hover:text-white"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                    <button onclick="deleteFood('${f.id}')" class="text-[var(--alert-red)] hover:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </div>
                            </div>
                        `;
                    });
                    nutritionContainer.innerHTML = nutritionHtml;
                    if (window.lucide) window.lucide.createIcons();
                    lastNutritionHash = currentNutritionHash;
                }
            }

            const proteinProgress = Math.min(100, (dayData.protein / TARGET_PROTEIN) * 100);
            const mealsProgress = (Object.keys(dayData.mealsLogged).length > 0) ? (Object.values(dayData.mealsLogged).filter(v => v).length / Object.keys(dayData.mealsLogged).length) * 100 : 0;
            const exercisesProgress = totalExCount > 0 ? (totalExCompleted / totalExCount) * 100 : 0;
            const combinedProgress = (proteinProgress * 0.33) + (mealsProgress * 0.33) + (exercisesProgress * 0.34);
            
            const globalProteinText = getCachedElement('global-protein-text');
            if (globalProteinText) globalProteinText.innerText = `${dayData.protein}/${TARGET_PROTEIN}g`;
            
            const dashProteinVal = getCachedElement('dash-protein-val');
            if (dashProteinVal) dashProteinVal.innerText = `${dayData.protein}`;
            
            const readinessScore = getCachedElement('readiness-score');
            if (readinessScore) readinessScore.innerText = Math.round(combinedProgress).toString();
            
            const circ = 263.89;
            const readinessSvg = getCachedElement('readiness-svg');
            if (readinessSvg) readinessSvg.style.strokeDashoffset = (circ - (circ * (combinedProgress / 100))).toString();
            
            const workoutProgressTxt = getCachedElement('workout-progress-txt');
            if (workoutProgressTxt) workoutProgressTxt.innerText = `${totalExCompleted}/${totalExCount}`;
            
            const workoutProgressBar = getCachedElement('workout-progress-bar');
            if (workoutProgressBar) workoutProgressBar.style.width = `${exercisesProgress}%`;
            
            const globalProteinBar = getCachedElement('global-protein-bar');
            if (globalProteinBar) globalProteinBar.style.width = `${combinedProgress}%`;

            const pulseContainer = document.getElementById('weekly-pulse-container');
            if (pulseContainer) {
                const daysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                const now = new Date();
                const nowStr = now.toDateString();
                const monday = getMonday(new Date(now));
                const performanceChart = document.getElementById('performance-chart');
                
                let pulseHtml = '';
                let performanceHtml = '';
                
                // Pre-calculate custom exercises and deleted ones once
                const customEx = db.customExercises || [];
                const deletedEx = db.deletedExercises || [];

                for(let i=0; i<7; i++) {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);
                    const dStr = d.toDateString();
                    const dayIdx = d.getDay();
                    
                    const dayInfo = getDailyData(dStr);
                    const isDone = db.history[dStr] === true;
                    const isToday = dStr === nowStr;
                    
                    const dayRoutines = [...(FULL_ROUTINE[dayIdx] || []), ...customEx.filter((ex: any) => ex.day === dayIdx)]
                        .filter((ex: any) => !deletedEx.includes(ex.id));
                    
                    const dayExCount = dayRoutines.length;
                    let dayExDone = 0;
                    dayRoutines.forEach((ex: any) => {
                        let allSets = true;
                        ex.sets.forEach((_: any, idx: number) => {
                            if(!dayInfo.setsDone.includes(`${ex.id}-${idx}`)) allSets = false;
                        });
                        if(allSets && ex.sets.length > 0) dayExDone++;
                    });

                    const dayExProg = dayExCount > 0 ? (dayExDone / dayExCount) : (isDone ? 1 : 0);
                    const dayProtProg = Math.min(1, dayInfo.protein / TARGET_PROTEIN);
                    const dayMealsProg = (Object.values(dayInfo.mealsLogged).filter(v => v).length / Math.max(1, Object.keys(dayInfo.mealsLogged).length));
                    
                    const combined = (dayExProg * 0.33) + (dayProtProg * 0.33) + (dayMealsProg * 0.34);
                    const height = `${Math.max(12, combined * 100)}%`;
                    
                    let activeClass = isDone ? 'done' : (combined > 0.1 ? 'in-progress' : '');
                    if (isToday && !isDone) activeClass = 'in-progress';
                    let currentClass = isToday ? 'today' : '';
                    
                    pulseHtml += `
                        <div class="activity-col ${activeClass} ${currentClass}">
                            <div class="w-full h-[60px] flex items-end">
                                <div class="activity-bar" style="height: ${height}; --h: ${height};"></div>
                            </div>
                            <span class="activity-lbl">${daysShort[i]}</span>
                        </div>
                    `;

                    if (performanceChart) {
                        performanceHtml += `
                            <div class="flex-1 flex flex-col items-center gap-2">
                                <div class="w-full bg-[var(--bg-elevated)] rounded-xl relative overflow-hidden" style="height: ${height}">
                                    <div class="absolute inset-0 bg-gold/10"></div>
                                    <div class="absolute inset-0 border border-gold/20 rounded-xl"></div>
                                </div>
                                <span class="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">${daysShort[i]}</span>
                            </div>
                        `;
                    }
                }
                pulseContainer.innerHTML = pulseHtml;
                if (performanceChart) performanceChart.innerHTML = performanceHtml;
            }

            const dashWorkouts = document.getElementById('dash-workouts');
            if (dashWorkouts) dashWorkouts.innerText = `${totalExCompleted}/${totalExCount}`;
            
            for(let i=0; i<7; i++) {
                const btn = document.getElementById(`day-btn-${i}`);
                if(btn) {
                    if(i === currentDayIdx) {
                        btn.classList.add('border-gold', 'text-gold', 'bg-gold/10');
                        btn.classList.remove('border-[var(--border-color)]', 'text-[var(--text-muted)]');
                    } else {
                        btn.classList.remove('border-gold', 'text-gold', 'bg-gold/10');
                        btn.classList.add('border-[var(--border-color)]', 'text-[var(--text-muted)]');
                    }
                }
            }
            
            if (window.lucide) window.lucide.createIcons();
            hydratePending = false;
        });
    };

    const saveData = () => {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(db));
            hydrateUI(); 
        } catch (e) {
            console.error("Failed to save data:", e);
            window.fireToast("Storage Error. Progress may not be saved.", "alert-triangle", "var(--alert-red)");
        }
    };

    window.saveData = saveData;
    window.getDailyData = getDailyData;

    window.switchDay = (dayIdx: number) => {
        currentDayIdx = dayIdx;
        buildUI();
        hydrateUI();
        window.fireToast(`Switched to ${DAYS_MAP[dayIdx]}`, "calendar", "var(--gold)");
    };

    const buildUI = () => {
        const todaysRoutines = getTodaysRoutines();
        const wl = document.getElementById('workout-list');
        if (!wl) return;
        
        let workoutHtml = '';
        
        if (todaysRoutines.length === 0) {
            const trainTitle = document.getElementById('train-title');
            if (trainTitle) trainTitle.innerText = "REST PROTOCOL";
            
            const trainSubtext = document.getElementById('train-subtext');
            if (trainSubtext) trainSubtext.innerText = "Active recovery. No heavy lifting.";
            
            const dashWorkoutTitle = document.getElementById('dash-workout-title');
            if (dashWorkoutTitle) dashWorkoutTitle.innerText = "Rest Day";
            
            workoutHtml = `
                <div class="card text-center border-dashed border-[var(--text-dim)] !bg-transparent">
                    <i data-lucide="coffee" class="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 icon-sharp"></i>
                    <h4 class="font-bold text-[18px] text-white">Active Recovery Day</h4>
                    <p class="text-[14px] text-[var(--text-muted)] mt-2 leading-relaxed">Focus entirely on hydration, protein intake, and light mobility work like walking.</p>
                </div>`;
        } else {
            let routineTitle = "DAILY ASSAULT";
            if(currentDayIdx === 1) routineTitle = "SHOULDERS + BACK";
            if(currentDayIdx === 3) routineTitle = "CHEST + TRICEPS";
            if(currentDayIdx === 5) routineTitle = "BACK + BICEPS";
            if(currentDayIdx === 6) routineTitle = "LEGS + CORE";
            
            const trainTitle = document.getElementById('train-title');
            if (trainTitle) trainTitle.innerText = routineTitle;
            
            const dashWorkoutTitle = document.getElementById('dash-workout-title');
            if (dashWorkoutTitle) dashWorkoutTitle.innerText = "Execute Workout";
            
            const trainSubtext = document.getElementById('train-subtext');
            if (trainSubtext) trainSubtext.innerText = "Tap sets to mark complete.";

            todaysRoutines.forEach((ex: any, i: number) => {
                let pillsHTML = '';
                ex.sets.forEach((reps: any, index: number) => {
                    const setId = `${ex.id}-${index}`;
                    pillsHTML += `
                        <div class="set-pill group" id="${setId}" onclick="toggleSet('${ex.id}', ${index})">
                            <div class="flex flex-col items-center transition-all duration-300 group-active:scale-90">
                                <span class="set-pill-num">${index+1}</span>
                                <span class="set-pill-rep">${reps}</span>
                            </div>
                        </div>`;
                });
                const titleClass = ex.gold ? 'text-gold' : (ex.red ? 'text-[#FF453A]' : '');
                const borderClass = ex.red ? '!border-[#FF453A]/30' : '';
                const editBtn = `<button class="text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider mt-4 flex items-center gap-1" onclick="editExercise('${ex.id}')"><i data-lucide="edit-2" class="w-3 h-3"></i> Replace</button>`;
                const deleteBtn = `<button class="text-[var(--alert-red)] text-[11px] font-bold uppercase tracking-wider mt-4 flex items-center gap-1" onclick="deleteExercise('${ex.id}')"><i data-lucide="trash-2" class="w-3 h-3"></i> Delete</button>`;
                
                const masteredBadge = `
                    <div id="master-badge-${ex.id}" class="hidden flex items-center gap-1.5 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full animate-in fade-in zoom-in duration-500">
                        <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-gold"></i>
                        <span class="text-[10px] font-bold text-gold tracking-widest uppercase">Mastered</span>
                    </div>`;
                
                const staggerClass = `stagger-${Math.min(i + 1, 5)}`;

                workoutHtml += `
                    <div class="exercise-card ${borderClass} ${staggerClass}" id="${ex.id}">
                        <div class="ex-title-row">
                            <div class="flex items-center gap-3">
                                <h3 class="ex-title ${titleClass}">${ex.title}</h3>
                                ${masteredBadge}
                            </div>
                            <span class="ex-target">${ex.target}</span>
                        </div>
                        <p class="ex-desc">${ex.desc}</p>
                        <div class="set-pills-container">${pillsHTML}</div>
                        <div class="flex gap-4">
                            ${editBtn}
                            ${deleteBtn}
                        </div>
                    </div>
                `;
            });

            workoutHtml += `
                <div class="mt-8 pb-12 stagger-5">
                    <button class="btn-primary w-full flex items-center justify-center gap-3 py-5 !rounded-2xl shadow-lg shadow-gold/10" onclick="completeAllExercises()">
                        <i data-lucide="check-circle" class="w-6 h-6"></i>
                        <span class="text-[18px] font-bebas tracking-wider">Complete All Exercises</span>
                    </button>
                    <p class="text-center text-[12px] text-[var(--text-muted)] mt-4 uppercase tracking-widest font-bold">End of Protocol</p>
                </div>
            `;
        }
        wl.innerHTML = workoutHtml;

        const wg = document.getElementById('water-grid-container');
        if (wg) {
            let waterHtml = '';
            for(let i=0; i<8; i++) { 
                const staggerClass = `stagger-${Math.min((i % 4) + 1, 5)}`;
                waterHtml += `<div class="water-drop ${staggerClass}" id="water-${i}" onclick="logWaterNode(${i})"><i data-lucide="droplet" class="w-6 h-6 icon-sharp"></i></div>`; 
            }
            wg.innerHTML = waterHtml;
        }
        if (window.lucide) window.lucide.createIcons();
        hydrateUI();
    };

    const recalculateStreak = () => {
        let streak = 0;
        let checkDate = new Date();
        // We count backwards from today if today is successful, 
        // or from yesterday if today is not yet successful.
        // But a "current streak" usually means consecutive days ending today or yesterday.
        
        // Let's use a simpler logic: start from today, if not done, check yesterday.
        // If yesterday is also not done, streak is 0.
        // If either is done, count backwards.
        
        let cursor = new Date();
        if (!db.history[cursor.toDateString()]) {
            cursor.setDate(cursor.getDate() - 1);
        }
        
        while (db.history[cursor.toDateString()]) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        db.streak = streak;
    };

    const updateDailyStatus = (dateStr: string) => {
        const dayData = getDailyData(dateStr);
        const dateObj = new Date(dateStr);
        const dayIdx = dateObj.getDay();

        const dayRoutines = [...(FULL_ROUTINE[dayIdx] || []), ...(db.customExercises || []).filter((ex: any) => ex.day === dayIdx)]
            .filter((ex: any) => !(db.deletedExercises || []).includes(ex.id));
        
        let allExDone = true;
        if (dayRoutines.length > 0) {
            dayRoutines.forEach((ex: any) => {
                ex.sets.forEach((_: any, idx: number) => {
                    if(!dayData.setsDone.includes(`${ex.id}-${idx}`)) allExDone = false;
                });
            });
        }

        const wasSuccess = dayData.protein >= TARGET_PROTEIN && allExDone;
        db.history[dateStr] = wasSuccess;
        recalculateStreak();
        return wasSuccess;
    };

    const checkDailyReset = () => {
        const today = new Date().toDateString();
        if (db.lastDate && db.lastDate !== today) {
            // Fill gaps and update status for missed days
            let cursor = new Date(db.lastDate);
            // We want to update every day from lastDate up to (but not including) today
            while (cursor.toDateString() !== today) {
                updateDailyStatus(cursor.toDateString());
                cursor.setDate(cursor.getDate() + 1);
                // Safety break to prevent infinite loops if something goes wrong with dates
                if (cursor.getTime() > new Date().getTime() + 86400000) break;
            }

            db.lastDate = today;
            window.fireToast("New Day. Trackers Ready.", "rotate-ccw", "var(--gold)");
        }
        
        updateDailyStatus(today);
        saveData();
    };

    const initApp = () => {
        if (window.lucide) window.lucide.createIcons();
        const todayOptions: any = { weekday: 'long', month: 'short', day: 'numeric' };
        const headerDate = document.getElementById('header-date');
        if (headerDate) headerDate.innerText = new Date().toLocaleDateString('en-US', todayOptions).toUpperCase();
        
        const todayDayName = document.getElementById('today-day-name');
        if (todayDayName) todayDayName.innerText = DAYS_MAP[currentDayIdx].toUpperCase();

        const savedData = localStorage.getItem(DB_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                db = {
                    user: parsedData.user || null,
                    goal: parsedData.goal || null,
                    lastDate: parsedData.lastDate || null,
                    streak: parsedData.streak || 0,
                    history: parsedData.history || {},
                    dailyData: parsedData.dailyData || {},
                    customExercises: parsedData.customExercises || [],
                    deletedExercises: parsedData.deletedExercises || []
                };
                
                // Migration: if old data exists, move it to dailyData
                if (parsedData.protein !== undefined && db.lastDate) {
                    if (!db.dailyData[db.lastDate]) {
                        db.dailyData[db.lastDate] = {
                            protein: parsedData.protein,
                            water: parsedData.water || 0,
                            mealsLogged: parsedData.mealsLogged || { sehri: false, iftar: false, post: false, sleep: false },
                            setsDone: parsedData.setsDone || [],
                            nutrition: parsedData.nutrition || []
                        };
                    }
                }
            } catch (e) {
                console.error("Failed to parse saved data:", e);
                window.fireToast("Data Corruption Detected. Starting fresh.", "alert-octagon", "var(--alert-red)");
            }

            checkDailyReset();
            buildUI();
            saveData(); 
            const authScreen = document.getElementById('auth-screen');
            if (authScreen) authScreen.style.display = 'none';
            const appRoot = document.getElementById('app-root');
            if (appRoot) appRoot.classList.add('initialized');
        } else {
            const appRoot = document.getElementById('app-root');
            if (appRoot) appRoot.classList.add('initialized');
        }
    };

    window.forceNextSlide = (num: number) => {
        document.querySelectorAll('.onboard-slide').forEach(s => s.classList.remove('active'));
        const slide = document.getElementById(`obs-${num}`);
        if (slide) slide.classList.add('active');
    };

    let selectedGoal: string | null = null;
    window.selectGoal = (btn: HTMLElement, goal: string) => {
        document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedGoal = goal;
        const nextBtn = document.getElementById('btn-goal-next');
        if (nextBtn) nextBtn.classList.remove('disabled');
    };

    window.initializeDatabase = () => {
        const nameInput = document.getElementById('auth-name') as HTMLInputElement;
        const name = nameInput.value.trim();
        if(!name) return window.fireToast("Enter Designation", "alert-circle", "var(--alert-red)");
        
        nameInput.blur(); 
        
        db.user = name.toUpperCase();
        db.goal = selectedGoal || 'V-Shape Engine';
        db.lastDate = new Date().toDateString();
        
        buildUI();
        saveData();
        
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.style.opacity = '0';
            setTimeout(() => {
                authScreen.style.display = 'none';
                window.fireToast("Database Provisioned", "database", "var(--gold)");
            }, 600);
        }
    };

    const updateDockIndicator = (index: number) => {
        const indicator = document.getElementById('dock-indicator');
        if (!indicator) return;
        const offset = (index * 100); 
        indicator.style.transform = `translateX(${offset}%)`;
    };

    window.switchTab = (viewId: string, index: number) => {
        const btns = document.querySelectorAll('.nav-btn');
        btns.forEach(b => b.classList.remove('active'));
        btns[index].classList.add('active');
        updateDockIndicator(index);

        const header = document.querySelector('.global-header');
        if (header) {
            if (viewId !== 'view-dash') {
                header.classList.add('sticky-header');
            } else {
                header.classList.remove('sticky-header');
            }
        }

        const views = document.querySelectorAll('.view-layer');
        views.forEach(v => {
            if (v.id === viewId) {
                v.classList.add('active');
            } else {
                v.classList.remove('active');
            }
        });
        
        const scrollContainer = document.getElementById('scroll-container');
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.logMeal = (mealId: string, amount: number) => {
        const dayData = getDailyData();
        if(dayData.mealsLogged[mealId]) return;
        dayData.mealsLogged[mealId] = true;
        dayData.protein += amount;
        if(dayData.protein > TARGET_PROTEIN) dayData.protein = TARGET_PROTEIN;
        updateDailyStatus(getViewedDate());
        saveData();
        window.fireToast(`+${amount}g Protein Saved`, "apple", "var(--gold)");
    };

    window.logWaterNode = (index: number) => {
        const dayData = getDailyData();
        if (index < dayData.water) {
            dayData.water = index;
        } else if (index === dayData.water) {
            dayData.water = index + 1;
        }
        saveData();
        buildUI();
    };

    window.logFood = async (food: string) => {
        if (!food.trim()) return;
        const dayData = getDailyData();
        const btn = document.getElementById('food-log-btn');
        if (btn) {
            btn.innerText = "CALCULATING...";
            btn.classList.add('opacity-50', 'pointer-events-none');
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Calculate calories, protein, carbs, and fats for: ${food}. Return JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.INTEGER },
                            protein: { type: Type.INTEGER },
                            carbs: { type: Type.INTEGER },
                            fats: { type: Type.INTEGER },
                        },
                        required: ["calories", "protein", "carbs", "fats"]
                    },
                },
            });
            const data = JSON.parse(response.text);
            const newFood = { id: Date.now().toString(), food, ...data };
            dayData.nutrition.push(newFood);
            dayData.protein += data.protein;
            if(dayData.protein > TARGET_PROTEIN) dayData.protein = TARGET_PROTEIN;
            updateDailyStatus(getViewedDate());
            saveData();
            window.fireToast(`Logged ${food}`, "check", "var(--gold)");
        } catch (error) {
            console.error(error);
            window.fireToast("Failed to log food", "alert-circle", "var(--alert-red)");
        } finally {
            if (btn) {
                btn.innerText = "Log";
                btn.classList.remove('opacity-50', 'pointer-events-none');
            }
        }
    };

    window.editFood = async (id: string) => {
        const dayData = getDailyData();
        const foodItem = dayData.nutrition.find((f: any) => f.id === id);
        if (!foodItem) return;
        const newFood = prompt("Edit food:", foodItem.food);
        if (newFood && newFood !== foodItem.food) {
            window.deleteFood(id);
            window.logFood(newFood);
        }
    };

    window.deleteFood = (id: string) => {
        const dayData = getDailyData();
        const foodItem = dayData.nutrition.find((f: any) => f.id === id);
        if (foodItem) {
            dayData.protein = Math.max(0, dayData.protein - foodItem.protein);
            dayData.nutrition = dayData.nutrition.filter((f: any) => f.id !== id);
            updateDailyStatus(getViewedDate());
            saveData();
            buildUI();
        }
    };

    window.toggleSet = (exId: string, setIndex: number) => {
        if (getViewedDate() !== new Date().toDateString()) {
            window.fireToast("Cannot edit past/future workouts", "lock", "var(--alert-red)");
            return;
        }
        const dayData = getDailyData();
        const setId = `${exId}-${setIndex}`;
        const idx = dayData.setsDone.indexOf(setId);
        
        if(idx > -1) {
            dayData.setsDone.splice(idx, 1);
        } else {
            dayData.setsDone.push(setId);
        }
        
        const todaysRoutines = getTodaysRoutines();
        const exData = todaysRoutines.find((e: any) => e.id === exId);
        if (!exData) return;

        let exerciseComplete = true;
        exData.sets.forEach((_: any, idx: number) => {
            if (!dayData.setsDone.includes(`${exId}-${idx}`)) exerciseComplete = false;
        });
        
        updateDailyStatus(getViewedDate());
        saveData(); 
        hydrateUI(); 
        
        if(exerciseComplete && idx === -1) {
            window.fireToast(`${exData.title} Mastered`, "zap", "var(--gold)");
            const card = getCachedElement(exId, true); // Force refresh to get the current element
            if(card) {
                card.classList.add('master-glow');
                setTimeout(() => card.classList.remove('master-glow'), 1500);
            }
        }
    };

    window.completeAllExercises = () => {
        if (getViewedDate() !== new Date().toDateString()) {
            window.fireToast("Cannot edit past/future workouts", "lock", "var(--alert-red)");
            return;
        }
        const dayData = getDailyData();
        const routines = getTodaysRoutines();
        routines.forEach((ex: any) => {
            ex.sets.forEach((_: any, idx: number) => {
                const setId = `${ex.id}-${idx}`;
                if (!dayData.setsDone.includes(setId)) {
                    dayData.setsDone.push(setId);
                }
            });
        });
        updateDailyStatus(getViewedDate());
        saveData();
        buildUI();
        window.fireToast("All Exercises Completed", "check-check", "var(--gold)");
    };

    window.openResetModal = () => { 
        const modal = document.getElementById('modal-reset');
        if (modal) modal.classList.add('active'); 
    };

    window.openAddExerciseModal = () => {
        const modal = document.getElementById('modal-add-exercise');
        const title = document.querySelector('#modal-add-exercise h3');
        const btn = document.querySelector('#modal-add-exercise .btn-primary');
        const idInput = document.getElementById('ex-id-edit') as HTMLInputElement;
        
        if (idInput) idInput.value = '';
        if (title) title.innerHTML = 'ADD DIRECTIVE';
        if (btn) btn.innerHTML = 'Add to Routine';
        
        if (modal) modal.classList.add('active');
    };

    window.addCustomExercise = () => {
        if (getViewedDate() !== new Date().toDateString()) {
            window.fireToast("Cannot edit past/future workouts", "lock", "var(--alert-red)");
            return;
        }
        const title = (document.getElementById('ex-title-input') as HTMLInputElement).value.trim();
        const target = (document.getElementById('ex-target-input') as HTMLInputElement).value.trim();
        const desc = (document.getElementById('ex-desc-input') as HTMLInputElement).value.trim();
        const setsCount = parseInt((document.getElementById('ex-sets-input') as HTMLInputElement).value);
        const reps = (document.getElementById('ex-reps-input') as HTMLInputElement).value.trim();
        const editId = (document.getElementById('ex-id-edit') as HTMLInputElement).value;

        if (!title || !target || isNaN(setsCount)) {
            return window.fireToast("Fill Required Fields", "alert-circle", "var(--alert-red)");
        }

        const newEx = {
            id: editId || `custom-${Date.now()}`,
            day: currentDayIdx,
            title,
            target,
            desc: desc || 'Custom exercise added by athlete.',
            sets: Array(setsCount).fill(reps || '10')
        };

        if (!db.customExercises) db.customExercises = [];
        
        if (editId) {
            // Update existing or replace default
            if (editId.startsWith('custom-')) {
                const idx = db.customExercises.findIndex((ex: any) => ex.id === editId);
                if (idx > -1) db.customExercises[idx] = newEx;
            } else {
                // Replacing a default exercise
                if (!db.deletedExercises) db.deletedExercises = [];
                db.deletedExercises.push(editId);
                newEx.id = `custom-${Date.now()}`; // Give it a new custom ID
                db.customExercises.push(newEx);
            }
        } else {
            db.customExercises.push(newEx);
        }
        
        (document.getElementById('ex-title-input') as HTMLInputElement).value = '';
        (document.getElementById('ex-target-input') as HTMLInputElement).value = '';
        (document.getElementById('ex-desc-input') as HTMLInputElement).value = '';
        (document.getElementById('ex-sets-input') as HTMLInputElement).value = '3';
        (document.getElementById('ex-reps-input') as HTMLInputElement).value = '10';
        (document.getElementById('ex-id-edit') as HTMLInputElement).value = '';

        window.closeModals();
        buildUI();
        saveData();
        window.fireToast(editId ? "Exercise Updated" : "Exercise Provisioned", "plus", "var(--gold)");
    };

    window.editExercise = (exId: string) => {
        if (getViewedDate() !== new Date().toDateString()) {
            window.fireToast("Cannot edit past/future workouts", "lock", "var(--alert-red)");
            return;
        }
        const todaysRoutines = getTodaysRoutines();
        const ex = todaysRoutines.find((e: any) => e.id === exId);
        if (!ex) return;

        (document.getElementById('ex-title-input') as HTMLInputElement).value = ex.title;
        (document.getElementById('ex-target-input') as HTMLInputElement).value = ex.target;
        (document.getElementById('ex-desc-input') as HTMLInputElement).value = ex.desc;
        (document.getElementById('ex-sets-input') as HTMLInputElement).value = ex.sets.length.toString();
        (document.getElementById('ex-reps-input') as HTMLInputElement).value = ex.sets[0].toString();
        (document.getElementById('ex-id-edit') as HTMLInputElement).value = exId;

        const modal = document.getElementById('modal-add-exercise');
        const title = document.querySelector('#modal-add-exercise h3');
        const btn = document.querySelector('#modal-add-exercise .btn-primary');
        
        if (title) title.innerHTML = 'REPLACE DIRECTIVE';
        if (btn) btn.innerHTML = 'Update Exercise';
        
        if (modal) modal.classList.add('active');
    };

    window.deleteExercise = (exId: string) => {
        if (getViewedDate() !== new Date().toDateString()) {
            window.fireToast("Cannot edit past/future workouts", "lock", "var(--alert-red)");
            return;
        }
        if (!db.deletedExercises) db.deletedExercises = [];
        db.deletedExercises.push(exId);
        
        if (!db.customExercises) db.customExercises = [];
        db.customExercises = db.customExercises.filter((ex: any) => ex.id !== exId);
        
        if (!db.setsDone) db.setsDone = [];
        db.setsDone = db.setsDone.filter((id: string) => !id.startsWith(exId));
        buildUI();
        saveData();
        window.fireToast("Exercise Decommissioned", "trash-2", "var(--alert-red)");
    };

    window.updateCustomExercise = (exId: string) => {
        if (getViewedDate() !== new Date().toDateString()) {
            window.fireToast("Cannot edit past/future workouts", "lock", "var(--alert-red)");
            return;
        }
        const title = (document.getElementById('ex-title-input') as HTMLInputElement).value.trim();
        const target = (document.getElementById('ex-target-input') as HTMLInputElement).value.trim();
        const desc = (document.getElementById('ex-desc-input') as HTMLInputElement).value.trim();
        const setsCount = parseInt((document.getElementById('ex-sets-input') as HTMLInputElement).value);
        const reps = (document.getElementById('ex-reps-input') as HTMLInputElement).value.trim();

        if (!title || !target || isNaN(setsCount)) {
            return window.fireToast("Fill Required Fields", "alert-circle", "var(--alert-red)");
        }

        const exIdx = db.customExercises.findIndex((e: any) => e.id === exId);
        if (exIdx > -1) {
            db.customExercises[exIdx] = {
                ...db.customExercises[exIdx],
                title,
                target,
                desc,
                sets: Array(setsCount).fill(reps || '10')
            };
        }

        window.closeModals();
        buildUI();
        saveData();
        window.fireToast("Exercise Updated", "edit-2", "var(--gold)");
        
        // Reset modal button
        const modal = document.getElementById('modal-add-exercise');
        if (modal) {
            const btn = modal.querySelector('.btn-primary') as HTMLElement;
            if (btn) {
                btn.textContent = 'Add to Routine';
                btn.onclick = () => window.addCustomExercise();
            }
        }
    };
    
    window.closeModals = () => { 
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active')); 
    };

    window.executeFactoryReset = () => {
        localStorage.removeItem(DB_KEY);
        location.reload();
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            saveData();
        }
    };

    initApp();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="app-root" id="app-root">
      <div id="auth-screen">
        <div className="onboard-slide active" id="obs-1">
          <div className="w-28 h-28 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <i data-lucide="shield" className="w-12 h-12 text-[var(--gold)] icon-sharp"></i>
          </div>
          <h1 className="font-bebas text-[56px] text-white leading-none mb-4 tracking-wide">COACH V</h1>
          <p className="text-[15px] text-[var(--text-muted)] mb-12 leading-relaxed">The elite training and nutrition operating system designed for serious athletes.</p>
          <button className="btn-primary" onClick={() => window.forceNextSlide(2)}>Begin Calibration</button>
        </div>

        <div className="onboard-slide" id="obs-2">
          <span className="eyebrow block mb-4 text-gold">Step 1 of 2</span>
          <h1 className="font-bebas text-[48px] text-white leading-none mb-10 tracking-wide">SELECT FOCUS</h1>
          
          <div className="w-full mb-10 space-y-4">
            <div className="goal-btn" onClick={(e) => window.selectGoal(e.currentTarget, 'Recomp')}>
              <span>V-Shape Recomp</span><div className="radio-box"></div>
            </div>
            <div className="goal-btn" onClick={(e) => window.selectGoal(e.currentTarget, 'Hypertrophy')}>
              <span>Pure Hypertrophy</span><div className="radio-box"></div>
            </div>
          </div>
          
          <button className="btn-primary disabled" id="btn-goal-next" onClick={() => window.forceNextSlide(3)}>Continue</button>
        </div>

        <div className="onboard-slide" id="obs-3">
          <span className="eyebrow block mb-4 text-gold">Step 2 of 2</span>
          <h1 className="font-bebas text-[48px] text-white leading-none mb-6 tracking-wide">DESIGNATION</h1>
          <p className="text-[14px] text-[var(--text-muted)] mb-10">Provisioning local database architecture.</p>
          
          <input type="text" id="auth-name" className="auth-input" placeholder="YOUR NAME" autoComplete="off" />
          <button className="btn-primary" onClick={() => window.initializeDatabase()}>Initialize OS</button>
        </div>
      </div>

      <div id="toast-container"></div>

      <header className="global-header">
        <div className="header-content">
          <div className="flex items-center gap-4">
            <div className="avatar-wrap" onClick={() => window.switchTab('view-coach', 3)}>
              <img src={null as any} id="ui-avatar" alt="Athlete" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="eyebrow block mb-1" id="header-date">Loading...</span>
              <h1 className="font-bebas text-[30px] leading-none tracking-wide text-white"><span id="ui-greeting">COACH,</span> <span id="ui-name" className="text-gold">PROTOCOL</span></h1>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bebas text-[26px] leading-none tabular text-gold" id="global-protein-text">0/85g</span>
            <span className="eyebrow block mt-1">Protein</span>
          </div>
        </div>
        <div className="header-progress-track"><div className="header-progress-fill" id="global-protein-bar"></div></div>
      </header>

      <div className="views-container" id="scroll-container">
        <main id="view-dash" className="view-layer active px-5 pb-24">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card !p-5 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-gold/20 shadow-2xl shadow-gold/10 stagger-1 col-span-2 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <span className="eyebrow text-gold mb-1 block truncate" id="ui-goal-display">Phase 1: Foundation</span>
                    <h2 className="font-bebas text-[32px] leading-[1] truncate">SYSTEM STATUS</h2>
                </div>
                <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gold)" strokeWidth="8" strokeDasharray="263.89" strokeDashoffset="263.89" strokeLinecap="round" className="readiness-ring" id="readiness-svg"></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-bebas text-[24px] text-white" id="readiness-score">0</span>
                    </div>
                </div>
            </div>
            
            <div className="card !p-5 stagger-2 flex flex-col justify-between aspect-square">
                <span className="eyebrow text-gold">Streak</span>
                <div className="flex items-end gap-1">
                    <span className="font-bebas text-[40px] leading-none text-white" id="dash-streak">0</span>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] mb-1">DAYS</span>
                </div>
            </div>

            <div className="card !p-5 stagger-2 flex flex-col justify-between aspect-square">
                <span className="eyebrow text-gold">Protein</span>
                <div className="flex items-end gap-1">
                    <span className="font-bebas text-[40px] leading-none text-white" id="dash-protein-val">0</span>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] mb-1">/85g</span>
                </div>
            </div>
          </div>

          <div className="card mb-6 stagger-3">
            <div className="flex justify-between items-end mb-6">
              <span className="font-bold text-[14px] uppercase tracking-wide">Weekly Performance</span>
            </div>
            <div className="activity-tracker" id="weekly-pulse-container"></div>
          </div>

          <span className="eyebrow block mb-4 stagger-4">Today's Directives</span>
          <div className="space-y-4 stagger-5">
            <div className="flex items-center gap-4 card !p-5 !mb-0 active-scale-95 hover:border-gold/30 transition-all" onClick={() => window.switchTab('view-train', 1)}>
              <div className="icon-box gold"><i data-lucide="dumbbell" className="w-6 h-6 icon-sharp"></i></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[15px] truncate" id="dash-workout-title">Execute Workout</h4>
                <p className="text-[13px] text-[var(--text-muted)] mt-1 tabular"><span id="dash-workouts">0/0</span> Completed</p>
              </div>
              <i data-lucide="chevron-right" className="w-5 h-5 text-[var(--text-muted)] shrink-0"></i>
            </div>
          </div>
        </main>

        <main id="view-train" className="view-layer px-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="eyebrow text-gold mb-3 block" id="today-day-name">TODAY</span>
              <h2 className="font-bebas text-[48px] sm:text-[52px] leading-none" id="train-title">DAILY ASSAULT</h2>
            </div>
            <button className="icon-box gold !w-12 !h-12 !rounded-full mt-2" onClick={() => window.openAddExerciseModal()}>
              <i data-lucide="plus" className="w-6 h-6 icon-sharp"></i>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-6 mb-4 no-scrollbar">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
              <button 
                key={idx} 
                className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-[12px] transition-all border-[var(--border-color)] text-[var(--text-muted)]`}
                id={`day-btn-${idx}`}
                onClick={() => window.switchDay(idx)}
              >
                {day}
              </button>
            ))}
          </div>
          
          <div className="mb-8 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <span className="eyebrow text-[var(--text-muted)]">Session Progress</span>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-[32px] text-gold leading-none tabular" id="workout-progress-txt">0/0</span>
                <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Done</span>
              </div>
            </div>
            <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div id="workout-progress-bar" className="h-full bg-gold transition-all duration-700 ease-out shadow-[0_0_10px_var(--gold-glow)]" style={{ width: '0%' }}></div>
            </div>
          </div>

          <div id="workout-list"></div>

          <button className="btn-primary mt-6 group !bg-gold/10 !text-gold border-gold/30" onClick={() => window.completeAllExercises()}>
            <i data-lucide="check-check" className="w-5 h-5"></i>
            Complete All Exercises
          </button>

          <button className="btn-primary mt-4 mb-8 group" onClick={() => {
              window.saveData();
              window.fireToast('Progress Synced', 'zap', 'var(--gold)');
          }}>
            <i data-lucide="save" className="w-5 h-5 group-hover:scale-110 transition-transform"></i>
            Save Progress
          </button>
        </main>

        <main id="view-diet" className="view-layer px-6">
          <span className="eyebrow block mb-3 text-gold stagger-1">Nutrition Protocol</span>
          <h2 className="font-bebas text-[48px] sm:text-[52px] leading-none mb-8 stagger-1">RAMADAN FUEL</h2>

          <div className="card mb-8 stagger-2">
            <div className="flex justify-between items-end mb-4">
              <span className="font-bold text-[15px] uppercase tracking-wide">Hydration Tracker</span>
              <span className="text-[15px] font-bold text-[var(--water-blue)] tabular" id="water-count">0/8 Glasses</span>
            </div>
            <div className="grid grid-cols-4 gap-2" id="water-grid-container"></div>
          </div>

          <div className="card mb-8 border-gold/20 stagger-3">
            <h3 className="font-bold text-[15px] uppercase tracking-wide mb-4 text-gold">Log Food</h3>
            <div className="relative flex items-center">
                <input type="text" id="food-input" className="w-full bg-[#1A1A1A] border border-[var(--border-color)] p-4 pr-20 rounded-xl text-white outline-none focus:border-gold transition-all" placeholder="e.g. 2 eggs and a banana" />
                <button id="food-log-btn" className="absolute right-2 bg-gold text-black font-bold px-4 py-2 rounded-lg hover:bg-gold/90 transition-all" onClick={() => {
                    const input = document.getElementById('food-input') as HTMLInputElement;
                    window.logFood(input.value);
                    input.value = '';
                }}>Log</button>
            </div>
          </div>
          
          <div id="nutrition-list" className="mb-8" style={{contain: 'strict'}}></div>

          <div className="space-y-4">
            <div id="card-sehri" className="card !p-0">
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-4">
                  <div className="icon-box gold !rounded-2xl"><i data-lucide="sunrise" className="w-6 h-6 icon-sharp"></i></div>
                  <div><h3 className="font-bold text-[16px] uppercase tracking-wide">Sehri</h3><span className="text-[12px] text-[var(--text-muted)]">~4:00 AM</span></div>
                </div>
                <span className="font-bebas text-[28px] text-gold">~22g</span>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">1.5 Paratha • 2 Boiled Eggs • Bowl of Dahi</p>
                <button id="btn-sehri" className="btn-primary" onClick={() => window.logMeal('sehri', 22)}>Log +22g Protein</button>
              </div>
            </div>

            <div id="card-iftar" className="card !p-0">
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-4">
                  <div className="icon-box !text-[#FF9500] !bg-[#FF9500]/10 !border-[#FF9500]/30 !rounded-2xl"><i data-lucide="sunset" className="w-6 h-6 icon-sharp"></i></div>
                  <div><h3 className="font-bold text-[16px] uppercase tracking-wide">Iftar</h3><span className="text-[12px] text-[var(--text-muted)]">~6:30 PM</span></div>
                </div>
                <span className="font-bebas text-[28px] text-gold">~25g</span>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">2 Dates • Milkshake • <strong className="text-white">2 Extra Boiled Eggs</strong></p>
                <button id="btn-iftar" className="btn-primary" onClick={() => window.logMeal('iftar', 25)}>Log +25g Protein</button>
              </div>
            </div>

            <div id="card-post" className="card !p-0 border-gold/30">
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--gold-dim)]">
                <div className="flex items-center gap-4">
                  <div className="icon-box !bg-gold !text-black !rounded-2xl"><i data-lucide="zap" className="w-6 h-6 icon-sharp"></i></div>
                  <div><h3 className="font-bold text-[16px] uppercase tracking-wide text-gold">Post-Workout</h3><span className="text-[12px] text-[var(--text-muted)]">~11:00 PM</span></div>
                </div>
                <span className="font-bebas text-[28px] text-gold">~26g</span>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">3 Boiled Eggs • 1 Large Glass Milk (Muscle repair)</p>
                <button id="btn-post" className="btn-primary" onClick={() => window.logMeal('post', 26)}>Log +26g Protein</button>
              </div>
            </div>
            
            <div id="card-sleep" className="card !p-0">
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-4">
                  <div className="icon-box !text-[#AA88FF] !bg-[#AA88FF]/10 !border-[#AA88FF]/30 !rounded-2xl"><i data-lucide="moon" className="w-6 h-6 icon-sharp"></i></div>
                  <div><h3 className="font-bold text-[16px] uppercase tracking-wide">Pre-Sleep</h3><span className="text-[12px] text-[var(--text-muted)]">~11:30 PM</span></div>
                </div>
                <span className="font-bebas text-[28px] text-gold">~12g</span>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">1 Glass Milk for slow casein release. 2 Eggs if hungry.</p>
                <button id="btn-sleep" className="btn-primary" onClick={() => window.logMeal('sleep', 12)}>Log +12g Protein</button>
              </div>
            </div>

            <div id="card-custom" className="card !p-0 border-dashed border-gold/30">
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-gold/5">
                <div className="flex items-center gap-4">
                  <div className="icon-box !bg-gold/20 !text-gold !rounded-2xl"><i data-lucide="plus" className="w-6 h-6 icon-sharp"></i></div>
                  <div><h3 className="font-bold text-[16px] uppercase tracking-wide text-gold">Custom Intake</h3><span className="text-[12px] text-[var(--text-muted)]">Anytime</span></div>
                </div>
                <span className="font-bebas text-[28px] text-gold">VARIES</span>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">Log any additional protein sources not listed above.</p>
                <div className="flex gap-2">
                    <input type="number" id="custom-protein-input" className="w-20 bg-[#1A1A1A] border border-[var(--border-color)] p-2 rounded-lg text-white outline-none focus:border-gold" placeholder="g" />
                    <button className="btn-primary flex-1" onClick={() => {
                        const input = document.getElementById('custom-protein-input') as HTMLInputElement;
                        const val = parseInt(input.value);
                        if(val > 0) {
                            const dayData = window.getDailyData();
                            dayData.protein += val;
                            if(dayData.protein > TARGET_PROTEIN) dayData.protein = TARGET_PROTEIN;
                            window.saveData();
                            window.fireToast(`+${val}g Protein Logged`, "plus", "var(--gold)");
                            input.value = '';
                        }
                    }}>Log Protein</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <main id="view-coach" className="view-layer px-6">
          <span className="eyebrow block mb-3 text-[var(--text-muted)]">Athlete Control</span>
          <h2 className="font-bebas text-[48px] sm:text-[52px] leading-none mb-8">SYSTEM ARCHIVE</h2>

          <div className="card !p-6 mb-8 bg-[#1A1A1A] border-[var(--border-color)]">
            <h4 className="font-bold text-[16px] uppercase tracking-wide mb-4">User Profile</h4>
            <div className="flex items-center gap-4 mb-6">
                <img id="ui-avatar-settings" className="w-16 h-16 rounded-full border-2 border-gold" alt="Avatar" referrerPolicy="no-referrer" />
                <div>
                    <h3 className="font-bold text-[18px]" id="ui-name-settings">COACH</h3>
                    <p className="text-[13px] text-[var(--text-muted)]" id="ui-goal-display-settings">Target: V-Shape Engine</p>
                </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-[var(--bg-void)] rounded-xl border border-[var(--border-color)]">
                <span className="text-[14px] font-bold">Streak</span>
                <span className="font-bebas text-[24px] text-gold" id="dash-streak-settings">0 Day Streak</span>
            </div>
          </div>

          <div className="card !p-6 mb-12 flex justify-between items-center bg-[#1A0B0B] border-[#FF453A]/30 active-scale-95" onClick={() => window.openResetModal()}>
            <div>
              <h4 className="font-bold text-[var(--alert-red)] text-[16px]">Factory Reset</h4>
              <p className="text-[13px] text-[var(--alert-red)]/70 mt-1">Wipes all local data.</p>
            </div>
            <div className="icon-box !bg-[var(--alert-red)] !text-white !w-12 !h-12 !rounded-xl !border-none">
              <i data-lucide="trash-2" className="w-6 h-6 icon-sharp"></i>
            </div>
          </div>
          
          <span className="eyebrow block mb-3 text-gold">The Manifesto</span>
          <h2 className="font-bebas text-[48px] sm:text-[52px] leading-none mb-4">THE 5 RULES</h2>
          <button className="btn-secondary mb-8" onClick={() => document.getElementById('rules-section')?.classList.toggle('hidden')}>View Rules</button>
          <div className="space-y-8 hidden" id="rules-section">
            <div className="editorial-rule">
              <div className="bg-number">01</div>
              <div className="rule-content">
                <h4 className="font-bold text-[16px] uppercase tracking-wide mb-2">Left Side First.</h4>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">Your right side is dominant. Start every exercise on the left to fix the imbalance.</p>
              </div>
            </div>
            <div className="editorial-rule">
              <div className="bg-number">02</div>
              <div className="rule-content">
                <h4 className="font-bold text-[16px] uppercase tracking-wide mb-2">Never Skip Sehri.</h4>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">It is your entire day's fuel. Without it, your body enters a catabolic state.</p>
              </div>
            </div>
            <div className="editorial-rule">
              <div className="bg-number">03</div>
              <div className="rule-content">
                <h4 className="font-bold text-[16px] uppercase tracking-wide mb-2">Pull Days are Mandatory.</h4>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">Lats equal the V-Shape. You can miss a push day, but never miss a back day.</p>
              </div>
            </div>
            <div className="editorial-rule">
              <div className="bg-number">04</div>
              <div className="rule-content">
                <h4 className="font-bold text-[16px] uppercase tracking-wide mb-2">Progressive Overload.</h4>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">Add weight to your backpack every two weeks. Muscle requires resistance to grow.</p>
              </div>
            </div>
            <div className="editorial-rule">
              <div className="bg-number">05</div>
              <div className="rule-content">
                <h4 className="font-bold text-[16px] uppercase tracking-wide mb-2">Eat After Training.</h4>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">3 eggs and milk post-workout is mandatory. This is when muscles repair and grow.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="dock-wrapper">
        <nav className="dock" id="main-dock">
          <div className="dock-indicator" id="dock-indicator"></div>
          <div className="nav-btn active" onClick={() => window.switchTab('view-dash', 0)}><i data-lucide="layout-dashboard" className="w-6 h-6 icon-sharp"></i></div>
          <div className="nav-btn" onClick={() => window.switchTab('view-train', 1)}><i data-lucide="dumbbell" className="w-6 h-6 icon-sharp"></i></div>
          <div className="nav-btn" onClick={() => window.switchTab('view-diet', 2)}><i data-lucide="apple" className="w-6 h-6 icon-sharp"></i></div>
          <div className="nav-btn" onClick={() => window.switchTab('view-coach', 3)}><i data-lucide="book-open" className="w-6 h-6 icon-sharp"></i></div>
        </nav>
      </div>

      <div className="overlay" id="modal-reset">
        <div className="modal-box text-center">
          <div className="w-16 h-16 bg-[#FF453A]/10 text-[#FF453A] rounded-full flex items-center justify-center mx-auto mb-6">
            <i data-lucide="alert-triangle" className="w-8 h-8 icon-sharp"></i>
          </div>
          <h3 className="font-bebas text-[32px] mb-2">ERASE PROTOCOL</h3>
          <p className="text-[14px] text-[var(--text-muted)] mb-8 leading-relaxed">This action is irreversible. All your progress and streaks will be permanently deleted.</p>
          <div className="flex flex-col gap-3">
            <button className="btn-primary !bg-[var(--alert-red)] !text-white !shadow-none" onClick={() => window.executeFactoryReset()}>Confirm Erase</button>
            <button className="btn-secondary" onClick={() => window.closeModals()}>Cancel</button>
          </div>
        </div>
      </div>

      <div className="overlay" id="modal-add-exercise">
        <div className="modal-box">
          <input type="hidden" id="ex-id-edit" value="" />
          <h3 className="font-bebas text-[32px] mb-6 text-center">ADD DIRECTIVE</h3>
          <div className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">Exercise Title</label>
              <input type="text" id="ex-title-input" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 rounded-xl text-white outline-none focus:border-gold" placeholder="e.g. Pull Ups" />
            </div>
            <div>
              <label className="eyebrow block mb-2">Target (Sets x Reps)</label>
              <input type="text" id="ex-target-input" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 rounded-xl text-white outline-none focus:border-gold" placeholder="e.g. 3x12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="eyebrow block mb-2">Sets</label>
                <input type="number" id="ex-sets-input" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 rounded-xl text-white outline-none focus:border-gold" defaultValue="3" />
              </div>
              <div>
                <label className="eyebrow block mb-2">Reps Per Set</label>
                <input type="text" id="ex-reps-input" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 rounded-xl text-white outline-none focus:border-gold" defaultValue="10" />
              </div>
            </div>
            <div>
              <label className="eyebrow block mb-2">Description (Optional)</label>
              <textarea id="ex-desc-input" className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 rounded-xl text-white outline-none focus:border-gold h-24 resize-none" placeholder="Form cues..."></textarea>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-8">
            <button className="btn-primary" onClick={() => window.addCustomExercise()}>Add to Routine</button>
            <button className="btn-secondary" onClick={() => window.closeModals()}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
