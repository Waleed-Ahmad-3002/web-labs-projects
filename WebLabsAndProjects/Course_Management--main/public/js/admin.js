// public/js/admin.js

function initAdminDashboard() {
    displayAdminInfo();
    loadCourses();
    loadStudents();
    initAdminNavigation();
    initAdminActions();
    initAdminLogout();
    updateDashboardStats();
}
//done
function displayAdminInfo() {
    const adminName = localStorage.getItem('userName') || 'Admin';
    document.getElementById('admin-name').textContent = adminName;
}

//done
async function loadCourses() {
    const coursesTbody = document.getElementById('courses-tbody');
    coursesTbody.innerHTML = '';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('courses-error', 'You are not logged in.');
            return;
        }
        
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
        
        if (courses.length === 0) {
            coursesTbody.innerHTML = '<tr><td colspan="6" class="no-data">No courses available</td></tr>';
            return;
        }
        
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.code}</td>
                <td>${course.name}</td>
                <td>${course.department}</td>
                <td>${course.schedule}</td>
                <td>${course.seats}</td>
                <td>
                    <button class="edit-course-btn" data-id="${course._id}">Edit</button>
                    <button class="delete-course-btn" data-id="${course._id}">Delete</button>
                </td>
            `;
            coursesTbody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-course-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-id');
                editCourse(courseId);
            });
        });
        
        document.querySelectorAll('.delete-course-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-id');
                confirmDeleteCourse(courseId);
            });
        });
        
    } catch (err) {
        console.error('Error loading courses:', err);
        coursesTbody.innerHTML = `<tr><td colspan="6" class="error">Error: ${err.message}</td></tr>`;
    }
}
//done
/*
async function loadStudents() {
    console.log('Loading students...');
    const studentsTbody = document.getElementById('students-tbody');
    studentsTbody.innerHTML = '';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('students-error', 'You are not logged in.');
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/students/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Server returned ${response.status}: ${responseText}`);
        }
        
        const students = await response.json();
        console.log('Students loaded:', students);
        
        if (students.length === 0) {
            studentsTbody.innerHTML = '<tr><td colspan="5" class="no-data">No students available</td></tr>';
            return;
        }
        
        students.forEach(student => {
            console.log(`Processing student: ${student.username} (ID: ${student._id})`);
            
            // Create registered courses cell with remove buttons per course
            let registeredCoursesHtml = 'None';
            
            if (Array.isArray(student.registeredCourses) && student.registeredCourses.length > 0) {
                console.log(`Student ${student.username} has ${student.registeredCourses.length} registered courses:`, student.registeredCourses);
                registeredCoursesHtml = '<ul class="course-list">';
                student.registeredCourses.forEach(course => {
                    // Make sure we handle both populated objects and course IDs
                    const courseId = course._id || course;
                    const courseName = course.name || 'Unknown Course';
                    
                    console.log(`  Course: ${courseName} (ID: ${courseId})`);
                    
                    registeredCoursesHtml += `
                        <li>
                            ${courseName}
                             <button class="update-course-btn" 
                                data-student-id="${student._id}" 
                                data-course-id="${courseId}"
                                data-course-name="${courseName}">
                                ✎
                            </button>
                            <button class="remove-course-btn" 
                                data-student-id="${student._id}" 
                                data-course-id="${courseId}">
                                ✕
                            </button>
                        </li>
                    `;
                });
                registeredCoursesHtml += '</ul>';
            }
            
            // Create completed courses cell with a list format like registered courses but without buttons
            let completedCoursesHtml = 'None';
            
            if (Array.isArray(student.completedCourses) && student.completedCourses.length > 0) {
                console.log(`Student ${student.username} has ${student.completedCourses.length} completed courses:`, student.completedCourses);
                completedCoursesHtml = '<ul class="course-list">';
                student.completedCourses.forEach(course => {
                    // Make sure we handle both populated objects and course IDs
                    const courseId = course._id || course;
                    const courseName = course.name || 'Unknown Course';
                    
                    console.log(`  Completed Course: ${courseName} (ID: ${courseId})`);
                    
                    completedCoursesHtml += `
                        <li>
                            ${courseName}
                        </li>
                    `;
                });
                completedCoursesHtml += '</ul>';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.username}</td>
                <td>${student.name || 'N/A'}</td>
                <td>${registeredCoursesHtml}</td>
                <td>${completedCoursesHtml}</td>
                <td>
                    <button class="edit-student-btn" data-id="${student._id}">Edit</button>
                </td>
            `;
            studentsTbody.appendChild(row);
        });
        
        // Add event listeners for the remove course buttons
        document.querySelectorAll('.remove-course-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const studentId = this.getAttribute('data-student-id');
                const courseId = this.getAttribute('data-course-id');
                console.log(`Remove button clicked for student ID: ${studentId}, course ID: ${courseId}`);
                confirmRemoveCourse(studentId, courseId);
            });
        });
        
        // Add event listeners for the update course buttons
        document.querySelectorAll('.update-course-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const studentId = this.getAttribute('data-student-id');
                const courseId = this.getAttribute('data-course-id');
                const courseName = this.getAttribute('data-course-name');
                console.log(`Update button clicked for student ID: ${studentId}, course ID: ${courseId}`);
                showUpdateCourseModal(studentId, courseId, courseName);
            });
        });
        
    } catch (err) {
        console.error('Error loading students:', err);
        studentsTbody.innerHTML = `<tr><td colspan="5" class="error">Error: ${err.message}</td></tr>`;
    }
}*/
async function loadStudents() {
    console.log('Loading students...');
    const studentsTbody = document.getElementById('students-tbody');
    studentsTbody.innerHTML = '';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('students-error', 'You are not logged in.');
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/students/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Server returned ${response.status}: ${responseText}`);
        }
        
        const students = await response.json();
        console.log('Students loaded:', students);
        
        if (students.length === 0) {
            studentsTbody.innerHTML = '<tr><td colspan="4" class="no-data">No students available</td></tr>';
            return;
        }
        
        students.forEach(student => {
            console.log(`Processing student: ${student.username} (ID: ${student._id})`);
            
            // Create completed courses cell with a list format
            let completedCoursesHtml = 'None';
            
            if (Array.isArray(student.completedCourses) && student.completedCourses.length > 0) {
                console.log(`Student ${student.username} has ${student.completedCourses.length} completed courses:`, student.completedCourses);
                completedCoursesHtml = '<ul class="course-list">';
                student.completedCourses.forEach(course => {
                    // Make sure we handle both populated objects and course IDs
                    const courseId = course._id || course;
                    const courseName = course.name || 'Unknown Course';
                    
                    console.log(`  Completed Course: ${courseName} (ID: ${courseId})`);
                    
                    completedCoursesHtml += `
                        <li>
                            ${courseName}
                        </li>
                    `;
                });
                completedCoursesHtml += '</ul>';
            }
            
            // Create registered courses cell with update and delete buttons per course
            let registeredCoursesHtml = 'None';
            
            if (Array.isArray(student.registeredCourses) && student.registeredCourses.length > 0) {
                console.log(`Student ${student.username} has ${student.registeredCourses.length} registered courses:`, student.registeredCourses);
                registeredCoursesHtml = '<ul class="course-list">';
                student.registeredCourses.forEach(course => {
                    // Make sure we handle both populated objects and course IDs
                    const courseId = course._id || course;
                    const courseName = course.name || 'Unknown Course';
                    
                    console.log(`  Course: ${courseName} (ID: ${courseId})`);
                    
                    registeredCoursesHtml += `
                        <li>
                            ${courseName}
                            <div class="course-buttons">
                                <button class="update-course-btn" 
                                    data-student-id="${student._id}" 
                                    data-course-id="${courseId}"
                                    data-course-name="${courseName}">
                                    Update
                                </button>
                                <button class="remove-course-btn" 
                                    data-student-id="${student._id}" 
                                    data-course-id="${courseId}">
                                    Delete
                                </button>
                            </div>
                        </li>
                    `;
                });
                registeredCoursesHtml += '</ul>';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.username}</td>
                <td>${student.name || 'N/A'}</td>
                <td>${completedCoursesHtml}</td>
                <td>${registeredCoursesHtml}</td>
            `;
            studentsTbody.appendChild(row);
        });
        
        // Add event listeners for the remove course buttons
        document.querySelectorAll('.remove-course-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const studentId = this.getAttribute('data-student-id');
                const courseId = this.getAttribute('data-course-id');
                console.log(`Delete button clicked for student ID: ${studentId}, course ID: ${courseId}`);
                confirmRemoveCourse(studentId, courseId);
            });
        });
        
        // Add event listeners for the update course buttons
        document.querySelectorAll('.update-course-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const studentId = this.getAttribute('data-student-id');
                const courseId = this.getAttribute('data-course-id');
                const courseName = this.getAttribute('data-course-name');
                console.log(`Update button clicked for student ID: ${studentId}, course ID: ${courseId}`);
                showUpdateCourseModal(studentId, courseId, courseName);
            });
        });
        
    } catch (err) {
        console.error('Error loading students:', err);
        studentsTbody.innerHTML = `<tr><td colspan="4" class="error">Error: ${err.message}</td></tr>`;
    }
}
function hideModal(modalId = 'confirmation-modal') {
    document.getElementById(modalId).classList.add('hidden');
}

function confirmRemoveCourse(studentId, courseId) {
    console.log(`Confirming removal - Student ID: ${studentId}, Course ID: ${courseId}`);
    
    // Using the confirmation modal
    const confirmModal = document.getElementById('confirmation-modal');
    const confirmTitle = document.getElementById('confirmation-title');
    const confirmMessage = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    confirmTitle.textContent = 'Remove Course';
    confirmMessage.textContent = `Are you sure you want to remove this course (ID: ${courseId}) from the student (ID: ${studentId})?`;
    
    confirmModal.classList.remove('hidden');
    
    // Remove previous event listeners
    const cloneConfirmBtn = confirmBtn.cloneNode(true);
    const cloneCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(cloneConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(cloneCancelBtn, cancelBtn);
    
    // Add new event listeners
    cloneConfirmBtn.addEventListener('click', async function() {
        console.log(`Confirm button clicked for removing course ID: ${courseId} from student ID: ${studentId}`);
        try {
            await removeStudentCourse(studentId, courseId);
            console.log('Course removed successfully');
            hideModal();
            loadStudents(); // Refresh the students list
            updateDashboardStats(); // If you have this function
        } catch (err) {
            console.error('Error removing course:', err);
            alert(`Error: ${err.message}`);
        }
    });
    
    cloneCancelBtn.addEventListener('click', function() {
        console.log('Removal canceled');
        hideModal();
    });
}
/*
async function removeStudentCourse(studentId, courseId) {
    console.log(`Removing course - API call initiated - Student ID: ${studentId}, Course ID: ${courseId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('You are not logged in.');
    }
    
    // Fix the API URL to match the correct route pattern
    const apiUrl = `http://localhost:3000/api/students/${studentId}/courses/${courseId}`;
    console.log(`API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
        const error = await response.json();
        console.error('API error response:', error);
        throw new Error(error.message || 'Failed to remove course from student');
    }
    
    // Return the response data if needed
    const responseData = await response.json();
    console.log('API success response:', responseData);
    return responseData;
}*/
async function removeStudentCourse(studentId, courseId) {
    console.log(`Removing course ${courseId} from student ${studentId}...`);
    
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('You are not logged in.');
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/students/${studentId}/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to remove course: ${errorData}`);
        }
        
        const result = await response.json();
        console.log('Course removed successfully:', result);
        return result;
    } catch (error) {
        console.error('Error in removeStudentCourse:', error);
        throw error;
    }
}
//workingggggggggggggggggggggggggggg
// FRONTEND - Function to update student course
// Show the update course modal with available courses
async function showUpdateCourseModal(studentId, courseId, courseName) {
    console.log(`Opening update modal for student ID: ${studentId}, course ID: ${courseId}, course name: ${courseName}`);
    
    const updateModal = document.getElementById('update-course-modal');
    const updateTitle = document.getElementById('update-course-title');
    const updateMessage = document.getElementById('update-course-message');
    const courseSelect = document.getElementById('update-course-select');
    const updateBtn = document.getElementById('update-course-confirm-btn');
    const cancelBtn = document.getElementById('update-course-cancel-btn');
    const errorElement = document.getElementById('update-course-error');
    
    // Clear previous error messages
    errorElement.textContent = '';
    
    updateTitle.textContent = 'Update Course';
    updateMessage.textContent = `Select a new course to replace "${courseName}":`;
    
    // Clear previous options
    courseSelect.innerHTML = '';
    
    try {
        // Fetch available courses
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        const response = await fetch('http://localhost:3000/api/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to fetch courses: ${errorData}`);
        }
        
        const courses = await response.json();
        console.log('Available courses:', courses);
        
        // Populate the select dropdown with courses
        courses.forEach(course => {
            // Skip the current course
            if (course._id === courseId) return;
            
            const option = document.createElement('option');
            option.value = course._id;
            option.textContent = `${course.name} (${course.code})`;
            courseSelect.appendChild(option);
        });
        
        if (courseSelect.options.length === 0) {
            // No other courses available
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No other courses available';
            courseSelect.appendChild(option);
            updateBtn.disabled = true;
        } else {
            updateBtn.disabled = false;
        }
        
        // Show the modal
        updateModal.classList.remove('hidden');
        
        // Remove previous event listeners
        const cloneUpdateBtn = updateBtn.cloneNode(true);
        const cloneCancelBtn = cancelBtn.cloneNode(true);
        updateBtn.parentNode.replaceChild(cloneUpdateBtn, updateBtn);
        cancelBtn.parentNode.replaceChild(cloneCancelBtn, cancelBtn);
        
        // Add new event listeners
        cloneUpdateBtn.addEventListener('click', async function() {
            console.log('Update button clicked');
            try {
                const newCourseId = courseSelect.value;
                if (!newCourseId) {
                    errorElement.textContent = 'Please select a course';
                    return;
                }
                
                console.log(`Updating course for student ${studentId}: ${courseId} -> ${newCourseId}`);
                await updateStudentCourse(studentId, courseId, newCourseId);
                
                hideModal('update-course-modal');
                loadStudents(); // Refresh the students list
                updateDashboardStats(); // If you have this function
            } catch (err) {
                console.error('Error updating course:', err);
                errorElement.textContent = `Error: ${err.message}`;
            }
        });
        
        cloneCancelBtn.addEventListener('click', function() {
            console.log('Update canceled');
            hideModal('update-course-modal');
        });
        
    } catch (err) {
        console.error('Error setting up update modal:', err);
        errorElement.textContent = `Error: ${err.message}`;
    }
}

