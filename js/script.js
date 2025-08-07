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
let TEACHER_ID = null;
let SELECTED_GROUP_ID = null;
let allStudents = [];

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
    document.getElementById('setTeacherButton').addEventListener('click', setTeacher);
    document.getElementById('saveProfileButton').addEventListener('click', saveTeacherProfile);
    document.getElementById('addNewGroupButton').addEventListener('click', addNewGroup);
    document.getElementById('groupSelect').addEventListener('change', handleGroupSelection);
    document.getElementById('addNewStudentButton').addEventListener('click', addNewStudent);
    document.getElementById('studentSearchInput').addEventListener('input', handleStudentSearch);
    document.getElementById('attendanceDateInput').addEventListener('change', renderAttendanceInputs);
    document.getElementById('saveDailyAttendanceButton').addEventListener('click', saveDailyAttendance);
    document.getElementById('assignmentSelect').addEventListener('change', renderGradesInputs);
    document.getElementById('addNewAssignmentButton').addEventListener('click', addNewAssignment);
    document.getElementById('saveAssignmentGradesButton').addEventListener('click', saveAssignmentGrades);
    document.getElementById('addClassScheduleButton').addEventListener('click', addClassSchedule);
});

// --- 1. Teacher Login & Profile ---
async function setTeacher() {
    const phone = document.getElementById('teacherPhoneInput').value.trim();
    if (phone) {
        TEACHER_ID = phone;
        document.getElementById('teacherPhoneInput').disabled = true;
        document.getElementById('setTeacherButton').disabled = true;

        try {
            const teacherDoc = await db.collection('teachers').doc(TEACHER_ID).get();
            if (teacherDoc.exists) {
                const teacherData = teacherDoc.data();
                document.getElementById('dashboardTitle').innerText = `Welcome, ${teacherData.name || TEACHER_ID}`;
                document.getElementById('teacherNameInput').value = teacherData.name || '';
                document.getElementById('teacherSubjectInput').value = teacherData.subject || '';
            } else {
                document.getElementById('dashboardTitle').innerText = `Welcome, ${TEACHER_ID}`;
                showMessageBox('Please complete your profile information.');
            }
        } catch (error) {
            console.error("Error fetching teacher profile:", error);
            document.getElementById('dashboardTitle').innerText = `Welcome, ${TEACHER_ID}`;
        }
        
        document.getElementById('mainContent').classList.remove('hidden');
        fetchGroups();
    } else {
        showMessageBox('Please enter a valid phone number.');
    }
}

async function saveTeacherProfile() {
    if (!TEACHER_ID) return;
    
    const teacherName = document.getElementById('teacherNameInput').value.trim();
    const teacherSubject = document.getElementById('teacherSubjectInput').value.trim();

    if (teacherName && teacherSubject) {
        try {
            await db.collection('teachers').doc(TEACHER_ID).set({
                name: teacherName,
                subject: teacherSubject
            }, { merge: true });
            
            showMessageBox('Profile saved successfully!');
            document.getElementById('dashboardTitle').innerText = `Welcome, ${teacherName}`;
        } catch (error) {
            console.error("Error saving profile:", error);
            showMessageBox('Failed to save profile.');
        }
    } else {
        showMessageBox('Please enter your name and the subject you teach.');
    }
}

