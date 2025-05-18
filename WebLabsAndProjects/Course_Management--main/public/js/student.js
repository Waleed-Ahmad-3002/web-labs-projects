// student.js

function initStudentDashboard() {
    displayStudentInfo();
    loadSchedule();
    loadSelectedCourses();
    initNavigation();
    initCourseSearch();
    initCourseActions();
    initLogout();
}

function displayStudentInfo() {
    const studentName = localStorage.getItem('userName') || 'Student';
    document.getElementById('student-name').textContent = studentName;
}
/*
function loadSchedule() {
    const scheduleGrid = document.querySelector('.schedule-grid');
    scheduleGrid.innerHTML = '<div class="time-header">Time</div>' +
        '<div class="day-header">Monday</div>' +
        '<div class="day-header">Tuesday</div>' +
        '<div class="day-header">Wednesday</div>' +
        '<div class="day-header">Thursday</div>' +
        '<div class="day-header">Friday</div>';

    for (let i = 8; i <= 20; i++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${i}:00 - ${i + 1}:00`;
        scheduleGrid.appendChild(timeSlot);

        for (let j = 0; j < 5; j++) {
            const daySlot = document.createElement('div');
            daySlot.className = 'day-slot';
            scheduleGrid.appendChild(daySlot);
        }
    }
    
    // Update schedule with selected courses
    updateScheduleDisplay();
}

function updateScheduleDisplay() {
    // Clear existing course displays
    document.querySelectorAll('.course-in-schedule').forEach(el => el.remove());
    
    // Get selected courses from localStorage
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    if (selectedCourses.length === 0) return;
    
    // Parse schedule and place courses in the grid
    selectedCourses.forEach(course => {
        if (!course.schedule) return;
        
        const scheduleInfo = parseScheduleString(course.schedule);
        if (!scheduleInfo) return;
        
        scheduleInfo.forEach(info => {
            const { day, startHour, endHour } = info;
            
            // Find the right day column (0 = Monday, 4 = Friday)
            const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(day.toLowerCase());
            if (dayIndex === -1) return;
            
            // Find the starting time slot row (grid is from 8:00 to 20:00)
            const startRow = startHour - 7; // 8:00 is the first row after the header row
            const duration = endHour - startHour;
            
            // Calculate position in the grid
            const startPosition = 7 + (startRow * 6) + dayIndex + 1; // 7 is for the header cells
            
            // Create the course display element
            const courseDisplay = document.createElement('div');
            courseDisplay.className = 'course-in-schedule';
            courseDisplay.innerHTML = `
                <div class="course-code">${course.code}</div>
                <div class="course-name">${course.name}</div>
            `;
            courseDisplay.style.gridRow = `${startPosition} / span ${duration}`;
            courseDisplay.style.gridColumn = `${dayIndex + 2}`; // +2 because of the time column
            
            document.querySelector('.schedule-grid').appendChild(courseDisplay);
        });
    });
    
    // Check for conflicts
    checkScheduleConflicts();
}
function parseScheduleString(scheduleStr) {
    // Handle formats like: "Wednesday 10:00 AM - 11:00 AM"
    const scheduleInfo = [];
    
    // Split by comma for multiple days (if any)
    const scheduleParts = scheduleStr.split(',').map(part => part.trim());
    
    scheduleParts.forEach(part => {
        // Match day and time with the actual format
        // This regex matches: [Day name] [hour]:[minute] [AM/PM] - [hour]:[minute] [AM/PM]
        const match = part.match(/(\w+)\s+(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return;
        
        const day = match[1];
        const startHour = parseInt(match[2]);
        const startMinute = parseInt(match[3]);
        const startPeriod = match[4].toUpperCase();
        const endHour = parseInt(match[5]);
        const endMinute = parseInt(match[6]);
        const endPeriod = match[7].toUpperCase();
        
        // Convert to 24-hour format
        const startTime = convertTimeTo24Hour(startHour, startMinute, startPeriod);
        const endTime = convertTimeTo24Hour(endHour, endMinute, endPeriod);
        
        scheduleInfo.push({ 
            day, 
            startHour: startTime, 
            endHour: endTime 
        });
    });
    
    return scheduleInfo.length > 0 ? scheduleInfo : null;
}

function convertTimeTo24Hour(hours, minutes, period) {
    // Convert hours to 24-hour format
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    // Return as decimal hours
    return hours + (minutes / 60);
}

function checkScheduleConflicts() {
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    const conflicts = [];
    
    // Compare each pair of courses
    for (let i = 0; i < selectedCourses.length; i++) {
        for (let j = i + 1; j < selectedCourses.length; j++) {
            const courseA = selectedCourses[i];
            const courseB = selectedCourses[j];
            
            const scheduleA = parseScheduleString(courseA.schedule);
            const scheduleB = parseScheduleString(courseB.schedule);
            
            if (!scheduleA || !scheduleB) continue;
            
            // Check for conflicts
            for (const timeA of scheduleA) {
                for (const timeB of scheduleB) {
                    if (timeA.day.toLowerCase() === timeB.day.toLowerCase()) {
                        // Check time overlap
                        if ((timeA.startHour < timeB.endHour && timeA.endHour > timeB.startHour) ||
                            (timeB.startHour < timeA.endHour && timeB.endHour > timeA.startHour)) {
                            conflicts.push({
                                course1: courseA.code,
                                course2: courseB.code,
                                day: timeA.day
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Display conflicts
    const conflictsContainer = document.getElementById('schedule-conflicts');
    const conflictsList = document.getElementById('conflicts-list');
    
    if (conflicts.length > 0) {
        conflictsList.innerHTML = '';
        conflicts.forEach(conflict => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${conflict.course1}</strong> and <strong>${conflict.course2}</strong> conflict on ${conflict.day}`;
            conflictsList.appendChild(listItem);
        });
        conflictsContainer.classList.remove('hidden');
    } else {
        conflictsContainer.classList.add('hidden');
    }
}*/


// First modify your loadSchedule function to fetch data from the server
/*
function loadSchedule() {
    // Create the schedule grid structure first
    const scheduleGrid = document.querySelector('.schedule-grid');
    scheduleGrid.innerHTML = '<div class="time-header">Time</div>' +
        '<div class="day-header">Monday</div>' +
        '<div class="day-header">Tuesday</div>' +
        '<div class="day-header">Wednesday</div>' +
        '<div class="day-header">Thursday</div>' +
        '<div class="day-header">Friday</div>';

    for (let i = 8; i <= 20; i++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = `${i}:00 - ${i + 1}:00`;
        scheduleGrid.appendChild(timeSlot);

        for (let j = 0; j < 5; j++) {
            const daySlot = document.createElement('div');
            daySlot.className = 'day-slot';
            scheduleGrid.appendChild(daySlot);
        }
    }
    
    // Fetch registered courses and update the schedule
    fetchRegisteredCourses();
}*/

function loadSchedule() {
    // Create the schedule grid structure
    const scheduleGrid = document.querySelector('.schedule-grid');
    scheduleGrid.innerHTML = ''; // Clear existing content
    
    // Create the empty first cell (top-left corner)
    const firstCell = document.createElement('div');
    firstCell.className = 'first-cell';
    scheduleGrid.appendChild(firstCell);
    
    // Create time headers (across the top) - now ending at 17:00 instead of 21:00
    for (let i = 8; i <= 17; i++) {
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        timeHeader.textContent = `${i}:00 - ${i+1}:00`;
        scheduleGrid.appendChild(timeHeader);
    }
    
    // Create day headers and cells
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    
    days.forEach(day => {
        // Create day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        scheduleGrid.appendChild(dayHeader);
        
        // Create cells for each time slot for this day - now ending at 17:00
        for (let i = 8; i <= 17; i++) {
            const cell = document.createElement('div');
            cell.className = 'schedule-cell';
            cell.dataset.day = day.toLowerCase();
            cell.dataset.time = `${i}:00`;
            scheduleGrid.appendChild(cell);
        }
    });
    
    // Fetch registered courses and update the schedule
    fetchRegisteredCourses();
}
// New function to fetch the student profile data from your API
async function fetchRegisteredCourses() {
    try {
        // Get the JWT token from localStorage or wherever you store it
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        // Fetch student profile which contains registeredCourses IDs
        const response = await fetch('http://localhost:3000/api/students/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch student profile');
        }
        
        const studentData = await response.json();
        
        // If no registered courses, just return
        if (!studentData.registeredCourses || studentData.registeredCourses.length === 0) {
            return;
        }
        
        // Fetch complete course details for each registered course
        const coursePromises = studentData.registeredCourses.map(async (courseRef) => {
            // We need the full course details, so we fetch each course
            // Using the ID from the student profile
            const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseRef._id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!courseResponse.ok) {
                console.error(`Failed to fetch course details for ${courseRef.code}`);
                return null;
            }
            
            return await courseResponse.json();
        });
        
        // Wait for all course detail fetches to complete
        const coursesWithDetails = (await Promise.all(coursePromises)).filter(course => course !== null);
        
        // Store the detailed courses in localStorage for the schedule functions to use
        localStorage.setItem('selectedCourses', JSON.stringify(coursesWithDetails));
        
        // Update the schedule display with the fetched courses
        updateScheduleDisplay();
        
    } catch (error) {
        console.error('Error fetching registered courses:', error);
    }
}

