// localStorage implementation
const storage = {
    _workouts: null,
    _templates: null,
    _customWorkoutTypes: null,

    get workouts() {
        if (!this._workouts) {
            this._workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        }
        return this._workouts;
    },

    set workouts(value) {
        this._workouts = value;
        localStorage.setItem('workouts', JSON.stringify(value));
    },

    get templates() {
        if (!this._templates) {
            this._templates = JSON.parse(localStorage.getItem('templates') || '{}');
        }
        return this._templates;
    },

    set templates(value) {
        this._templates = value;
        localStorage.setItem('templates', JSON.stringify(value));
    },

    get customWorkoutTypes() {
        if (!this._customWorkoutTypes) {
            this._customWorkoutTypes = JSON.parse(localStorage.getItem('customWorkoutTypes') || '[]');
        }
        return this._customWorkoutTypes;
    },

    set customWorkoutTypes(value) {
        this._customWorkoutTypes = value;
        localStorage.setItem('customWorkoutTypes', JSON.stringify(value));
    },

    get calendarTextMode() {
        const saved = localStorage.getItem('calendarTextMode');
        return saved === 'true';
    },

    set calendarTextMode(value) {
        localStorage.setItem('calendarTextMode', value);
    },

    saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(this._workouts));
    },

    saveTemplates() {
        localStorage.setItem('templates', JSON.stringify(this._templates));
    },

    saveCustomWorkoutTypes() {
        localStorage.setItem('customWorkoutTypes', JSON.stringify(this._customWorkoutTypes));
    },

    currentWorkout: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    isViewMode: false,
    editingWorkoutId: null,
    selectedDate: null,
    activeCalendarDay: null,
    customWorkoutColor: '#4c6ef5',
    customExercises: [],
    isEditingWorkoutType: false,
    isFromCalendar: false,
    selectedTemplate: null,
    currentWeekOffset: 0,
    isCreatingNewTemplate: false  // ADD THIS LINE
};
// Default exercise templates
const defaultTemplates = {
    push: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Tricep Dips'],
    pull: ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Bicep Curls'],
    legs: ['Squats', 'Deadlift', 'Leg Press', 'Leg Curls'],
    upper: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Barbell Row'],
    lower: ['Squats', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'],
    whole: ['Squats', 'Bench Press', 'Deadlift', 'Pull-ups', 'Overhead Press']
};

function showScreen(screenName) {
    document.getElementById('workoutDetailsSection').style.display = 'none';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(screenName).classList.add('active');

    const navBtns = document.querySelectorAll('.nav-btn');
    if (screenName === 'home') {
        navBtns[0].classList.add('active');
        renderHomeScreen();
    }
    if (screenName === 'calendar') navBtns[1].classList.add('active');
    if (screenName === 'stats') navBtns[2].classList.add('active');

    if (screenName === 'calendar') renderCalendar();
    if (screenName === 'stats') renderStats();
}

function startWorkout(type, date = null, templateData = null) {
    storage.isViewMode = false;
    storage.editingWorkoutId = null;
    storage.isEditingWorkoutType = false;

    let exercises;
    if (templateData) {
        // Use custom template
        exercises = JSON.parse(JSON.stringify(templateData.exercises));
    } else {
        // Check if it's a custom workout type (including warmup/cooldown)
        const customType = storage.customWorkoutTypes.find(t => t.id === type);
        if (customType) {
            exercises = JSON.parse(JSON.stringify(customType.exercises));
        } else if (defaultTemplates[type]) {
            // Use default template ONLY if it exists
            exercises = defaultTemplates[type].map(name => ({
                name: name,
                sets: 3,
                reps: 10,
                weight: 0,
                notes: ''
            }));
        } else {
            // No template found - start with empty exercises
            exercises = [];
        }
    }

    storage.currentWorkout = {
        id: Date.now(),
        type: type,
        date: date ? date : new Date().toISOString(),
        exercises: exercises
    };

    // Get display name
    let displayName;
    const customType = storage.customWorkoutTypes.find(t => t.id === type);
    if (customType) {
        displayName = customType.name;
    } else if (type === 'warmup') {
        displayName = 'Warm-up';
    } else if (type === 'cooldown') {
        displayName = 'Cool-down';
    } else {
        displayName = type.charAt(0).toUpperCase() + type.slice(1);
    }

    document.getElementById('workoutTitle').textContent = displayName + ' Workout';
    document.getElementById('workoutDate').textContent = new Date(storage.currentWorkout.date).toLocaleDateString();
    document.getElementById('viewModeIndicator').innerHTML = '';
    renderExercises();
    renderWorkoutActions();
    showScreen('workout');
}
function selectWorkoutType(type) {
    storage.selectedWorkoutType = type;
    showTemplateSelector(type);
}

function showWorkoutTypePreview(type, templateData = null) {
    storage.isViewMode = true;
    storage.isEditingWorkoutType = true;
    storage.selectedTemplate = templateData;

    // Get exercises for this type
    let exercises;
    if (templateData) {
        // Using a specific template (Previous or custom template)
        exercises = JSON.parse(JSON.stringify(templateData.exercises));
    } else if (storage.isCreatingNewTemplate) {
        // Creating NEW template from ➕ button - start EMPTY
        exercises = [];
    } else {
        // Not creating new, but no template provided - use defaults if available
        const customType = storage.customWorkoutTypes.find(t => t.id === type);
        if (customType) {
            exercises = JSON.parse(JSON.stringify(customType.exercises));
        } else if (defaultTemplates[type]) {
            exercises = defaultTemplates[type].map(name => ({
                name: name,
                sets: 3,
                reps: 10,
                weight: 0,
                notes: ''
            }));
        } else {
            exercises = [];
        }
    }

    storage.currentWorkout = {
        type: type,
        exercises: exercises
    };

    // Get display name
    let displayName;
    const customType = storage.customWorkoutTypes.find(t => t.id === type);
    if (customType) {
        displayName = customType.name;
    } else if (type === 'warmup') {
        displayName = 'Warm-up';
    } else if (type === 'cooldown') {
        displayName = 'Cool-down';
    } else {
        displayName = type.charAt(0).toUpperCase() + type.slice(1);
    }

    document.getElementById('workoutTitle').textContent = displayName + ' Workout';
    document.getElementById('workoutDate').textContent = 'Preview';

    renderExercises();
    renderPreviewActions();
    showScreen('workout');
}
function renderPreviewActions() {
    const container = document.getElementById('workoutActions');
    container.innerHTML = `
        <div class="action-buttons">
            <button class="save-template-btn" onclick="editFromPreview()">Edit & Start Workout</button>
        </div>
    `;
}

function editFromPreview() {
    storage.isViewMode = false;
    // isEditingWorkoutType stays true (don't change it)

    document.getElementById('workoutDate').textContent = 'Editing';
    document.getElementById('viewModeIndicator').innerHTML = '';

    renderExercises();
    renderWorkoutActions();
}

function showTemplateSelector(type) {
    const modal = document.getElementById('templateSelectorModal');
    const container = document.getElementById('templateList');

    // Get display name
    let displayName;
    const customType = storage.customWorkoutTypes.find(t => t.id === type);
    if (customType) {
        displayName = customType.name;
    } else if (type === 'warmup') {
        displayName = 'Warm-up';
    } else if (type === 'cooldown') {
        displayName = 'Cool-down';
    } else {
        displayName = type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Set title
    document.getElementById('templateSelectorTitle').textContent =
        `Select ${displayName} Template`;
    // Wire the HEADER ➕ button
    const addBtn = document.getElementById('addTemplateBtn');
    addBtn.onclick = () => {
        closeTemplateSelector();
        if (storage.isFromCalendar) {
            startWorkout(type, storage.selectedDate.toISOString(), null);
            storage.isFromCalendar = false;
        } else {
            // Mark that we're creating a NEW template (not editing)
            storage.isCreatingNewTemplate = true;  // ADD THIS LINE
            showWorkoutTypePreview(type, null);
        }
    };

    container.innerHTML = '';

    const isWarmupOrCooldown = (type === 'warmup' || type === 'cooldown');

    if (!isWarmupOrCooldown) {
        const isCustomType = storage.customWorkoutTypes.find(t => t.id === type);
        const hasDefaultTemplate = defaultTemplates[type] !== undefined;

        if (hasDefaultTemplate && !isCustomType) {
            const defaultBtn = document.createElement('button');
            defaultBtn.className = 'workout-btn ' + type;
            defaultBtn.innerHTML = `
        <div class="workout-btn-content">
            <span class="material-symbols-outlined workout-btn-icon">fitness_center</span>
            <span>Default</span>
        </div>
    `;

            defaultBtn.onclick = () => {
                closeTemplateSelector();
                storage.isCreatingNewTemplate = false;
                if (storage.isFromCalendar) {
                    startWorkout(type, storage.selectedDate.toISOString(), null);
                    storage.isFromCalendar = false;
                } else {
                    showWorkoutTypePreview(type, null);
                }
            };

            container.appendChild(defaultBtn);
        }

        const previousWorkouts = storage.workouts
            .filter(w => w.type === type && w.exercises?.length)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (previousWorkouts.length) {
            const lastWorkout = previousWorkouts[0];
            const prevBtn = document.createElement('button');
            prevBtn.className = 'workout-btn ' + type;

            const workoutDate = new Date(lastWorkout.date)
                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            prevBtn.innerHTML = `
        <div class="workout-btn-content">
            <span class="material-symbols-outlined workout-btn-icon">history</span>
            <span>Previous (${workoutDate})</span>
        </div>
    `;

            prevBtn.onclick = () => {
                closeTemplateSelector();
                storage.isCreatingNewTemplate = false;
                const previousTemplate = {
                    name: 'Previous',
                    exercises: JSON.parse(JSON.stringify(lastWorkout.exercises))
                };

                if (storage.isFromCalendar) {
                    startWorkout(type, storage.selectedDate.toISOString(), previousTemplate);
                    storage.isFromCalendar = false;
                } else {
                    showWorkoutTypePreview(type, previousTemplate);
                }
            };

            container.appendChild(prevBtn);
        }
    }

    // Custom templates (ALL types)
    const userTemplates = storage.templates[type] || [];
    userTemplates.forEach((template, idx) => {
        const btn = document.createElement('button');
        btn.className = 'workout-btn ' + type;
        btn.innerHTML = `
        <div class="workout-btn-content">
            <span class="material-symbols-outlined workout-btn-icon">bookmark</span>
            <span class="template-name">${template.name}</span>
        </div>
        <button
            class="delete-template-btn"
            onclick="event.stopPropagation(); deleteTemplate('${type}', ${idx})"
            aria-label="Delete template"
        >
            <span class="material-symbols-outlined">close</span>
        </button>
    `;

        btn.onclick = () => {
            closeTemplateSelector();
            storage.isCreatingNewTemplate = false;
            if (storage.isFromCalendar) {
                startWorkout(type, storage.selectedDate.toISOString(), template);
                storage.isFromCalendar = false;
            } else {
                showWorkoutTypePreview(type, template);
            }
        };

        container.appendChild(btn);
    });

    // Empty state (TEXT ONLY)
    if (container.children.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText =
            'padding:20px;text-align:center;color:#6c757d;';
        emptyMsg.textContent = 'No templates yet';
        container.appendChild(emptyMsg);
    }

    modal.classList.add('active');
}


function closeTemplateSelector() {
    document.getElementById('templateSelectorModal').classList.remove('active');
}

function deleteTemplate(type, idx) {
    if (!confirm('Delete this template?')) return;

    const templates = storage.templates;
    templates[type].splice(idx, 1);
    storage.templates = templates;
    storage.saveTemplates();
    showTemplateSelector(type);
}

function markRest() {
    const today = new Date();
    const todayStr = today.toDateString();

    // Check if ANY workout/rest already exists for today
    const existingEntry = storage.workouts.find(w =>
        new Date(w.date).toDateString() === todayStr
    );

    if (existingEntry) {
        alert('Already logged for today! Check calendar 📅');
        return;
    }

    storage.workouts.push({
        id: Date.now(),
        type: 'rest',
        date: new Date().toISOString(),
        exercises: []
    });
    storage.saveWorkouts();
    alert('Rest day marked! 💤');
    renderCalendar();
}

function autoSave() {
    if (!storage.currentWorkout || storage.isViewMode || storage.isEditingWorkoutType) return;

    const existingIdx = storage.workouts.findIndex(w => w.id === storage.currentWorkout.id);

    if (existingIdx >= 0) {
        storage.workouts[existingIdx] = { ...storage.currentWorkout };
    } else {
        storage.workouts.push({ ...storage.currentWorkout });
    }
    storage.saveWorkouts();
}


function renderExercises() {
    const container = document.getElementById('exerciseList');
    container.innerHTML = '';

    if (!storage.currentWorkout || !storage.currentWorkout.exercises) return;

    storage.currentWorkout.exercises.forEach((ex, idx) => {
        const div = document.createElement('div');
        div.className = 'exercise-item';

        if (storage.isViewMode) {
            // View mode - simple format
            div.innerHTML = `
                <div class="exercise-name" style="margin-bottom: 8px;">${ex.name}</div>
                <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 4px;">
                    ${ex.sets} sets × ${ex.reps} reps × ${ex.weight === 'BW' ? 'Bodyweight' : ex.weight + ' kg'}
                </div>
                ${ex.notes ? `<div class="notes-display">${ex.notes}</div>` : ''}
            `;
        } else {
            // Edit mode - new redesigned layout
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <input type="text" class="exercise-name-input" value="${ex.name}" 
                           onchange="updateExerciseName(${idx}, this.value)"
                           style="flex: 1; margin-right: 10px; padding: 6px; font-weight: 600; font-size: 0.95em;">
                    <button class="delete-exercise" onclick="deleteExercise(${idx})">
                    
                        <span class="material-icons" style="font-size: 20px; color: #4e4b4bff;">delete</span>
 


                    </button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px;">
                    <!-- SETS -->
                    <div style="text-align: center;">
                        <div style="font-size: 0.75em; font-weight: 600; color: #6c757d; margin-bottom: 6px;">SETS</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <button class="control-btn minus" onclick="changeValue(${idx}, 'sets', -1)">−</button>
                            <input type="number" class="value-input" value="${ex.sets}" 
                                   onchange="updateValue(${idx}, 'sets', this.value)" min="1"
                                   style="width: 45px;">
                            <button class="control-btn plus" onclick="changeValue(${idx}, 'sets', 1)">+</button>
                        </div>
                    </div>
                    
                    <!-- REPS -->
                    <div style="text-align: center;">
                        <div style="font-size: 0.75em; font-weight: 600; color: #6c757d; margin-bottom: 6px;">REPS</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <button class="control-btn minus" onclick="changeValue(${idx}, 'reps', -1)">−</button>
                            <input type="number" class="value-input" value="${ex.reps}" 
                                   onchange="updateValue(${idx}, 'reps', this.value)" min="1"
                                   style="width: 45px;">
                            <button class="control-btn plus" onclick="changeValue(${idx}, 'reps', 1)">+</button>
                        </div>
                    </div>
                    
                    <!-- KG -->
                    <div style="text-align: center;">
<div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px;"> 
    <div style="font-size: 0.75em; font-weight: 600; color: #6c757d;">KG</div>

    <label style="display: flex; align-items: center; justify-content: center; gap: 3px; font-size: 0.6em; color: #6c757d;">
        <input 
            type="checkbox"
            style="zoom: 0.7;"
            ${ex.weight === 'BW' ? 'checked' : ''} 
            onchange="toggleBodyweight(${idx}, this.checked)"
        >
        BW
    </label>
</div>




                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <button class="control-btn minus" onclick="changeValue(${idx}, 'weight', -2.5)" ${ex.weight === 'BW' ? 'disabled' : ''}>−</button>
                            <input type="text" class="value-input" value="${ex.weight}" 
                                   onchange="updateValue(${idx}, 'weight', this.value)" 
                                   ${ex.weight === 'BW' ? 'disabled' : ''}
                                   style="width: 45px;">
                            <button class="control-btn plus" onclick="changeValue(${idx}, 'weight', 2.5)" ${ex.weight === 'BW' ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                </div>
                
                <textarea class="notes-input" 
                          placeholder="Notes (optional)" 
                          onchange="updateNotes(${idx}, this.value)"
                          rows="1">${ex.notes || ''}</textarea>
            `;
        }

        container.appendChild(div);
    });
}

function updateExerciseName(exIdx, newName) {
    storage.currentWorkout.exercises[exIdx].name = newName;
    autoSave();
}

function updateNotes(exIdx, notes) {
    storage.currentWorkout.exercises[exIdx].notes = notes;
    autoSave();
}


function toggleBodyweight(exIdx, isBodyweight) {
    const ex = storage.currentWorkout.exercises[exIdx];
    ex.weight = isBodyweight ? 'BW' : 0;
    renderExercises();
    autoSave();
}

function changeValue(exIdx, field, delta) {
    const ex = storage.currentWorkout.exercises[exIdx];
    if (field === 'sets') {
        ex.sets = Math.max(1, ex.sets + delta);
    } else if (field === 'reps') {
        ex.reps = Math.max(1, ex.reps + delta);
    } else if (field === 'weight' && ex.weight !== 'BW') {
        ex.weight = Math.max(0, parseFloat(ex.weight) + delta);
    }
    renderExercises();
    autoSave();
}

function updateValue(exIdx, field, value) {
    const ex = storage.currentWorkout.exercises[exIdx];
    if (field === 'weight') {
        ex[field] = value === 'BW' ? 'BW' : (parseFloat(value) || 0);
    } else {
        ex[field] = parseFloat(value) || 0;
    }
    renderExercises();
    autoSave();
}

function renderWorkoutActions() {
    const container = document.getElementById('workoutActions');

    if (storage.isViewMode) {
        container.innerHTML = `
            <div class="action-buttons">
                <button class="save-template-btn" onclick="editCurrentWorkout()">Edit</button>
                <button class="delete-btn" onclick="deleteWorkout()">Delete</button>
            </div>
        `;
    } else if (storage.isEditingWorkoutType) {
        const isWarmupOrCooldown = (storage.currentWorkout.type === 'warmup' || storage.currentWorkout.type === 'cooldown');
        const isEditingExistingTemplate = storage.selectedTemplate && storage.selectedTemplate.name && storage.selectedTemplate.name !== 'Previous';

        // CHANGE THIS SECTION:
        if (storage.isCreatingNewTemplate) {
            // Creating brand new template - only "Save as" button
            container.innerHTML = `
                <button class="add-exercise-btn" onclick="openAddExercise()">Add Exercise</button>
                <div class="action-buttons">
                    <button class="finish-btn" onclick="openSaveTemplate()">Save as</button>
                </div>
            `;
        } else if (isEditingExistingTemplate) {
            // Editing existing template - both "Save" and "Save as"
            container.innerHTML = `
                <button class="add-exercise-btn" onclick="openAddExercise()">Add Exercise</button>
                <div class="action-buttons">
                    <button class="save-template-btn" onclick="openSaveTemplate()">Save as</button>
                    <button class="finish-btn" onclick="saveWorkoutTypeEdit()">Save</button>
                </div>
            `;
        } else {
            // Editing default/previous - only "Save as"
            container.innerHTML = `
                <button class="add-exercise-btn" onclick="openAddExercise()">Add Exercise</button>
                <div class="action-buttons">
                    <button class="save-template-btn" onclick="openSaveTemplate()">Save as</button>
                </div>
            `;
        }
    } else {
        container.innerHTML = `
            <button class="add-exercise-btn" onclick="openAddExercise()">Add Exercise</button>
            <div class="action-buttons">
                <button class="save-template-btn" onclick="openSaveTemplate()">Save as</button>
                <button class="finish-btn" onclick="finishWorkout()">Log</button>
            </div>
        `;
    }
}

function saveWorkoutTypeEdit() {
    const type = storage.currentWorkout.type;
    const isWarmupOrCooldown = (type === 'warmup' || type === 'cooldown');

    // If editing an existing template (not creating new one)
    if (storage.selectedTemplate && storage.selectedTemplate.name && storage.selectedTemplate.name !== 'Previous') {
        const templates = storage.templates;
        const categoryTemplates = templates[type] || [];

        // Find and update the template
        const templateIndex = categoryTemplates.findIndex(t => t.name === storage.selectedTemplate.name);
        if (templateIndex >= 0) {
            categoryTemplates[templateIndex].exercises = JSON.parse(JSON.stringify(storage.currentWorkout.exercises));
            storage.templates = templates;
            storage.saveTemplates();
            alert(`Template "${storage.selectedTemplate.name}" updated! 💾`);
        }
    } else if (isWarmupOrCooldown) {
        // For warmup/cooldown creating NEW template (selectedTemplate is null)
        // User needs to use "Save as" button to give it a name first
        alert('Please use "Save as" to create your first template! 💡');
    } else {
        // If editing default or previous workout for regular types
        alert('Changes not saved (Default/Previous templates cannot be updated) 💡');
    }

    storage.isEditingWorkoutType = false;
    storage.currentWorkout = null;
    storage.isViewMode = false;
    storage.selectedTemplate = null;
    showScreen('home');
}


function deleteExercise(idx) {
    storage.currentWorkout.exercises.splice(idx, 1);
    renderExercises();
    autoSave();
}

function openAddExercise() {
    document.getElementById('exerciseModal').classList.add('active');
}

function closeAddExercise() {
    document.getElementById('exerciseModal').classList.remove('active');
}

function addExercise() {
    const name = document.getElementById('exerciseName').value;
    const sets = parseInt(document.getElementById('exerciseSets').value);
    const reps = parseInt(document.getElementById('exerciseReps').value);
    const weight = parseFloat(document.getElementById('exerciseWeight').value);

    if (!name) {
        alert('Please enter exercise name');
        return;
    }

    storage.currentWorkout.exercises.push({ name, sets, reps, weight, notes: '' });
    renderExercises();
    closeAddExercise();
    autoSave();

    // Reset form
    document.getElementById('exerciseName').value = '';
    document.getElementById('exerciseSets').value = '3';
    document.getElementById('exerciseReps').value = '10';
    document.getElementById('exerciseWeight').value = '0';
}

// function openNotes(exIdx) {
//     storage.editingNotesIndex = exIdx;
//     const ex = storage.currentWorkout.exercises[exIdx];
//     document.getElementById('notesText').value = ex.notes || '';
//     document.getElementById('notesModal').classList.add('active');
// }

// function closeNotes() {
//     document.getElementById('notesModal').classList.remove('active');
// }

// function saveNotes() {
//     const notes = document.getElementById('notesText').value;
//     storage.currentWorkout.exercises[storage.editingNotesIndex].notes = notes;
//     renderExercises();
//     closeNotes();
//     autoSave();
// }

function openSaveTemplate() {
    document.getElementById('saveTemplateModal').classList.add('active');
    document.getElementById('templateName').value = '';

    // Set the category dropdown
    const categoryDropdown = document.getElementById('templateCategory');

    // Check if current type is warmup or cooldown
    if (storage.currentWorkout.type === 'warmup' || storage.currentWorkout.type === 'cooldown') {
        categoryDropdown.value = storage.currentWorkout.type;
        categoryDropdown.disabled = true; // Lock it so user can't change
    } else {
        categoryDropdown.value = storage.currentWorkout.type;
        categoryDropdown.disabled = false;
    }

    // Populate custom workout types in the dropdown
    const customOptionsGroup = document.getElementById('customCategoryOptions');
    customOptionsGroup.innerHTML = '';

    storage.customWorkoutTypes.forEach((custom) => {
        const option = document.createElement('option');
        option.value = custom.id;
        option.textContent = custom.name;
        customOptionsGroup.appendChild(option);
    });

    // If current workout is a custom type, select it
    const isCustomType = storage.customWorkoutTypes.find(t => t.id === storage.currentWorkout.type);
    if (isCustomType) {
        categoryDropdown.value = storage.currentWorkout.type;
    }
}

function closeSaveTemplate() {
    document.getElementById('saveTemplateModal').classList.remove('active');
}
function saveAsTemplate() {
    const name = document.getElementById('templateName').value.trim();
    const category = document.getElementById('templateCategory').value;

    const templates = storage.templates;
    if (!templates[category]) {
        templates[category] = [];
    }

    // Generate template name based on existing count
    let templateName;
    if (name) {
        templateName = name;
    } else {
        // Find the next available template number
        let templateNum = 1;
        while (templates[category].some(t => t.name === `Template ${templateNum}`)) {
            templateNum++;
        }
        templateName = `Template ${templateNum}`;
    }

    const newTemplate = {
        name: templateName,
        exercises: JSON.parse(JSON.stringify(storage.currentWorkout.exercises))
    };

    templates[category].push(newTemplate);
    storage.templates = templates;
    storage.saveTemplates();

    closeSaveTemplate();
    alert(`Template "${templateName}" saved! 💾`);
}

function finishWorkout() {
    autoSave();
    alert('Workout completed! 💪');
    storage.currentWorkout = null;
    storage.isViewMode = false;
    showScreen('calendar');
}

function goBackFromWorkout() {
    if (storage.isViewMode) {
        storage.isViewMode = false;
        storage.currentWorkout = null;
        showScreen('calendar');
    } else {
        showScreen('home');
    }
}

function editCurrentWorkout() {
    storage.isViewMode = false;
    renderExercises();
    renderWorkoutActions();
}

function deleteWorkout() {
    if (!confirm('Are you sure you want to delete this workout?')) {
        return;
    }

    const workoutId = storage.currentWorkout.id;
    const idx = storage.workouts.findIndex(w => w.id === workoutId);

    if (idx >= 0) {
        storage.workouts.splice(idx, 1);
        storage.saveWorkouts();
    }

    alert('Workout deleted! 🗑️');
    storage.currentWorkout = null;
    storage.isViewMode = false;
    showScreen('calendar');
}

function viewWorkout(workoutId) {
    const workout = storage.workouts.find(w => w.id === workoutId);
    if (!workout) return;

    storage.currentWorkout = JSON.parse(JSON.stringify(workout));
    storage.isViewMode = true;

    // Get display name
    let displayName;
    const customType = storage.customWorkoutTypes.find(t => t.id === workout.type);
    if (customType) {
        displayName = customType.name;
    } else {
        displayName = workout.type.charAt(0).toUpperCase() + workout.type.slice(1);
    }

    document.getElementById('workoutTitle').textContent = displayName + ' Workout';
    document.getElementById('workoutDate').textContent =
        new Date(workout.date).toLocaleDateString();

    // document.getElementById('viewModeIndicator').innerHTML = `
    //     <div class="view-mode">
    //         <div class="view-mode-label">✓ Completed Workout</div>
    //     </div>
    // `;

    renderExercises();
    renderWorkoutActions();
    showScreen('workout');
}

let selectedCalendarDate = null;
let isDetailsExpanded = false;

function toggleCalendarView() {
    storage.calendarTextMode = !storage.calendarTextMode;

    // Rotate the icon
    const toggleBtn = document.querySelector('.view-toggle-btn .material-symbols-outlined');
    if (storage.calendarTextMode) {
        toggleBtn.style.transform = 'rotate(180deg)';
    } else {
        toggleBtn.style.transform = 'rotate(0deg)';
    }

    renderCalendar();
}

function renderCalendar() {

    // Initialize icon rotation based on saved state
    const toggleBtn = document.querySelector('.view-toggle-btn .material-symbols-outlined');
    if (toggleBtn) {
        toggleBtn.style.transform = storage.calendarTextMode ? 'rotate(180deg)' : 'rotate(0deg)';
    }


    const grid = document.getElementById('calendarGrid');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    document.getElementById('calendarMonth').textContent =
        `${monthNames[storage.currentMonth]} ${storage.currentYear}`;

    const firstDay = new Date(storage.currentYear, storage.currentMonth, 1).getDay();
    const daysInMonth = new Date(storage.currentYear, storage.currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(storage.currentYear, storage.currentMonth, 0).getDate();

    grid.innerHTML = '';
    grid.classList.remove('one-line');

    // ===== HEADER DAY LABELS =====
    weekdayNames.forEach(day => {
        const label = document.createElement('div');
        label.className = 'day-label';
        label.textContent = day;
        grid.appendChild(label);
    });

    // ===== PREVIOUS MONTH DAYS (grayed out) =====
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const prevMonth = storage.currentMonth === 0 ? 11 : storage.currentMonth - 1;
        const prevYear = storage.currentMonth === 0 ? storage.currentYear - 1 : storage.currentYear;

        createCalendarDay(day, new Date(prevYear, prevMonth, day), true);
    }

    // ===== CURRENT MONTH DAYS =====
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(storage.currentYear, storage.currentMonth, day);
        createCalendarDay(day, date, false);
    }

    // ===== NEXT MONTH DAYS (grayed out) to fill the grid =====
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    for (let day = 1; day <= remainingCells; day++) {
        const nextMonth = storage.currentMonth === 11 ? 0 : storage.currentMonth + 1;
        const nextYear = storage.currentMonth === 11 ? storage.currentYear + 1 : storage.currentYear;

        createCalendarDay(day, new Date(nextYear, nextMonth, day), true);
    }
}

function createCalendarDay(day, date, isOtherMonth) {
    const grid = document.getElementById('calendarGrid');
    const today = new Date();
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';

    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    }

    const workout = storage.workouts.find(w =>
        new Date(w.date).toDateString() === date.toDateString()
    );

    // Get workout label
    let workoutLabel = '';
    if (workout) {
        const customType = storage.customWorkoutTypes.find(t => t.id === workout.type);
        if (customType) {
            workoutLabel = customType.name;
            if (!storage.calendarTextMode) {
                dayDiv.style.backgroundColor = customType.color + '33';
                dayDiv.style.borderColor = customType.color;
            }
        } else {
            // Map workout types to short labels
            const labelMap = {
                'push': 'Push',
                'pull': 'Pull',
                'legs': 'Legs',
                'upper': 'UB',
                'lower': 'LB',
                'whole': 'FB',
                'rest': 'Rest',
                'warmup': 'Warm',
                'cooldown': 'Cool'
            };
            workoutLabel = labelMap[workout.type] || workout.type;

            if (!storage.calendarTextMode) {
                dayDiv.classList.add(workout.type);
            }
        }
    }

    // Add text mode class if enabled
    if (storage.calendarTextMode) {
        dayDiv.classList.add('text-mode');
        if (workout) {
            dayDiv.classList.add(workout.type);
        }
    }

    dayDiv.onclick = () => {
        if (storage.activeCalendarDay) storage.activeCalendarDay.classList.remove('active');
        dayDiv.classList.add('active');
        storage.activeCalendarDay = dayDiv;
        showWorkoutDetails(date, workout);
    };

    // Check if this is the previously selected date
    if (selectedCalendarDate && date.toDateString() === selectedCalendarDate.toDateString()) {
        dayDiv.click();
    } else if (!selectedCalendarDate && date.toDateString() === today.toDateString()) {
        dayDiv.classList.add('today');
        dayDiv.click();
    }

    // Always mark today
    if (date.toDateString() === today.toDateString()) {
        dayDiv.classList.add('today');
    }

    dayDiv.style.cursor = 'pointer';

    // Render based on mode
    if (storage.calendarTextMode) {
        // Text mode: small number top-left, workout label below
        dayDiv.innerHTML = `
            <div class="weekday">${weekdayNames[date.getDay()]}</div>
            <div class="day-number">${day}</div>
            ${workoutLabel ? `<div class="workout-label">${workoutLabel}</div>` : ''}
        `;
    } else {
        // Normal mode: centered number
        dayDiv.innerHTML = `
            <div class="weekday">${weekdayNames[date.getDay()]}</div>
            <div class="day-number">${day}</div>
        `;
    }

    grid.appendChild(dayDiv);
}

function showWorkoutDetails(date, workout) {
    selectedCalendarDate = date;
    const detailsSection = document.getElementById('workoutDetailsSection');

    const detailsContent = document.getElementById('workoutDetailsContent');
    detailsContent.onclick = (e) => {
        // Check if click is on delete button or its children (Material Icons span)
        if (e.target.classList.contains('delete-btn') ||
            e.target.closest('.delete-btn')) {
            return; // Stop here, don't view workout
        }
        if (workout) {
            viewWorkout(workout.id);
        }
    };
    const dateLabel = document.getElementById('selectedDateLabel');

    // Format date
    const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
        // ,
        // year: 'numeric'
    });
    const deleteBtn = document.getElementById("deleteWorkoutBtn");
    if (workout) {
        deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteWorkoutFromCalendar(workout.id);
        };
        deleteBtn.style.display = 'flex';
    } else {
        deleteBtn.innerHTML = '';
        deleteBtn.style.display = 'none';
    }
    dateLabel.innerHTML = `
  <span>${dateStr}</span>
`;


    // Show the section
    detailsSection.style.display = 'block';

    if (workout) {
        // Show workout details
        if (workout.type === 'rest') {
            detailsContent.innerHTML = `
                <div class="no-workout-message">
                    <span class="material-symbols-outlined rest-day-icon">
bath_bedrock
</span>    <div class="rest-day-text">Rest Day</div>
                
                </div>

            `;
        } else {

            // <button class="save-template-btn" style="flex: 1; padding: 10px;" onclick="viewWorkout(${workout.id})">Expand</button>
            let html = `

            `;

            workout.exercises.forEach(ex => {
                html += `
                    <div class="workout-detail-item">
                        <div class="workout-detail-title">${ex.name}</div>
                        <div class="workout-detail-set">${ex.sets} sets × ${ex.reps} reps × ${ex.weight === 'BW' ? 'Bodyweight' : ex.weight + ' kg'}</div>
                        ${ex.notes ? `<div style="margin-top: 8px; font-size: 0.8em; color: #6c757d; font-style: italic;">${ex.notes}</div>` : ''}
                    </div>
                `;
            });

            detailsContent.innerHTML = html;
        }
    } else {
        // No workout - show add workout button
        detailsContent.innerHTML = `
            <div class="no-workout-message">
                No workout logged for this day
            </div>
            <div style=" display: flex; justify-content: center; padding: 0 15px 15px;">
                <button class="add-exercise-btn" style="margin: 0;" onclick="selectDateForWorkout(new Date('${date.toISOString()}'))">Log Workout</button>
            </div>
        `;
    }
}

function toggleExpand() {
    const section = document.getElementById('workoutDetailsSection');
    const icon = document.getElementById('expandIcon');
    isDetailsExpanded = !isDetailsExpanded;

    if (isDetailsExpanded) {
        section.classList.add('expanded');
        icon.textContent = 'more_down';
        // Initialize to current week
        storage.currentWeekOffset = 0;
        renderWeekView();
    } else {
        section.classList.remove('expanded');
        icon.textContent = 'more_up';
        renderCalendar();
    }
}

function deleteWorkoutFromCalendar(workoutId) {
    if (!confirm('Are you sure you want to delete this workout?')) {
        return;
    }

    const idx = storage.workouts.findIndex(w => w.id == workoutId);

    if (idx >= 0) {
        storage.workouts.splice(idx, 1);
        storage.saveWorkouts();
    }

    // Refresh calendar and details
    renderCalendar();
    if (selectedCalendarDate) {
        const workout = storage.workouts.find(w =>
            new Date(w.date).toDateString() === selectedCalendarDate.toDateString()
        );
        showWorkoutDetails(selectedCalendarDate, workout);
    }
}
function changeMonth(delta) {
    if (isDetailsExpanded) {
        // In week view mode
        changeWeek(delta);
    } else {
        // In month view mode
        storage.currentMonth += delta;
        if (storage.currentMonth > 11) {
            storage.currentMonth = 0;
            storage.currentYear++;
        } else if (storage.currentMonth < 0) {
            storage.currentMonth = 11;
            storage.currentYear--;
        }
        renderCalendar();
    }
}

function selectDateForWorkout(date) {
    storage.selectedDate = date;
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('selectedDateDisplay').textContent = dateStr;

    // Render custom workouts in the modal
    renderCustomWorkoutsInModal();

    document.getElementById('selectWorkoutModal').classList.add('active');
}

function renderCustomWorkoutsInModal() {
    const customContainer = document.getElementById('customWorkoutTypesModalList');
    const customSection = document.getElementById('customWorkoutsModalSection');
    const customTypes = storage.customWorkoutTypes;

    // Clear custom container
    customContainer.innerHTML = '';

    // Show/hide custom section based on whether there are custom types
    if (customTypes.length > 0) {
        customSection.style.display = 'block';

        // Add custom workout types
        customTypes.forEach((custom) => {
            const btn = document.createElement('button');
            btn.className = 'workout-btn';
            btn.style.borderColor = custom.color;
            btn.style.color = custom.color;
            btn.textContent = custom.name;
            btn.onclick = () => startWorkoutForDate(custom.id);
            customContainer.appendChild(btn);
        });
    } else {
        customSection.style.display = 'none';
    }
}

function closeSelectWorkout() {
    document.getElementById('selectWorkoutModal').classList.remove('active');
}

function cleanupDuplicates() {
    const seen = new Map();
    const duplicates = [];
    const invalidDates = [];

    storage.workouts = storage.workouts.filter(w => {
        // Check for invalid date
        const date = new Date(w.date);
        if (isNaN(date.getTime()) || w.date === 'Invalid Date' || !w.date) {
            invalidDates.push(w);
            return false; // Remove invalid date entry
        }

        const dateStr = date.toDateString();

        if (seen.has(dateStr)) {
            duplicates.push(dateStr);
            return false; // Remove duplicate
        }

        seen.set(dateStr, true);
        return true; // Keep first occurrence
    });

    let message = '';
    if (duplicates.length > 0) {
        message += `Removed ${duplicates.length} duplicate entries! ✨\n`;
    }
    if (invalidDates.length > 0) {
        message += `Removed ${invalidDates.length} invalid date entries! 🗑️`;
    }

    if (duplicates.length > 0 || invalidDates.length > 0) {
        storage.saveWorkouts();
        alert(message || 'Cleaned up successfully!');
        renderCalendar();
        renderStats();
    } else {
        alert('No duplicates or invalid dates found! 👍');
    }
}


function startWorkoutForDate(type) {
    closeSelectWorkout();

    const selectedDateStr = storage.selectedDate.toDateString();

    // Check for existing entry on selected date
    const existingEntry = storage.workouts.find(w =>
        new Date(w.date).toDateString() === selectedDateStr
    );

    if (existingEntry) {
        alert('Already logged for this day! Delete it first if you want to replace it.');
        return;
    }

    if (type === 'rest') {
        storage.workouts.push({
            id: Date.now(),
            type: 'rest',
            date: storage.selectedDate.toISOString(),
            exercises: []
        });
        storage.saveWorkouts();
        alert('Rest day marked! 💤');
        renderCalendar();
    } else {
        storage.selectedWorkoutType = type;
        storage.isFromCalendar = true;
        showTemplateSelector(type);
    }
}


// HELPER FUNCTIONS (keep these outside renderStats)
function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(
        ((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    );
    return `${d.getFullYear()}-W${weekNum}`;
}

function calculateAvgWorkoutsPerWeek(workouts) {
    const weeks = {};

    workouts.forEach(w => {
        const weekKey = getWeekKey(w.date);
        if (!weeks[weekKey]) {
            weeks[weekKey] = { workouts: 0 };
        }
        if (w.type !== 'rest') {
            weeks[weekKey].workouts++;
        }
    });

    const weeklyValues = Object.values(weeks);
    if (weeklyValues.length === 0) return 0;

    const total = weeklyValues.reduce((sum, w) => sum + w.workouts, 0);
    return Math.round(total / weeklyValues.length);
}

// MAIN FUNCTION
function renderStats() {
    const container = document.getElementById('statsContainer');

    // Current month/year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter workouts for this month
    const thisMonthWorkouts = storage.workouts.filter(w => {
        const d = new Date(w.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Monthly stats
    const monthWorkouts = thisMonthWorkouts.filter(w => w.type !== 'rest').length;
    const monthRestDays = thisMonthWorkouts.filter(w => w.type === 'rest').length;

    // Monthly avg / week
    const monthAvgPerWeek = calculateAvgWorkoutsPerWeek(thisMonthWorkouts);

    // Overall stats
    const totalWorkouts = storage.workouts.filter(w => w.type !== 'rest').length;
    const totalRestDays = storage.workouts.filter(w => w.type === 'rest').length;

    // Overall avg / week
    const avgWorkoutsPerWeek = calculateAvgWorkoutsPerWeek(storage.workouts);

    // Debug log
    let debugLog = '=== WORKOUTS ===\n';
    storage.workouts.filter(w => w.type !== 'rest').forEach(w => {
        debugLog += `${new Date(w.date).toDateString()} - ${w.type}\n`;
    });

    debugLog += '\n=== REST DAYS ===\n';
    storage.workouts.filter(w => w.type === 'rest').forEach(w => {
        debugLog += `${new Date(w.date).toDateString()}\n`;
    });

    const dates = {};
    storage.workouts.forEach(w => {
        const d = new Date(w.date).toDateString();
        dates[d] = (dates[d] || 0) + 1;
    });

    debugLog += '\n=== DUPLICATES ===\n';
    Object.entries(dates).forEach(([date, count]) => {
        if (count > 1) debugLog += `⚠️ ${date}: ${count} entries\n`;
    });

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Render UI
    container.innerHTML = `
        <div class="stats-section current-month">
            <div class="stats-section-header">
                <span class="material-symbols-outlined">calendar_month</span>
                <h3>${monthNames[currentMonth]} ${currentYear}</h3>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">fitness_center</span>
                    <div class="stat-value">${monthWorkouts}</div>
                    <div class="stat-label">Workouts</div>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">hotel</span>
                    <div class="stat-value">${monthRestDays}</div>
                    <div class="stat-label">Rest Days</div>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">trending_up</span>
                    <div class="stat-value">${monthAvgPerWeek}</div>
                    <div class="stat-label">Avg per Week</div>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">calendar_today</span>
                    <div class="stat-value">${thisMonthWorkouts.length}</div>
                    <div class="stat-label">Days Tracked</div>
                </div>
            </div>
        </div>

        <div class="stats-section all-time">
            <div class="stats-section-header">
                <span class="material-symbols-outlined">insights</span>
                <h3>All Time</h3>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">bar_chart</span>
                    <div class="stat-value">${totalWorkouts}</div>
                    <div class="stat-label">Total Workouts</div>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">bedtime</span>
                    <div class="stat-value">${totalRestDays}</div>
                    <div class="stat-label">Total Rest Days</div>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">analytics</span>
                    <div class="stat-value">${avgWorkoutsPerWeek}</div>
                    <div class="stat-label">Avg per Week</div>
                </div>
                <div class="stat-card">
                    <span class="material-symbols-outlined stat-icon">event_available</span>
                    <div class="stat-value">${storage.workouts.length}</div>
                    <div class="stat-label">Days Tracked</div>
                </div>
            </div>
        </div>

        <button class="debug-log-btn debug-btns" style="display:none;"
            onclick="alert(\`${debugLog.replace(/`/g, '')}\`)">
            <span class="material-symbols-outlined" style="font-size: 18px;">bug_report</span>
            Show Debug Log
        </button>
        <button class="delete-duplicate-btn debug-btns" style="display:none;"
            onclick="cleanupDuplicates()">
            <span class="material-symbols-outlined" style="font-size: 18px;">cleaning_services</span>
            Clean Up Duplicates
        </button>
    `;

    // Hidden debug unlock
    let debugClickCount = 0;
    container.addEventListener('click', () => {
        // debugClickCount++;
        // if (debugClickCount === 7) {
        //     document.querySelectorAll('.debug-btns').forEach(btn => {
        //         btn.style.display = 'inline-block';
        //     });
        //     debugClickCount = 0;
        // }
    });

    // Render the weekly chart
    setTimeout(() => renderWeeklyChart(), 100);

    // Render year heatmap
    setTimeout(() => renderYearHeatmap(), 200);

}

// ===== WEEK VIEW FUNCTIONS =====
function renderWeekView() {
    const grid = document.getElementById('calendarGrid');
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate the week to display
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (storage.currentWeekOffset * 7));

    grid.innerHTML = '';
    grid.classList.add('one-line');

    // Render 7 days (Sun - Sat)
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const workout = storage.workouts.find(w =>
            new Date(w.date).toDateString() === date.toDateString()
        );

        if (workout) {
            const customType = storage.customWorkoutTypes.find(t => t.id === workout.type);
            if (customType) {
                dayDiv.style.backgroundColor = customType.color + '33';
                dayDiv.style.borderColor = customType.color;
            } else {
                dayDiv.classList.add(workout.type);
            }
        }

        dayDiv.onclick = () => {
            if (storage.activeCalendarDay) storage.activeCalendarDay.classList.remove('active');
            dayDiv.classList.add('active');
            storage.activeCalendarDay = dayDiv;
            showWorkoutDetails(date, workout);
        };

        // Check if this is today
        if (date.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }

        // Check if this is the previously selected date
        if (selectedCalendarDate && date.toDateString() === selectedCalendarDate.toDateString()) {
            dayDiv.click();
        } else if (!selectedCalendarDate && date.toDateString() === today.toDateString()) {
            dayDiv.click();
        }

        dayDiv.style.cursor = 'pointer';
        dayDiv.innerHTML = `
            <div class="weekday">${weekdayNames[date.getDay()]}</div>
            <div class="day-number">${date.getDate()}</div>
        `;

        grid.appendChild(dayDiv);
    }

    // Update month display to show week range
    updateWeekHeader(startOfWeek);
}

function updateWeekHeader(startOfWeek) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const startMonth = monthNames[startOfWeek.getMonth()];
    const endMonth = monthNames[endOfWeek.getMonth()];
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();

    let headerText;
    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        headerText = `${startMonth} ${startDay}-${endDay}, ${startOfWeek.getFullYear()}`;
    } else {
        headerText = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startOfWeek.getFullYear()}`;
    }

    document.getElementById('calendarMonth').textContent = headerText;
}

function changeWeek(delta) {
    storage.currentWeekOffset += delta;
    renderWeekView();
}


renderCalendar();



// ===== SWIPE FUNCTIONALITY =====
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleSwipe(startX, endX, startY, endY) {
    const dx = endX - startX;
    const dy = endY - startY;

    const minSwipeDistance = 50;
    if (Math.abs(dx) < minSwipeDistance) return; // too short

    const slope = Math.abs(dy / dx);
    const maxAllowedSlope = Math.tan(30 * Math.PI / 180); // ~0.577 (~30°)

    if (slope > maxAllowedSlope) return; // too vertical - let scroll work

    // Valid horizontal swipe detected
    if (dx < 0) {
        // Swipe left → next
        changeMonth(1);
    } else {
        // Swipe right → previous
        changeMonth(-1);
    }
}

// Attach swipe listeners to calendar section
const calendarSection = document.querySelector('.calendar-section');
if (calendarSection) {
    calendarSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    calendarSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
    }, { passive: true });
}

// Attach swipe listeners to workout details section
const detailsSection = document.getElementById('workoutDetailsSection');
if (detailsSection) {
    detailsSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    detailsSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
    }, { passive: true });
}


// ===== CUSTOM WORKOUT TYPE FUNCTIONS =====

function renderHomeScreen() {
    const customContainer = document.getElementById('customWorkoutTypesList');
    const customSection = document.getElementById('customWorkoutsSection');
    const customTypes = storage.customWorkoutTypes;

    // Clear custom container
    customContainer.innerHTML = '';

    // Show/hide custom section based on whether there are custom types
    if (customTypes.length > 0) {
        customSection.style.display = 'block';

        // Add custom workout types
        customTypes.forEach((custom, idx) => {
            const btn = document.createElement('button');
            btn.className = 'workout-card';
            btn.style.borderColor = custom.color;
            btn.style.color = custom.color;
            btn.innerHTML = `
                <span class="material-symbols-outlined card-icon">fitness_center</span>
                <span class="card-label">${custom.name}</span>
                <button onclick="event.stopPropagation(); deleteCustomWorkoutType(${idx})" 
                        style="position: absolute; top: 8px; right: 8px; background: #ff6b6b; color: white; border: none; padding: 4px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer;">
                        <span class="material-symbols-outlined">close_small</span>
                        </button>
            `;
            btn.style.position = 'relative';
            btn.onclick = () => selectWorkoutType(custom.id);
            customContainer.appendChild(btn);
        });
    } else {
        customSection.style.display = 'none';
    }
}

function openCreateCustomWorkout() {
    storage.customWorkoutColor = '#4c6ef5';
    storage.customExercises = [];
    document.getElementById('customWorkoutName').value = '';
    document.getElementById('customTemplateName').value = '';  // ADD THIS
    document.getElementById('customExercisesList').innerHTML = '';

    // Reset color selection
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.color-option[data-color="${storage.customWorkoutColor}"]`)?.classList.add('selected');

    document.getElementById('customWorkoutModal').classList.add('active');
}