// Function to call the API to update a student's course
async function updateStudentCourse(studentId, oldCourseId, newCourseId) {
    console.log(`Updating course for student ${studentId}: ${oldCourseId} -> ${newCourseId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('You are not logged in.');
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/students/${studentId}/courses/${oldCourseId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newCourseId: newCourseId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to update course: ${errorData}`);
        }
        
        const result = await response.json();
        console.log('Course updated successfully:', result);
        return result;
    } catch (error) {
        console.error('Error in updateStudentCourse:', error);
        throw error;
    }
}
//done
function initAdminActions() {
    const addCourseBtn = document.getElementById('add-course-btn');
    addCourseBtn.addEventListener('click', function () {
        showCourseModal();
    });

    // Important: Use the form's submit event instead of the button's click event
    const courseForm = document.getElementById('course-form');
    courseForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission
        saveCourse();
    });

    const closeButtons = document.querySelectorAll('.close-button, .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            hideModal();
        });
    });
    const studentSearch = document.getElementById('admin-student-search');
    if (studentSearch) {
        studentSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#students-tbody tr');
            
            rows.forEach(row => {
                // Get the Roll Number from the first column (index 0)
                const rollNumber = row.cells[0].textContent.toLowerCase();
                if (rollNumber.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });}
    // Search functionality for courses
    const courseSearch = document.getElementById('admin-course-search');
    if (courseSearch) {
        courseSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#courses-tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
}
//done
function showCourseModal(courseData = null) {
    const modal = document.getElementById('course-modal');
    modal.classList.remove('hidden');
    
    // Clear previous form data
    document.getElementById('course-form').reset();
    
    // If editing an existing course, populate the form
    if (courseData) {
        document.getElementById('course-id').value = courseData._id;
        document.getElementById('course-code').value = courseData.code;
        document.getElementById('course-name').value = courseData.name;
        document.getElementById('course-department').value = courseData.department;
        document.getElementById('course-level').value = courseData.level;
        document.getElementById('course-schedule').value = courseData.schedule;
        document.getElementById('course-seats').value = courseData.seats;
        document.getElementById('course-prerequisites').value = courseData.prerequisites ? courseData.prerequisites.join(', ') : '';
        
        // Disable course code editing for existing courses
        document.getElementById('course-code').disabled = true;
        document.getElementById('modal-title').textContent = 'Edit Course';
    } else {
        // Clear the course ID value for new courses
        document.getElementById('course-id').value = '';
        document.getElementById('course-code').disabled = false;
        document.getElementById('modal-title').textContent = 'Add New Course';
    }
}
//done
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    } else {
        alert(message);
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
}
function showCourseModal(courseData = null) {
    const modal = document.getElementById('course-modal');
    modal.classList.remove('hidden');
    
    // Clear previous form data
    document.getElementById('course-form').reset();
    
    // If editing an existing course, populate the form
    if (courseData) {
        console.log('Populating form with:', courseData); // Log the course data
        document.getElementById('course-id').value = courseData._id;
        document.getElementById('course-code').value = courseData.code;
        document.getElementById('course-name').value = courseData.name;
        document.getElementById('course-department').value = courseData.department;
        document.getElementById('course-level').value = courseData.level;
        document.getElementById('course-schedule').value = courseData.schedule;
        document.getElementById('course-seats').value = courseData.seats;
        document.getElementById('course-prerequisites').value = courseData.prerequisites ? courseData.prerequisites.join(', ') : '';
        
        // Disable course code editing for existing courses
        document.getElementById('course-code').disabled = true;
        document.getElementById('modal-title').textContent = 'Edit Course';
    } else {
        document.getElementById('course-id').value = '';
        document.getElementById('course-code').disabled = false;
        document.getElementById('modal-title').textContent = 'Add New Course';
    }
}

