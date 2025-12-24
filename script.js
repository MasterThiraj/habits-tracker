// DOM Elements
const currentDateEl = document.getElementById('current-date');
const currentDayEl = document.getElementById('current-day');
const totalPointsEl = document.getElementById('total-points');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const habitNameInput = document.getElementById('habit-name');
const habitTimeInput = document.getElementById('habit-time');
const addBtn = document.getElementById('add-btn');
const habitsList = document.getElementById('habits-list');
const emptyState = document.getElementById('empty-state');

// State
let habits = [];
let totalPoints = 0;
const POINTS_PER_HABIT = 10;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    checkDailyReset();
    updateDateDisplay();
    renderHabits();
    updateProgress();
});

// Event Listeners
addBtn.addEventListener('click', addHabit);
habitNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

// Functions

function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDayEl.textContent = now.toLocaleDateString('en-US', options);

    // Greeting based on time
    const hour = now.getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    currentDateEl.textContent = greeting;
}

function loadData() {
    const storedData = localStorage.getItem('habitsData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        habits = parsedData.habits || [];
        // Recalculate points based on completed habits to ensure consistency
        calculatePoints();
    }
}

function saveData() {
    const data = {
        lastVisitDate: new Date().toDateString(),
        habits: habits
    };
    localStorage.setItem('habitsData', JSON.stringify(data));
    calculatePoints();
    updateProgress();
}

function checkDailyReset() {
    const storedData = localStorage.getItem('habitsData');
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        const lastDate = parsedData.lastVisitDate;
        const today = new Date().toDateString();

        if (lastDate !== today) {
            // It's a new day! Reset habits
            habits.forEach(habit => {
                habit.completed = false;
            });
            saveData(); // Save the reset state with today's date
            alert("It's a new day! Your habits have been reset.");
        }
    }
}

function calculatePoints() {
    const completedCount = habits.filter(h => h.completed).length;
    totalPoints = completedCount * POINTS_PER_HABIT;
    totalPointsEl.textContent = `${totalPoints}/500`;

    // Animate points change
    totalPointsEl.classList.add('scale-125');
    setTimeout(() => totalPointsEl.classList.remove('scale-125'), 300);
}

function updateProgress() {
    if (habits.length === 0) {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        return;
    }

    const completedCount = habits.filter(h => h.completed).length;
    const percentage = Math.round((completedCount / habits.length) * 100);

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

function addHabit() {
    const name = habitNameInput.value.trim();
    const time = habitTimeInput.value;

    if (!name) {
        alert('Please enter a habit name.');
        return;
    }

    // Check for duplicates
    if (habits.some(h => h.name.toLowerCase() === name.toLowerCase())) {
        alert('This habit already exists!');
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        time: time || 'Anytime',
        completed: false
    };

    habits.push(newHabit);
    saveData();
    renderHabits();

    // Reset inputs
    habitNameInput.value = '';
    habitTimeInput.value = '';
}

function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (habit) {
        habit.completed = !habit.completed;
        saveData();
        renderHabits();
    }
}

function deleteHabit(id) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== id);
        saveData();
        renderHabits();
    }
}

function renderHabits() {
    habitsList.innerHTML = '';

    if (habits.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    // Sort habits: Uncompleted first, then by time
    const sortedHabits = [...habits].sort((a, b) => {
        if (a.completed === b.completed) {
            return a.time.localeCompare(b.time);
        }
        return a.completed ? 1 : -1;
    });

    sortedHabits.forEach(habit => {
        const habitEl = document.createElement('div');
        // Base classes for the card
        let cardClasses = 'group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:bg-slate-800/90 animate-[slideIn_0.3s_ease-out_forwards]';

        // Conditional classes based on completion
        if (habit.completed) {
            cardClasses += ' border-emerald-500/30 bg-emerald-500/10';
        } else {
            cardClasses += ' border-white/10 bg-slate-800/70 backdrop-blur-sm';
        }

        habitEl.className = cardClasses;

        // Button classes
        const baseBtnClasses = 'w-9 h-9 rounded-[10px] cursor-pointer flex items-center justify-center transition-all duration-200';
        const checkBtnClasses = habit.completed
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-white/5 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-500';
        const deleteBtnClasses = 'bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-500';

        habitEl.innerHTML = `
            <div class="flex flex-col gap-1 min-w-0 flex-1">
                <span class="text-xs text-slate-400">${formatTime(habit.time)}</span>
                <span class="text-lg font-medium break-words ${habit.completed ? 'line-through text-slate-400' : 'text-slate-50'}">${habit.name}</span>
            </div>
            <div class="flex gap-2.5">
                <button class="${baseBtnClasses} ${checkBtnClasses}" onclick="toggleHabit(${habit.id})" aria-label="Toggle Complete">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>
                <button class="${baseBtnClasses} ${deleteBtnClasses}" onclick="deleteHabit(${habit.id})" aria-label="Delete">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        habitsList.appendChild(habitEl);
    });
}

function formatTime(timeStr) {
    if (timeStr === 'Anytime') return timeStr;
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    const formattedMinute = m < 10 ? '0' + m : m;
    return `${formattedHour}:${formattedMinute} ${ampm}`;
}