function closeCustomWorkout() {
    document.getElementById('customWorkoutModal').classList.remove('active');
}

function selectColor(color) {
    storage.customWorkoutColor = color;
    document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.color-option[data-color="${color}"]`).classList.add('selected');
}

function addCustomExercise() {
    const exerciseName = prompt('Enter exercise name:');
    if (!exerciseName) return;

    storage.customExercises.push(exerciseName);
    renderCustomExercises();
}

function renderCustomExercises() {
    const container = document.getElementById('customExercisesList');
    container.innerHTML = '';

    storage.customExercises.forEach((ex, idx) => {
        const div = document.createElement('div');
        div.className = 'custom-exercise-item';
        div.innerHTML = `
            <input type="text" value="${ex}" onchange="updateCustomExercise(${idx}, this.value)" />
            <button onclick="removeCustomExercise(${idx})">×</button>
        `;
        container.appendChild(div);
    });
}

function updateCustomExercise(idx, value) {
    storage.customExercises[idx] = value;
}

function removeCustomExercise(idx) {
    storage.customExercises.splice(idx, 1);
    renderCustomExercises();
}

function saveCustomWorkout() {
    const name = document.getElementById('customWorkoutName').value.trim();
    const templateName = document.getElementById('customTemplateName').value.trim();

    if (!name) {
        alert('Please enter a workout type name!');
        return;
    }

    const customTypes = storage.customWorkoutTypes;
    const id = 'custom_' + Date.now();

    const newType = {
        id: id,
        name: name,
        color: storage.customWorkoutColor,
        exercises: storage.customExercises.map(ex => ({
            name: ex,
            sets: 3,
            reps: 10,
            weight: 0,
            notes: ''
        }))
    };

    customTypes.push(newType);
    storage.customWorkoutTypes = customTypes;
    storage.saveCustomWorkoutTypes();

    // Create initial template for this custom workout type
    const templates = storage.templates;
    if (!templates[id]) {
        templates[id] = [];
    }

    const initialTemplate = {
        name: templateName || 'Template 1',
        exercises: storage.customExercises.map(ex => ({
            name: ex,
            sets: 3,
            reps: 10,
            weight: 0,
            notes: ''
        }))
    };

    templates[id].push(initialTemplate);
    storage.templates = templates;
    storage.saveTemplates();

    // Add to defaultTemplates dynamically
    defaultTemplates[id] = storage.customExercises;

    closeCustomWorkout();
    alert(`Custom workout type "${name}" with template "${initialTemplate.name}" created! 🎉`);
    renderHomeScreen();
}

function deleteCustomWorkoutType(idx) {
    if (!confirm('Delete this custom workout type?')) return;

    const customTypes = storage.customWorkoutTypes;
    const deletedId = customTypes[idx].id;

    // Remove from storage
    customTypes.splice(idx, 1);
    storage.customWorkoutTypes = customTypes;
    storage.saveCustomWorkoutTypes();

    // Remove from defaultTemplates
    delete defaultTemplates[deletedId];

    alert('Custom workout type deleted! 🗑️');
    renderHomeScreen();
}

function scrollToActiveDay() {
    const grid = document.getElementById('calendarGrid');
    const activeEl =
        grid.querySelector('.calendar-day.active') ||
        grid.querySelector('.calendar-day.today');

    if (!activeEl) return;

    const gridWidth = grid.clientWidth;
    const dayWidth = activeEl.offsetWidth;

    const scrollLeft =
        activeEl.offsetLeft -
        gridWidth / 2 +
        dayWidth / 2;

    grid.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
    });
}

// Weekly Chart
let weeklyChart = null;

// function renderWeeklyChart() {
//     const canvas = document.getElementById('weeklyChart');
//     if (!canvas) return;

//     // Get all workouts sorted by date
//     const sortedWorkouts = storage.workouts
//         .filter(w => w.type !== 'rest')
//         .sort((a, b) => new Date(a.date) - new Date(b.date));

//     // if (sortedWorkouts.length === 0) {
//     //     // No data to display
//     //     const ctx = canvas.getContext('2d');
//     //     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     //     ctx.font = '14px Segoe UI';
//     //     ctx.fillStyle = '#6c757d';
//     //     ctx.textAlign = 'center';
//     //     ctx.fillText('No workout data yet', canvas.width / 2, canvas.height / 2);
//     //     return;
//     // }

//     if (sortedWorkouts.length === 0) {
//     // No data to display
//     canvas.style.display = 'block';
//     canvas.style.height = '200px';
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.font = '14px Segoe UI';
//     ctx.fillStyle = '#6c757d';
//     ctx.textAlign = 'center';
//     ctx.fillText('No workout data yet', canvas.width / 2, 100);
//     return;
// }

//     // Get first and last workout dates
//     const firstDate = new Date(sortedWorkouts[0].date);
//     const lastDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);

//     // Calculate start of first week (Sunday)
//     const startDate = new Date(firstDate);
//     startDate.setDate(startDate.getDate() - startDate.getDay());
//     startDate.setHours(0, 0, 0, 0);

//     // Calculate end of last week (Saturday)
//     const endDate = new Date(lastDate);
//     endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
//     endDate.setHours(23, 59, 59, 999);

//     // Generate week labels and count workouts per week
//     const weeks = [];
//     const workoutCounts = [];
//     let currentWeekStart = new Date(startDate);

//     while (currentWeekStart <= endDate) {
//         const currentWeekEnd = new Date(currentWeekStart);
//         currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

//         // Format week label (e.g., "Jan 6-12")
//         const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
//         const startDay = currentWeekStart.getDate();
//         const endDay = currentWeekEnd.getDate();
//         const label = `${startMonth} ${startDay}-${endDay}`;

//         weeks.push(label);

//         // Count workouts in this week
//         const weekWorkouts = sortedWorkouts.filter(w => {
//             const workoutDate = new Date(w.date);
//             return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
//         });

//         workoutCounts.push(weekWorkouts.length);

//         // Move to next week
//         currentWeekStart.setDate(currentWeekStart.getDate() + 7);
//     }

//     // Destroy existing chart if it exists
//     if (weeklyChart) {
//         weeklyChart.destroy();
//     }

//     // Create the chart
//     const ctx = canvas.getContext('2d');
//     weeklyChart = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: weeks,
//             datasets: [{
//                 label: 'Workouts per Week',
//                 data: workoutCounts,
//                 borderColor: '#2d3436',
//                 backgroundColor: 'rgba(45, 52, 54, 0.1)',
//                 tension: 0.3,
//                 fill: true,
//                 pointBackgroundColor: '#2d3436',
//                 pointBorderColor: '#fff',
//                 pointBorderWidth: 2,
//                 pointRadius: 4,
//                 pointHoverRadius: 6
//             }]
//         },
//         options: {
//             responsive: true,
//             // maintainAspectRatio: true,
//                         maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     backgroundColor: 'rgba(45, 52, 54, 0.9)',
//                     padding: 12,
//                     titleFont: {
//                         size: 13,
//                         weight: 'bold'
//                     },
//                     bodyFont: {
//                         size: 12
//                     },
//                     callbacks: {
//                         label: function (context) {
//                             return `Workouts: ${context.parsed.y}`;
//                         }
//                     }
//                 }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     max: 7,
//                     ticks: {
//                         stepSize: 1,
//                         font: {
//                             size: 11
//                         },
//                         color: '#6c757d'
//                     },
//                     grid: {
//                         color: 'rgba(0, 0, 0, 0.05)'
//                     }
//                 },
//                 x: {
//                     ticks: {
//                         font: {
//                             size: 10
//                         },
//                         color: '#6c757d',
//                         maxRotation: 45,
//                         minRotation: 45
//                     },
//                     grid: {
//                         display: false
//                     }
//                 }
//             }
//         }
//     });
// }

function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;

    // Get all workouts sorted by date
    const sortedWorkouts = storage.workouts
        .filter(w => w.type !== 'rest')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedWorkouts.length === 0) {
        // No data to display
        canvas.style.display = 'block';
        canvas.style.height = '200px';
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Segoe UI';
        ctx.fillStyle = '#6c757d';
        ctx.textAlign = 'center';
        ctx.fillText('No workout data yet', canvas.width / 2, 100);
        return;
    }

    // Get first and last workout dates
    const firstDate = new Date(sortedWorkouts[0].date);
    const lastDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);

    // Calculate start of first week (Sunday)
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    startDate.setHours(0, 0, 0, 0);

    // Calculate end of last week (Saturday)
    const endDate = new Date(lastDate);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    endDate.setHours(23, 59, 59, 999);

    // Generate week labels and count workouts per week
    const weeks = [];
    const workoutCounts = [];
    let currentWeekStart = new Date(startDate);

    while (currentWeekStart <= endDate) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

        // Format week label (e.g., "Jan 6-12")
        const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
        const startDay = currentWeekStart.getDate();
        const endDay = currentWeekEnd.getDate();
        const label = `${startMonth} ${startDay}-${endDay}`;

        weeks.push(label);

        // Count workouts in this week
        const weekWorkouts = sortedWorkouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= currentWeekStart && workoutDate <= currentWeekEnd;
        });

        workoutCounts.push(weekWorkouts.length);

        // Move to next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // Destroy existing chart if it exists
    if (weeklyChart) {
        weeklyChart.destroy();
    }

    // Set dynamic width based on number of weeks
    const wrapper = document.getElementById('chartWrapper');
    // const minWidth = weeks.length * 60; // 60px per week
    // Only expand if more than 12 weeks, otherwise fit to container
    const minWidth = weeks.length > 12 ? weeks.length * 60 : wrapper.parentElement.offsetWidth;


    wrapper.style.width = Math.max(minWidth, wrapper.parentElement.offsetWidth) + 'px';

    // Create the chart
    const ctx = canvas.getContext('2d');
    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Workouts per Week',
                data: workoutCounts,
                borderColor: '#2da44e',
                backgroundColor: 'rgba(64, 196, 99, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#2da44e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(45, 52, 54, 0.9)',
                    padding: 12,
                    titleFont: {
                        size: 13,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        label: function (context) {
                            return `Workouts: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 7,
                    ticks: {
                        stepSize: 1,
                        autoSkip: false,
                        callback: function (value) {
                            return value;
                        },
                        font: {
                            size: 11
                        },
                        color: '#6c757d'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        },
                        color: '#6c757d',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}