// The rest of your existing functions remain the same
/*
function updateScheduleDisplay() {
    // Clear existing course displays
    document.querySelectorAll('.course-in-schedule').forEach(el => el.remove());
    
    // Get selected courses from localStorage
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    if (selectedCourses.length === 0) return;
    
    // Parse schedule and place courses in the grid
    selectedCourses.forEach(course => {
        if (!course.schedule) return;
        
        const scheduleInfo = parseScheduleString(course.schedule);
        if (!scheduleInfo) return;
        
        scheduleInfo.forEach(info => {
            const { day, startHour, endHour } = info;
            
            // Find the right day column (0 = Monday, 4 = Friday)
            const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(day.toLowerCase());
            if (dayIndex === -1) return;
            
            // Find the starting time slot row (grid is from 8:00 to 20:00)
            const startRow = startHour - 7; // 8:00 is the first row after the header row
            const duration = endHour - startHour;
            
            // Calculate position in the grid
            const startPosition = 7 + (startRow * 6) + dayIndex + 1; // 7 is for the header cells
            
            // Create the course display element
            const courseDisplay = document.createElement('div');
            courseDisplay.className = 'course-in-schedule';
            courseDisplay.innerHTML = `
                <div class="course-code">${course.code}</div>
                <div class="course-name">${course.name}</div>
            `;
            courseDisplay.style.gridRow = `${startPosition} / span ${duration}`;
            courseDisplay.style.gridColumn = `${dayIndex + 2}`; // +2 because of the time column
            
            document.querySelector('.schedule-grid').appendChild(courseDisplay);
        });
    });
    
    // Check for conflicts
    checkScheduleConflicts();
}*/
/*old
function updateScheduleDisplay() {
    // Clear existing course displays
    document.querySelectorAll('.course-block').forEach(el => el.remove());
    
    // Get selected courses from localStorage
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    if (selectedCourses.length === 0) return;
    
    // Track cells with courses for conflict detection
    const cellsWithCourses = {};
    
    // Parse schedule and place courses in the grid
    selectedCourses.forEach(course => {
        if (!course.schedule) return;
        
        const scheduleInfo = parseScheduleString(course.schedule);
        if (!scheduleInfo) return;
        
        scheduleInfo.forEach(info => {
            const { day, startHour, endHour } = info;
            
            // Calculate which cells this course should occupy based on start and end time
            for (let hour = Math.floor(startHour); hour < Math.ceil(endHour); hour++) {
                const cellSelector = `.schedule-cell[data-day="${day.toLowerCase()}"][data-time="${hour}:00"]`;
                const timeSlotCell = document.querySelector(cellSelector);
                
                if (timeSlotCell) {
                    // Create the course display element
                    const courseDisplay = document.createElement('div');
                    courseDisplay.className = 'course-block';
                    courseDisplay.classList.add(getCourseCategory(course.code));
                    courseDisplay.dataset.course = course.code;
                    courseDisplay.innerHTML = `
                        <div class="course-code">${course.code}</div>
                        <div class="course-name">${course.name}</div>
                    `;
                    
                    // Track this cell for conflict detection
                    if (!cellsWithCourses[cellSelector]) {
                        cellsWithCourses[cellSelector] = [];
                    }
                    cellsWithCourses[cellSelector].push(course.code);
                    
                    // Insert the course into the cell
                    timeSlotCell.appendChild(courseDisplay);
                    
                }
            }
        });
    });
    
    // Mark conflicts visually
    for (const cellSelector in cellsWithCourses) {
        if (cellsWithCourses[cellSelector].length > 1) {
            const cell = document.querySelector(cellSelector);
            cell.classList.add('has-conflict');
            
            // Mark all courses in this cell as conflicting
            const courseBlocks = cell.querySelectorAll('.course-block');
            courseBlocks.forEach((block, index) => {
                block.classList.add('conflict');
                
                // Offset the conflicting courses so both are visible
                block.style.top = `${index * 5}px`;
                block.style.left = `${index * 5}px`;
                block.style.right = `${-index * 5}px`;
                block.style.bottom = `${-index * 5}px`;
                block.style.zIndex = 10 + index;
            });
        }
    }
    
    // Run conflict detection logic
    checkScheduleConflicts();
}*/
function updateScheduleDisplay() {
    // Clear existing course displays
    document.querySelectorAll('.course-block').forEach(el => el.remove());
    
    // Get selected courses from localStorage
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    if (selectedCourses.length === 0) return;
    
    // Track cells with courses for conflict detection
    const cellsWithCourses = {};
    
    // Parse schedule and place courses in the grid
    selectedCourses.forEach(course => {
        if (!course.schedule) return;
        
        const scheduleInfo = parseScheduleString(course.schedule);
        if (!scheduleInfo) return;
        
        scheduleInfo.forEach(info => {
            const { day, startHour, endHour } = info;
            
            // Only display courses that fall within our new time range (8-17)
            const displayStartHour = Math.max(Math.floor(startHour), 8);
            const displayEndHour = Math.min(Math.ceil(endHour), 18);
            
            // Skip if the course is completely outside our display range
            if (displayStartHour >= displayEndHour || displayEndHour <= 8 || displayStartHour >= 18) {
                return;
            }
            
            // Calculate which cells this course should occupy based on start and end time
            for (let hour = displayStartHour; hour < displayEndHour; hour++) {
                const cellSelector = `.schedule-cell[data-day="${day.toLowerCase()}"][data-time="${hour}:00"]`;
                const timeSlotCell = document.querySelector(cellSelector);
                
                if (timeSlotCell) {
                    // Track this cell for conflict detection
                    if (!cellsWithCourses[cellSelector]) {
                        cellsWithCourses[cellSelector] = [];
                    }
                    cellsWithCourses[cellSelector].push({
                        code: course.code,
                        name: course.name,
                        category: getCourseCategory(course.code)
                    });
                }
            }
        });
    });
    
    // Handle all cells including conflicts
    for (const cellSelector in cellsWithCourses) {
        const cell = document.querySelector(cellSelector);
        const coursesInCell = cellsWithCourses[cellSelector];
        
        // Mark cell as having conflict if there are multiple courses
        if (coursesInCell.length > 1) {
            cell.classList.add('has-conflict');
        }
        
        // Add all courses to the cell with proper positioning for conflicts
        coursesInCell.forEach((course, index) => {
            // Create the course display element
            const courseDisplay = document.createElement('div');
            courseDisplay.className = 'course-block';
            courseDisplay.classList.add(course.category);
            courseDisplay.dataset.course = course.code;
            
            // If there's a conflict, mark it and position accordingly
            if (coursesInCell.length > 1) {
                courseDisplay.classList.add('conflict');
                
                // Adjust size and position for conflicts to make them both visible
                const offsetPercent = 100 / coursesInCell.length;
                const heightPercent = 100 / coursesInCell.length;
                
                courseDisplay.style.height = `${heightPercent}%`;
                courseDisplay.style.top = `${index * offsetPercent}%`;
                courseDisplay.style.zIndex = 10 + index;
            }
            
            // Add course content
            courseDisplay.innerHTML = `
                <div class="course-code">${course.code}</div>
                <div class="course-name">${course.name}</div>
            `;
            
            // Insert the course into the cell
            cell.appendChild(courseDisplay);
        });
    }
    
    // Run conflict detection logic for the alerts section
    checkScheduleConflicts();
}
// Keep only one getCourseCategory implementation
function getCourseCategory(courseCode) {
    if (courseCode.startsWith('CS')) return 'cs';
    if (courseCode.startsWith('MATH')) return 'math';
    if (courseCode.startsWith('ENG')) return 'eng';
    if (courseCode.startsWith('PHYS')) return 'phys';
    if (courseCode.startsWith('BIO')) return 'bio';
    if (courseCode.startsWith('SE')) return 'se';
    if (courseCode.startsWith('AI')) return 'ai';
    if (courseCode.startsWith('ML')) return 'ml';
    return 'default'; // Default category if none match
}