async function saveCourse() {
    const courseId = document.getElementById('course-id').value;
    const courseCode = document.getElementById('course-code').value;
    const courseName = document.getElementById('course-name').value;
    const courseDepartment = document.getElementById('course-department').value;
    const courseLevel = document.getElementById('course-level').value;
    const courseSchedule = document.getElementById('course-schedule').value;
    const courseSeats = document.getElementById('course-seats').value;
    const coursePrerequisitesString = document.getElementById('course-prerequisites').value;
    
    // Split prerequisites by comma and trim whitespace
    const prerequisites = coursePrerequisitesString
        ? coursePrerequisitesString.split(',').map(code => code.trim())
        : [];

    if (!courseCode || !courseName || !courseDepartment || !courseLevel || !courseSchedule || !courseSeats) {
        alert('Please fill in all required fields.');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('course-error', 'You are not logged in.');
            return;
        }
        
        const courseData = {
            code: courseCode,
            name: courseName,
            department: courseDepartment,
            level: courseLevel,
            schedule: courseSchedule,
            seats: parseInt(courseSeats),
            prerequisites
        };
        
        console.log("Saving course data:", courseData);
        console.log("Course ID:", courseId);
        
        let url = 'http://localhost:3000/api/courses';
        let method = 'POST';
        
        // If we have an ID, we're updating an existing course
        if (courseId) {
            url = `${url}/${courseId}`;
            method = 'PUT';
        }
        
        console.log(`Making ${method} request to ${url}`);
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to ${courseId ? 'update' : 'create'} course`);
        }
        
        hideModal();
        loadCourses(); // Refresh the courses list
        updateDashboardStats();
        alert(`Course ${courseId ? 'updated' : 'created'} successfully!`);
        
    } catch (err) {
        console.error(`Error ${courseId ? 'updating' : 'creating'} course:`, err);
        alert(`Error: ${err.message}`);
    }
}
async function confirmDeleteCourse(courseId) {
    // Using the confirmation modal instead of the browser's confirm
    const confirmModal = document.getElementById('confirmation-modal');
    const confirmTitle = document.getElementById('confirmation-title');
    const confirmMessage = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    confirmTitle.textContent = 'Delete Course';
    confirmMessage.textContent = 'Are you sure you want to delete this course? This action cannot be undone.';
    
    confirmModal.classList.remove('hidden');
    
    // Remove previous event listeners
    const cloneConfirmBtn = confirmBtn.cloneNode(true);
    const cloneCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(cloneConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(cloneCancelBtn, cancelBtn);
    
    // Add new event listeners
    cloneConfirmBtn.addEventListener('click', async function() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showError('courses-error', 'You are not logged in.');
                return;
            }
            
            const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete course');
            }
            
            hideModal();
            loadCourses(); // Refresh the courses list
            updateDashboardStats();
            alert('Course deleted successfully!');
            
        } catch (err) {
            console.error('Error deleting course:', err);
            alert(`Error: ${err.message}`);
        }
    });
    
    cloneCancelBtn.addEventListener('click', function() {
        hideModal();
    });
}
function hideModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.classList.add('hidden'));
}
async function updateDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch courses for stats
        const coursesResponse = await fetch('http://localhost:3000/api/courses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Fetch students for stats
        const studentsResponse = await fetch('http://localhost:3000/api/students', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!coursesResponse.ok || !studentsResponse.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        const courses = await coursesResponse.json();
        const students = await studentsResponse.json();
        
        // Update dashboard stats
        document.getElementById('total-courses').textContent = courses.length;
        document.getElementById('total-students').textContent = students.length;
        
        // Count full courses
        const fullCourses = courses.filter(course => 
            course.enrolledStudents >= course.seats
        );
        document.getElementById('full-courses').textContent = fullCourses.length;
        
        // For prerequisite issues, this would need additional logic depending on your requirements
        // This is a placeholder
        document.getElementById('prereq-issues').textContent = 0;
        
    } catch (err) {
        console.error('Error updating dashboard stats:', err);
    }
}

//above it everything is fine 


//can work on it for updation
async function editCourse(courseId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('courses-error', 'You are not logged in.');
            return;
        }
        
        // Use the correct API endpoint to get course by ID
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
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
        
        const courseData = await response.json();
        showCourseModal(courseData);
        
    } catch (err) {
        console.error('Error fetching course details:', err);
        alert(`Error: ${err.message}`);
    }
}


//working

function initAdminLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    logoutBtn.addEventListener('click', function () {
        logout();
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
}


// Function to load a single student (current user)
async function loadCurrentStudent() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('profile-error', 'You are not logged in.');
            return null;
        }
        
        const response = await fetch('http://localhost:3000/api/students', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load student profile');
        }
        
        return await response.json();
    } catch (err) {
        console.error('Error loading student profile:', err);
        showError('profile-error', err.message);
        return null;
    }
}
function initAdminNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            
            if (page === 'logout') {
                logout();
                return;
            }
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            contentPages.forEach(content => content.classList.add('hidden'));
            
            const targetPage = document.getElementById(`${page}-page`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }
        });
    });
    
    // Add click handlers for view buttons on dashboard
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // Activate the nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
            
            // Show the page
            contentPages.forEach(content => content.classList.add('hidden'));
            document.getElementById(`${page}-page`).classList.remove('hidden');
        });
    });
}
// This file should be added as js/reports.js

// Main function to handle report rendering based on the selected tab
async function generateReport(reportType) {
    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = '<div class="loading">Loading report data...</div>';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('You are not logged in.');
        }
        
        switch(reportType) {
            case 'course-enrollment':
                await generateCourseEnrollmentReport(reportContent);
                break;
            case 'available-seats':
                await generateAvailableSeatsReport(reportContent);
                break;
            case 'prerequisites':
                await generatePrerequisiteIssuesReport(reportContent);
                break;
            default:
                reportContent.innerHTML = '<p>Select a report type from the tabs above.</p>';
        }
    } catch (err) {
        console.error('Error generating report:', err);
        reportContent.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
}

// Report 1: Students registered for a specific course
async function generateCourseEnrollmentReport(container) {
    // Fetch all courses first
    const courses = await fetchAllCourses();
    
    // Create a course selector
    const reportHTML = `
        <div class="report-header">
            <h3>Course Enrollment Report</h3>
            <div class="report-controls">
                <select id="course-selector" class="form-control">
                    <option value="">-- Select a course --</option>
                    ${courses.map(course => `<option value="${course._id}">${course.code} - ${course.name}</option>`).join('')}
                </select>
                <button id="print-enrollment-report" class="btn" disabled>Print Report</button>
            </div>
        </div>
        <div id="enrollment-report-data" class="report-data">
            <p>Select a course to view enrollment data.</p>
        </div>
    `;
    
    container.innerHTML = reportHTML;
    
    // Add event listener to the course selector
    const courseSelector = document.getElementById('course-selector');
    const printButton = document.getElementById('print-enrollment-report');
    
    courseSelector.addEventListener('change', async () => {
        const courseId = courseSelector.value;
        if (!courseId) {
            document.getElementById('enrollment-report-data').innerHTML = '<p>Select a course to view enrollment data.</p>';
            printButton.disabled = true;
            return;
        }
        
        try {
            // Find selected course
            const selectedCourse = courses.find(c => c._id === courseId);
            
            // Get all students
            const students = await fetchAllStudents();
            
            // Filter students registered for this course
            const registeredStudents = students.filter(student => 
                student.registeredCourses && 
                student.registeredCourses.some(course => 
                    course._id === courseId || 
                    (typeof course === 'string' && course === courseId)
                )
            );
            
            // Generate report data
            const reportDataContainer = document.getElementById('enrollment-report-data');
            
            if (registeredStudents.length === 0) {
                reportDataContainer.innerHTML = '<p>No students are currently registered for this course.</p>';
                printButton.disabled = true;
                return;
            }
            
            const enrollmentData = `
                <h4>${selectedCourse.code} - ${selectedCourse.name}</h4>
                <p><strong>Total Enrolled:</strong> ${registeredStudents.length} students</p>
                <p><strong>Department:</strong> ${selectedCourse.department} | <strong>Level:</strong> ${selectedCourse.level}</p>
                <p><strong>Schedule:</strong> ${selectedCourse.schedule}</p>
                
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Total Registered Courses</th>
                            <th>Total Completed Courses</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registeredStudents.map(student => `
                            <tr>
                                <td>${student.rollNumber || student.username}</td>
                                <td>${student.name}</td>
                                <td>${Array.isArray(student.registeredCourses) ? student.registeredCourses.length : 0}</td>
                                <td>${Array.isArray(student.completedCourses) ? student.completedCourses.length : 0}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            reportDataContainer.innerHTML = enrollmentData;
            printButton.disabled = false;
            
            // Enable print functionality
            printButton.addEventListener('click', () => {
                const reportTitle = `Course_Enrollment_${selectedCourse.code}`;
                const reportData = `
Course Enrollment Report
-----------------------
Course: ${selectedCourse.code} - ${selectedCourse.name}
Department: ${selectedCourse.department}
Level: ${selectedCourse.level}
Schedule: ${selectedCourse.schedule}
Total Enrolled: ${registeredStudents.length} students

Enrolled Students:
${registeredStudents.map((student, index) => 
    `${index + 1}. ${student.rollNumber || student.username} - ${student.name} (Registered Courses: ${Array.isArray(student.registeredCourses) ? student.registeredCourses.length : 0}, Completed Courses: ${Array.isArray(student.completedCourses) ? student.completedCourses.length : 0})`
).join('\n')}
                `;
                
                downloadTextFile(reportData, reportTitle);
            });
            
        } catch (err) {
            console.error('Error generating enrollment report:', err);
            document.getElementById('enrollment-report-data').innerHTML = `<div class="error">Error: ${err.message}</div>`;
            printButton.disabled = true;
        }
    });
}

// Report 2: Courses with available seats
async function generateAvailableSeatsReport(container) {
    try {
        // Fetch all courses
        const courses = await fetchAllCourses();
        
        // Calculate available seats
        courses.forEach(course => {
            course.availableSeats = course.seats - (course.enrolledStudents || 0);
        });
        
        // Sort by available seats (descending)
        courses.sort((a, b) => b.availableSeats - a.availableSeats);
        
        // Create report UI
        const reportHTML = `
            <div class="report-header">
                <h3>Available Seats Report</h3>
                <div class="report-controls">
                    <label>
                        <input type="checkbox" id="show-only-available" checked> 
                        Show only courses with available seats
                    </label>
                    <button id="print-seats-report" class="btn">Print Report</button>
                </div>
            </div>
            
            <div class="report-data">
                <table class="report-table" id="seats-report-table">
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Department</th>
                            <th>Total Seats</th>
                            <th>Enrolled</th>
                            <th>Available</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="seats-report-body">
                        ${courses.map(course => {
                            const isAvailable = course.availableSeats > 0;
                            return `
                                <tr class="${isAvailable ? 'available' : 'full'}">
                                    <td>${course.code}</td>
                                    <td>${course.name}</td>
                                    <td>${course.department}</td>
                                    <td>${course.seats}</td>
                                    <td>${course.enrolledStudents || 0}</td>
                                    <td>${course.availableSeats}</td>
                                    <td>
                                        <span class="status-badge ${isAvailable ? 'status-open' : 'status-full'}">
                                            ${isAvailable ? 'Open' : 'Full'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = reportHTML;
        
        // Add filter functionality
        const showOnlyAvailable = document.getElementById('show-only-available');
        const seatsTable = document.getElementById('seats-report-table');
        
        showOnlyAvailable.addEventListener('change', () => {
            const rows = seatsTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                if (showOnlyAvailable.checked && row.classList.contains('full')) {
                    row.style.display = 'none';
                } else {
                    row.style.display = '';
                }
            });
        });
        
        // Initially filter if checkbox is checked
        if (showOnlyAvailable.checked) {
            const fullRows = seatsTable.querySelectorAll('tbody tr.full');
            fullRows.forEach(row => {
                row.style.display = 'none';
            });
        }
        
        // Add print functionality
        document.getElementById('print-seats-report').addEventListener('click', () => {
            let reportData = `Available Seats Report\n-----------------------\n`;
            
            if (showOnlyAvailable.checked) {
                reportData += `Showing only courses with available seats\n\n`;
            } else {
                reportData += `Showing all courses\n\n`;
            }
            
            reportData += `${courses.filter(course => !showOnlyAvailable.checked || course.availableSeats > 0)
                .map((course, index) => 
                    `${index + 1}. ${course.code} - ${course.name} (${course.department})
   Total Seats: ${course.seats}
   Enrolled: ${course.enrolledStudents || 0}
   Available: ${course.availableSeats}
   Status: ${course.availableSeats > 0 ? 'Open' : 'Full'}
`
                ).join('\n')}`;
            
            downloadTextFile(reportData, 'Available_Seats_Report');
        });
        
    } catch (err) {
        console.error('Error generating available seats report:', err);
        container.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
}

// Report 3: Students who haven't completed prerequisites
async function generatePrerequisiteIssuesReport(container) {
    try {
        // Fetch all students and courses
        const [students, courses] = await Promise.all([
            fetchAllStudents(),
            fetchAllCourses()
        ]);
        
        // Track students with prerequisite issues
        const studentsWithIssues = [];
        
        // For each student, check their registered courses against their completed courses
        for (const student of students) {
            const registeredCourses = student.registeredCourses || [];
            const completedCourses = student.completedCourses || [];
            
            // Convert to array of IDs or codes for easier comparison
            const completedIds = completedCourses.map(course => 
                typeof course === 'object' ? course._id || course.code : course
            );
            
            const issues = [];
            
            // Check each registered course for prerequisites
            for (const regCourse of registeredCourses) {
                // Get course details if we only have the ID
                const courseId = typeof regCourse === 'object' ? regCourse._id : regCourse;
                const courseDetails = typeof regCourse === 'object' && regCourse.code ? 
                    regCourse : 
                    courses.find(c => c._id === courseId);
                
                if (!courseDetails) continue; // Skip if we can't find the course
                
                // Check prerequisites
                const prerequisites = courseDetails.prerequisites || [];
                if (prerequisites.length === 0) continue; // No prerequisites to check
                
                // Find missing prerequisites
                const missingPrereqs = [];
                
                for (const prereq of prerequisites) {
                    // Find the prerequisite course in the courses list
                    const prereqCourse = courses.find(c => 
                        c.code === prereq || c.name === prereq
                    );
                    
                    if (!prereqCourse) continue; // Skip if we can't find the prerequisite course
                    
                    // Check if the student has completed this prerequisite
                    const hasCompleted = completedIds.some(id => 
                        id === prereqCourse._id || id === prereqCourse.code
                    );
                    
                    if (!hasCompleted) {
                        missingPrereqs.push(prereqCourse);
                    }
                }
                
                // If there are missing prerequisites, add to issues
                if (missingPrereqs.length > 0) {
                    issues.push({
                        course: courseDetails,
                        missingPrerequisites: missingPrereqs
                    });
                }
            }
            
            // If this student has issues, add them to our list
            if (issues.length > 0) {
                studentsWithIssues.push({
                    student: student,
                    issues: issues
                });
            }
        }
        
        // Create report UI
        const reportHTML = `
            <div class="report-header">
                <h3>Prerequisite Issues Report</h3>
                <div class="report-controls">
                    <span>${studentsWithIssues.length} students with prerequisite issues found</span>
                    <button id="print-prereq-report" class="btn" ${studentsWithIssues.length === 0 ? 'disabled' : ''}>Print Report</button>
                </div>
            </div>
            
            <div class="report-data" id="prereq-report-data">
                ${studentsWithIssues.length === 0 ? 
                    '<p>No students with prerequisite issues found.</p>' : 
                    studentsWithIssues.map(item => `
                        <div class="prereq-issue-card">
                            <div class="student-info">
                                <h4>${item.student.name}</h4>
                                <p><strong>Roll Number:</strong> ${item.student.rollNumber || item.student.username}</p>
                            </div>
                            
                            <div class="issue-details">
                                <h5>Prerequisite Issues (${item.issues.length}):</h5>
                                <ul>
                                    ${item.issues.map(issue => `
                                        <li>
                                            <strong>${issue.course.code} - ${issue.course.name}</strong>
                                            <p>Missing prerequisites:</p>
                                            <ul>
                                                ${issue.missingPrerequisites.map(prereq => 
                                                    `<li>${prereq.code} - ${prereq.name}</li>`
                                                ).join('')}
                                            </ul>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
        
        container.innerHTML = reportHTML;
        
        // Add print functionality
        if (studentsWithIssues.length > 0) {
            document.getElementById('print-prereq-report').addEventListener('click', () => {
                let reportData = `Prerequisite Issues Report\n--------------------------\n`;
                reportData += `Generated: ${new Date().toLocaleString()}\n`;
                reportData += `Total students with issues: ${studentsWithIssues.length}\n\n`;
                
                studentsWithIssues.forEach((item, index) => {
                    reportData += `STUDENT ${index + 1}: ${item.student.name} (${item.student.rollNumber || item.student.username})\n`;
                    reportData += `Issues found: ${item.issues.length}\n\n`;
                    
                    item.issues.forEach((issue, i) => {
                        reportData += `Issue ${i + 1}: Course ${issue.course.code} - ${issue.course.name}\n`;
                        reportData += `Missing prerequisites:\n`;
                        
                        issue.missingPrerequisites.forEach(prereq => {
                            reportData += `  - ${prereq.code} - ${prereq.name}\n`;
                        });
                        
                        reportData += '\n';
                    });
                    
                    reportData += '-'.repeat(40) + '\n\n';
                });
                
                downloadTextFile(reportData, 'Prerequisite_Issues_Report');
            });
        }
        
    } catch (err) {
        console.error('Error generating prerequisite issues report:', err);
        container.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    }
}

// Utility function to download text file
function downloadTextFile(content, filename) {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// API fetch functions
async function fetchAllCourses() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('You are not logged in.');
    }
    
    const response = await fetch('http://localhost:3000/api/courses', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch courses');
    }
    
    return await response.json();
}

async function fetchAllStudents() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('You are not logged in.');
    }
    
    const response = await fetch('http://localhost:3000/api/students/all', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch students');
    }
    
    return await response.json();
}
//


//
// Make sure to add this to admin.js or wherever you initialize the dashboard
// Complaints functionality for the admin dashboard
let complaintsData = [];

// Function to fetch all complaints
async function fetchComplaints() {
    console.log('Fetching complaints...');
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No token found');
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/reports/complaints', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }
        
        complaintsData = await response.json();
        displayComplaints(complaintsData);
        
        // Update counter in admin dashboard
        const openComplaints = complaintsData.filter(c => c.status === 'open').length;
        document.querySelector('#prereq-issues').textContent = openComplaints;
        
    } catch (err) {
        console.error('Error fetching complaints:', err);
    }
}



// Now, let's modify the deleteComplaint function in the frontend to use the correct class names
async function deleteComplaint(complaintId) {
    // Confirm with the user before deleting
    if (!confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
        return;
    }
    console.log("Deleting complaint with ID:", complaintId);
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No token found');
            return;
        }
        
        // Log the exact URL being called
        const url = `http://localhost:3000/api/reports/complaints/${complaintId}`;
        console.log(`Attempting to delete complaint at URL: ${url}`);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Delete response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to delete complaint: ${response.status} ${errorText}`);
        }
        
        alert('Complaint deleted successfully');
        fetchComplaints();
        
    } catch (err) {
        console.error('Error deleting complaint:', err);
        alert(`Error: ${err.message}`);
    }
}

// Let's also fix the displayComplaints function to use your existing CSS classes

function displayComplaints(complaints) {
    const tbody = document.getElementById('complaints-tbody');
    tbody.innerHTML = '';
    
    if (complaints.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">No complaints found</td>';
        tbody.appendChild(row);
        return;
    }
    
    complaints.forEach(complaint => {
        const row = document.createElement('tr');
        
        // Format the date
        const createdDate = new Date(complaint.createdAt).toLocaleDateString();
        
        // Get student name - if populated correctly, we should have student.name
        const studentName = complaint.student ? complaint.student.name : 'Unknown';
        
        // Status class for styling
        const statusClass = getStatusClass(complaint.status);
        
        // Improved course code extraction from issue text
        let courseCode = 'UNKNOWN';
        
        // First try the specific format mentioned in the issue
        const specificMatch = complaint.issue.match(/(?:Register Course:|Unable to Register Course:)\s*([A-Z0-9]+)/i);
        if (specificMatch && specificMatch[1]) {
            courseCode = specificMatch[1].trim();
        } else {
            // Try a more general format - look for any pattern like ABC123
            const generalMatch = complaint.issue.match(/([A-Z]{2,4}\s*\d{3,4})/i);
            if (generalMatch && generalMatch[1]) {
                courseCode = generalMatch[1].replace(/\s+/g, '').toUpperCase();
            }
            
            // Check for format like "Course: ABC123"
            const colonMatch = complaint.issue.match(/Course:\s*([A-Z0-9]+)/i);
            if (colonMatch && colonMatch[1]) {
                courseCode = colonMatch[1].trim();
            }
        }
        
        // For debugging - log the course code extraction
        console.log(`Extracted course code "${courseCode}" from issue: "${complaint.issue}"`);
        
        // Action buttons container - using your existing CSS classes
        let actionButtons = '<div class="action-buttons">';
        
        // Show resolve button only for complaints with OPEN status
        if (complaint.status === 'open') {
            actionButtons += `<button class="resolve-complaint-btn resolve-btn" data-id="${complaint._id}" data-course="${courseCode}">Resolve</button>`;
        }
        
        // Always show delete button regardless of status
        actionButtons += `<button class="delete-complaint-btn delete-btn" data-id="${complaint._id}">Delete</button>`;
        
        actionButtons += '</div>';
        
        row.innerHTML = `
            <td>${complaint._id.substr(-6)}</td>
            <td>${studentName}</td>
            <td>${truncateText(complaint.issue, 50)}</td>
            <td><span class="status-badge ${statusClass}">${formatStatus(complaint.status)}</span></td>
            <td>${createdDate}</td>
            <td>${actionButtons}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to resolve buttons
    document.querySelectorAll('.resolve-complaint-btn').forEach(btn => {
        btn.addEventListener('click', () => resolveComplaint(
            btn.getAttribute('data-id'),
            btn.getAttribute('data-course')
        ));
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-complaint-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteComplaint(
            btn.getAttribute('data-id')
        ));
    });
}