// ===== YEAR HEATMAP =====
let currentHeatmapYear = new Date().getFullYear();

function renderYearHeatmap() {
    const container = document.getElementById('statsContainer');
    if (!container) {
        console.error('Stats container not found!');
        return;
    }

    // Calculate total workouts for the year
    const yearWorkouts = storage.workouts.filter(w => {
        const d = new Date(w.date);
        return d.getFullYear() === currentHeatmapYear && w.type !== 'rest';
    });

    const totalDays = yearWorkouts.length;

    // Create heatmap section
    const heatmapSection = document.createElement('div');
    heatmapSection.className = 'year-heatmap-section';
    heatmapSection.innerHTML = `
        <div class="year-heatmap-header">
            <div class="year-heatmap-title">
                <span class="material-symbols-outlined">calendar_view_month</span>
                <h3>${totalDays} workouts in ${currentHeatmapYear}</h3>
            </div>
            <div class="year-nav">
                <button onclick="changeHeatmapYear(-1)">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <span>${currentHeatmapYear}</span>
                <button onclick="changeHeatmapYear(1)" ${currentHeatmapYear >= new Date().getFullYear() ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
        <div class="heatmap-container">
            <div class="heatmap-grid" id="heatmapGrid"></div>
            <div class="heatmap-months" id="heatmapMonths"></div>
        </div>
        <div class="heatmap-legend">
            <span>Rest</span>
            <div class="legend-scale">
                <div class="legend-box empty"></div>
                <div class="legend-box filled"></div>
            </div>
            <span>Load</span>
        </div>
    `;

    // Append to container
    container.appendChild(heatmapSection);

    // Render grid with a small delay to ensure DOM is ready
    setTimeout(() => {
        const grid = document.getElementById('heatmapGrid');
        if (grid) {
            renderHeatmapGrid();
            renderMonthLabels();
        }
    }, 100);
}