function parseScheduleString(scheduleStr) {
    // Handle formats like: "Wednesday 10:00 AM - 11:00 AM"
    const scheduleInfo = [];
    
    // Split by comma for multiple days (if any)
    const scheduleParts = scheduleStr.split(',').map(part => part.trim());
    
    scheduleParts.forEach(part => {
        // Match day and time with the actual format
        // This regex matches: [Day name] [hour]:[minute] [AM/PM] - [hour]:[minute] [AM/PM]
        const match = part.match(/(\w+)\s+(\d+):(\d+)\s*(AM|PM)\s*-\s*(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return;
        
        const day = match[1];
        const startHour = parseInt(match[2]);
        const startMinute = parseInt(match[3]);
        const startPeriod = match[4].toUpperCase();
        const endHour = parseInt(match[5]);
        const endMinute = parseInt(match[6]);
        const endPeriod = match[7].toUpperCase();
        
        // Convert to 24-hour format
        const startTime = convertTimeTo24Hour(startHour, startMinute, startPeriod);
        const endTime = convertTimeTo24Hour(endHour, endMinute, endPeriod);
        
        scheduleInfo.push({ 
            day, 
            startHour: startTime, 
            endHour: endTime 
        });
    });
    
    return scheduleInfo.length > 0 ? scheduleInfo : null;
}

function convertTimeTo24Hour(hours, minutes, period) {
    // Convert hours to 24-hour format
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    // Return as decimal hours
    return hours + (minutes / 60);
}

function checkScheduleConflicts() {
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    const conflicts = [];
    
    // Compare each pair of courses
    for (let i = 0; i < selectedCourses.length; i++) {
        for (let j = i + 1; j < selectedCourses.length; j++) {
            const courseA = selectedCourses[i];
            const courseB = selectedCourses[j];
            
            const scheduleA = parseScheduleString(courseA.schedule);
            const scheduleB = parseScheduleString(courseB.schedule);
            
            if (!scheduleA || !scheduleB) continue;
            
            // Check for conflicts
            for (const timeA of scheduleA) {
                for (const timeB of scheduleB) {
                    if (timeA.day.toLowerCase() === timeB.day.toLowerCase()) {
                        // Check time overlap
                        if ((timeA.startHour < timeB.endHour && timeA.endHour > timeB.startHour) ||
                            (timeB.startHour < timeA.endHour && timeB.endHour > timeA.startHour)) {
                            conflicts.push({
                                course1: courseA.code,
                                course2: courseB.code,
                                day: timeA.day
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Display conflicts
    const conflictsContainer = document.getElementById('schedule-conflicts');
    const conflictsList = document.getElementById('conflicts-list');
    
    if (conflicts.length > 0) {
        conflictsList.innerHTML = '';
        conflicts.forEach(conflict => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${conflict.course1}</strong> and <strong>${conflict.course2}</strong> conflict on ${conflict.day}`;
            conflictsList.appendChild(listItem);
        });
        conflictsContainer.classList.remove('hidden');
    } else {
        conflictsContainer.classList.add('hidden');
    }
}







//above

function loadSelectedCourses() {
    const selectedCoursesList = document.getElementById('selected-courses-list');
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    
    if (selectedCourses.length === 0) {
        selectedCoursesList.innerHTML = '<p class="no-courses">No courses selected yet. Go to "Find Courses" to add courses to your schedule.</p>';
        return;
    }
    
    selectedCoursesList.innerHTML = '';
    selectedCourses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'selected-course';
        courseElement.innerHTML = `
            <div class="course-info">
                <span class="course-code">${course.code}</span>
                <span class="course-name">${course.name}</span>
            </div>
            <div class="course-details">
                <span class="course-schedule">${course.schedule}</span>
                <span class="course-seats">Available seats: ${course.seats - (course.enrolledStudents || 0)}</span>
            </div>
            <button class="remove-course-btn" data-code="${course.code}">Remove</button>
        `;
        selectedCoursesList.appendChild(courseElement);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-course-btn').forEach(button => {
        button.addEventListener('click', function() {
            const courseCode = this.getAttribute('data-code');
            removeCourseFromSelection(courseCode);
        });
    });
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            if (this.classList.contains('logout')) {
                logout();
                return;
            }
            
            const page = this.getAttribute('data-page');
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            contentPages.forEach(content => content.classList.add('hidden'));
            const targetPage = document.getElementById(`${page}-page`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                
                // Load data if needed
                if (page === 'search') {
                    searchCourses();
                } else if (page === 'requirements') {
                    loadRequirements();
                }
            }
        });
    });
}

function initCourseSearch() {
    // Initialize filter change events
    document.getElementById('department-filter').addEventListener('change', searchCourses);
    document.getElementById('level-filter').addEventListener('change', searchCourses);
    document.getElementById('day-filter').addEventListener('change', searchCourses);
    document.getElementById('time-filter').addEventListener('change', searchCourses);
    document.getElementById('seats-filter').addEventListener('change', searchCourses);
    
    // Initialize search input event
    const searchInput = document.getElementById('search-input');
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchCourses();
        }, 300); // Debounce for better performance
    });
    
    // Initial search to load courses
    searchCourses();
}
async function searchCourses() {
    const courseList = document.getElementById('course-list');
    const resultsCount = document.getElementById('results-count');
    
    courseList.innerHTML = '<div class="loading">Loading courses...</div>';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('You are not logged in.');
            return;
        }
        
        // Fetch all courses from API
        const response = await fetch('http://localhost:3000/api/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load courses');
        }
        
        const courses = await response.json();
        
        // Apply filters
        const searchInput = document.getElementById('search-input').value.toLowerCase();
        const departmentFilter = document.getElementById('department-filter').value;
        const levelFilter = document.getElementById('level-filter').value;
        const dayFilter = document.getElementById('day-filter').value;
        const timeFilter = document.getElementById('time-filter').value;
        const seatsFilter = document.getElementById('seats-filter').value;
        
        const filteredCourses = courses.filter(course => {
            // Text search
            const matchesSearch = 
                course.code.toLowerCase().includes(searchInput) || 
                course.name.toLowerCase().includes(searchInput);
            
            // Department filter
            const matchesDepartment = 
                !departmentFilter || course.department === departmentFilter;
            
            // Level filter
            const matchesLevel = 
                !levelFilter || course.level.startsWith(levelFilter);
            
            // Day filter
            const matchesDay = 
                !dayFilter || course.schedule.toLowerCase().includes(dayFilter.toLowerCase());
            // Time filter
let matchesTime = true;
if (timeFilter) {
    const schedule = parseScheduleString(course.schedule);
    if (schedule) {
        matchesTime = schedule.some(time => {
            const startHour = time.startHour;
            if (timeFilter === 'morning') return startHour >= 8 && startHour < 12;
            if (timeFilter === 'afternoon') return startHour >= 12 && startHour < 17;
            if (timeFilter === 'evening') return startHour >= 17;
            return true;
        });
    } else {
        // If parsing fails, we can't determine the time period
        matchesTime = false;
    }
}
            // Seats filter
            let matchesSeats = true;
            if (seatsFilter) {
                const availableSeats = course.seats - (course.enrolledStudents || 0);
                if (seatsFilter === 'open') matchesSeats = availableSeats > 0;
                if (seatsFilter === 'full') matchesSeats = availableSeats <= 0;
            }
            
            return matchesSearch && matchesDepartment && matchesLevel && matchesDay && matchesTime && matchesSeats;
        });
        
        resultsCount.textContent = `${filteredCourses.length} courses found`;
        
        // Display courses
        courseList.innerHTML = '';
        
        if (filteredCourses.length === 0) {
            courseList.innerHTML = '<div class="no-results">No courses match your search criteria</div>';
            return;
        }
        
        // Get selected courses to indicate selection status
        const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
        const selectedCourseIds = selectedCourses.map(course => course.code);
        
        // First, add all course items to the DOM
        for (const course of filteredCourses) {
            const availableSeats = course.seats - (course.enrolledStudents || 0);
            const isSelected = selectedCourseIds.includes(course.code);
            
        
            // Inside the searchCourses function
const courseItem = document.createElement('div');
courseItem.className = 'course-item';
courseItem.dataset.code = course.code;

// Check if the course is full
const isCourseFull = course.enrolledStudents >= course.seats;

// Initially render with a loading state for prerequisites
courseItem.innerHTML = `
    <div class="course-header">
        <h3>${course.code} - ${course.name}</h3>
        <span class="prereq-status">Checking prerequisites...</span>
    </div>
    <div class="course-details">
        <p><strong>Department:</strong> ${course.department} | <strong>Level:</strong> ${course.level}</p>
        <p><strong>Schedule:</strong> ${course.schedule}</p>
        <p><strong>Seats:</strong> ${course.seats - course.enrolledStudents} available out of ${course.seats}</p>
        <p><strong>Prerequisites:</strong> ${course.prerequisites ? course.prerequisites.join(', ') : 'None'}</p>
    </div>
    <div class="course-actions">
        ${isSelected ? 
            `<button class="remove-course-btn" data-code="${course.code}">Remove</button>` :
            isCourseFull ? 
                `<button class="subscribe-btn" data-code="${course.code}">Subscribe</button>` :
                `<button class="add-course-btn" data-code="${course.code}" disabled>Add to Selection</button>`
        }
    </div>
`;

courseList.appendChild(courseItem);
        }
        
        // Then check prerequisites for each course and update the UI
        for (const course of filteredCourses) {
            const courseItem = courseList.querySelector(`.course-item[data-code="${course.code}"]`);
            if (!courseItem) continue;
            
            const isSelected = selectedCourseIds.includes(course.code);
            if (isSelected) continue; // Skip prerequisite check for already selected courses
            
            try {
                // Check prerequisites
                const prereqStatus = await checkPrerequisites(course);
                
                // Update the prerequisite status display
                const statusElem = courseItem.querySelector('.prereq-status');
                if (statusElem) {
                    if (prereqStatus.met) {
                        statusElem.textContent = 'Prerequisites met';
                        statusElem.className = 'prereq-status prereq-met';
                    } else {
                        statusElem.textContent = `Prerequisites not met: ${prereqStatus.missing.join(', ')}`;
                        statusElem.className = 'prereq-status prereq-warning';
                    }
                }
                
                // Update the add button state
                const addButton = courseItem.querySelector('.add-course-btn');
                if (addButton) {
                    addButton.disabled = !prereqStatus.met;
                }
            } catch (err) {
                console.error(`Error checking prerequisites for ${course.code}:`, err);
                const statusElem = courseItem.querySelector('.prereq-status');
                if (statusElem) {
                    statusElem.textContent = 'Error checking prerequisites';
                    statusElem.className = 'prereq-status prereq-error';
                }
            }
        }
        
        // Add event listeners
        document.querySelectorAll('.add-course-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseCode = this.getAttribute('data-code');
                addCourseToSelection(courseCode);
            });
        });
        
        document.querySelectorAll('.remove-course-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseCode = this.getAttribute('data-code');
                removeCourseFromSelection(courseCode);
            });
        });
/*
// Add event listeners for "Subscribe" buttons
document.querySelectorAll('.subscribe-btn').forEach(button => {
    button.addEventListener('click', function() {
        const courseCode = this.getAttribute('data-code');
        subscribeToCourse(courseCode);
    });
});*/
courseList.addEventListener('click', function(event) {
    if (event.target.classList.contains('subscribe-btn')) {
        const courseCode = event.target.getAttribute('data-code');
        subscribeToCourse(courseCode);
    }
});
    } catch (err) {
        console.error('Error searching courses:', err);
        courseList.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
}
async function checkPrerequisites(courseData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        // Extract course information whether an object or just a course code was passed
        const courseCode = typeof courseData === 'object' ? courseData.code : courseData;
        const courseId = typeof courseData === 'object' ? courseData._id : courseData;
        
        // Get the prerequisites array - ensure we're properly extracting it
        let prerequisites = [];
        if (typeof courseData === 'object' && courseData.prerequisites) {
            prerequisites = Array.isArray(courseData.prerequisites) ? courseData.prerequisites : [courseData.prerequisites];
        }
        
        // Debug log to verify prerequisites are being extracted correctly
        console.log(`Prerequisites for ${courseCode}:`, prerequisites);
        
        // If there are no prerequisites, return immediately
        if (!prerequisites || prerequisites.length === 0) {
            console.log("No prerequisites found for course:", courseCode);
            return { met: true, missing: [] };
        }
        
        // Step 1: Get the student's profile to check completed courses
        const studentResponse = await fetch('http://localhost:3000/api/students/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!studentResponse.ok) {
            const error = await studentResponse.json();
            throw new Error(error.message || 'Failed to fetch student profile');
        }
        
        const student = await studentResponse.json();
        console.log("Student profile:", student);
        
        // Step 2: Get the student's completed courses
        // First, check if completedCourses is populated with objects or just IDs
        let completedCourses = [];
        
        if (Array.isArray(student.completedCourses)) {
            // If completedCourses contains objects with _id, name, and code
            if (student.completedCourses.length > 0 && typeof student.completedCourses[0] === 'object') {
                completedCourses = student.completedCourses;
            } 
            // If completedCourses contains just IDs, we need to fetch the course details
            else {
                // Fetch details for each completed course
                const completedCourseIds = student.completedCourses;
                const completedCoursesDetails = [];
                
                for (const courseId of completedCourseIds) {
                    try {
                        const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (courseResponse.ok) {
                            const course = await courseResponse.json();
                            completedCoursesDetails.push(course);
                        }
                    } catch (error) {
                        console.error(`Error fetching course details for ID ${courseId}:`, error);
                    }
                }
                
                completedCourses = completedCoursesDetails;
            }
        }
        
        console.log("Completed courses:", completedCourses);
        
        // Extract the names and codes of completed courses for easier comparison
        const completedCourseCodes = completedCourses.map(course => 
            typeof course === 'object' ? course.code : null).filter(Boolean);
        const completedCourseNames = completedCourses.map(course => 
            typeof course === 'object' ? course.name : null).filter(Boolean);
        
        console.log("Completed course codes:", completedCourseCodes);
        console.log("Completed course names:", completedCourseNames);
        
        // Step 3: Check each prerequisite against the student's completed courses
        const missingPrerequisites = [];
        const foundPrerequisites = [];
        
        for (const prereq of prerequisites) {
            // Skip empty prerequisite strings
            if (!prereq || prereq.trim() === '') continue;
            
            console.log(`Checking prerequisite: ${prereq}`);
            
            // Check if the prerequisite matches a completed course code or name
            // Case-insensitive matching for more flexibility
            const codeMatch = completedCourseCodes.some(code => 
                code && code.toLowerCase() === prereq.toLowerCase());
            const nameMatch = completedCourseNames.some(name => 
                name && name.toLowerCase() === prereq.toLowerCase());
            
            if (codeMatch || nameMatch) {
                console.log(`Found direct match for prerequisite: ${prereq}`);
                const matchedCourse = completedCourses.find(course => 
                    (course.code && course.code.toLowerCase() === prereq.toLowerCase()) || 
                    (course.name && course.name.toLowerCase() === prereq.toLowerCase())
                );
                if (matchedCourse) {
                    foundPrerequisites.push(matchedCourse._id || matchedCourse);
                }
                continue;
            }
            
            // If no direct match, find the prerequisite course by code or name
            try {
                console.log(`Searching for prerequisite course: ${prereq}`);
                const prereqResponse = await fetch(`http://localhost:3000/api/courses/findByCodeOrName/${encodeURIComponent(prereq)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!prereqResponse.ok) {
                    console.log(`Could not find prerequisite course: ${prereq}`);
                    missingPrerequisites.push(prereq);
                    continue;
                }
                
                const prereqCourse = await prereqResponse.json();
                console.log(`Found prerequisite course in database:`, prereqCourse);
                
                // Check if the student has completed this prerequisite
                const hasCompleted = completedCourses.some(course => 
                    (typeof course === 'object' && course._id === prereqCourse._id) || 
                    course === prereqCourse._id
                );
                
                if (!hasCompleted) {
                    console.log(`Student has not completed prerequisite: ${prereqCourse.name || prereq}`);
                    missingPrerequisites.push(prereqCourse.name || prereq);
                } else {
                    console.log(`Student has completed prerequisite: ${prereqCourse.name || prereq}`);
                    foundPrerequisites.push(prereqCourse._id);
                }
            } catch (error) {
                console.error(`Error checking prerequisite ${prereq}:`, error);
                missingPrerequisites.push(prereq);
            }
        }
        
        console.log("Missing prerequisites:", missingPrerequisites);
        console.log("Found prerequisites:", foundPrerequisites);
        
        // All prerequisites are met if there are no missing prerequisites
        return {
            met: missingPrerequisites.length === 0,
            missing: missingPrerequisites,
            found: foundPrerequisites
        };
    } catch (err) {
        console.error('Error checking prerequisites:', err);
        throw new Error(`Failed to check prerequisites: ${err.message}`);
    }
}
async function addCourseToSelection(courseCode) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        console.log("Adding course to selection:", courseCode);
        
        // First get all courses - using the same approach as your original working code
        const response = await fetch('http://localhost:3000/api/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // Handle errors properly without trying to parse JSON if the response isn't JSON
            if (response.headers.get('content-type')?.includes('application/json')) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch courses');
            } else {
                throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
            }
        }

        const courses = await response.json();
        
        // Find the course by code - same as original working code
        const course = courses.find(c => c.code === courseCode);
        
        if (!course) {
            throw new Error('Course not found');
        }
        
        // Only check prerequisites if you need to
        const prerequisiteCheck = await checkPrerequisites(course);
        if (!prerequisiteCheck.met) {
            throw new Error(`Missing prerequisites: ${prerequisiteCheck.missing.join(', ')}`);
        }
        
        // Add the course to the selected courses list
        const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
        if (selectedCourses.some(c => c.code === course.code)) {
            alert('Course is already selected.');
            return;
        }

        selectedCourses.push(course);
        localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));

        // Update UI
        alert(`Course ${course.code} added to your selection.`);
        
        // Refresh the selected courses list and schedule - directly call these functions
        loadSelectedCourses();
        updateScheduleDisplay();
        
        // Refresh the search results to update button states
        searchCourses();
    } catch (err) {
        console.error('Error adding course:', err);
        alert(`Error: ${err.message}`);
    }
}
async function fetchCourseDetails(courseCode) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('You are not logged in.');
    }
    
    const response = await fetch(`http://localhost:3000/api/courses/${courseCode}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch course details');
    }
    
    return await response.json();
}

function removeCourseFromSelection(courseCode) {
    let selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    selectedCourses = selectedCourses.filter(course => course.code !== courseCode);
    localStorage.setItem('selectedCourses', JSON.stringify(selectedCourses));
    loadSelectedCourses();
    updateScheduleDisplay();
    searchCourses(); // Refresh search results
}

function initCourseActions() {
    const registerBtn = document.getElementById('register-btn');
    registerBtn.addEventListener('click', function() {
        registerCourses();
    });

    const clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener('click', function() {
        clearSelectedCourses();
    });
}

async function registerCourses() {
    const selectedCourses = JSON.parse(localStorage.getItem('selectedCourses')) || [];
    if (selectedCourses.length === 0) {
        alert('No courses selected.');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('userName');
        
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        if (!username) {
            throw new Error('Username not found. Please log in again.');
        }
        
        // Add debug logging
        console.log('Username being sent:', username);
        console.log('Sending selected courses:', selectedCourses);
        console.log('Course codes being sent:', selectedCourses.map(course => course.code));
        
        // Make sure we're sending an array of course codes
        const courseCodes = selectedCourses.map(course => course.code);
        
        const response = await fetch('http://localhost:3000/api/students/register', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                courses: courseCodes
            })
        });
        
        // Debug the response
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register courses');
        }
        
        const responseData = await response.json();
        console.log('Registration response:', responseData);
        
        // Clear selected courses after successful registration
        localStorage.removeItem('selectedCourses');
        loadSelectedCourses();
        updateScheduleDisplay();
        
        // Show more detailed success message
        if (responseData.newlyRegistered > 0) {
            alert(`Success! Registered ${responseData.newlyRegistered} new course(s). Total registered courses: ${responseData.totalRegistered}`);
        } else {
            alert(responseData.message);
        }
    } catch (err) {
        console.error('Error registering courses:', err);
        alert(`Error: ${err.message}`);
    }
}
function clearSelectedCourses() {
    localStorage.removeItem('selectedCourses');
    loadSelectedCourses();
    updateScheduleDisplay();
}


function initLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        document.getElementById('student-dashboard').classList.add('hidden');
        document.getElementById('login-page').classList.remove('hidden');
    });
}

function showError(message) {
    alert(message);
}
//kam kam kam
/*
async function loadRequirements() {
    try {
        const requirementsContainer = document.querySelector('.course-requirements');
        requirementsContainer.innerHTML = '<div class="loading">Loading requirements...</div>';
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        // Get all courses
        const coursesResponse = await fetch('http://localhost:3000/api/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!coursesResponse.ok) {
            throw new Error('Failed to fetch courses');
        }
        
        const courses = await coursesResponse.json();
        
        // Get student profile to check completed courses
        const studentResponse = await fetch('http://localhost:3000/api/students/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!studentResponse.ok) {
            throw new Error('Failed to fetch student profile');
        }
        
        const student = await studentResponse.json();
        
        // Extract completed and registered course IDs
        const completedCourseIds = student.completedCourses.map(course => 
            typeof course === 'object' ? course._id : course);
        const registeredCourseIds = student.registeredCourses.map(course => 
            typeof course === 'object' ? course._id : course);
        
        // Group courses by department and level
        const coursesByDeptLevel = {};
        
        courses.forEach(course => {
            const dept = course.department;
            const level = course.level;
            
            if (!coursesByDeptLevel[dept]) {
                coursesByDeptLevel[dept] = {};
            }
            
            if (!coursesByDeptLevel[dept][level]) {
                coursesByDeptLevel[dept][level] = [];
            }
            
            coursesByDeptLevel[dept][level].push(course);
        });
        
        // Build the HTML
        let html = '<h3>Degree Requirements by Department</h3>';
        
        for (const dept in coursesByDeptLevel) {
            html += `
                <div class="dept-section">
                    <h4>${getDepartmentName(dept)}</h4>
                    <div class="dept-levels">
            `;
            
            // Sort levels numerically
            const levels = Object.keys(coursesByDeptLevel[dept]).sort((a, b) => parseInt(a) - parseInt(b));
            
            for (const level of levels) {
                html += `
                    <div class="level-section">
                        <h5>${level} Level Courses</h5>
                        <ul class="course-list">
                `;
                
                coursesByDeptLevel[dept][level].forEach(course => {
                    // Determine course status
                    let status = 'available';
                    if (completedCourseIds.includes(course._id)) {
                        status = 'completed';
                    } else if (registeredCourseIds.includes(course._id)) {
                        status = 'registered';
                    } else if (course.prerequisites && course.prerequisites.length > 0) {
                        // Check if all prerequisites are met
                        const unmetPrereqs = course.prerequisites.filter(prereq => {
                            // Find the prerequisite course
                            const prereqCourse = courses.find(c => 
                                c.code === prereq || c.name === prereq);
                            
                            // If we can't find the prerequisite course, consider it unmet
                            if (!prereqCourse) return true;
                            
                            // Check if the prerequisite is completed
                            return !completedCourseIds.includes(prereqCourse._id);
                        });
                        
                        if (unmetPrereqs.length > 0) {
                            status = 'locked';
                        }
                    }
                    
                    // Format prerequisites display
                    let prereqHtml = '';
                    if (course.prerequisites && course.prerequisites.length > 0) {
                        prereqHtml = '<div class="prerequisites">';
                        prereqHtml += '<span>Prerequisites: </span>';
                        
                        prereqHtml += course.prerequisites.map(prereq => {
                            // Find the prerequisite course
                            const prereqCourse = courses.find(c => 
                                c.code === prereq || c.name === prereq);
                            
                            // Determine the status of the prerequisite
                            let prereqStatus = 'unmet';
                            if (prereqCourse && completedCourseIds.includes(prereqCourse._id)) {
                                prereqStatus = 'met';
                            }
                            
                            return `<span class="prereq-item ${prereqStatus}">${prereq}</span>`;
                        }).join(', ');
                        
                        prereqHtml += '</div>';
                    }
                    
                    html += `
                        <li class="course-item ${status}" data-course-id="${course._id}">
                            <div class="course-header">
                                <span class="course-code">${course.code}</span>
                                <span class="course-name">${course.name}</span>
                                <span class="course-status">${getStatusText(status)}</span>
                            </div>
                            ${prereqHtml}
                        </li>
                    `;
                });
                
                html += `
                        </ul>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        requirementsContainer.innerHTML = html;
        
        // Now generate the prerequisite tree
        generatePrerequisiteTree(courses, completedCourseIds);
        
    } catch (err) {
        console.error('Error loading requirements:', err);
        const requirementsContainer = document.querySelector('.course-requirements');
        requirementsContainer.innerHTML = `<div class="error">Error loading requirements: ${err.message}</div>`;
    }
}*/
async function loadRequirements() {
    try {
        const requirementsContainer = document.querySelector('.course-requirements');
        requirementsContainer.innerHTML = '<div class="loading">Loading requirements...</div>';
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        // Get all courses
        const coursesResponse = await fetch('http://localhost:3000/api/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!coursesResponse.ok) {
            throw new Error('Failed to fetch courses');
        }
        
        const courses = await coursesResponse.json();
        
        // Get student profile to check completed courses
        const studentResponse = await fetch('http://localhost:3000/api/students/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!studentResponse.ok) {
            throw new Error('Failed to fetch student profile');
        }
        
        const student = await studentResponse.json();
        
        // Extract completed and registered course IDs
        const completedCourseIds = student.completedCourses.map(course => 
            typeof course === 'object' ? course._id : course);
        const registeredCourseIds = student.registeredCourses.map(course => 
            typeof course === 'object' ? course._id : course);
        
        // Calculate available courses
        const availableCourses = courses.filter(course => {
            // A course is available if:
            // 1. Not completed
            // 2. Not registered
            // 3. All prerequisites are met
            if (completedCourseIds.includes(course._id) || registeredCourseIds.includes(course._id)) {
                return false;
            }
            
            // Check if all prerequisites are met
            if (course.prerequisites && course.prerequisites.length > 0) {
                const unmetPrereqs = course.prerequisites.filter(prereq => {
                    const prereqCourse = courses.find(c => 
                        c.code === prereq || c.name === prereq);
                    if (!prereqCourse) return true;
                    return !completedCourseIds.includes(prereqCourse._id);
                });
                
                return unmetPrereqs.length === 0; // Available only if all prereqs are met
            }
            
            return true; // No prerequisites, so it's available
        });
        
        // Update the course stats
        const statsContainer = document.querySelector('.course-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card completed">
                    <div class="stat-icon">✓</div>
                    <div class="stat-value">${completedCourseIds.length}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card registered">
                    <div class="stat-icon">⌘</div>
                    <div class="stat-value">${registeredCourseIds.length}</div>
                    <div class="stat-label">Registered</div>
                </div>
                <div class="stat-card available">
                    <div class="stat-icon">◎</div>
                    <div class="stat-value">${availableCourses.length}</div>
                    <div class="stat-label">Available</div>
                </div>
            `;
        }
        
        // Group courses by department and level
        const coursesByDeptLevel = {};
        
        courses.forEach(course => {
            const dept = course.department;
            const level = course.level;
            
            if (!coursesByDeptLevel[dept]) {
                coursesByDeptLevel[dept] = {};
            }
            
            if (!coursesByDeptLevel[dept][level]) {
                coursesByDeptLevel[dept][level] = [];
            }
            
            coursesByDeptLevel[dept][level].push(course);
        });
        
        // Build the HTML
        let html = '<h3>Degree Requirements by Department</h3>';
        
        for (const dept in coursesByDeptLevel) {
            html += `
                <div class="dept-section">
                    <h4>${getDepartmentName(dept)}</h4>
                    <div class="dept-levels">
            `;
            
            // Sort levels numerically
            const levels = Object.keys(coursesByDeptLevel[dept]).sort((a, b) => parseInt(a) - parseInt(b));
            
            for (const level of levels) {
                html += `
                    <div class="level-section">
                        <h5>${level} Level Courses</h5>
                        <ul class="course-list">
                `;
                
                coursesByDeptLevel[dept][level].forEach(course => {
                    // Determine course status
                    let status = 'available';
                    if (completedCourseIds.includes(course._id)) {
                        status = 'completed';
                    } else if (registeredCourseIds.includes(course._id)) {
                        status = 'registered';
                    } else if (course.prerequisites && course.prerequisites.length > 0) {
                        // Check if all prerequisites are met
                        const unmetPrereqs = course.prerequisites.filter(prereq => {
                            // Find the prerequisite course
                            const prereqCourse = courses.find(c => 
                                c.code === prereq || c.name === prereq);
                            
                            // If we can't find the prerequisite course, consider it unmet
                            if (!prereqCourse) return true;
                            
                            // Check if the prerequisite is completed
                            return !completedCourseIds.includes(prereqCourse._id);
                        });
                        
                        if (unmetPrereqs.length > 0) {
                            status = 'locked';
                        }
                    }
                    
                    // Format prerequisites display
                    let prereqHtml = '';
                    if (course.prerequisites && course.prerequisites.length > 0) {
                        prereqHtml = '<div class="prerequisites">';
                        prereqHtml += '<span>Prerequisites: </span>';
                        
                        prereqHtml += course.prerequisites.map(prereq => {
                            // Find the prerequisite course
                            const prereqCourse = courses.find(c => 
                                c.code === prereq || c.name === prereq);
                            
                            // Determine the status of the prerequisite
                            let prereqStatus = 'unmet';
                            if (prereqCourse && completedCourseIds.includes(prereqCourse._id)) {
                                prereqStatus = 'met';
                            }
                            
                            return `<span class="prereq-item ${prereqStatus}">${prereq}</span>`;
                        }).join(', ');
                        
                        prereqHtml += '</div>';
                    }
                    
                    html += `
                        <li class="course-item ${status}" data-course-id="${course._id}">
                            <div class="course-header">
                                <span class="course-code">${course.code}</span>
                                <span class="course-name">${course.name}</span>
                                <span class="course-status">${getStatusText(status)}</span>
                            </div>
                            ${prereqHtml}
                        </li>
                    `;
                });
                
                html += `
                        </ul>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        requirementsContainer.innerHTML = html;
        
        // Now generate the prerequisite tree
        generatePrerequisiteTree(courses, completedCourseIds);
        
    } catch (err) {
        console.error('Error loading requirements:', err);
        const requirementsContainer = document.querySelector('.course-requirements');
        requirementsContainer.innerHTML = `<div class="error">Error loading requirements: ${err.message}</div>`;
        
        // Also update stats to show error
        const statsContainer = document.querySelector('.course-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `<div class="error">Unable to load course statistics</div>`;
        }
    }
}
// Helper function to get full department name
function getDepartmentName(code) {
    const departments = {
        'CS': 'Computer Science',
        'SE': 'Software Engineering',
        'ENG': 'Engineering',
        'AI': 'Artificial Intelligence',
        'ML': 'Machine Learning'
    };
    
    return departments[code] || code;
}

// Helper function to get status text
function getStatusText(status) {
    switch (status) {
        case 'completed': return 'Completed';
        case 'registered': return 'Registered';
        case 'locked': return 'Prerequisites Required';
        case 'available': return 'Available';
        default: return '';
    }
}

// Function to generate a visual prerequisite tree
function generatePrerequisiteTree(courses, completedCourseIds) {
    const treeContainer = document.getElementById('prerequisite-tree-content');
    treeContainer.innerHTML = '';
    
    // Create a visualization using a simple list structure with levels
    const buildCourseTree = (course, depth = 0, visited = new Set()) => {
        // Prevent infinite loops from circular references
        if (visited.has(course.code)) {
            return '';
        }
        visited.add(course.code);
        
        const isCompleted = completedCourseIds.includes(course._id);
        const spacing = '&nbsp;'.repeat(depth * 4);
        
        let html = `<div class="tree-node ${isCompleted ? 'completed' : ''}" style="padding-left: ${depth * 20}px">
            <span class="tree-connector">${depth > 0 ? '└─ ' : ''}</span>
            <span class="tree-course">${course.code}: ${course.name}</span>
        </div>`;
        
        // Check and add prerequisites
        if (course.prerequisites && course.prerequisites.length > 0) {
            for (const prereqCode of course.prerequisites) {
                const prereqCourse = courses.find(c => c.code === prereqCode || c.name === prereqCode);
                if (prereqCourse) {
                    html += buildCourseTree(prereqCourse, depth + 1, new Set([...visited]));
                } else {
                    // Prerequisite course not found in the system
                    html += `<div class="tree-node" style="padding-left: ${(depth + 1) * 20}px">
                        <span class="tree-connector">└─ </span>
                        <span class="tree-course unknown">${prereqCode} (Unknown)</span>
                    </div>`;
                }
            }
        }
        
        return html;
    };
    
    // Filter to just show courses with prerequisites or which are prerequisites
    const coursesWithPrereqs = courses.filter(course => 
        (course.prerequisites && course.prerequisites.length > 0));
    
    // Also include courses that are prerequisites for other courses
    const allPrereqCodes = new Set();
    courses.forEach(course => {
        if (course.prerequisites) {
            course.prerequisites.forEach(prereq => allPrereqCodes.add(prereq));
        }
    });
    
    const prerequisiteCourses = courses.filter(course => 
        allPrereqCodes.has(course.code) && !coursesWithPrereqs.includes(course));
    
    // Combine both lists (without duplicates)
    const relevantCourses = [...coursesWithPrereqs];
    prerequisiteCourses.forEach(course => {
        if (!relevantCourses.some(c => c._id === course._id)) {
            relevantCourses.push(course);
        }
    });
    
    // Group by department
    const coursesByDept = {};
    relevantCourses.forEach(course => {
        if (!coursesByDept[course.department]) {
            coursesByDept[course.department] = [];
        }
        coursesByDept[course.department].push(course);
    });
    
    // Build the tree for each department
    let treeHtml = '<div class="prerequisite-forest">';
    
    for (const dept in coursesByDept) {
        treeHtml += `<div class="dept-tree">
            <h4>${getDepartmentName(dept)}</h4>
        `;
        
        // Sort courses by level
        const sortedCourses = coursesByDept[dept].sort((a, b) => 
            parseInt(a.level) - parseInt(b.level));
        
        // Generate tree for top-level courses (ones that aren't prerequisites for others)
        sortedCourses.forEach(course => {
            const isPrereqForAnother = courses.some(c => 
                c.prerequisites && c.prerequisites.includes(course.code));
            
            if (!isPrereqForAnother) {
                treeHtml += buildCourseTree(course);
            }
        });
        
        treeHtml += '</div>';
    }
    
    treeHtml += '</div>';
    treeContainer.innerHTML = treeHtml;
    
    // Add click handlers for expanding/collapsing
    document.querySelectorAll('.tree-node').forEach(node => {
        node.addEventListener('click', function() {
            this.classList.toggle('expanded');
            
            // Find all child nodes
            const depth = parseInt(this.style.paddingLeft) / 20;
            let nextNode = this.nextElementSibling;
            
            while (nextNode && parseInt(nextNode.style.paddingLeft) / 20 > depth) {
                nextNode.classList.toggle('hidden');
                nextNode = nextNode.nextElementSibling;
            }
        });
    });
}
const pendingSubscriptions = new Set();

async function subscribeToCourse(courseCode) {
    try {
        console.log(`Subscribe function called for course: ${courseCode}`);
        
        // Check if we're already processing a subscription for this course
        if (pendingSubscriptions.has(courseCode)) {
            console.log('Subscription already in progress for:', courseCode);
            return;
        }
        
        // Add to pending set
        pendingSubscriptions.add(courseCode);
        
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('userName');
        
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        if (!username) {
            throw new Error('Username not found. Please log in again.');
        }
        
        console.log('Subscribing to course:', courseCode);
        
        // Disable button immediately to prevent multiple clicks
        const subscribeButton = document.querySelector(`.subscribe-btn[data-code="${courseCode}"]`);
        if (subscribeButton) {
            subscribeButton.disabled = true;
            subscribeButton.textContent = 'Subscribing...';
        }
        
        const response = await fetch('http://localhost:3000/api/reports/subscribe', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                courseCode: courseCode
            })
        });
        
        const responseData = await response.json();
        console.log('Subscription response:', responseData);
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to subscribe to course');
        }
        
        // Use a separate function for showing the alert to avoid multiple alerts
        showSuccessMessage(courseCode);
        
        // Update the button to show subscription status
        if (subscribeButton) {
            subscribeButton.textContent = 'Subscribed';
            subscribeButton.disabled = true;
            subscribeButton.classList.add('subscribed');
        }
    } catch (err) {
        console.error('Error subscribing to course:', err);
        showErrorMessage(err.message);
        
        // Reset button if there was an error
        const subscribeButton = document.querySelector(`.subscribe-btn[data-code="${courseCode}"]`);
        if (subscribeButton) {
            subscribeButton.disabled = false;
            subscribeButton.textContent = 'Subscribe';
        }
    } finally {
        // Remove from pending set regardless of success/failure
        pendingSubscriptions.delete(courseCode);
    }
}

