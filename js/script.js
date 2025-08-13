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
let currentLang = 'ar'; // Default language

// --- Translations Dictionary ---
const translations = {
    ar: {
        pageTitle: "ليرناريا - لوحة تحكم المعلم",
        teacherDashboardTitle: "لوحة تحكم المعلم",
        teacherLoginTitle: "1. تسجيل دخول المعلم",
        teacherLoginPrompt: "الرجاء إدخال رقم هاتفك لتحميل بياناتك.",
        loadDashboardButton: "تحميل لوحة التحكم",
        myProfileTitle: "ملفي الشخصي",
        myNameLabel: "اسمي:",
        mySubjectLabel: "المادة التي أدرسها:",
        saveProfileButton: "حفظ ملفي الشخصي",
        manageGroupsTitle: "2. إدارة المجموعات",
        newGroupNameLabel: "اسم المجموعة الجديدة:",
        addNewGroupButton: "إضافة مجموعة جديدة",
        selectGroupLabel: "اختر مجموعة لإدارتها:",
        manageStudentsTitle: "إدارة الطلاب",
        studentNameLabel: "اسم الطالب:",
        parentPhoneLabel: "رقم هاتف ولي الأمر:",
        addNewStudentButton: "إضافة طالب جديد",
        searchStudentLabel: "البحث عن طالب:",
        allStudentsLabel: "كل الطلاب في هذه المجموعة:",
        attendanceTitle: "الحضور اليومي",
        selectDateLabel: "اختر التاريخ:",
        markAttendanceLabel: "تسجيل الحضور:",
        saveAttendanceButton: "حفظ الحضور اليومي",
        gradesTitle: "إدارة الدرجات",
        selectAssignmentLabel: "اختر الواجب:",
        newAssignmentNameLabel: "أو أضف اسم واجب جديد:",
        newAssignmentDateLabel: "تاريخ الواجب الجديد:",
        addNewAssignmentButton: "إضافة واجب جديد",
        enterGradesLabel: "أدخل الدرجات:",
        saveGradesButton: "حفظ درجات الواجب",
        scheduleTitle: "إدارة جدول الحصص",
        addRecurringScheduleTitle: "إضافة جدول متكرر جديد",
        subjectLabel: "المادة:",
        timeLabel: "الوقت:",
        selectDaysLabel: "اختر أيام الأسبوع:",
        saveRecurringScheduleButton: "حفظ الجدول المتكرر",
        mySchedulesLabel: "جداولي المتكررة:",
        modifySingleClassTitle: "تعديل حصة واحدة",
        modifyClassPrompt: "هل تحتاج إلى تغيير أو إلغاء حصة واحدة؟ اختر التاريخ وقم بالتغيير.",
        classDateLabel: "تاريخ الحصة:",
        newTimeLabel: "الوقت الجديد (اختياري):",
        updateClassButton: "تحديث الحصة",
        cancelClassButton: "إلغاء هذه الحصة",
        phonePlaceholder: "أدخل رقم هاتفك (مثال: +201001234567)",
        fullNamePlaceholder: "أدخل اسمك الكامل",
        subjectPlaceholder: "مثال: فيزياء، رياضيات",
        groupNamePlaceholder: "مثال: الصف الأول - صباحي",
        newStudentPlaceholder: "أدخل اسم الطالب الجديد",
        parentPhonePlaceholder: "مثال: +201001234567",
        searchPlaceholder: "اكتب اسمًا للبحث...",
        assignmentNamePlaceholder: "مثال: اختبار قصير 1",
        selectGroupOption: "-- اختر مجموعة --",
        welcomeMessage: "مرحباً،",
        completeProfileMessage: "الرجاء إكمال معلومات ملفك الشخصي.",
        profileSavedSuccess: "تم حفظ الملف الشخصي بنجاح!",
        profileSavedError: "فشل حفظ الملف الشخصي.",
        nameAndSubjectMissing: "الرجاء إدخال اسمك والمادة التي تدرسها.",
        groupAddedSuccess: "تمت إضافة المجموعة بنجاح!",
        groupAddedError: "فشل إضافة المجموعة.",
        groupNameMissing: "الرجاء إدخال اسم المجموعة.",
        studentAddedSuccess: "تمت إضافة طالب جديد للمجموعة!",
        studentAddedError: "فشل إضافة الطالب.",
        studentAndParentMissing: "الرجاء إدخال اسم الطالب ورقم هاتف ولي الأمر.",
        studentDeletedSuccess: "تم حذف الطالب بنجاح!",
        studentDeletedError: "فشل حذف الطالب.",
        deleteConfirmation: "هل أنت متأكد من حذف",
        attendanceDateMissing: "الرجاء اختيار تاريخ.",
        attendanceSavedSuccess: "تم حفظ الحضور بنجاح!",
        attendanceSavedError: "فشل حفظ الحضور.",
        selectAssignmentOption: "اختر واجبًا",
        assignmentAddedSuccess: "تمت إضافة واجب جديد!",
        assignmentNameDateMissing: "الرجاء إدخال اسم الواجب وتاريخه.",
        selectAssignmentFirst: "الرجاء اختيار واجب أولاً.",
        gradesSavedSuccess: "تم حفظ الدرجات بنجاح!",
        gradesSavedError: "فشل حفظ الدرجات.",
        scheduleSavedSuccess: "تم حفظ الجدول المتكرر بنجاح!",
        scheduleSavedError: "فشل حفظ الجدول.",
        fillScheduleForm: "الرجاء تعبئة المادة والوقت واختيار يوم واحد على الأقل.",
        scheduleDeletedSuccess: "تم حذف الجدول بنجاح!",
        scheduleDeletedError: "فشل حذف الجدول.",
        confirmScheduleDelete: "هل أنت متأكد من حذف هذا الجدول المتكرر بالكامل؟",
        classUpdatedSuccess: "تم تغيير موعد حصة {date} إلى {time}.",
        classUpdatedError: "فشل تحديث الحصة.",
        classDateAndTimeMissing: "الرجاء تحديد تاريخ الحصة والوقت الجديد.",
        classCancelledSuccess: "تم إلغاء حصة يوم {date}.",
        classCancelledError: "فشل إلغاء الحصة.",
        classDateMissing: "الرجاء اختيار تاريخ الحصة التي تريد إلغاءها.",
        confirmCancelClass: "هل أنت متأكد من إلغاء حصة يوم {date}؟",
        noStudentsInGroup: "لا يوجد طلاب في هذه المجموعة بعد.",
        parentLabel: "ولي الأمر:",
        notAvailable: "غير متوفر",
        deleteButton: "حذف",
        absent: "غائب",
        present: "حاضر",
        late: "متأخر",
        scorePlaceholder: "الدرجة",
        noDateSelected: "الرجاء اختيار تاريخ.",
        noStudentsAvailable: "لا يوجد طلاب في هذه المجموعة.",
        noAssignmentSelected: "الرجاء اختيار واجب.",
        loadingSchedules: "جاري تحميل الجداول...",
        noSchedulesYet: "لا توجد جداول متكررة لهذه المجموعة بعد.",
        repeatsOn: "تتكرر في:",
        days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    },
    en: {
        pageTitle: "Learnaria - Teacher Dashboard",
        teacherDashboardTitle: "Teacher Dashboard",
        teacherLoginTitle: "1. Teacher Login",
        teacherLoginPrompt: "Please enter your phone number to load your data.",
        loadDashboardButton: "Load My Dashboard",
        myProfileTitle: "My Profile",
        myNameLabel: "My Name:",
        mySubjectLabel: "Subject I Teach:",
        saveProfileButton: "Save My Profile",
        manageGroupsTitle: "2. Manage Groups",
        newGroupNameLabel: "New Group Name:",
        addNewGroupButton: "Add New Group",
        selectGroupLabel: "Select a Group to Manage:",
        manageStudentsTitle: "Manage Students",
        studentNameLabel: "Student Name:",
        parentPhoneLabel: "Parent Phone Number:",
        addNewStudentButton: "Add New Student",
        searchStudentLabel: "Search for a Student:",
        allStudentsLabel: "All Students in this Group:",
        attendanceTitle: "Daily Attendance",
        selectDateLabel: "Select Date:",
        markAttendanceLabel: "Mark Attendance:",
        saveAttendanceButton: "Save Daily Attendance",
        gradesTitle: "Grades Management",
        selectAssignmentLabel: "Select Assignment:",
        newAssignmentNameLabel: "Or Add New Assignment Name:",
        newAssignmentDateLabel: "New Assignment Date:",
        addNewAssignmentButton: "Add New Assignment",
        enterGradesLabel: "Enter Grades:",
        saveGradesButton: "Save Assignment Grades",
        scheduleTitle: "Class Schedule Management",
        addRecurringScheduleTitle: "Add New Recurring Schedule",
        subjectLabel: "Subject:",
        timeLabel: "Time:",
        selectDaysLabel: "Select Days of the Week:",
        saveRecurringScheduleButton: "Save Recurring Schedule",
        mySchedulesLabel: "My Recurring Schedules:",
        modifySingleClassTitle: "Modify a Single Class",
        modifyClassPrompt: "Need to change or cancel a single class? Select the date and make your change.",
        classDateLabel: "Date of Class:",
        newTimeLabel: "New Time (Optional):",
        updateClassButton: "Update Class",
        cancelClassButton: "Cancel This Class",
        phonePlaceholder: "Enter your phone number (e.g., +1234567890)",
        fullNamePlaceholder: "Enter your full name",
        subjectPlaceholder: "e.g., Physics, Math",
        groupNamePlaceholder: "e.g., Grade 10 - Morning",
        newStudentPlaceholder: "Enter new student name",
        parentPhonePlaceholder: "e.g., +1234567890",
        searchPlaceholder: "Type a name to search...",
        assignmentNamePlaceholder: "e.g., Quiz 1",
        selectGroupOption: "-- Select a Group --",
        welcomeMessage: "Welcome,",
        completeProfileMessage: "Please complete your profile information.",
        profileSavedSuccess: "Profile saved successfully!",
        profileSavedError: "Failed to save profile.",
        nameAndSubjectMissing: "Please enter your name and the subject you teach.",
        groupAddedSuccess: "Group added successfully!",
        groupAddedError: "Failed to add group.",
        groupNameMissing: "Please enter a group name.",
        studentAddedSuccess: "New student added to group!",
        studentAddedError: "Failed to add student.",
        studentAndParentMissing: "Please enter both student name and parent phone number.",
        studentDeletedSuccess: "Student deleted successfully!",
        studentDeletedError: "Failed to delete student.",
        deleteConfirmation: "Are you sure you want to delete",
        attendanceDateMissing: "Please select a date.",
        attendanceSavedSuccess: "Attendance saved successfully!",
        attendanceSavedError: "Failed to save attendance.",
        selectAssignmentOption: "Select an Assignment",
        assignmentAddedSuccess: "New assignment added!",
        assignmentNameDateMissing: "Please enter assignment name and date.",
        selectAssignmentFirst: "Please select an assignment first.",
        gradesSavedSuccess: "Grades saved successfully!",
        gradesSavedError: "Failed to save grades.",
        scheduleSavedSuccess: "Recurring schedule saved successfully!",
        scheduleSavedError: "Failed to save the schedule.",
        fillScheduleForm: "Please fill in subject, time, and select at least one day.",
        scheduleDeletedSuccess: "Schedule deleted successfully!",
        scheduleDeletedError: "Failed to delete schedule.",
        confirmScheduleDelete: "Are you sure you want to delete this entire recurring schedule?",
        classUpdatedSuccess: "Class on {date} has been rescheduled to {time}.",
        classUpdatedError: "Failed to update class.",
        classDateAndTimeMissing: "Please select the date of the class and the new time.",
        classCancelledSuccess: "Class on {date} has been cancelled.",
        classCancelledError: "Failed to cancel class.",
        classDateMissing: "Please select the date of the class you want to cancel.",
        confirmCancelClass: "Are you sure you want to cancel the class on {date}?",
        noStudentsInGroup: "No students in this group yet.",
        parentLabel: "Parent:",
        notAvailable: "N/A",
        deleteButton: "Delete",
        absent: "Absent",
        present: "Present",
        late: "Late",
        scorePlaceholder: "Score",
        noDateSelected: "Please select a date.",
        noStudentsAvailable: "No students available in this group.",
        noAssignmentSelected: "Please select an assignment.",
        loadingSchedules: "Loading schedules...",
        noSchedulesYet: "No recurring schedules set for this group yet.",
        repeatsOn: "Repeats on:",
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
};

// --- Utility Functions ---
function showMessageBox(messageKey) {
    const message = translations[currentLang][messageKey] || messageKey;
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

// --- Language and Theme Management ---
function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-key]').forEach(elem => {
        const key = elem.getAttribute('data-key');
        elem.innerText = translations[lang][key];
    });

    document.querySelectorAll('[data-key-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-key-placeholder');
        elem.placeholder = translations[lang][key];
    });
    
    document.getElementById('languageToggleButton').innerText = lang === 'ar' ? 'EN' : 'ع';

    // Refresh dynamic content
    renderDayCheckboxes();
    if (TEACHER_ID) {
        fetchGroups();
    }
    if (SELECTED_GROUP_ID) {
        // Use async/await to ensure students are loaded before rendering
        (async () => {
            await fetchStudents();
            fetchAssignments();
            fetchRecurringSchedules();
            renderAttendanceInputs();
            renderGradesInputs();
        })();
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    localStorage.setItem('learnaria-lang', newLang);
}