function renderHeatmapGrid() {
    const grid = document.getElementById('heatmapGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Start from first Sunday of the year
    const yearStart = new Date(currentHeatmapYear, 0, 1);
    const firstSunday = new Date(yearStart);
    firstSunday.setDate(yearStart.getDate() - yearStart.getDay());

    // End at last Saturday that contains Dec 31
    const yearEnd = new Date(currentHeatmapYear, 11, 31);
    const lastSaturday = new Date(yearEnd);
    lastSaturday.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));

    // Create all days
    const currentDate = new Date(firstSunday);
    const days = [];

    while (currentDate <= lastSaturday) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create workout lookup map
    const workoutMap = {};
    storage.workouts.forEach(w => {
        const dateKey = new Date(w.date).toDateString();
        workoutMap[dateKey] = w;
    });

    // Render grid
    days.forEach(date => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'heatmap-day';

        const dateKey = date.toDateString();
        const workout = workoutMap[dateKey];

        // Only color if workout exists and it's not a rest day
        if (workout && workout.type !== 'rest') {
            dayDiv.classList.add('has-workout');
        }

        // Check if date is in current year (gray out other year dates)
        if (date.getFullYear() !== currentHeatmapYear) {
            dayDiv.style.opacity = '0.3';
        }

        // Hover tooltip
        dayDiv.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'heatmap-tooltip';

            const dateStr = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            if (workout && workout.type !== 'rest') {
                const customType = storage.customWorkoutTypes.find(t => t.id === workout.type);
                const typeName = customType ? customType.name :
                    workout.type.charAt(0).toUpperCase() + workout.type.slice(1);
                tooltip.textContent = `${dateStr} - ${typeName}`;
            } else if (workout && workout.type === 'rest') {
                tooltip.textContent = `${dateStr} - Rest Day`;
            } else {
                tooltip.textContent = `${dateStr} - No workout`;
            }

            document.body.appendChild(tooltip);

            const rect = dayDiv.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

            dayDiv._tooltip = tooltip;
        });

        dayDiv.addEventListener('mouseleave', (e) => {
            if (dayDiv._tooltip) {
                dayDiv._tooltip.remove();
                dayDiv._tooltip = null;
            }
        });

        // Click to view workout
        dayDiv.addEventListener('click', () => {
            if (workout && workout.type !== 'rest') {
                viewWorkout(workout.id);
                showScreen('workout');
            }
        });

        grid.appendChild(dayDiv);
    });
}

