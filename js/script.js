
// --- Firebase Configuration (IMPORTANT: Replace with your actual config) ---
const firebaseConfig = {
  apiKey: "AIzaSyAbN4awHvNUZWC-uCgU_hR7iYiHk-3dpv8",
  authDomain: "learnaria-483e7.firebaseapp.com",
  projectId: "learnaria-483e7",
  storageBucket: "learnaria-483e7.firebasestorage.app",
  messagingSenderId: "573038013067",
  appId: "1:573038013067:web:db6a78e8370d33b07a828e",
  measurementId: "G-T68CEZS4YC"
};

// Initialize Firebase (make sure Firebase SDK scripts are loaded in index.html)
// تأكد أن روابط Firebase SDK في index.html صحيحة:
// <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Teacher ID (IMPORTANT: In a real app, this would come from Firebase Authentication) ---
const TEACHER_ID = "teacher_001"; // تأكد أن هذا المعرف يطابق وثيقة المدرس في Firestore

// --- Global Data Stores ---
let allStudents = []; // Stores all students for the current teacher
let currentAttendance = {}; // Stores attendance for the currently selected date {studentId: status}
let currentAssignmentGrades = {}; // Stores grades for the currently selected assignment {studentId: score}
let selectedAssignmentId = ''; // Stores the ID of the currently selected assignment for grades

// --- Utility Functions ---

function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerText = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.style.opacity = 1;
    }, 50);

    setTimeout(() => {
        messageBox.style.opacity = 0;
        messageBox.addEventListener('transitionend', () => messageBox.remove());
    }, 3000);
}

function typeWriterEffect(elementId, text, delay = 100) {
    const element = document.getElementById(elementId);
    let i = 0;
    element.innerText = '';
    function type() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            setTimeout(type, delay);
        }
    }
    type();
}

// Attach event listeners and load initial data after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    typeWriterEffect('dashboardTitle', 'Teacher Dashboard');
    
    // Attach event listeners to buttons
    document.getElementById('refreshDataButton').addEventListener('click', fetchDataFromFirestore);
    document.getElementById('addNewStudentButton').addEventListener('click', addNewStudent);
    document.getElementById('attendanceDateInput').addEventListener('change', renderAttendanceInputs);
    document.getElementById('saveDailyAttendanceButton').addEventListener('click', saveDailyAttendance);
    document.getElementById('assignmentSelect').addEventListener('change', renderGradesInputs);
    document.getElementById('addNewAssignmentButton').addEventListener('click', addNewAssignment);
    document.getElementById('saveAssignmentGradesButton').addEventListener('click', saveAssignmentGrades);
    document.getElementById('addClassScheduleButton').addEventListener('click', addClassSchedule);

    // Initial data fetch
    fetchStudents(); // Fetches students and populates allStudents array
    fetchAssignments(); // Fetches assignments and populates dropdown
    fetchRecentSchedules(); // Fetches and displays recent schedules
});

function addRecordWithAnimation(recordsDiv, recordElement) {
    recordsDiv.appendChild(recordElement);
    recordElement.offsetHeight; 
    recordElement.style.opacity = 1;
    recordElement.style.transform = 'translateY(0)';
}

// --- Firestore Data Management ---

// Fetches all students for the current teacher
async function fetchStudents() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.classList.remove('hidden');

    try {
        // تأكد من أن المسار هنا صحيح ويطابق قواعد Firestore
        const studentsSnapshot = await db.collection(`teachers/${TEACHER_ID}/students`).get();
        allStudents = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        renderStudentsList(document.getElementById('studentsListDisplay'), allStudents);

        loadingIndicator.classList.add('hidden');
        showMessageBox('Students loaded!');

    } catch (error) {
        console.error('Error loading students from Firestore:', error); // رسالة خطأ مفصلة
        loadingIndicator.classList.add('hidden');
        showMessageBox('Failed to load students. Check Firebase config, network, and Firestore rules.');
        document.getElementById('studentsListDisplay').innerHTML = '<p class="text-primary-red text-center">Failed to load students. See console for details.</p>';
    }
}