// Separate the alert functions to avoid multiple alerts
function showSuccessMessage(courseCode) {
    // Use a timeout to ensure this doesn't get called multiple times in quick succession
    setTimeout(() => {
        alert(`Successfully subscribed to ${courseCode}. You will be notified when a spot becomes available.`);
    }, 100);
}

function showErrorMessage(message) {
    // Use a timeout to ensure this doesn't get called multiple times in quick succession
    setTimeout(() => {
        alert(`Error: ${message}`);
    }, 100);
}

// Add this function to attach event listeners safely
function setupSubscribeButtons() {
    // Find all subscribe buttons
    const buttons = document.querySelectorAll('.subscribe-btn');
    
    // First, remove any existing event listeners to prevent duplicates
    buttons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add the click event listener
        newButton.addEventListener('click', function(event) {
            event.preventDefault();
            const courseCode = this.getAttribute('data-code');
            subscribeToCourse(courseCode);
        });
    });
    
    console.log(`Set up ${buttons.length} subscribe buttons`);
}

// Make sure to call this function when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupSubscribeButtons();
    console.log('Event listeners for subscribe buttons have been set up');
});
//
// Sample notification data (replace with your actual data source)


// Function to initialize notifications page
function initNotificationsPage() {
    displayNotifications(sampleNotifications);
    setupNotificationSearch();
    setupMarkAllRead();
}