function renderMonthLabels() {
    const monthsContainer = document.getElementById('heatmapMonths');
    if (!monthsContainer) return;

    monthsContainer.innerHTML = '';

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate weeks in year
    const yearStart = new Date(currentHeatmapYear, 0, 1);
    const firstSunday = new Date(yearStart);
    firstSunday.setDate(yearStart.getDate() - yearStart.getDay());

    const yearEnd = new Date(currentHeatmapYear, 11, 31);
    const lastSaturday = new Date(yearEnd);
    lastSaturday.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));

    let currentWeek = new Date(firstSunday);
    let lastMonth = -1;

    while (currentWeek <= lastSaturday) {
        const month = currentWeek.getMonth();
        const label = document.createElement('div');
        label.className = 'heatmap-month-label';

        // Only show month label when month changes
        if (month !== lastMonth && currentWeek.getFullYear() === currentHeatmapYear) {
            label.textContent = monthNames[month];
            lastMonth = month;
        }

        monthsContainer.appendChild(label);
        currentWeek.setDate(currentWeek.getDate() + 7);
    }
}

function changeHeatmapYear(delta) {
    const newYear = currentHeatmapYear + delta;
    const currentYear = new Date().getFullYear();

    // Don't allow future years
    if (newYear > currentYear) return;

    // Get earliest workout year
    if (storage.workouts.length === 0) return;

    const earliestWorkout = storage.workouts.reduce((earliest, w) => {
        const wDate = new Date(w.date);
        return wDate < earliest ? wDate : earliest;
    }, new Date());

    const earliestYear = earliestWorkout.getFullYear();

    // Don't go before earliest workout
    if (newYear < earliestYear) return;

    currentHeatmapYear = newYear;

    // Remove old heatmap and render new one
    const oldHeatmap = document.querySelector('.year-heatmap-section');
    if (oldHeatmap) {
        oldHeatmap.remove();
    }

    renderYearHeatmap();
}