// Renders the list of students for display
function renderStudentsList(containerElement, students) {
    containerElement.innerHTML = ''; // Clear previous list
    if (students.length === 0) {
        containerElement.innerHTML = '<p class="text-grey-600 text-center">No students found. Add students below.</p>';
        return;
    }

    students.forEach(student => {
        const studentElement = document.createElement('div');
        studentElement.className = 'record-item';
        studentElement.innerHTML = `
            <div>
                <p class="font-semibold text-grey-800">${student.name}</p>
                <p class="text-sm text-grey-600">Parent: ${student.parentPhoneNumber || 'N/A'}</p>
            </div>
            <button class="delete-student-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm" data-student-id="${student.id}">Delete</button>
        `;
        addRecordWithAnimation(containerElement, studentElement);

        // Attach event listener to the delete button
        studentElement.querySelector('.delete-student-btn').addEventListener('click', function() {
            const studentIdToDelete = this.dataset.studentId;
            if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
                deleteStudent(studentIdToDelete);
            }
        });
    });
}

// --- Attendance Management ---

// Renders students with attendance inputs for a specific date
async function renderAttendanceInputs() {
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    const attendanceStudentsContainer = document.getElementById('attendanceStudentsContainer');
    attendanceStudentsContainer.innerHTML = ''; // Clear previous inputs

    if (!attendanceDate) {
        attendanceStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">Please select a date.</p>';
        return;
    }
    if (allStudents.length === 0) {
        attendanceStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">No students available. Add students first.</p>';
        return;
    }

    // Fetch existing attendance for this date to pre-fill
    currentAttendance = {}; // Reset
    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/dailyAttendance`).doc(attendanceDate);
        const doc = await docRef.get();
        if (doc.exists && doc.data() && doc.data().records) {
            doc.data().records.forEach(record => {
                currentAttendance[record.studentId] = record.status;
            });
            showMessageBox('Existing attendance loaded for this date.');
        }
    } catch (error) {
        console.error('Error fetching existing attendance for date:', error); // رسالة خطأ مفصلة
        showMessageBox('Could not load existing attendance for this date.');
    }

    allStudents.forEach(student => {
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';
        studentRow.innerHTML = `
            <span class="student-name">${student.name}</span>
            <select class="attendance-status-select" data-student-id="${student.id}">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
            </select>
        `;
        attendanceStudentsContainer.appendChild(studentRow);

        // Set pre-filled status
        const selectElement = studentRow.querySelector('.attendance-status-select');
        if (currentAttendance[student.id]) {
            selectElement.value = currentAttendance[student.id];
        }
    });
}

// Saves attendance for all students for the selected date
async function saveDailyAttendance() {
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    if (!attendanceDate) {
        showMessageBox('Please select a date before saving attendance.');
        return;
    }
    if (allStudents.length === 0) {
        showMessageBox('No students to save attendance for.');
        return;
    }

    const recordsToSave = [];
    document.querySelectorAll('#attendanceStudentsContainer .attendance-status-select').forEach(selectElement => {
        const studentId = selectElement.dataset.studentId;
        const status = selectElement.value;
        recordsToSave.push({ studentId, status });
    });

    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/dailyAttendance`).doc(attendanceDate);
        await docRef.set({ // Using set() to create or overwrite the document for the date
            date: attendanceDate,
            records: recordsToSave
        });
        showMessageBox('Daily attendance saved successfully!');
    } catch (error) {
        console.error('Error saving daily attendance:', error); // رسالة خطأ مفصلة
        showMessageBox('Failed to save daily attendance. Check Firestore rules.');
    }
}

// --- Grades Management ---

// Fetches all assignments for the current teacher
async function fetchAssignments() {
    try {
        const assignmentsSnapshot = await db.collection(`teachers/${TEACHER_ID}/assignments`).get();
        const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const assignmentSelect = document.getElementById('assignmentSelect');
        assignmentSelect.innerHTML = '<option value="">Select an Assignment</option>'; // Default option
        
        assignments.forEach(assignment => {
            const option = document.createElement('option');
            option.value = assignment.id;
            option.innerText = `${assignment.name} (${assignment.date})`;
            assignmentSelect.appendChild(option);
        });
        
        // If there's a previously selected assignment, try to re-select it
        if (selectedAssignmentId && assignments.some(a => a.id === selectedAssignmentId)) {
            assignmentSelect.value = selectedAssignmentId;
            renderGradesInputs(); // Re-render inputs for the re-selected assignment
        }

    } catch (error) {
        console.error('Error loading assignments:', error); // رسالة خطأ مفصلة
        showMessageBox('Failed to load assignments.');
    }
}