function loadInitialPreferences() {
    const savedLang = localStorage.getItem('learnaria-lang') || 'ar';
    setLanguage(savedLang);

    const isDarkMode = localStorage.getItem('learnaria-darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcons(isDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('learnaria-darkMode', isDarkMode);
    updateDarkModeIcons(isDarkMode);
}

function updateDarkModeIcons(isDarkMode) {
    const darkIcon = document.getElementById('darkModeIcon');
    const lightIcon = document.getElementById('lightModeIcon');
    if (isDarkMode) {
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    } else {
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
    }
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
    document.getElementById('addRecurringScheduleButton').addEventListener('click', saveRecurringSchedule);
    document.getElementById('updateSingleClassButton').addEventListener('click', updateSingleClass);
    document.getElementById('cancelSingleClassButton').addEventListener('click', cancelSingleClass);
    
    document.getElementById('darkModeToggleButton').addEventListener('click', toggleDarkMode);
    document.getElementById('languageToggleButton').addEventListener('click', toggleLanguage);
    
    loadInitialPreferences();
    addEnterKeyListeners();
});


function renderDayCheckboxes() {
    const container = document.getElementById('daysOfWeekContainer');
    const days = translations[currentLang].days;
    container.innerHTML = '';
    days.forEach(day => {
        const label = document.createElement('label');
        label.className = 'day-checkbox-container';
        label.innerHTML = `
            <input type="checkbox" class="day-checkbox" value="${day}">
            <span>${day}</span>
        `;
        container.appendChild(label);
    });
}

