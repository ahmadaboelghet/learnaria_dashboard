// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAbN4awHvNUZWC-uCgU_hR7iYiHk-3dpv8",
  authDomain: "learnaria-483e7.firebaseapp.com",
  projectId: "learnaria-483e7",
  storageBucket: "learnaria-483e7.firebasestorage.app",
  messagingSenderId: "573038013067",
  appId: "1:573038013067:web:db6a78e8370d33b07a828e",
  measurementId: "G-T68CEZS4YC"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- Global State ---
let TEACHER_ID = null; // سيتم تعيينه بعد تسجيل الدخول
let SELECTED_GROUP_ID = null; // سيتم تعيينه بعد اختيار المجموعة
let allStudents = []; // يخزن طلاب المجموعة المحددة

// --- Utility Functions ---
function showMessageBox(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerText = message;
    document.body.appendChild(messageBox);
    setTimeout(() => { messageBox.style.opacity = 1; }, 50);
    setTimeout(() => {
        messageBox.style.opacity = 0;
        messageBox.addEventListener('transitionend', () => messageBox.remove());
    }, 3000);
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {
    // Listeners الأساسية
    document.getElementById('setTeacherButton').addEventListener('click', setTeacher);
    document.getElementById('addNewGroupButton').addEventListener('click', addNewGroup);
    document.getElementById('groupSelect').addEventListener('change', handleGroupSelection);
    
    // Listeners المعتمدة على اختيار المجموعة
    document.getElementById('addNewStudentButton').addEventListener('click', addNewStudent);
    document.getElementById('attendanceDateInput').addEventListener('change', renderAttendanceInputs);
    document.getElementById('saveDailyAttendanceButton').addEventListener('click', saveDailyAttendance);
    document.getElementById('assignmentSelect').addEventListener('change', renderGradesInputs);
    document.getElementById('addNewAssignmentButton').addEventListener('click', addNewAssignment);
    document.getElementById('saveAssignmentGradesButton').addEventListener('click', saveAssignmentGrades);
    document.getElementById('addClassScheduleButton').addEventListener('click', addClassSchedule);
});

// --- 1. Teacher Login ---
function setTeacher() {
    const phone = document.getElementById('teacherPhoneInput').value.trim();
    if (phone) {
        TEACHER_ID = phone;
        document.getElementById('dashboardTitle').innerText = `Welcome, ${TEACHER_ID}`;
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('teacherPhoneInput').disabled = true;
        document.getElementById('setTeacherButton').disabled = true;
        showMessageBox(`Dashboard loaded for ${TEACHER_ID}`);
        fetchGroups();
    } else {
        showMessageBox('Please enter a valid phone number.');
    }
}

// --- 2. Group Management ---
async function fetchGroups() {
    try {
        const groupsSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups`).get();
        const groupSelect = document.getElementById('groupSelect');
        groupSelect.innerHTML = '<option value="">-- Select a Group --</option>'; // Reset
        
        groupsSnapshot.docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.innerText = doc.data().name;
            groupSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
        showMessageBox('Failed to load groups.');
    }
}

async function addNewGroup() {
    if (!TEACHER_ID) return;
    const groupName = document.getElementById('newGroupName').value.trim();
    if (groupName) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups`).add({ name: groupName });
            showMessageBox('Group added successfully!');
            document.getElementById('newGroupName').value = '';
            fetchGroups(); // Refresh the dropdown
        } catch (error) {
            console.error('Error adding group:', error);
            showMessageBox('Failed to add group.');
        }
    } else {
        showMessageBox('Please enter a group name.');
    }
}

function handleGroupSelection() {
    SELECTED_GROUP_ID = document.getElementById('groupSelect').value;
    const groupContent = document.getElementById('groupContent');
    
    if (SELECTED_GROUP_ID) {
        groupContent.classList.remove('hidden');
        // جلب كل البيانات لهذه المجموعة
        fetchStudents();
        fetchAssignments();
        fetchRecentSchedules();
        // مسح البيانات القديمة
        document.getElementById('attendanceStudentsContainer').innerHTML = '';
        document.getElementById('gradesStudentsContainer').innerHTML = '';
        document.getElementById('attendanceDateInput').value = '';
    } else {
        groupContent.classList.add('hidden');
    }
}