// Format date to be more readable
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Setup notification search functionality
function setupNotificationSearch() {
    const searchInput = document.getElementById('notification-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (searchTerm.trim() === '') {
            displayNotifications(sampleNotifications);
        } else {
            const filteredNotifications = sampleNotifications.filter(notification => 
                notification.message.toLowerCase().includes(searchTerm) || 
                notification.id.toString().includes(searchTerm) ||
                notification.status.toLowerCase().includes(searchTerm)
            );
            
            displayNotifications(filteredNotifications);
        }
    });
}

// Setup "Mark All as Read" button
function setupMarkAllRead() {
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    
    markAllReadBtn.addEventListener('click', function() {
        // Update all unread notifications to read
        sampleNotifications.forEach(notification => {
            if (notification.status === 'unread') {
                notification.status = 'read';
            }
        });
        
        // Refresh the table
        displayNotifications(sampleNotifications);
    });
}

// Setup action buttons (Mark as Read, Delete)
function setupActionButtons() {
    // Mark as Read buttons
    document.querySelectorAll('.mark-read').forEach(button => {
        button.addEventListener('click', function() {
            const notificationId = parseInt(this.dataset.id);
            
            // Find and update the notification status
            const notification = sampleNotifications.find(n => n.id === notificationId);
            if (notification) {
                notification.status = 'read';
                displayNotifications(sampleNotifications);
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', function() {
            const notificationId = parseInt(this.dataset.id);
            
            // Remove the notification from the array
            const index = sampleNotifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                sampleNotifications.splice(index, 1);
                displayNotifications(sampleNotifications);
            }
        });
    });
}