// Function to resolve a complaint and increment course seats
// Function to resolve a complaint, increment course seats, and notify student
async function resolveComplaint(complaintId, courseCode) {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No token found');
            return;
        }
        
        console.log(`Attempting to update complaint: ${complaintId} for course: ${courseCode}`);
        
        // First, get the complaint details to access the student ID
        const complaintDetailsResponse = await fetch(`http://localhost:3000/api/reports/complaints/${complaintId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!complaintDetailsResponse.ok) {
            const errorText = await complaintDetailsResponse.text();
            throw new Error(`Failed to fetch complaint details: ${complaintDetailsResponse.status} ${errorText}`);
        }
        
        const complaintDetails = await complaintDetailsResponse.json();
        const studentId = complaintDetails.student ? complaintDetails.student._id : null;
        
        if (!studentId) {
            console.error('No student ID found in complaint');
            alert('Cannot resolve complaint: No student ID found');
            return;
        }
        
        // Update the complaint status to 'resolved'
        const complaintResponse = await fetch(`http://localhost:3000/api/reports/complaints/${complaintId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'resolved'
            })
        });
        
        console.log('Complaint update response status:', complaintResponse.status);
        
        if (!complaintResponse.ok) {
            const errorText = await complaintResponse.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to update complaint status: ${complaintResponse.status} ${errorText}`);
        }
        
        // Handle course code being UNKNOWN - skip the course seat increment
        if (courseCode === 'UNKNOWN') {
            alert('Complaint resolved successfully. No course code was found to increment seats.');
            fetchComplaints();
            return;
        }
        
        // Increment the course seat
        const courseResponse = await fetch(`http://localhost:3000/api/courses/${courseCode}/increment-seat`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Course update response status:', courseResponse.status);
        
        if (!courseResponse.ok) {
            const errorText = await courseResponse.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to increment course seat: ${courseResponse.status} ${errorText}`);
        }
        
        // Create a notification for the student
        const notificationMessage = `A seat is now available for course: ${courseCode}. You can now register for this course.`;
        
        const notificationResponse = await fetch('http://localhost:3000/api/notifications', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                message: notificationMessage
            })
        });
        
        console.log('Notification response status:', notificationResponse.status);
        
        if (!notificationResponse.ok) {
            const errorText = await notificationResponse.text();
            console.error('Error creating notification:', errorText);
            // We don't throw here to avoid preventing the complaint resolution
            console.error(`Failed to create notification: ${notificationResponse.status} ${errorText}`);
        } else {
            console.log('Notification sent successfully to student');
        }
        
        // Show success message
        alert(`Complaint resolved, seat for course ${courseCode} incremented, and student notified successfully.`);
        
        // Refresh complaints list
        fetchComplaints();
        
    } catch (err) {
        console.error('Error resolving complaint:', err);
        alert(`Error: ${err.message}`);
    }
}
// Helper function to truncate long text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Helper function to format status
function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
}

// Helper function to get status class for styling
function getStatusClass(status) {
    switch (status) {
        case 'open':
            return 'status-open';
        case 'in-progress':
            return 'status-in-progress';
        case 'resolved':
            return 'status-resolved';
        case 'closed':
            return 'status-closed';
        default:
            return '';
    }
}

// Function to handle complaint search
function handleComplaintSearch() {
    const searchInput = document.getElementById('admin-complaint-search');
    
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            // If search is empty, show all complaints
            displayComplaints(complaintsData);
            return;
        }
        
        // Filter complaints based on search term
        const filteredComplaints = complaintsData.filter(complaint => {
            const studentName = complaint.student ? complaint.student.name.toLowerCase() : '';
            const issue = complaint.issue.toLowerCase();
            const status = complaint.status.toLowerCase();
            
            return studentName.includes(searchTerm) || 
                   issue.includes(searchTerm) || 
                   status.includes(searchTerm);
        });
        
        displayComplaints(filteredComplaints);
    });
}

// Initialize complaints functionality
function initializeComplaints() {
    // Add event listeners
    document.querySelectorAll('.close-button, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('complaint-modal').classList.add('hidden');
        });
    });
    
    // Initialize search
    handleComplaintSearch();
    
    // Fetch complaints on page load
    fetchComplaints();
}

// Initialize reports
function initReports() {
    const reportTabs = document.querySelectorAll('.report-tab');
    
    // Add event listeners to report tabs
    reportTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            reportTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Generate the selected report
            const reportType = this.getAttribute('data-report');
            generateReport(reportType);
        });
    });
    
    // Generate the default report (first tab)
    const defaultReport = document.querySelector('.report-tab.active');
    if (defaultReport) {
        const reportType = defaultReport.getAttribute('data-report');
        generateReport(reportType);
    }
}

// Add event listener to initialize reports when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Listen for navigation to reports page
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page === 'reports') {
                // Initialize reports when the reports page is shown
                setTimeout(initReports, 100); // Small delay to ensure DOM is updated
            }
        });
    });
    
    // Check if we're already on the reports page
    if (!document.getElementById('reports-page').classList.contains('hidden')) {
        initReports();
    }
    
    const existingNavItems = document.querySelectorAll('.nav-item');
    
    existingNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // If clicking the complaints page
            if (page === 'complaints') {
                // Fetch fresh data when navigating to the page
                fetchComplaints();
            }
        });
    });
    
    // Initialize complaints
    initializeComplaints();
});