function addEnterKeyListeners() {
    const listenForEnter = (elementId, actionFunction) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    actionFunction();
                }
            });
        }
    };
    listenForEnter('teacherPhoneInput', setTeacher);
    listenForEnter('newGroupName', addNewGroup);
    listenForEnter('newParentPhoneNumber', addNewStudent);
    listenForEnter('newAssignmentDate', addNewAssignment);
    listenForEnter('exceptionNewTime', updateSingleClass);
}

// --- 1. Teacher Login & Profile ---
async function setTeacher() {
    const phone = document.getElementById('teacherPhoneInput').value.trim();
    if (phone) {
        TEACHER_ID = phone;
        document.getElementById('teacherPhoneInput').disabled = true;
        document.getElementById('setTeacherButton').disabled = true;

        try {
            const teacherDoc = await db.collection('teachers').doc(TEACHER_ID).get();
            const welcomeMsg = translations[currentLang].welcomeMessage;
            if (teacherDoc.exists) {
                const teacherData = teacherDoc.data();
                document.getElementById('dashboardTitle').innerText = `${welcomeMsg} ${teacherData.name || TEACHER_ID}`;
                document.getElementById('teacherNameInput').value = teacherData.name || '';
                document.getElementById('teacherSubjectInput').value = teacherData.subject || '';
            } else {
                document.getElementById('dashboardTitle').innerText = `${welcomeMsg} ${TEACHER_ID}`;
                showMessageBox('completeProfileMessage');
            }
        } catch (error) {
            console.error("Error fetching teacher profile:", error);
            document.getElementById('dashboardTitle').innerText = `${translations[currentLang].welcomeMessage} ${TEACHER_ID}`;
        }
        
        document.getElementById('mainContent').classList.remove('hidden');
        fetchGroups();
    } else {
        showMessageBox('phoneMissing');
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
            
            showMessageBox('profileSavedSuccess');
            document.getElementById('dashboardTitle').innerText = `${translations[currentLang].welcomeMessage} ${teacherName}`;
        } catch (error) {
            console.error("Error saving profile:", error);
            showMessageBox('profileSavedError');
        }
    } else {
        showMessageBox('nameAndSubjectMissing');
    }
}

