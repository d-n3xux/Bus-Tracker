const routeSequence = ["chandrapur", "ballarsha", "rajura", "gadchandur", "korpana", "pardi", "bela", "jainath", "adilabad"];

const routeOffsets = {
    "chandrapur": 0, "ballarsha": 25, "rajura": 45, "gadchandur": 75,
    "korpana": 105, "pardi": 135, "bela": 160, "jainath": 185, "adilabad": 210
};

const schedules = [
    { 
        type: 'MSRTC', way: 'Adilabad Way', startStation: 'chandrapur', 
        baseTimes: [6.25, 6.5, 7, 7.75, 9.25, 10, 11, 12, 13, 14, 16.83]
    },
    { 
        type: 'TGSRTC', way: 'Chandrapur Way', startStation: 'adilabad', 
        baseTimes: [7, 8, 9, 10, 13.5, 15]
    },
    { 
        type: 'TGSRTC', way: 'Adilabad Way', startStation: 'chandrapur', 
        baseTimes: [8.5, 11.5, 14.5]
    }
];

// Click event setup for the check arrival action button
document.getElementById('calculate-btn').addEventListener('click', function() {
    const selectedStand = document.getElementById('bus-stand-select').value;
    const selectedDirection = document.getElementById('route-direction-select').value;
    const dashboard = document.getElementById('dashboard');
    const cardsContainer = document.getElementById('bus-cards');
    
    if (!selectedStand) {
        alert("Please select your current bus stand first!");
        dashboard.style.display = "none";
        return;
    }

    const standDropdown = document.getElementById('bus-stand-select');
    const standText = standDropdown.options[standDropdown.selectedIndex].text;
    document.getElementById('current-location-heading').textContent = `Precise Arrival Times for ${standText}`;
    cardsContainer.innerHTML = '';
    
    const now = new Date();
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();
    let dynamicBusesList = [];

    schedules.forEach(schedule => {
        if (selectedDirection !== 'all' && schedule.way !== selectedDirection) {
            return;
        }

        const isForward = (schedule.startStation === 'chandrapur');
        const originOffset = routeOffsets[schedule.startStation];
        const localOffset = routeOffsets[selectedStand];
        
        const standIndex = routeSequence.indexOf(selectedStand);
        const startIndex = routeSequence.indexOf(schedule.startStation);
        
        if ((isForward && standIndex < startIndex) || (!isForward && standIndex > startIndex)) {
            return; 
        }

        const minutesFromStart = isForward ? (localOffset - originOffset) : (originOffset - localOffset);

        schedule.baseTimes.forEach(decimalHour => {
            const departureMinutes = Math.round(decimalHour * 60);
            const actualArrivalMinutes = departureMinutes + minutesFromStart;
            let minutesLeft = actualArrivalMinutes - currentMinutes;

            if (minutesLeft < -30) return; 

            dynamicBusesList.push({
                type: schedule.type,
                way: schedule.way,
                arrivalMinutes: actualArrivalMinutes,
                timeLeft: minutesLeft
            });
        });
    });

    dynamicBusesList.sort((a, b) => a.timeLeft - b.timeLeft);

    if (dynamicBusesList.length === 0) {
        cardsContainer.innerHTML = '<div class="no-buses">No upcoming buses matching this criteria for today.</div>';
    } else {
        dynamicBusesList.forEach(bus => {
            const card = document.createElement('div');
            card.className = `bus-card ${bus.type.toLowerCase()}`;
            
            let displayHours = Math.floor(bus.arrivalMinutes / 60) % 24;
            const displayMins = bus.arrivalMinutes % 60;
            const ampm = displayHours >= 12 ? 'PM' : 'AM';
            displayHours = displayHours % 12 || 12; 
            
            const formattedClock = `${displayHours}:${displayMins.toString().padStart(2, '0')} ${ampm}`;
            
            // Format countdown string dynamically based on duration threshold
            let countdownDisplay = '';
            if (bus.timeLeft <= 0) {
                countdownDisplay = `<span class="time-number" style="font-size:1.1rem; color:#e63946; font-weight:700;">DEPARTED</span>`;
            } else if (bus.timeLeft > 59) {
                const hours = Math.floor(bus.timeLeft / 60);
                const mins = bus.timeLeft % 60;
                countdownDisplay = `<span class="time-number" style="font-size: 1.4rem;">${hours} hr ${mins} min</span><span class="time-label">Time Left</span>`;
            } else {
                countdownDisplay = `<span class="time-number">${bus.timeLeft}</span><span class="time-label">Mins Left</span>`;
            }

            card.innerHTML = `
                <div class="bus-info">
                    <span class="way-badge">${bus.way}</span>
                    <p class="operator-name">${bus.type} Service</p>
                    <p class="arrival-clock">Estimated Arrival: <strong>${formattedClock}</strong></p>
                </div>
                <div class="bus-countdown">
                    ${countdownDisplay}
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }
    
    dashboard.style.display = "block";
});