// --- 3. Students Management ---
async function fetchStudents() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    try {
        const studentsSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/students`).get();
        allStudents = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderStudentsList(document.getElementById('studentsListDisplay'), allStudents);
    } catch (error) {
        console.error('Error loading students:', error);
        showMessageBox('Failed to load students for this group.');
    }
}

function renderStudentsList(containerElement, students) {
    containerElement.innerHTML = '';
    if (students.length === 0) {
        containerElement.innerHTML = '<p class="text-grey-600 text-center">No students in this group yet.</p>';
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
            <button class="delete-student-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm" data-student-id="${student.id}" data-student-name="${student.name}">Delete</button>
        `;
        containerElement.appendChild(studentElement);
        studentElement.querySelector('.delete-student-btn').addEventListener('click', function() {
            const studentId = this.dataset.studentId;
            const studentName = this.dataset.studentName;
            if (confirm(`Are you sure you want to delete ${studentName}?`)) {
                deleteStudent(studentId);
            }
        });
    });
}

async function addNewStudent() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const studentName = document.getElementById('newStudentName').value.trim();
    const parentPhoneNumber = document.getElementById('newParentPhoneNumber').value.trim();

    if (studentName && parentPhoneNumber) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/students`).add({
                name: studentName,
                parentPhoneNumber: parentPhoneNumber
            });
            showMessageBox('New student added to group!');
            document.getElementById('newStudentName').value = '';
            document.getElementById('newParentPhoneNumber').value = '';
            fetchStudents(); // Refresh list
        } catch (error) {
            console.error('Error adding student:', error);
            showMessageBox('Failed to add student.');
        }
    } else {
        showMessageBox('Please enter both student name and parent phone number.');
    }
}

async function deleteStudent(studentId) {
    if (!TEACHER_ID || !SELECTED_GROUP_ID || !studentId) return;
    try {
        await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/students`).doc(studentId).delete();
        showMessageBox('Student deleted successfully!');
        fetchStudents(); // Refresh list
    } catch (error) {
        console.error('Error deleting student:', error);
        showMessageBox('Failed to delete student.');
    }
}

// --- 4. Attendance Management ---
async function renderAttendanceInputs() {
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    const attendanceStudentsContainer = document.getElementById('attendanceStudentsContainer');
    attendanceStudentsContainer.innerHTML = ''; 

    if (!attendanceDate) {
        attendanceStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">Please select a date.</p>';
        return;
    }
    if (allStudents.length === 0) {
        attendanceStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">No students available in this group.</p>';
        return;
    }

    let existingAttendance = {};
    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/dailyAttendance`).doc(attendanceDate);
        const doc = await docRef.get();
        if (doc.exists && doc.data() && doc.data().records) {
            doc.data().records.forEach(record => {
                existingAttendance[record.studentId] = record.status;
            });
        }
    } catch (error) {
        console.error('Error fetching existing attendance:', error);
    }

    allStudents.forEach(student => {
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';
        // --- هذا هو السطر الذي تم تعديله ---
        studentRow.innerHTML = `
            <span class="student-name">${student.name}</span>
            <select class="attendance-status-select" data-student-id="${student.id}">
                <option value="absent" selected>Absent</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
            </select>
        `;
        attendanceStudentsContainer.appendChild(studentRow);

        const selectElement = studentRow.querySelector('.attendance-status-select');
        // هذا الجزء سيتأكد من عرض الحالة المحفوظة سابقاً إذا وجدت
        if (existingAttendance[student.id]) {
            selectElement.value = existingAttendance[student.id];
        }
    });
}

async function saveDailyAttendance() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    if (!attendanceDate) {
        showMessageBox('Please select a date.');
        return;
    }
    const recordsToSave = [];
    document.querySelectorAll('#attendanceStudentsContainer .attendance-status-select').forEach(selectElement => {
        const studentId = selectElement.dataset.studentId;
        const status = selectElement.value;
        recordsToSave.push({ studentId, status });
    });

    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/dailyAttendance`).doc(attendanceDate);
        await docRef.set({ date: attendanceDate, records: recordsToSave });
        showMessageBox('Attendance saved successfully!');
    } catch (error) {
        console.error('Error saving attendance:', error);
        showMessageBox('Failed to save attendance.');
    }
}