// --- 2. Group Management ---
async function fetchGroups() {
    if (!TEACHER_ID) return;
    try {
        const groupsSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups`).get();
        const groupSelect = document.getElementById('groupSelect');
        const currentGroup = groupSelect.value;
        groupSelect.innerHTML = `<option value="">${translations[currentLang].selectGroupOption}</option>`;
        
        groupsSnapshot.docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.innerText = doc.data().name;
            groupSelect.appendChild(option);
        });
        if(currentGroup) {
            groupSelect.value = currentGroup;
        }
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}

async function addNewGroup() {
    if (!TEACHER_ID) return;
    const groupName = document.getElementById('newGroupName').value.trim();
    if (groupName) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups`).add({ name: groupName });
            showMessageBox('groupAddedSuccess');
            document.getElementById('newGroupName').value = '';
            fetchGroups();
        } catch (error) {
            console.error('Error adding group:', error);
            showMessageBox('groupAddedError');
        }
    } else {
        showMessageBox('groupNameMissing');
    }
}


// =========================================================================
// ===                    التعديل الجذري هنا لحل المشكلة               ===
// =========================================================================
async function handleGroupSelection() {
    SELECTED_GROUP_ID = document.getElementById('groupSelect').value;
    const groupContent = document.getElementById('groupContent');
    
    if (SELECTED_GROUP_ID) {
        groupContent.classList.remove('hidden');
        
        // الخطوة 1: انتظر اكتمال تحميل الطلاب أولاً وقبل كل شيء
        await fetchStudents(); 
        
        // الخطوة 2: الآن بعد أن تأكدنا من وجود الطلاب، قم بباقي العمليات
        fetchAssignments();
        fetchRecurringSchedules();

        // الخطوة 3: حدد تاريخ اليوم واعرض الطلاب في قائمة الحضور
        document.getElementById('attendanceDateInput').value = new Date().toISOString().split('T')[0];
        renderAttendanceInputs();
        
        // الخطوة 4: اعرض قائمة الدرجات (ستكون فارغة حتى يتم اختيار واجب)
        renderGradesInputs(); 

    } else {
        groupContent.classList.add('hidden');
    }
}
// =========================================================================