// Initialize the notifications when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // This will handle the notifications page when it becomes visible
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageName = this.getAttribute('data-page');
            if (pageName === 'notifications') {
                initNotificationsPage();
            }
        });
    });
    
    // If the notifications page is visible on load, initialize it
    if (!document.getElementById('notifications-page').classList.contains('hidden')) {
        initNotificationsPage();
    }
});
// Global variables for notifications
let notificationsData = [];
let currentStudentId = null;

// Initialize notifications functionality when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're in the student dashboard
    if (localStorage.getItem('userRole') === 'student') {
        initializeNotifications();
    }
});

// Initialize notifications
function initializeNotifications() {
    // Get the notifications tab element and add click event
    const notificationsTab = document.querySelector('.nav-item[data-page="notifications"]');
    if (notificationsTab) {
        notificationsTab.addEventListener('click', function() {
            fetchNotifications();
        });
    }

    // Setup notification search functionality
    setupNotificationSearch();
    
    // Setup status filter
    setupStatusFilter();
    
    // Setup modal events
    setupNotificationModalEvents();
}

// Fetch student ID based on the username from localStorage
async function getStudentId() {
    if (currentStudentId) return currentStudentId;
    
    try {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('userName');
        
        if (!token || !username) {
            console.error('No token or username found');
            return null;
        }
        
        // Fetch student profile to get the ID
        const response = await fetch('http://localhost:3000/api/students/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch student profile: ${response.status}`);
        }
        
        const student = await response.json();
        currentStudentId = student._id;
        return currentStudentId;
        
    } catch (err) {
        console.error('Error fetching student ID:', err);
        return null;
    }
}