// --- 5. Grades Management ---
async function fetchAssignments() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    try {
        const assignmentsSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).get();
        const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const assignmentSelect = document.getElementById('assignmentSelect');
        assignmentSelect.innerHTML = '<option value="">Select an Assignment</option>';
        assignments.forEach(assignment => {
            const option = document.createElement('option');
            option.value = assignment.id;
            option.innerText = `${assignment.name} (${assignment.date})`;
            assignmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

async function renderGradesInputs() {
    const selectedAssignmentId = document.getElementById('assignmentSelect').value;
    const gradesStudentsContainer = document.getElementById('gradesStudentsContainer');
    gradesStudentsContainer.innerHTML = '';

    if (!selectedAssignmentId) {
        gradesStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">Please select an assignment.</p>';
        return;
    }
    if (allStudents.length === 0) {
        gradesStudentsContainer.innerHTML = '<p class="text-grey-600 text-center">No students available in this group.</p>';
        return;
    }
    
    let existingGrades = {};
     try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).doc(selectedAssignmentId);
        const doc = await docRef.get();
        if (doc.exists && doc.data() && doc.data().scores) {
            doc.data().scores.forEach(scoreRecord => {
                existingGrades[scoreRecord.studentId] = scoreRecord.score;
            });
        }
    } catch (error) {
        console.error('Error fetching existing grades:', error);
    }

    allStudents.forEach(student => {
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';
        studentRow.innerHTML = `
            <span class="student-name">${student.name}</span>
            <input type="number" class="grade-input" data-student-id="${student.id}" min="0" max="100" placeholder="Score">
        `;
        gradesStudentsContainer.appendChild(studentRow);
        
        const inputElement = studentRow.querySelector('.grade-input');
        if (existingGrades[student.id] !== undefined) {
            inputElement.value = existingGrades[student.id];
        }
    });
}

async function addNewAssignment() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const assignmentName = document.getElementById('newAssignmentName').value.trim();
    const assignmentDate = document.getElementById('newAssignmentDate').value;
    if (assignmentName && assignmentDate) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).add({
                name: assignmentName,
                date: assignmentDate,
                scores: []
            });
            showMessageBox('New assignment added!');
            fetchAssignments(); // Refresh dropdown
        } catch (error) {
            console.error('Error adding assignment:', error);
        }
    } else {
        showMessageBox('Please enter assignment name and date.');
    }
}

async function saveAssignmentGrades() {
    const selectedAssignmentId = document.getElementById('assignmentSelect').value;
    if (!TEACHER_ID || !SELECTED_GROUP_ID || !selectedAssignmentId) {
        showMessageBox('Please select an assignment first.');
        return;
    }

    const scoresToSave = [];
    document.querySelectorAll('#gradesStudentsContainer .grade-input').forEach(input => {
        const studentId = input.dataset.studentId;
        const score = input.value;
        if (score !== '') { // Only save if a score is entered
            scoresToSave.push({ studentId, score: parseInt(score, 10) });
        }
    });
    
    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).doc(selectedAssignmentId);
        await docRef.update({ scores: scoresToSave });
        showMessageBox('Grades saved successfully!');
    } catch(error) {
        console.error('Error saving grades:', error);
        showMessageBox('Failed to save grades.');
    }
}


// --- 6. Class Schedule Management ---
async function fetchRecentSchedules() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const scheduleDisplayContainer = document.getElementById('classScheduleDisplay');
    scheduleDisplayContainer.innerHTML = '<p class="text-grey-600 text-center">Loading schedules...</p>';
    try {
        const scheduleSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/classSchedule`).orderBy('date', 'desc').limit(5).get();
        const schedules = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        scheduleDisplayContainer.innerHTML = ''; // Clear loading message

        if (schedules.length === 0) {
            scheduleDisplayContainer.innerHTML = '<p class="text-grey-600 text-center">No schedules for this group.</p>';
            return;
        }
        schedules.forEach(record => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item';
            // This is the improved display for schedules
            recordElement.innerHTML = `
                <div>
                    <p class="font-semibold text-grey-800">${record.subject}</p>
                    <p class="text-sm text-grey-600">Date: ${record.date} at ${record.time}</p>
                    <p class="text-sm text-grey-600">Room: ${record.room}</p>
                </div>
                <span class="font-bold text-grey-800">Scheduled</span>
            `;
            scheduleDisplayContainer.appendChild(recordElement);
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        scheduleDisplayContainer.innerHTML = '<p class="text-primary-red text-center">Failed to load schedules.</p>';
    }
}

async function addClassSchedule() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const subject = document.getElementById('classSubject').value.trim();
    const date = document.getElementById('classDate').value;
    const time = document.getElementById('classTime').value;
    const room = document.getElementById('classRoom').value.trim();
    if (subject && date && time && room) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/classSchedule`).add({ subject, date, time, room });
            showMessageBox('Schedule added successfully!');
            fetchRecentSchedules(); // Refresh schedule list
        } catch (error) {
            console.error('Error adding schedule:', error);
            showMessageBox('Failed to add schedule.');
        }
    } else {
        showMessageBox('Please fill in all schedule fields.');
    }
}