// --- 2. Group Management ---
async function fetchGroups() {
    try {
        const groupsSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups`).get();
        const groupSelect = document.getElementById('groupSelect');
        groupSelect.innerHTML = '<option value="">-- Select a Group --</option>';
        
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
            fetchGroups();
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
        fetchStudents();
        fetchAssignments();
        fetchRecentSchedules();
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
            if (confirm(`Are you sure you want to delete ${this.dataset.studentName}?`)) {
                deleteStudent(this.dataset.studentId);
            }
        });
    });
}

function handleStudentSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
        renderStudentsList(document.getElementById('studentsListDisplay'), allStudents);
        return;
    }
    const filteredStudents = allStudents.filter(student => student.name.toLowerCase().includes(searchTerm));
    renderStudentsList(document.getElementById('studentsListDisplay'), filteredStudents);
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
            fetchStudents();
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
        fetchStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showMessageBox('Failed to delete student.');
    }
}

// --- 4. Attendance Management ---
async function renderAttendanceInputs() {
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    const container = document.getElementById('attendanceStudentsContainer');
    container.innerHTML = ''; 

    if (!attendanceDate) {
        container.innerHTML = '<p class="text-grey-600 text-center">Please select a date.</p>';
        return;
    }
    if (allStudents.length === 0) {
        container.innerHTML = '<p class="text-grey-600 text-center">No students available in this group.</p>';
        return;
    }

    let existingAttendance = {};
    try {
        const doc = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/dailyAttendance`).doc(attendanceDate).get();
        if (doc.exists && doc.data().records) {
            doc.data().records.forEach(record => {
                existingAttendance[record.studentId] = record.status;
            });
        }
    } catch (error) {
        console.error('Error fetching existing attendance:', error);
    }

    allStudents.forEach(student => {
        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
            <span class="student-name">${student.name}</span>
            <select class="attendance-status-select" data-student-id="${student.id}">
                <option value="absent">Absent</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
            </select>
        `;
        container.appendChild(row);

        const select = row.querySelector('.attendance-status-select');
        select.value = existingAttendance[student.id] || 'absent';
    });
}

async function saveDailyAttendance() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    if (!attendanceDate) {
        showMessageBox('Please select a date.');
        return;
    }
    const records = [];
    document.querySelectorAll('#attendanceStudentsContainer .attendance-status-select').forEach(select => {
        records.push({ studentId: select.dataset.studentId, status: select.value });
    });

    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/dailyAttendance`).doc(attendanceDate);
        await docRef.set({ date: attendanceDate, records: records });
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
        const snapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).get();
        const select = document.getElementById('assignmentSelect');
        select.innerHTML = '<option value="">Select an Assignment</option>';
        snapshot.docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.innerText = `${doc.data().name} (${doc.data().date})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

async function renderGradesInputs() {
    const assignmentId = document.getElementById('assignmentSelect').value;
    const container = document.getElementById('gradesStudentsContainer');
    container.innerHTML = '';

    if (!assignmentId) {
        container.innerHTML = '<p class="text-grey-600 text-center">Please select an assignment.</p>';
        return;
    }
    if (allStudents.length === 0) {
        container.innerHTML = '<p class="text-grey-600 text-center">No students available.</p>';
        return;
    }
    
    let existingGrades = {};
     try {
        const doc = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).doc(assignmentId).get();
        if (doc.exists && doc.data().scores) {
            doc.data().scores.forEach(score => {
                existingGrades[score.studentId] = score.score;
            });
        }
    } catch (error) {
        console.error('Error fetching existing grades:', error);
    }

    allStudents.forEach(student => {
        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
            <span class="student-name">${student.name}</span>
            <input type="number" class="grade-input" data-student-id="${student.id}" min="0" max="100" placeholder="Score">
        `;
        container.appendChild(row);
        
        const input = row.querySelector('.grade-input');
        if (existingGrades[student.id] !== undefined) {
            input.value = existingGrades[student.id];
        }
    });
}

async function addNewAssignment() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const name = document.getElementById('newAssignmentName').value.trim();
    const date = document.getElementById('newAssignmentDate').value;
    if (name && date) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).add({
                name: name,
                date: date,
                scores: []
            });
            showMessageBox('New assignment added!');
            fetchAssignments();
            document.getElementById('newAssignmentName').value = '';
            document.getElementById('newAssignmentDate').value = '';
        } catch (error) {
            console.error('Error adding assignment:', error);
        }
    } else {
        showMessageBox('Please enter assignment name and date.');
    }
}

async function saveAssignmentGrades() {
    const assignmentId = document.getElementById('assignmentSelect').value;
    if (!TEACHER_ID || !SELECTED_GROUP_ID || !assignmentId) {
        showMessageBox('Please select an assignment first.');
        return;
    }

    const scores = [];
    document.querySelectorAll('#gradesStudentsContainer .grade-input').forEach(input => {
        if (input.value !== '') {
            scores.push({ studentId: input.dataset.studentId, score: parseInt(input.value, 10) });
        }
    });
    
    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).doc(assignmentId);
        await docRef.update({ scores: scores });
        showMessageBox('Grades saved successfully!');
    } catch(error) {
        console.error('Error saving grades:', error);
        showMessageBox('Failed to save grades.');
    }
}

// --- 6. Class Schedule Management ---
async function fetchRecentSchedules() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const container = document.getElementById('classScheduleDisplay');
    container.innerHTML = '<p class="text-grey-600 text-center">Loading schedules...</p>';
    try {
        const snapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/classSchedule`).orderBy('date', 'desc').limit(5).get();
        container.innerHTML = '';

        if (snapshot.docs.length === 0) {
            container.innerHTML = '<p class="text-grey-600 text-center">No schedules for this group.</p>';
            return;
        }
        snapshot.docs.forEach(doc => {
            const record = doc.data();
            const element = document.createElement('div');
            element.className = 'record-item';
            element.innerHTML = `
                <div>
                    <p class="font-semibold text-grey-800">${record.subject}</p>
                    <p class="text-sm text-grey-600">Date: ${record.date} at ${record.time}</p>
                    <p class="text-sm text-grey-600">Room: ${record.room}</p>
                </div>
                <span class="font-bold text-grey-800">Scheduled</span>
            `;
            container.appendChild(element);
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        container.innerHTML = '<p class="text-primary-red text-center">Failed to load schedules.</p>';
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
            fetchRecentSchedules();
            document.getElementById('classSubject').value = '';
            document.getElementById('classDate').value = '';
            document.getElementById('classTime').value = '';
            document.getElementById('classRoom').value = '';
        } catch (error) {
            console.error('Error adding schedule:', error);
            showMessageBox('Failed to add schedule.');
        }
    } else {
        showMessageBox('Please fill in all schedule fields.');
    }
}