// Fetch notifications from the API
async function fetchNotifications() {
    try {
        const studentId = await getStudentId();
        if (!studentId) {
            showNoNotificationsMessage('Unable to fetch your data. Please try logging in again.');
            return;
        }
        
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3000/api/notifications/student/${studentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch notifications: ${response.status}`);
        }
        
        notificationsData = await response.json();
        displayNotifications(notificationsData);
        
        // Show notification count in the sidebar
        updateUnreadNotificationCount();
        
    } catch (err) {
        console.error('Error fetching notifications:', err);
        showNoNotificationsMessage('Error loading notifications. Please try again later.');
    }
}

// Display notifications in the UI
function displayNotifications(notifications) {
    const notificationsList = document.getElementById('notifications-list');
    const noNotificationsElement = document.querySelector('.no-notifications');
    
    // Clear current list
    notificationsList.innerHTML = '';
    
    // Add back the "no notifications" element
    notificationsList.appendChild(noNotificationsElement);
    
    if (notifications.length === 0) {
        noNotificationsElement.classList.remove('hidden');
        return;
    }
    
    noNotificationsElement.classList.add('hidden');
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.status}`;
        notificationItem.dataset.id = notification._id;
        
        // Format the date
        const createdDate = new Date(notification.createdAt);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = createdDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        notificationItem.innerHTML = `
            <div class="notification-header">
                <div class="notification-time">${formattedDate} at ${formattedTime}</div>
                <div class="notification-status status-${notification.status}">${notification.status}</div>
            </div>
            <div class="notification-message">${notification.message}</div>
        `;
        
        // Add click event to open notification details
        notificationItem.addEventListener('click', () => {
            openNotificationModal(notification);
        });
        
        notificationsList.appendChild(notificationItem);
    });
}