// --- 3. Students Management ---
async function fetchStudents() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) {
        allStudents = [];
        return;
    };
    try {
        const studentsSnapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/students`).get();
        allStudents = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // عرض الطلاب في القائمة الرئيسية فور تحميلهم
        renderStudentsList(document.getElementById('studentsListDisplay'), allStudents);
    } catch (error) {
        console.error('Error loading students:', error);
        allStudents = []; // Clear students on error
    }
}

function renderStudentsList(containerElement, students) {
    containerElement.innerHTML = '';
    if (students.length === 0) {
        containerElement.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].noStudentsInGroup}</p>`;
        return;
    }
    const parentLabel = translations[currentLang].parentLabel;
    const notAvailable = translations[currentLang].notAvailable;
    const deleteBtnText = translations[currentLang].deleteButton;

    students.forEach(student => {
        const studentElement = document.createElement('div');
        studentElement.className = 'record-item';
        studentElement.innerHTML = `
            <div>
                <p class="font-semibold text-grey-800">${student.name}</p>
                <p class="text-sm text-grey-600">${parentLabel} ${student.parentPhoneNumber || notAvailable}</p>
            </div>
            <button class="delete-student-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm" data-student-id="${student.id}" data-student-name="${student.name}">${deleteBtnText}</button>
        `;
        containerElement.appendChild(studentElement);
        studentElement.querySelector('.delete-student-btn').addEventListener('click', function() {
            const confirmMsg = `${translations[currentLang].deleteConfirmation} ${this.dataset.studentName}?`;
            if (confirm(confirmMsg)) {
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
            showMessageBox('studentAddedSuccess');
            document.getElementById('newStudentName').value = '';
            document.getElementById('newParentPhoneNumber').value = '';
            await fetchStudents(); // Re-fetch and re-render all lists
            renderAttendanceInputs();
            renderGradesInputs();

        } catch (error) {
            console.error('Error adding student:', error);
            showMessageBox('studentAddedError');
        }
    } else {
        showMessageBox('studentAndParentMissing');
    }
}

async function deleteStudent(studentId) {
    if (!TEACHER_ID || !SELECTED_GROUP_ID || !studentId) return;
    try {
        await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/students`).doc(studentId).delete();
        showMessageBox('studentDeletedSuccess');
        await fetchStudents(); // Re-fetch and re-render all lists
        renderAttendanceInputs();
        renderGradesInputs();
    } catch (error) {
        console.error('Error deleting student:', error);
        showMessageBox('studentDeletedError');
    }
}

// --- 4. Attendance Management ---
async function renderAttendanceInputs() {
    const attendanceDate = document.getElementById('attendanceDateInput').value;
    const container = document.getElementById('attendanceStudentsContainer');
    container.innerHTML = ''; 

    if (!attendanceDate) {
        container.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].noDateSelected}</p>`;
        return;
    }
    // التأكد من أن allStudents ليست فارغة
    if (!allStudents || allStudents.length === 0) {
        container.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].noStudentsAvailable}</p>`;
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

    const absent = translations[currentLang].absent;
    const present = translations[currentLang].present;
    const late = translations[currentLang].late;

    allStudents.forEach(student => {
        const row = document.createElement('div');
        row.className = 'student-row';
        row.innerHTML = `
            <span class="student-name">${student.name}</span>
            <select class="attendance-status-select" data-student-id="${student.id}">
                <option value="absent">${absent}</option>
                <option value="present">${present}</option>
                <option value="late">${late}</option>
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
        showMessageBox('attendanceDateMissing');
        return;
    }
    const records = [];
    document.querySelectorAll('#attendanceStudentsContainer .attendance-status-select').forEach(select => {
        records.push({ studentId: select.dataset.studentId, status: select.value });
    });

    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/dailyAttendance`).doc(attendanceDate);
        await docRef.set({ date: attendanceDate, records: records }, { merge: true });
        showMessageBox('attendanceSavedSuccess');
    } catch (error) {
        console.error('Error saving attendance:', error);
        showMessageBox('attendanceSavedError');
    }
}

// --- 5. Grades Management ---
async function fetchAssignments() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    try {
        const snapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).get();
        const select = document.getElementById('assignmentSelect');
        const currentAssignment = select.value;
        select.innerHTML = `<option value="">${translations[currentLang].selectAssignmentOption}</option>`;
        snapshot.docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.innerText = `${doc.data().name} (${doc.data().date})`;
            select.appendChild(option);
        });
        if(currentAssignment) {
           select.value = currentAssignment;
        }

    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

async function renderGradesInputs() {
    const assignmentId = document.getElementById('assignmentSelect').value;
    const container = document.getElementById('gradesStudentsContainer');
    container.innerHTML = '';

    if (!assignmentId) {
        container.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].noAssignmentSelected}</p>`;
        return;
    }
    if (!allStudents || allStudents.length === 0) {
        container.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].noStudentsAvailable}</p>`;
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
            <input type="number" class="grade-input" data-student-id="${student.id}" min="0" max="100" placeholder="${translations[currentLang].scorePlaceholder}">
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
            const newDoc = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/assignments`).add({
                name: name,
                date: date,
                scores: []
            });
            showMessageBox('assignmentAddedSuccess');
            await fetchAssignments();
            document.getElementById('assignmentSelect').value = newDoc.id;
            renderGradesInputs();
            document.getElementById('newAssignmentName').value = '';
            document.getElementById('newAssignmentDate').value = '';
        } catch (error) {
            console.error('Error adding assignment:', error);
            showMessageBox('assignmentAddedError');
        }
    } else {
        showMessageBox('assignmentNameDateMissing');
    }
}