// Renders students with grade inputs for a selected assignment
async function renderGradesInputs() {
    selectedAssignmentId = document.getElementById('assignmentSelect').value;
    const gradesStudentsContainer = document.getElementById('gradesStudentsContainer');
    gradesStudentsContainer.innerHTML = ''; // Clear previous inputs

    if (!selectedAssignmentId) {
        gradesStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">Please select an assignment.</p>';
        return;
    }
    if (allStudents.length === 0) {
        gradesStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">No students available. Add students first.</p>';
        return;
    }

    // Fetch existing grades for this assignment to pre-fill
    currentAssignmentGrades = {}; // Reset
    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/assignments`).doc(selectedAssignmentId);
        const doc = await docRef.get();
        if (doc.exists && doc.data() && doc.data().scores) {
            doc.data().scores.forEach(scoreRecord => {
                currentAssignmentGrades[scoreRecord.studentId] = scoreRecord.score;
            });
            showMessageBox('Existing grades loaded for this assignment.');
        }
    } catch (error) {
        console.error('Error fetching existing grades for assignment:', error); // رسالة خطأ مفصلة
        showMessageBox('Could not load existing grades for this assignment.');
    }

    allStudents.forEach(student => {
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';
        studentRow.innerHTML = `
            <span class="student-name">${student.name}</span>
            <input type="number" class="grade-input" data-student-id="${student.id}" min="0" max="100" placeholder="Score">
        `;
        gradesStudentsContainer.appendChild(studentRow);

        // Set pre-filled score
        const inputElement = studentRow.querySelector('.grade-input');
        if (currentAssignmentGrades[student.id] !== undefined) {
            inputElement.value = currentAssignmentGrades[student.id];
        }
    });
}

// Saves grades for all students for the selected assignment
async function saveAssignmentGrades() {
    if (!selectedAssignmentId) {
        showMessageBox('Please select an assignment before saving grades.');
        return;
    }
    if (allStudents.length === 0) {
        showMessageBox('No students to save grades for.');
        return;
    }

    const scoresToSave = [];
    let isValid = true;
    document.querySelectorAll('#gradesStudentsContainer .grade-input').forEach(inputElement => {
        const studentId = inputElement.dataset.studentId;
        const score = parseInt(inputElement.value);

        if (inputElement.value === '' || isNaN(score) || score < 0 || score > 100) {
            showMessageBox(`Please enter a valid score (0-100) for ${allStudents.find(s => s.id === studentId)?.name}.`);
            isValid = false;
            return; // Exit forEach early if validation fails
        }
        scoresToSave.push({ studentId, score });
    });

    if (!isValid) return; // Stop function if validation failed for any input

    try {
        const assignmentRef = db.collection(`teachers/${TEACHER_ID}/assignments`).doc(selectedAssignmentId);
        await assignmentRef.update({ 
            scores: scoresToSave
        });
        showMessageBox('Assignment grades saved successfully!');
    } catch (error) {
        console.error('Error saving assignment grades:', error); // رسالة خطأ مفصلة
        showMessageBox('Failed to save assignment grades. Check Firestore rules.');
    }
}

// --- Add New Student ---
async function addNewStudent() {
    const studentName = document.getElementById('newStudentName').value.trim();
    const parentPhoneNumber = document.getElementById('newParentPhoneNumber').value.trim();

    if (studentName && parentPhoneNumber) {
        try {
            // المسار: teachers/{TEACHER_ID}/students
            const docRef = await db.collection(`teachers/${TEACHER_ID}/students`).add({
                name: studentName,
                parentPhoneNumber: parentPhoneNumber
            });
            showMessageBox('New student added successfully!');
            document.getElementById('newStudentName').value = '';
            document.getElementById('newParentPhoneNumber').value = '';
            fetchStudents(); // Refresh students list and inputs
        } catch (error) {
            console.error('Error adding new student to Firestore:', error); // رسالة خطأ مفصلة
            showMessageBox('Failed to add new student. Check Firestore rules, network, and Firebase config.');
        }
    } else {
        showMessageBox('Please enter both student name and parent phone number.');
    }
}

// --- Delete Student ---
async function deleteStudent(studentId) {
    try {
        // المسار: teachers/{TEACHER_ID}/students/{studentId}
        await db.collection(`teachers/${TEACHER_ID}/students`).doc(studentId).delete();
        showMessageBox('Student deleted successfully!');
        fetchStudents(); // Refresh students list after deletion

        // IMPORTANT: In a production application, you would also need to handle
        // deleting or updating this student's records in other collections
        // like 'dailyAttendance' and 'assignments' to maintain data integrity.
        // This might involve:
        // 1. Querying and deleting all attendance records for this student.
        // 2. Querying all assignment documents and removing this student's score from their 'scores' array.
        // This often requires more complex logic or server-side functions (e.g., Firebase Cloud Functions).

    } catch (error) {
        console.error('Error deleting student from Firestore:', error); // رسالة خطأ مفصلة
        showMessageBox('Failed to delete student. Check Firestore rules.');
    }
}

// --- Add New Assignment ---
async function addNewAssignment() {
    const assignmentName = document.getElementById('newAssignmentName').value.trim();
    const assignmentDate = document.getElementById('newAssignmentDate').value;

    if (assignmentName && assignmentDate) {
        const assignmentId = `${assignmentName}_${assignmentDate}`; // Create a unique ID
        try {
            // المسار: teachers/{TEACHER_ID}/assignments
            const docRef = db.collection(`teachers/${TEACHER_ID}/assignments`).doc(assignmentId);
            await docRef.set({ // Using set() to create or overwrite
                name: assignmentName,
                date: assignmentDate,
                scores: [] // Initialize with empty scores array
            });
            showMessageBox('New assignment added successfully!');
            document.getElementById('newAssignmentName').value = '';
            document.getElementById('newAssignmentDate').value = '';
            selectedAssignmentId = assignmentId; // Select the new assignment
            fetchAssignments(); // Refresh assignments dropdown
        } catch (error) {
            console.error('Error adding new assignment to Firestore:', error); // رسالة خطأ مفصلة
            showMessageBox('Failed to add new assignment. Check Firestore rules.');
        }
    } else {
        showMessageBox('Please enter assignment name and date.');
    }
}

// --- Class Schedule Management ---
async function addClassSchedule() {
    const subject = document.getElementById('classSubject').value.trim();
    const date = document.getElementById('classDate').value;
    const time = document.getElementById('classTime').value;
    const room = document.getElementById('classRoom').value.trim();
    const parentPhoneNumber = document.getElementById('parentPhoneNumberSchedule').value.trim(); // Optional for schedule

    if (subject && date && time && room) {
        try {
            // المسار: teachers/{TEACHER_ID}/classSchedule
            const docRef = await db.collection(`teachers/${TEACHER_ID}/classSchedule`).add({
                subject, date, time, room, parentPhoneNumber: parentPhoneNumber || '' // Use empty string if optional
            });
            showMessageBox('Class schedule added successfully!');
            fetchRecentSchedules(); // Refresh schedule display
            // Clear inputs
            document.getElementById('classSubject').value = '';
            document.getElementById('classDate').value = '';
            document.getElementById('classTime').value = '';
            document.getElementById('classRoom').value = '';
            document.getElementById('parentPhoneNumberSchedule').value = '';
        } catch (error) {
            console.error('Error adding class schedule to Firestore:', error); // رسالة خطأ مفصلة
            showMessageBox('Failed to add class schedule. Check Firestore rules.');
        }
    } else {
        showMessageBox('Please fill in all class schedule fields.');
    }
}

// Fetches and displays recent class schedules
async function fetchRecentSchedules() {
    const scheduleDisplayContainer = document.getElementById('classScheduleDisplay');
    scheduleDisplayContainer.innerHTML = '<p class="text-grey-600 text-center">Loading schedules...</p>';

    try {
        // المسار: teachers/{TEACHER_ID}/classSchedule
        const scheduleSnapshot = await db.collection(`teachers/${TEACHER_ID}/classSchedule`).orderBy('date', 'desc').limit(5).get(); // Get last 5 schedules
        const schedules = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        scheduleDisplayContainer.innerHTML = ''; // Clear loading message
        if (schedules.length === 0) {
            scheduleDisplayContainer.innerHTML = '<p class="text-grey-600 text-center">No class schedule records found.</p>';
            return;
        }

        schedules.forEach(record => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item';
            recordElement.innerHTML = `
                <div>
                    <p class="font-semibold text-grey-800">${record.subject}</p>
                    <p class="text-sm text-grey-600">Date: ${record.date} at ${record.time}</p>
                    <p class="text-sm text-grey-600">Room: ${record.room}</p>
                    <p class="text-sm text-grey-600">Parent: ${record.parentPhoneNumber || 'N/A'}</p>
                </div>
                <span class="font-bold text-grey-800">Scheduled</span>
            `;
            addRecordWithAnimation(scheduleDisplayContainer, recordElement);
        });

    } catch (error) {
        console.error('Error loading schedules from Firestore:', error); // رسالة خطأ مفصلة
        scheduleDisplayContainer.innerHTML = '<p class="text-primary-red text-center">Failed to load schedules.</p>';
    }
}

// --- Main Data Fetch (Combines all fetches for refresh button) ---
async function fetchDataFromFirestore() {
    await fetchStudents();
    await fetchAssignments();
    await fetchRecentSchedules();
}