// Show no notifications message
function showNoNotificationsMessage(message = 'You don\'t have any notifications at this time.') {
    const noNotificationsElement = document.querySelector('.no-notifications');
    noNotificationsElement.querySelector('p').textContent = message;
    noNotificationsElement.classList.remove('hidden');
}

// Update unread notification count in the sidebar
function updateUnreadNotificationCount() {
    const unreadCount = notificationsData.filter(n => n.status === 'unread').length;
    const notificationsTab = document.querySelector('.nav-item[data-page="notifications"]');
    
    if (notificationsTab) {
        // Remove existing badge if any
        const existingBadge = notificationsTab.querySelector('.notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add new badge if there are unread notifications
        if (unreadCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = unreadCount;
            notificationsTab.appendChild(badge);
        }
    }
}

// Setup notification search functionality
function setupNotificationSearch() {
    const searchInput = document.getElementById('notification-search');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = document.getElementById('notification-status-filter').value;
        
        let filteredNotifications = notificationsData;
        
        // Apply status filter if selected
        if (statusFilter) {
            filteredNotifications = filteredNotifications.filter(
                notification => notification.status === statusFilter
            );
        }
        
        // Apply search term if entered
        if (searchTerm) {
            filteredNotifications = filteredNotifications.filter(
                notification => notification.message.toLowerCase().includes(searchTerm)
            );
        }
        
        displayNotifications(filteredNotifications);
    });
}

// Setup status filter
function setupStatusFilter() {
    const statusFilter = document.getElementById('notification-status-filter');
    
    statusFilter.addEventListener('change', () => {
        const searchTerm = document.getElementById('notification-search').value.toLowerCase();
        const selectedStatus = statusFilter.value;
        
        let filteredNotifications = notificationsData;
        
        // Apply status filter if selected
        if (selectedStatus) {
            filteredNotifications = filteredNotifications.filter(
                notification => notification.status === selectedStatus
            );
        }
        
        // Apply search term if entered
        if (searchTerm) {
            filteredNotifications = filteredNotifications.filter(
                notification => notification.message.toLowerCase().includes(searchTerm)
            );
        }
        
        displayNotifications(filteredNotifications);
    });
}

// Open notification modal with details
function openNotificationModal(notification) {
    const modal = document.getElementById('notification-modal');
    const idField = document.getElementById('notification-id');
    const dateField = document.getElementById('notification-date');
    const messageField = document.getElementById('notification-message-text');
    const markReadBtn = document.getElementById('mark-read-btn');
    
    // Format date
    const createdDate = new Date(notification.createdAt);
    const formattedDate = createdDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Populate modal fields
    idField.value = notification._id;
    dateField.textContent = formattedDate;
    messageField.textContent = notification.message;
    
    // Show/hide mark as read button based on status
    if (notification.status === 'unread') {
        markReadBtn.classList.remove('hidden');
    } else {
        markReadBtn.classList.add('hidden');
    }
    
    // Show modal
    modal.classList.remove('hidden');
}

// Setup modal events
function setupNotificationModalEvents() {
    const modal = document.getElementById('notification-modal');
    const closeButton = modal.querySelector('.close-button');
    const cancelButton = modal.querySelector('.cancel-btn');
    const markReadBtn = document.getElementById('mark-read-btn');
    
    // Close on X button
    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Close on Cancel button
    cancelButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Mark as read functionality
    markReadBtn.addEventListener('click', async () => {
        const notificationId = document.getElementById('notification-id').value;
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to mark notification as read: ${response.status}`);
            }
            
            // Update the notification in our data
            const updatedNotification = await response.json();
            const index = notificationsData.findIndex(n => n._id === updatedNotification._id);
            
            if (index !== -1) {
                notificationsData[index] = updatedNotification;
                
                // Refresh the display
                const statusFilter = document.getElementById('notification-status-filter').value;
                const searchTerm = document.getElementById('notification-search').value.toLowerCase();
                
                let filteredNotifications = notificationsData;
                
                if (statusFilter) {
                    filteredNotifications = filteredNotifications.filter(
                        notification => notification.status === statusFilter
                    );
                }
                
                if (searchTerm) {
                    filteredNotifications = filteredNotifications.filter(
                        notification => notification.message.toLowerCase().includes(searchTerm)
                    );
                }
                
                displayNotifications(filteredNotifications);
                updateUnreadNotificationCount();
            }
            
            // Close the modal
            modal.classList.add('hidden');
            
        } catch (err) {
            console.error('Error marking notification as read:', err);
            alert('Failed to mark notification as read. Please try again.');
        }
    });
}

// Add CSS styles for the notification badge to the sidebar
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification-badge {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: var(--primary-neon);
            color: var(--darker);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 0 8px var(--primary-glow);
        }
        
        .nav-item {
            position: relative;
        }
    `;
    document.head.appendChild(style);
}

// Call this function to add the styles
addNotificationStyles();

// Initialize notifications when the dashboard is shown
// This assumes your auth.js file calls showStudentDashboard() after successful login
const originalShowStudentDashboard = window.showStudentDashboard;
window.showStudentDashboard = function() {
    originalShowStudentDashboard();
    setTimeout(() => {
        fetchNotifications();
    }, 1000);
};

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initStudentDashboard);