async function saveAssignmentGrades() {
    const assignmentId = document.getElementById('assignmentSelect').value;
    if (!TEACHER_ID || !SELECTED_GROUP_ID || !assignmentId) {
        showMessageBox('selectAssignmentFirst');
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
        showMessageBox('gradesSavedSuccess');
    } catch(error) {
        console.error('Error saving grades:', error);
        showMessageBox('gradesSavedError');
    }
}

// --- 6. Class Schedule Management ---
async function saveRecurringSchedule() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const subject = document.getElementById('recurringSubject').value.trim();
    const time = document.getElementById('recurringTime').value;
    const selectedDays = [];
    document.querySelectorAll('#daysOfWeekContainer .day-checkbox:checked').forEach(checkbox => {
        selectedDays.push(checkbox.value);
    });

    if (subject && time && selectedDays.length > 0) {
        try {
            await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/recurringSchedules`).add({
                subject: subject,
                time: time,
                days: selectedDays
            });
            showMessageBox('scheduleSavedSuccess');
            fetchRecurringSchedules();
            document.getElementById('recurringSubject').value = '';
            document.getElementById('recurringTime').value = '';
            document.querySelectorAll('#daysOfWeekContainer .day-checkbox').forEach(cb => cb.checked = false);

        } catch (error) {
            console.error('Error saving recurring schedule:', error);
            showMessageBox('scheduleSavedError');
        }
    } else {
        showMessageBox('fillScheduleForm');
    }
}

async function fetchRecurringSchedules() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const container = document.getElementById('recurringSchedulesDisplay');
    container.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].loadingSchedules}</p>`;
    
    try {
        const snapshot = await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/recurringSchedules`).get();
        container.innerHTML = '';

        if (snapshot.empty) {
            container.innerHTML = `<p class="text-grey-600 text-center p-4">${translations[currentLang].noSchedulesYet}</p>`;
            return;
        }

        snapshot.docs.forEach(doc => {
            const schedule = doc.data();
            const scheduleId = doc.id;
            const element = document.createElement('div');
            element.className = 'record-item';
            element.innerHTML = `
                <div>
                    <p class="font-semibold text-grey-800">${schedule.subject} at ${schedule.time}</p>
                    <p class="text-sm text-grey-600">${translations[currentLang].repeatsOn} ${schedule.days.join(', ')}</p>
                </div>
                <button class="delete-schedule-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm" data-schedule-id="${scheduleId}">${translations[currentLang].deleteButton}</button>
            `;
            container.appendChild(element);

            element.querySelector('.delete-schedule-btn').addEventListener('click', function() {
                if (confirm(translations[currentLang].confirmScheduleDelete)) {
                    deleteRecurringSchedule(this.dataset.scheduleId);
                }
            });
        });

    } catch (error) {
        console.error('Error fetching recurring schedules:', error);
        container.innerHTML = '<p class="text-primary-red text-center">Failed to load schedules.</p>';
    }
}

async function deleteRecurringSchedule(scheduleId) {
    if (!TEACHER_ID || !SELECTED_GROUP_ID || !scheduleId) return;
    try {
        await db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/recurringSchedules`).doc(scheduleId).delete();
        showMessageBox('scheduleDeletedSuccess');
        fetchRecurringSchedules();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        showMessageBox('scheduleDeletedError');
    }
}

async function updateSingleClass() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const date = document.getElementById('exceptionDate').value;
    const newTime = document.getElementById('exceptionNewTime').value;

    if (!date || !newTime) {
        showMessageBox('classDateAndTimeMissing');
        return;
    }

    try {
        const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/scheduleExceptions`).doc(date);
        await docRef.set({
            date: date,
            newTime: newTime,
            status: 'rescheduled'
        }, { merge: true });

        const successMsg = translations[currentLang].classUpdatedSuccess.replace('{date}', date).replace('{time}', newTime);
        showMessageBox(successMsg);
        document.getElementById('exceptionDate').value = '';
        document.getElementById('exceptionNewTime').value = '';
    } catch (error) {
        console.error('Error updating class:', error);
        showMessageBox('classUpdatedError');
    }
}

async function cancelSingleClass() {
    if (!TEACHER_ID || !SELECTED_GROUP_ID) return;
    const date = document.getElementById('exceptionDate').value;

    if (!date) {
        showMessageBox('classDateMissing');
        return;
    }
    
    const confirmMsg = translations[currentLang].confirmCancelClass.replace('{date}', date);
    if (confirm(confirmMsg)) {
        try {
            const docRef = db.collection(`teachers/${TEACHER_ID}/groups/${SELECTED_GROUP_ID}/scheduleExceptions`).doc(date);
            await docRef.set({
                date: date,
                status: 'cancelled'
            }, { merge: true });

            const successMsg = translations[currentLang].classCancelledSuccess.replace('{date}', date);
            showMessageBox(successMsg);
            document.getElementById('exceptionDate').value = '';
            document.getElementById('exceptionNewTime').value = '';
        } catch (error) {
            console.error('Error cancelling class:', error);
            showMessageBox('classCancelledError');
        }
    }
}