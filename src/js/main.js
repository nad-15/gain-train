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
    get isDetailsExpanded() {
        const saved = localStorage.getItem('isDetailsExpanded');
        return saved === 'true';
    },

    set isDetailsExpanded(value) {
        localStorage.setItem('isDetailsExpanded', value);
    },

    get weightLogs() {
        if (!this._weightLogs) {
            this._weightLogs = JSON.parse(localStorage.getItem('weightLogs') || '[]');
        }
        return this._weightLogs;
    },

    set weightLogs(value) {
        this._weightLogs = value;
        localStorage.setItem('weightLogs', JSON.stringify(value));
    },

    saveWeightLogs() {
        localStorage.setItem('weightLogs', JSON.stringify(this._weightLogs));
    },

    get currentGraphType() {
        const saved = localStorage.getItem('currentGraphType');
        return saved || 'workouts';
    },

    set currentGraphType(value) {
        localStorage.setItem('currentGraphType', value);
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

    editingWeightIndex: null,
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
    isSimplifiedView: false,
    isCreatingNewTemplate: false,
    editingExerciseIndex: null,
    originalExerciseSnapshot: null,
    currentPB: null // Stores current Personal Best info for display
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

// function startWorkout(type, date = null, templateData = null) {
//     storage.isViewMode = false;
//     storage.editingWorkoutId = null;
//     storage.isEditingWorkoutType = false;

function startWorkout(type, date = null, templateData = null) {
    storage.isViewMode = false;
    storage.editingWorkoutId = null;
    storage.editingExerciseIndex = null;

    // If no date provided, we're editing/creating a template (from home screen)
    // If date provided, we're logging a workout for that specific day
    storage.isEditingWorkoutType = (date === null);

    let exercises;
    if (templateData) {
        // Use custom template
        exercises = JSON.parse(JSON.stringify(templateData.exercises));
    } else if (storage.isCreatingNewTemplate) {
        // Creating NEW template - start EMPTY
        exercises = [];
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
    console.log('Selected workout type:', type);
}

// function showWorkoutTypePreview(type, templateData = null) {
//     storage.isViewMode = true;
//     storage.isEditingWorkoutType = true;
//     storage.selectedTemplate = templateData;

//     // Get exercises for this type
//     let exercises;
//     if (templateData) {
//         // Using a specific template (Previous or custom template)
//         exercises = JSON.parse(JSON.stringify(templateData.exercises));
//     } else if (storage.isCreatingNewTemplate) {
//         // Creating NEW template from ➕ button - start EMPTY
//         exercises = [];
//     } else {
//         // Not creating new, but no template provided - use defaults if available
//         const customType = storage.customWorkoutTypes.find(t => t.id === type);
//         if (customType) {
//             exercises = JSON.parse(JSON.stringify(customType.exercises));
//         } else if (defaultTemplates[type]) {
//             exercises = defaultTemplates[type].map(name => ({
//                 name: name,
//                 sets: 3,
//                 reps: 10,
//                 weight: 0,
//                 notes: ''
//             }));
//         } else {
//             exercises = [];
//         }
//     }

//     storage.currentWorkout = {
//         type: type,
//         exercises: exercises
//     };

//     // Get display name
//     let displayName;
//     const customType = storage.customWorkoutTypes.find(t => t.id === type);
//     if (customType) {
//         displayName = customType.name;
//     } else if (type === 'warmup') {
//         displayName = 'Warm-up';
//     } else if (type === 'cooldown') {
//         displayName = 'Cool-down';
//     } else {
//         displayName = type.charAt(0).toUpperCase() + type.slice(1);
//     }

//     document.getElementById('workoutTitle').textContent = displayName + ' Workout';
//     document.getElementById('workoutDate').textContent = 'Preview';

//     renderExercises();
//     renderPreviewActions();
//     showScreen('workout');
// }
// function renderPreviewActions() {
//     const container = document.getElementById('workoutActions');
//     container.innerHTML = `
//         <div class="action-buttons">
//             <button class="save-template-btn" onclick="editFromPreview()">Edit Workout</button>
//         </div>
//     `;
// }

// function editFromPreview() {
//     storage.isViewMode = false;
//     // isEditingWorkoutType stays true (don't change it)

//     document.getElementById('workoutDate').textContent = 'Editing';
//     document.getElementById('viewModeIndicator').innerHTML = '';

//     renderExercises();
//     renderWorkoutActions();
// }

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
    // addBtn.onclick = () => {
    //     closeTemplateSelector();
    //     if (storage.isFromCalendar) {
    //         startWorkout(type, storage.selectedDate.toISOString(), null);
    //         storage.isFromCalendar = false;
    //     } else {
    //         // Mark that we're creating a NEW template (not editing)
    //         storage.isCreatingNewTemplate = true;  // ADD THIS LINE
    //         // showWorkoutTypePreview(type, null);
    //     }
    // };

    addBtn.onclick = () => {
        closeTemplateSelector();
        storage.isCreatingNewTemplate = true;
        storage.selectedTemplate = null; // Creating new, not editing existing
        startWorkout(type, storage.isFromCalendar ? storage.selectedDate.toISOString() : null, null);
        storage.isFromCalendar = false;
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
                storage.selectedTemplate = null; // Not editing a saved template
                startWorkout(type, storage.isFromCalendar ? storage.selectedDate.toISOString() : null, null);
                storage.isFromCalendar = false;
            };
            container.appendChild(defaultBtn);
        }

        // Get the reference date - either selected date or today
        const referenceDate = storage.isFromCalendar && storage.selectedDate
            ? new Date(storage.selectedDate)
            : new Date();

        const previousWorkouts = storage.workouts
            .filter(w => {
                const workoutDate = new Date(w.date);
                return w.type === type &&
                    w.exercises?.length &&
                    workoutDate < referenceDate; // Only past workouts
            })
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

            // prevBtn.onclick = () => {
            //     closeTemplateSelector();
            //     storage.isCreatingNewTemplate = false;
            //     const previousTemplate = {
            //         name: 'Previous',
            //         exercises: JSON.parse(JSON.stringify(lastWorkout.exercises))
            //     };

            //     if (storage.isFromCalendar) {
            //         startWorkout(type, storage.selectedDate.toISOString(), previousTemplate);
            //         storage.isFromCalendar = false;
            //     } else {
            //         // showWorkoutTypePreview(type, previousTemplate);
            //     }
            // };

            prevBtn.onclick = () => {
                closeTemplateSelector();
                storage.isCreatingNewTemplate = false;
                const previousTemplate = {
                    name: 'Previous',
                    exercises: JSON.parse(JSON.stringify(lastWorkout.exercises))
                };
                storage.selectedTemplate = previousTemplate; // Track it
                startWorkout(type, storage.isFromCalendar ? storage.selectedDate.toISOString() : null, previousTemplate);
                storage.isFromCalendar = false;
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
            <div class="template-actions">
                <button
                    class="edit-template-btn"
                    onclick="event.stopPropagation(); editTemplateName('${type}', ${idx})"
                    aria-label="Edit template"
                >
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                    class="delete-template-btn"
                    onclick="event.stopPropagation(); deleteTemplate('${type}', ${idx})"
                    aria-label="Delete template"
                >
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `;

        // btn.onclick = () => {
        //     closeTemplateSelector();
        //     storage.isCreatingNewTemplate = false;
        //     if (storage.isFromCalendar) {
        //         startWorkout(type, storage.selectedDate.toISOString(), template);
        //         storage.isFromCalendar = false;
        //     } else {
        //         // showWorkoutTypePreview(type, template);
        //     }
        // };

        btn.onclick = () => {
            closeTemplateSelector();
            storage.isCreatingNewTemplate = false;
            storage.selectedTemplate = template; // Track which template we're editing
            startWorkout(type, storage.isFromCalendar ? storage.selectedDate.toISOString() : null, template);
            storage.isFromCalendar = false;
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

function editTemplateName(type, idx) {
    const currentName = storage.templates[type][idx].name;
    const newName = prompt('Enter new template name:', currentName);

    if (newName === null) return; // User cancelled

    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert('Template name cannot be empty!');
        return;
    }

    // Update the template name in storage
    const templates = storage.templates;
    templates[type][idx].name = trimmedName;
    storage.templates = templates;
    storage.saveTemplates();

    // Refresh the template selector to show the new name
    showTemplateSelector(type);
}

function saveTemplateName(type, idx) {
    const nameSpan = document.getElementById(`template-name-${type}-${idx}`);
    const nameInput = document.getElementById(`template-input-${type}-${idx}`);

    if (nameSpan && nameInput) {
        const newName = nameInput.value.trim();

        if (!newName) {
            alert('Template name cannot be empty!');
            nameInput.value = storage.templates[type][idx].name;
            return;
        }

        // Update the template name in storage
        const templates = storage.templates;
        templates[type][idx].name = newName;
        storage.templates = templates;
        storage.saveTemplates();

        // Update the display
        nameSpan.textContent = newName;
        nameSpan.style.display = 'inline';
        nameInput.style.display = 'none';
    }
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
        div.style.position = 'relative';

        const isEditing = storage.editingExerciseIndex === idx;

        if (isEditing) {
            div.innerHTML = `
                <div id="exerciseDropdownContainer-${idx}" 
                     style="display: none; position: absolute; top: 52px; left: 0; width: 100%; 
                            height: 250px; background: white; border: 1px solid #e9ecef; 
                            border-top: 2px solid #4c6ef5; border-radius: 0 0 10px 10px; z-index: 20; 
                            box-shadow: 0 8px 16px rgba(0,0,0,0.1); flex-direction: column; overflow-y: auto;">
                    
                    <div class="exercise-type-tabs" style="display: flex; border-bottom: 1px solid #e9ecef; padding: 8px 8px 0 8px; gap: 4px; overflow-x: auto; flex-shrink: 0; scrollbar-width: none;">
                        <style>
                            .exercise-tab {
                                padding: 6px 12px;
                                border: 1px solid transparent;
                                background: none;
                                font-size: 0.8em;
                                cursor: pointer;
                                white-space: nowrap;
                                color: #6c757d;
                            }
                            .exercise-tab.active {
                                font-weight: bold;
                            }
                        </style>
                        <button class="exercise-tab active" data-type="current" onclick="switchExerciseTabInEdit(${idx}, 'current')">Current</button>
                        <button class="exercise-tab" data-type="push" onclick="switchExerciseTabInEdit(${idx}, 'push')">Push</button>
                        <button class="exercise-tab" data-type="pull" onclick="switchExerciseTabInEdit(${idx}, 'pull')">Pull</button>
                        <button class="exercise-tab" data-type="legs" onclick="switchExerciseTabInEdit(${idx}, 'legs')">Legs</button>
                        <button class="exercise-tab" data-type="upper" onclick="switchExerciseTabInEdit(${idx}, 'upper')">Upper</button>
                        <button class="exercise-tab" data-type="lower" onclick="switchExerciseTabInEdit(${idx}, 'lower')">Lower</button>
                        <button class="exercise-tab" data-type="whole" onclick="switchExerciseTabInEdit(${idx}, 'whole')">Whole</button>
                        ${storage.customWorkoutTypes.map(custom =>
                `<button class="exercise-tab" data-type="${custom.id}" onclick="switchExerciseTabInEdit(${idx}, '${custom.id}')">${custom.name}</button>`
            ).join('')}
                    </div>

<select id="exerciseSelect-${idx}" 
        onchange="handleExerciseSelectionInEdit(${idx})" 
        size="10" 
        style="width: 100%; height: auto; flex-grow: 1; border: none; font-size: 0.9em; outline: none; background: transparent; padding: 8px;">
</select>

                </div>
                <div style="display: flex; align-items: center; width: 100%; gap: 8px;">

                    <button type="button" onclick="toggleExerciseDropdownInEdit(${idx})" style="background: none; border: none; cursor: pointer; padding: 4px; display: flex; flex-shrink: 0;">
                        <span class="material-symbols-outlined" style="font-size: 18px; color: #6c757d;">expand_more</span>
                    </button>
                    
                    <input type="text" 
                        class="exercise-name-input" 
                        id="exerciseName-${idx}" 
                        value="${ex.name}" 
                        onchange="updateExerciseName(${idx}, this.value)" 
                        style="flex: 1; min-width: 0; padding: 10px 0px 3px; font-weight: 600; font-size: 0.95rem; border: none; margin-bottom: 7px ;border-bottom: 1px solid #eee;">

                    <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;"> 
                        <button class="detail-tool-btn toggle-edit-btn editing" onclick="toggleEdit(${idx})">
                            <span class="material-icons save-icon">check</span>
                        </button>
                        
                        <button class="detail-tool-btn cancel-edit" onclick="cancelEdit(${idx})">
                            <span class="material-icons cancel-edit-icon" style="font-size: 18px;">close</span>
                        </button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.75em; font-weight: 600; color: #6c757d; margin-bottom: 6px;">SETS</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <button class="control-btn minus" onclick="changeValue(${idx}, 'sets', -1)">−</button>
                            <input type="number" class="value-input" value="${ex.sets}" onchange="updateValue(${idx}, 'sets', this.value)" style="width: 45px;">
                            <button class="control-btn plus" onclick="changeValue(${idx}, 'sets', 1)">+</button>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.75em; font-weight: 600; color: #6c757d; margin-bottom: 6px;">REPS</div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <button class="control-btn minus" onclick="changeValue(${idx}, 'reps', -1)">−</button>
                            <input type="number" class="value-input" value="${ex.reps}" onchange="updateValue(${idx}, 'reps', this.value)" style="width: 45px;">
                            <button class="control-btn plus" onclick="changeValue(${idx}, 'reps', 1)">+</button>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px;"> 
                            <div style="font-size: 0.75em; font-weight: 600; color: #6c757d;">KG</div>
                            <label style="display: flex; align-items: center; gap: 3px; font-size: 0.6em;">
                                <input type="checkbox" style="zoom: 0.7;" ${ex.weight === 'BW' ? 'checked' : ''} onchange="toggleBodyweight(${idx}, this.checked)"> BW
                            </label>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <button class="control-btn minus" onclick="changeValue(${idx}, 'weight', -2.5)" ${ex.weight === 'BW' ? 'disabled' : ''}>−</button>
                            <input type="text" class="value-input" value="${ex.weight}" onchange="updateValue(${idx}, 'weight', this.value)" ${ex.weight === 'BW' ? 'disabled' : ''} style="width: 45px;">
                            <button class="control-btn plus" onclick="changeValue(${idx}, 'weight', 2.5)" ${ex.weight === 'BW' ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                </div>
                
                ${storage.currentPB && storage.currentPB.exerciseIdx === idx ? `
    <div class="pb-display">
        <span class="material-symbols-outlined">emoji_events</span>
        <span>PB: ${storage.currentPB.weight}kg × ${storage.currentPB.reps} reps (${storage.currentPB.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
    </div>
` : ''}
<textarea class="notes-input" placeholder="Notes (optional)" oninput="autoResizeTextarea(this); updateNotes(${idx}, this.value)" rows="1">${ex.notes || ''}</textarea>
            `;
        } else {
            // VIEW MODE
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div class="exercise-name">${ex.name}</div>
                    <div style="display: flex; gap: 4px; align-items: center;"> 
                        <button class="detail-tool-btn toggle-edit-btn" onclick="toggleEdit(${idx})">
                            <span class="material-icons edit-icon">edit</span>
                        </button>
                        <button class="detail-tool-btn" onclick="deleteExercise(${idx})">
                            <span class="material-icons" style="font-size: 18px;">delete</span>
                        </button>
                    </div>
                </div>
                <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 4px;">
                    ${ex.sets} sets × ${ex.reps} reps × ${ex.weight === 'BW' ? 'Bodyweight' : ex.weight + ' kg'}
                </div>
                ${ex.notes ? `<div class="notes-display">${ex.notes}</div>` : ''}
            `;
        }
        container.appendChild(div);
    });
}

function toggleExerciseDropdownInEdit(idx) {
    const container = document.getElementById(`exerciseDropdownContainer-${idx}`);

    if (container.style.display === 'none') {
        container.style.display = 'block';
        // Load current type by default
        switchExerciseTabInEdit(idx, 'current');
    } else {
        container.style.display = 'none';
    }
}

function switchExerciseTabInEdit(idx, type) {
    const container = document.getElementById(`exerciseDropdownContainer-${idx}`);

    // Update active tab
    container.querySelectorAll('.exercise-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    container.querySelector(`.exercise-tab[data-type="${type}"]`).classList.add('active');

    // Load exercises for selected type
    const targetType = type === 'current' ? storage.currentWorkout.type : type;
    loadExercisesForTypeInEdit(idx, targetType);
}

function loadExercisesForTypeInEdit(idx, type) {
    const allExerciseNames = new Set();

    // Get from previous workouts
    storage.workouts.forEach(w => {
        if (w.type === type && w.exercises) {
            w.exercises.forEach(ex => {
                if (ex.name) allExerciseNames.add(ex.name);
            });
        }
    });

    // Get from templates
    if (storage.templates[type]) {
        storage.templates[type].forEach(template => {
            if (template.exercises) {
                template.exercises.forEach(ex => {
                    if (ex.name) allExerciseNames.add(ex.name);
                });
            }
        });
    }

    // Get from default templates
    if (defaultTemplates[type]) {
        defaultTemplates[type].forEach(name => {
            allExerciseNames.add(name);
        });
    }

    // Populate select dropdown
    const select = document.getElementById(`exerciseSelect-${idx}`);
    select.innerHTML = '';

    if (allExerciseNames.size === 0) {
        const option = document.createElement('option');
        option.textContent = 'No exercises found';
        option.disabled = true;
        select.appendChild(option);
    } else {
        Array.from(allExerciseNames).sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }
}
// function populateExerciseDropdown(idx) {
//     const currentType = storage.currentWorkout.type;
//     const allExerciseNames = new Set();

//     // Get from previous workouts
//     storage.workouts.forEach(w => {
//         if (w.type === currentType && w.exercises) {
//             w.exercises.forEach(ex => {
//                 if (ex.name) allExerciseNames.add(ex.name);
//             });
//         }
//     });

//     // Get from templates
//     if (storage.templates[currentType]) {
//         storage.templates[currentType].forEach(template => {
//             if (template.exercises) {
//                 template.exercises.forEach(ex => {
//                     if (ex.name) allExerciseNames.add(ex.name);
//                 });
//             }
//         });
//     }

//     // Get from default templates
//     if (defaultTemplates[currentType]) {
//         defaultTemplates[currentType].forEach(name => {
//             allExerciseNames.add(name);
//         });
//     }

//     // Populate select dropdown
//     const select = document.getElementById(`exerciseSelect-${idx}`);
//     if (select) {
//         select.innerHTML = ''; // Remove placeholder - show exercises immediately
//         Array.from(allExerciseNames).sort().forEach(name => {
//             const option = document.createElement('option');
//             option.value = name;
//             option.textContent = name;
//             select.appendChild(option);
//         });
//     }
// }

function handleExerciseSelectionInEdit(idx) {






    const select = document.getElementById(`exerciseSelect-${idx}`);
    const exerciseName = select.value;

    if (!exerciseName) return;

    // Update the exercise name input
    const nameInput = document.getElementById(`exerciseName-${idx}`);
    nameInput.value = exerciseName;

    // Update the exercise name in storage
    storage.currentWorkout.exercises[idx].name = exerciseName;

    // Prefill data from history
    prefillExerciseDataInEdit(idx, exerciseName);

    // Hide the dropdown container
    document.getElementById(`exerciseDropdownContainer-${idx}`).style.display = 'none';

    // Re-render to show updated values
    renderExercises();
    autoSave();
}
function prefillExerciseDataInEdit(idx, exerciseName) {
    const currentType = storage.currentWorkout.type;

    // Search for the most recent workout with this exercise
    let latestExercise = null;
    let latestDate = null;

    storage.workouts.forEach(w => {
        if (w.type === currentType && w.exercises) {
            w.exercises.forEach(ex => {
                if (ex.name === exerciseName) {
                    const workoutDate = new Date(w.date);
                    if (!latestDate || workoutDate > latestDate) {
                        latestDate = workoutDate;
                        latestExercise = ex;
                    }
                }
            });
        }
    });

    // If found, prefill the values
    if (latestExercise) {
        storage.currentWorkout.exercises[idx].sets = latestExercise.sets;
        storage.currentWorkout.exercises[idx].reps = latestExercise.reps;
        storage.currentWorkout.exercises[idx].weight = latestExercise.weight;
    }
}

// function toggleEdit(idx) {
//     if (storage.editingExerciseIndex === idx) {
//         storage.editingExerciseIndex = null; // save / exit edit
//         autoSave();
//     } else {
//         storage.editingExerciseIndex = idx; // enter edit
//     }
//     renderExercises();
// }

function toggleEdit(idx) {
    if (storage.editingExerciseIndex === idx) {
        // SAVING: Check for errors before closing
        const currentExercise = storage.currentWorkout.exercises[idx];

        if (!currentExercise.name.trim()) {
            alert('Exercise name cannot be empty!');
            return;
        }

        // Clear backup and save
        storage.editingExerciseIndex = null;
        storage.originalExerciseSnapshot = null;
        storage.currentPB = null; // Clear PB to force recalculation
        autoSave();
        renderExercises(); // Force re-render after save
    } else {
        // ENTERING EDIT MODE: Create a deep copy snapshot
        storage.originalExerciseSnapshot = JSON.parse(JSON.stringify(storage.currentWorkout.exercises[idx]));
        storage.editingExerciseIndex = idx;
        // Calculate and display PB for this exercise
        calculatePersonalBest(idx);
        renderExercises();
    }
}

// ADD THIS NEW FUNCTION DIRECTLY BELOW toggleEdit
function cancelEdit(idx) {
    if (storage.originalExerciseSnapshot) {
        // RESTORE: Put the old data back (trashes current typing)
        storage.currentWorkout.exercises[idx] = storage.originalExerciseSnapshot;
    }

    // Reset state
    storage.editingExerciseIndex = null;
    storage.originalExerciseSnapshot = null;

    renderExercises();
}

// function editExercise(idx) {
//     storage.editingExerciseIndex = idx;
//     renderExercises();
// }

// function saveExercise(idx) {
//     storage.editingExerciseIndex = null;
//     renderExercises();
//     autoSave();
// }

function updateExerciseName(exIdx, newName) {
    storage.currentWorkout.exercises[exIdx].name = newName;
    // autoSave();
}

function updateNotes(exIdx, notes) {
    storage.currentWorkout.exercises[exIdx].notes = notes;
    // autoSave();
}


function toggleBodyweight(exIdx, isBodyweight) {
    const ex = storage.currentWorkout.exercises[exIdx];
    ex.weight = isBodyweight ? 'BW' : 0;
    renderExercises();
    // autoSave();
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
    // autoSave();
}

function updateValue(exIdx, field, value) {
    const ex = storage.currentWorkout.exercises[exIdx];
    if (field === 'weight') {
        ex[field] = value === 'BW' ? 'BW' : (parseFloat(value) || 0);
    } else {
        ex[field] = parseFloat(value) || 0;
    }
    renderExercises();
    // autoSave();
}

function renderWorkoutActions() {
    const container = document.getElementById('workoutActions');

    if (storage.isViewMode) {
        // Viewing a completed workout from calendar
        container.innerHTML = `
            <div class="action-buttons">
                <button class="save-template-btn" onclick="editCurrentWorkout()">Edit</button>
                <button class="delete-btn" onclick="deleteWorkout()">Delete</button>
            </div>
        `;
    } else if (storage.isEditingWorkoutType) {
        // We're working on a template (from home screen, not logging to a date)

        const isEditingExistingTemplate = storage.selectedTemplate &&
            storage.selectedTemplate.name &&
            storage.selectedTemplate.name !== 'Previous' &&
            storage.selectedTemplate.name !== 'Default';

        if (isEditingExistingTemplate) {
            // Editing an existing saved template - show Save, Save as, and Log
            container.innerHTML = `
        <button class="add-exercise-btn" onclick="openAddExercise()">
            <span class="material-symbols-outlined">add_circle</span>
            Add Exercise
        </button>
        <div class="workout-action-grid">
            <button class="workout-action-card" onclick="openSaveTemplate()">
                <span class="material-symbols-outlined">bookmark_add</span>
                <span class="action-label">Save as</span>
            </button>
            <button class="workout-action-card" onclick="saveWorkoutTypeEdit()">
                <span class="material-symbols-outlined">save</span>
                <span class="action-label">Save</span>
            </button>
            <button class="workout-action-card primary" onclick="logWorkoutToday()">
                <span class="material-symbols-outlined">calendar_add_on</span>
                <span class="action-label">Log</span>
            </button>
        </div>
    `;
        } else {
            // Default/Previous or creating new - show Save as and Log
            container.innerHTML = `
        <button class="add-exercise-btn" onclick="openAddExercise()">
            <span class="material-symbols-outlined">add_circle</span>
            Add Exercise
        </button>
        <div class="workout-action-grid">
            <button class="workout-action-card" onclick="openSaveTemplate()">
                <span class="material-symbols-outlined">bookmark_add</span>
                <span class="action-label">Save as</span>
            </button>
            <button class="workout-action-card primary" onclick="logWorkoutToday()">
                <span class="material-symbols-outlined">calendar_add_on</span>
                <span class="action-label">Log</span>
            </button>
        </div>
    `;
        }
    } else {
        // We're viewing/editing a workout from calendar OR logging a new one
        // Check if we're editing an existing workout (has an ID in workouts array)
        const isExistingWorkout = storage.workouts.find(w => w.id === storage.currentWorkout.id);

        if (isExistingWorkout) {
            // Editing existing workout from calendar
            container.innerHTML = `
        <button class="add-exercise-btn" onclick="openAddExercise()">
            <span class="material-symbols-outlined">add_circle</span>
            Add Exercise
        </button>
        <div class="workout-action-grid">
            <button class="workout-action-card" onclick="openSaveTemplate()">
                <span class="material-symbols-outlined">bookmark_add</span>
                <span class="action-label">Save as</span>
            </button>
            <button class="workout-action-card primary" onclick="updateCurrentWorkout()">
                <span class="material-symbols-outlined">check_circle</span>
                <span class="action-label">Update</span>
            </button>
            <button class="workout-action-card danger" onclick="deleteWorkout()">
                <span class="material-symbols-outlined">delete</span>
                <span class="action-label">Delete</span>
            </button>
        </div>
    `;
        } else {
            // Logging a new workout to a specific date
            container.innerHTML = `
        <button class="add-exercise-btn" onclick="openAddExercise()">
            <span class="material-symbols-outlined">add_circle</span>
            Add Exercise
        </button>
        <div class="workout-action-grid">
            <button class="workout-action-card" onclick="openSaveTemplate()">
                <span class="material-symbols-outlined">bookmark_add</span>
                <span class="action-label">Save as</span>
            </button>
            <button class="workout-action-card primary" onclick="finishWorkout()">
                <span class="material-symbols-outlined">check_circle</span>
                <span class="action-label">Log</span>
            </button>
        </div>
    `;
        }
    }
}

function updateCurrentWorkout() {
    autoSave(); // This will update the existing workout
    alert('Workout updated! 💾');
    storage.currentWorkout = null;
    storage.editingExerciseIndex = null;
    showScreen('calendar');
}

// function saveWorkoutTypeEdit() {
//     const type = storage.currentWorkout.type;
//     const isWarmupOrCooldown = (type === 'warmup' || type === 'cooldown');

//     // If editing an existing template (not creating new one)
//     if (storage.selectedTemplate && storage.selectedTemplate.name && storage.selectedTemplate.name !== 'Previous') {
//         const templates = storage.templates;
//         const categoryTemplates = templates[type] || [];

//         // Find and update the template
//         const templateIndex = categoryTemplates.findIndex(t => t.name === storage.selectedTemplate.name);
//         if (templateIndex >= 0) {
//             categoryTemplates[templateIndex].exercises = JSON.parse(JSON.stringify(storage.currentWorkout.exercises));
//             storage.templates = templates;
//             storage.saveTemplates();
//             alert(`Template "${storage.selectedTemplate.name}" updated! 💾`);
//         }
//     } else if (isWarmupOrCooldown) {
//         // For warmup/cooldown creating NEW template (selectedTemplate is null)
//         // User needs to use "Save as" button to give it a name first
//         alert('Please use "Save as" to create your first template! 💡');
//     } else {
//         // If editing default or previous workout for regular types
//         alert('Changes not saved (Default/Previous templates cannot be updated) 💡');
//     }

//     storage.isEditingWorkoutType = false;
//     storage.currentWorkout = null;
//     storage.isViewMode = false;
//     storage.selectedTemplate = null;
//     showScreen('home');
// }


// function deleteExercise(idx) {
//     storage.currentWorkout.exercises.splice(idx, 1);
//     renderExercises();
//     autoSave();
// }

function saveWorkoutTypeEdit() {
    const type = storage.currentWorkout.type;

    // If editing an existing template
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
    }

    storage.isEditingWorkoutType = false;
    storage.isCreatingNewTemplate = false;
    storage.currentWorkout = null;
    storage.isViewMode = false;
    storage.selectedTemplate = null;
    storage.editingExerciseIndex = null;
    showScreen('home');
}

function logWorkoutToday() {
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

    // Save current workout to today
    storage.currentWorkout.date = today.toISOString();
    storage.currentWorkout.id = Date.now();

    storage.workouts.push({ ...storage.currentWorkout });
    storage.saveWorkouts();

    alert('Workout logged for today! 💪');

    // Clean up
    storage.isEditingWorkoutType = false;
    storage.isCreatingNewTemplate = false;
    storage.currentWorkout = null;
    storage.isViewMode = false;
    storage.selectedTemplate = null;
    storage.editingExerciseIndex = null;

    showScreen('calendar');
}

function deleteExercise(idx) {
    if (!confirm('Delete this exercise?')) return;

    storage.currentWorkout.exercises.splice(idx, 1);

    // Reset editing state if we deleted the exercise being edited
    if (storage.editingExerciseIndex === idx) {
        storage.editingExerciseIndex = null;
    } else if (storage.editingExerciseIndex > idx) {
        // Adjust index if we deleted an exercise before the one being edited
        storage.editingExerciseIndex--;
    }

    renderExercises();
    autoSave();
}

// function prefillExerciseData() {
//     const exerciseName = document.getElementById('exerciseName').value.trim();
//     if (!exerciseName) return;

//     const currentType = storage.currentWorkout.type;

//     // Search for the most recent workout with this exercise
//     let latestExercise = null;
//     let latestDate = null;

//     storage.workouts.forEach(w => {
//         if (w.type === currentType && w.exercises) {
//             w.exercises.forEach(ex => {
//                 if (ex.name === exerciseName) {
//                     const workoutDate = new Date(w.date);
//                     if (!latestDate || workoutDate > latestDate) {
//                         latestDate = workoutDate;
//                         latestExercise = ex;
//                     }
//                 }
//             });
//         }
//     });

//     // If found, prefill the values
//     if (latestExercise) {
//         document.getElementById('exerciseSets').value = latestExercise.sets;
//         document.getElementById('exerciseReps').value = latestExercise.reps;
//         document.getElementById('exerciseWeight').value = latestExercise.weight === 'BW' ? 0 : latestExercise.weight;
//     }
// }

// function toggleExerciseDropdown() {
//     const container = document.getElementById('exerciseDropdownContainer');
//     if (container.style.display === 'none') {
//         container.style.display = 'block';
//         // Load current type by default
//         switchExerciseTab('current');
//     } else {
//         container.style.display = 'none';
//     }
// }

// function switchExerciseTab(type) {
//     // Update active tab
//     document.querySelectorAll('.exercise-tab').forEach(tab => {
//         tab.classList.remove('active');
//     });
//     document.querySelector(`.exercise-tab[data-type="${type}"]`).classList.add('active');

//     // Load exercises for selected type
//     const targetType = type === 'current' ? storage.currentWorkout.type : type;
//     loadExercisesForType(targetType);
// }

// function loadExercisesForType(type) {
//     const allExerciseNames = new Set();

//     // Get from previous workouts
//     storage.workouts.forEach(w => {
//         if (w.type === type && w.exercises) {
//             w.exercises.forEach(ex => {
//                 if (ex.name) allExerciseNames.add(ex.name);
//             });
//         }
//     });

//     // Get from templates
//     if (storage.templates[type]) {
//         storage.templates[type].forEach(template => {
//             if (template.exercises) {
//                 template.exercises.forEach(ex => {
//                     if (ex.name) allExerciseNames.add(ex.name);
//                 });
//             }
//         });
//     }

//     // Get from default templates
//     if (defaultTemplates[type]) {
//         defaultTemplates[type].forEach(name => {
//             allExerciseNames.add(name);
//         });
//     }

//     // Populate select dropdown
//     const select = document.getElementById('exerciseSelect');
//     select.innerHTML = '';

//     if (allExerciseNames.size === 0) {
//         const option = document.createElement('option');
//         option.textContent = 'No exercises found';
//         option.disabled = true;
//         select.appendChild(option);
//     } else {
//         Array.from(allExerciseNames).sort().forEach(name => {
//             const option = document.createElement('option');
//             option.value = name;
//             option.textContent = name;
//             select.appendChild(option);
//         });
//     }
// }

// function populateExerciseDropdownMain() {
//     const currentType = storage.currentWorkout.type;
//     const allExerciseNames = new Set();

//     // Get from previous workouts
//     storage.workouts.forEach(w => {
//         if (w.type === currentType && w.exercises) {
//             w.exercises.forEach(ex => {
//                 if (ex.name) allExerciseNames.add(ex.name);
//             });
//         }
//     });

//     // Get from templates
//     if (storage.templates[currentType]) {
//         storage.templates[currentType].forEach(template => {
//             if (template.exercises) {
//                 template.exercises.forEach(ex => {
//                     if (ex.name) allExerciseNames.add(ex.name);
//                 });
//             }
//         });
//     }

//     // Get from default templates
//     if (defaultTemplates[currentType]) {
//         defaultTemplates[currentType].forEach(name => {
//             allExerciseNames.add(name);
//         });
//     }

//     const select = document.getElementById('exerciseSelect');
//     select.innerHTML = ''; // Remove placeholder
//     Array.from(allExerciseNames).sort().forEach(name => {
//         const option = document.createElement('option');
//         option.value = name;
//         option.textContent = name;
//         select.appendChild(option);
//     });
// }

// function handleExerciseSelection() {
//     const select = document.getElementById('exerciseSelect');
//     const exerciseName = select.value;

//     if (!exerciseName) return;

//     // Put the selected name in the text input
//     document.getElementById('exerciseName').value = exerciseName;

//     // Prefill data
//     prefillExerciseData();

//         document.getElementById('exerciseDropdownContainer').style.display = 'none';


//     // Reset select back to placeholder
//     select.selectedIndex = 0;

//     // Hide the dropdown
//     select.style.display = 'none';
// }

// function openAddExercise() {
//     // Reset form
//     document.getElementById('exerciseName').value = '';
//     document.getElementById('exerciseSets').value = '3';
//     document.getElementById('exerciseReps').value = '10';
//     document.getElementById('exerciseWeight').value = '0';

//     // Add custom workout types to tabs
//     const tabsContainer = document.getElementById('exerciseTabsMain');

//     // Remove old custom tabs first
//     tabsContainer.querySelectorAll('[data-custom="true"]').forEach(tab => tab.remove());

//     // Add custom workout type tabs
//     storage.customWorkoutTypes.forEach(custom => {
//         const btn = document.createElement('button');
//         btn.className = 'exercise-tab';
//         btn.setAttribute('data-type', custom.id);
//         btn.setAttribute('data-custom', 'true');
//         btn.textContent = custom.name;
//         btn.onclick = () => switchExerciseTab(custom.id);
//         tabsContainer.appendChild(btn);
//     });

//     // Hide dropdown container by default
//     document.getElementById('exerciseDropdownContainer').style.display = 'none';

//     document.getElementById('exerciseModal').classList.add('active');
// }

// function openAddExercise() {
//     // Create a blank exercise
//     const newExercise = {
//         name: 'Exercise Name',
//         sets: 3,
//         reps: 10,
//         weight: 0,
//         notes: ''
//     };

//     // Add to current workout
//     storage.currentWorkout.exercises.push(newExercise);

//     // Set it to editing mode immediately
//     storage.editingExerciseIndex = storage.currentWorkout.exercises.length - 1;

//     // Re-render to show the new exercise in edit mode
//     renderExercises();
// }

// function closeAddExercise() {
//     document.getElementById('exerciseModal').classList.remove('active');
// }

// function addExercise() {
//     const name = document.getElementById('exerciseName').value;
//     const sets = parseInt(document.getElementById('exerciseSets').value);
//     const reps = parseInt(document.getElementById('exerciseReps').value);
//     const weight = parseFloat(document.getElementById('exerciseWeight').value);

//     if (!name) {
//         alert('Please enter exercise name');
//         return;
//     }

//     storage.currentWorkout.exercises.push({ name, sets, reps, weight, notes: '' });
//     renderExercises();
//     closeAddExercise();
//     autoSave();

//     // Reset form
//     document.getElementById('exerciseName').value = '';
//     document.getElementById('exerciseSets').value = '3';
//     document.getElementById('exerciseReps').value = '10';
//     document.getElementById('exerciseWeight').value = '0';
// }

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

// function openAddExercise() {
//     const currentType = storage.currentWorkout.type;

//     // Get the reference date - either selected date or today
//     const referenceDate = storage.isFromCalendar && storage.selectedDate 
//         ? new Date(storage.selectedDate) 
//         : new Date();

//     // Find the most recent workout of this type BEFORE the reference date
//     const previousWorkouts = storage.workouts
//         .filter(w => {
//             const workoutDate = new Date(w.date);
//             return w.type === currentType && 
//                    w.exercises?.length && 
//                    workoutDate < referenceDate;
//         })
//         .sort((a, b) => new Date(b.date) - new Date(a.date));

//     let newExercise;

//     if (previousWorkouts.length > 0 && previousWorkouts[0].exercises.length > 0) {
//         // Use the first exercise from the most recent workout as template
//         const templateExercise = previousWorkouts[0].exercises[0];
//         newExercise = {
//             name: templateExercise.name || 'Exercise Name',
//             sets: templateExercise.sets || 3,
//             reps: templateExercise.reps || 10,
//             weight: templateExercise.weight || 0,
//             notes: ''
//         };
//     } else {
//         // No previous workout found - use defaults
//         newExercise = {
//             name: 'Exercise Name',
//             sets: 3,
//             reps: 10,
//             weight: 0,
//             notes: ''
//         };
//     }

//     // Add to current workout
//     storage.currentWorkout.exercises.push(newExercise);

//     // Set it to editing mode immediately
//     storage.editingExerciseIndex = storage.currentWorkout.exercises.length - 1;

//     // Re-render to show the new exercise in edit mode
//     renderExercises();
// }

function openAddExercise() {
    // Create a blank exercise with default values
    const newExercise = {
        name: 'Exercise Name',
        sets: 3,
        reps: 10,
        weight: 0,
        notes: ''
    };

    // Add to current workout
    storage.currentWorkout.exercises.push(newExercise);

    // Set it to editing mode immediately
    storage.editingExerciseIndex = storage.currentWorkout.exercises.length - 1;

    // Re-render to show the new exercise in edit mode
    renderExercises();
}
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
    // Check if this date already has a workout
    const workoutDateStr = new Date(storage.currentWorkout.date).toDateString();
    const existingEntry = storage.workouts.find(w =>
        w.id !== storage.currentWorkout.id && // Don't count itself if editing
        new Date(w.date).toDateString() === workoutDateStr
    );

    if (existingEntry) {
        alert('Already logged for this day! Delete the existing workout first if you want to replace it.');
        return;
    }

    autoSave();
    alert('Workout completed! 💪');
    storage.currentWorkout = null;
    storage.isViewMode = false;
    storage.editingExerciseIndex = null;
    showScreen('calendar');
}

function goBackFromWorkout() {
    storage.editingExerciseIndex = null;

    if (storage.isViewMode) {
        storage.isViewMode = false;
        storage.currentWorkout = null;
        showScreen('calendar');
    } else if (storage.isEditingWorkoutType) {
        // Coming from home screen (editing template)
        storage.isEditingWorkoutType = false;
        storage.currentWorkout = null;
        showScreen('home');
    } else {
        // Coming from calendar (logging workout)
        storage.currentWorkout = null;
        showScreen('calendar');
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
    storage.isViewMode = false; // Make it always editable

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

    // renderWorkoutWeight(workout);

    // document.getElementById('viewModeIndicator').innerHTML = `
    //     <div class="view-mode">
    //         <div class="view-mode-label">✓ Completed Workout</div>
    //     </div>
    // `;

    renderExercises();
    renderWorkoutActions();
    showScreen('workout');
}
// function renderWorkoutWeight(workout) {
//     const container = document.getElementById('workoutWeightSection');
//     if (!workout) {
//         container.style.display = 'none';
//         return;
//     }

//     const workoutDate = new Date(workout.date).toDateString();
//     const weightLog = storage.weightLogs.find(log =>
//         new Date(log.date).toDateString() === workoutDate
//     );

//     container.style.display = 'block';

//     if (weightLog) {
//         // Show logged weight with edit option
//         container.innerHTML = `
//             <div class="workout-weight-display">
//                 <span class="workout-weight-label">Body Weight:</span>
//                 <div style="display: flex; gap: 8px; align-items: center;">
//                     <span class="workout-weight-value">${weightLog.weight} kg</span>
//                     <button class="detail-tool-btn" onclick="editWorkoutWeight(${workout.id})">
//                         <span class="material-icons">edit</span>
//                     </button>
//                 </div>
//             </div>
//         `;
//     } else {
//         // Show option to log weight
//         container.innerHTML = `
//             <div class="workout-weight-edit">
//                 <input type="number" id="workoutWeightInput" placeholder="Log body weight (kg)" step="0.1">
//                 <button class="save-weight-btn" style="padding: 8px 16px; margin: 0;" onclick="logWorkoutWeight(${workout.id})">
//                     Log Weight
//                 </button>
//             </div>
//         `;
//     }
// }

// function logWorkoutWeight(workoutId) {
//     const input = document.getElementById('workoutWeightInput');
//     const weight = parseFloat(input.value);

//     if (!weight || weight <= 0) {
//         alert('Please enter a valid weight!');
//         return;
//     }

//     const workout = storage.workouts.find(w => w.id === workoutId);
//     if (!workout) return;

//     const workoutDate = new Date(workout.date);
//     workoutDate.setHours(12, 0, 0, 0);

//     // Check if already logged for this date
//     const existingIndex = storage.weightLogs.findIndex(log =>
//         new Date(log.date).toDateString() === workoutDate.toDateString()
//     );

//     if (existingIndex >= 0) {
//         storage.weightLogs[existingIndex].weight = weight;
//     } else {
//         storage.weightLogs.push({
//             date: workoutDate.toISOString(),
//             weight: weight
//         });
//     }

//     storage.saveWeightLogs();
//     alert('Weight logged! 📊');
//     renderWorkoutWeight(workout);
// }

// function editWorkoutWeight(workoutId) {
//     const workout = storage.workouts.find(w => w.id === workoutId);
//     if (!workout) return;

//     const workoutDate = new Date(workout.date).toDateString();
//     const weightLog = storage.weightLogs.find(log =>
//         new Date(log.date).toDateString() === workoutDate
//     );

//     if (!weightLog) return;

//     const newWeight = prompt('Enter new weight (kg):', weightLog.weight);
//     if (newWeight === null) return;

//     const weight = parseFloat(newWeight);
//     if (!weight || weight <= 0) {
//         alert('Please enter a valid weight!');
//         return;
//     }

//     weightLog.weight = weight;
//     storage.saveWeightLogs();
//     alert('Weight updated! 📊');
//     renderWorkoutWeight(workout);
// }
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

    // Re-render current view (weekly or monthly) instead of always going to monthly
    if (isDetailsExpanded) {
        renderWeekView();
    } else {
        renderCalendar();
    }
}

function renderCalendar() {

    // Restore expanded state if saved

    if (storage.isDetailsExpanded && !isDetailsExpanded) {
        isDetailsExpanded = true;
        const section = document.getElementById('workoutDetailsSection');
        const icon = document.getElementById('expandIcon');
        section.classList.add('expanded');
        icon.textContent = 'more_down';
        storage.currentWeekOffset = 0;
        renderWeekView();
        return; // Exit early, renderWeekView will handle the rest
    }

    // Show weekday header for monthly view
    const header = document.getElementById('calendarWeekdayHeader');
    if (header) {
        header.style.display = 'grid';
    }

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

    // Days are now in fixed header, no need to add them to grid

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

    dayDiv.className = 'calendar-day';
    dayDiv.dataset.date = date.toISOString(); // ADD THIS LINE

    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    }

    const workout = storage.workouts.find(w =>
        new Date(w.date).toDateString() === date.toDateString()
    );

    // Check if weight is logged for this date
    const hasWeight = storage.weightLogs.find(log =>
        new Date(log.date).toDateString() === date.toDateString()
    );

    if (hasWeight) {
        dayDiv.classList.add('has-weight');
    }

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

    // Render based on mode (no weekday inside cell anymore)
    if (storage.calendarTextMode) {
        // Text mode: small number top-left, workout label below
        dayDiv.innerHTML = `
            <div class="day-number">${day}</div>
            ${workoutLabel ? `<div class="workout-label">${workoutLabel}</div>` : ''}
        `;
    } else {
        // Normal mode: centered number
        dayDiv.innerHTML = `
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

    // Check for weight log
    const weightLog = storage.weightLogs.find(log =>
        new Date(log.date).toDateString() === date.toDateString()
    );
    const weightDisplay = document.getElementById('weightDisplay');

    const deleteBtn = document.getElementById("deleteWorkoutBtn");
    const changeBtn = document.getElementById("changeWorkoutBtn");

    if (workout) {
        // Show delete button
        deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteWorkoutFromCalendar(workout.id);
        };
        deleteBtn.style.display = 'flex';

        // Show change workout button
        changeBtn.innerHTML = `<span class="material-symbols-outlined">sync_alt</span>`;
        changeBtn.onclick = (e) => {
            e.stopPropagation();
            changeWorkoutForDate(date, workout.id);
        };
        changeBtn.style.display = 'flex';
    } else {
        deleteBtn.innerHTML = '';
        deleteBtn.style.display = 'none';
        changeBtn.innerHTML = '';
        changeBtn.style.display = 'none';
    }


    dateLabel.innerHTML = `
  <span>${dateStr}</span>
`;

    // Update weight display
    if (weightLog) {
        weightDisplay.textContent = `• ${weightLog.weight}kg`;
        weightDisplay.style.display = 'inline';
    } else {
        weightDisplay.textContent = '';
        weightDisplay.style.display = 'none';
    }

    // Show/hide weight button
    const logWeightBtn = document.getElementById('logWeightBtn');
    logWeightBtn.style.display = 'flex';

    // Add this right after the logWeightBtn.style.display = 'flex'; line
const simplifiedViewBtn = document.getElementById('simplifiedViewBtn');
if (!simplifiedViewBtn) {
    // Create the button if it doesn't exist
    const newBtn = document.createElement('button');
    newBtn.id = 'simplifiedViewBtn';
    newBtn.className = 'detail-tool-btn';
    newBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
    newBtn.title = 'Toggle simplified view';
    newBtn.onclick = (e) => {
        e.stopPropagation();
        toggleSimplifiedView();
    };
    document.querySelector('.workout-details-tools').insertBefore(
        newBtn, 
        document.querySelector('.workout-details-tools').lastElementChild
    );
}

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

           // Replace the section that starts with: workout.exercises.forEach(ex => {
if (storage.isSimplifiedView) {
    // SIMPLIFIED VIEW
    workout.exercises.forEach(ex => {
        // Calculate PB for this exercise
        const currentType = workout.type;
        let pbInfo = null;
        
        let bestWeight = null;
        let bestReps = 0;
        let bestSets = 0;
        let bestDate = null;
        
        storage.workouts.forEach(w => {
            if (w.type === currentType && w.exercises) {
                w.exercises.forEach(exW => {
                    if (exW.name === ex.name) {
                        const weight = exW.weight === 'BW' ? 'BW' : parseFloat(exW.weight) || 0;
                        const reps = parseInt(exW.reps) || 0;
                        const sets = parseInt(exW.sets) || 0;
                        
                        let isBetter = false;
                        
                        if (bestWeight === null) {
                            isBetter = true;
                        } else if (weight === 'BW' && bestWeight === 'BW') {
                            if (reps > bestReps || (reps === bestReps && sets > bestSets)) {
                                isBetter = true;
                            }
                        } else if (weight !== 'BW' && bestWeight !== 'BW') {
                            if (weight > bestWeight || (weight === bestWeight && reps > bestReps) || 
                                (weight === bestWeight && reps === bestReps && sets > bestSets)) {
                                isBetter = true;
                            }
                        } else if (weight !== 'BW' && bestWeight === 'BW') {
                            isBetter = true;
                        }
                        
                        if (isBetter) {
                            bestWeight = weight;
                            bestReps = reps;
                            bestSets = sets;
                            bestDate = new Date(w.date);
                        }
                    }
                });
            }
        });
        
        if (bestWeight !== null) {
            pbInfo = {
                weight: bestWeight,
                reps: bestReps,
                sets: bestSets,
                date: bestDate
            };
        }
        
        html += `
            <div class="workout-detail-item">
                <div class="workout-detail-title">${ex.name}</div>
                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.85em; color: #6c757d;">
                    <span>${ex.sets} sets × ${ex.reps} reps × ${ex.weight === 'BW' ? 'Bodyweight' : ex.weight + ' kg'}</span>
                    ${pbInfo ? `
                        <span style="color: #4c6ef5; font-size: 0.75em; display: flex; align-items: center; gap: 4px;">
                            <span class="material-symbols-outlined" style="font-size: 14px !important;">emoji_events</span>
                            PB: ${pbInfo.sets}×${pbInfo.reps}×${pbInfo.weight === 'BW' ? 'BW' : pbInfo.weight + 'kg'} 
                            (${pbInfo.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    });
} else {
    // FULL VIEW (existing code)
    workout.exercises.forEach(ex => {
        html += `
            <div class="workout-detail-item">
                <div class="workout-detail-title">${ex.name}</div>
                <div class="workout-detail-set">${ex.sets} sets × ${ex.reps} reps × ${ex.weight === 'BW' ? 'Bodyweight' : ex.weight + ' kg'}</div>
                ${ex.notes ? `<div style="margin-top: 8px; font-size: 0.8em; color: #6c757d; font-style: italic;">${ex.notes}</div>` : ''}
            </div>
        `;
    });
}

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

function changeWorkoutForDate(date, oldWorkoutId) {
    // Store the date and old workout ID
    storage.changeWorkoutDate = date;
    storage.changeWorkoutOldId = oldWorkoutId;

    // Show workout selector
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('selectedDateDisplay').textContent = dateStr;
    renderCustomWorkoutsInModal();
    document.getElementById('selectWorkoutModal').classList.add('active');
}

function toggleExpand() {
    const section = document.getElementById('workoutDetailsSection');
    const icon = document.getElementById('expandIcon');
    isDetailsExpanded = !isDetailsExpanded;

    // Save state to localStorage
    storage.isDetailsExpanded = isDetailsExpanded;

    if (isDetailsExpanded) {
        section.classList.add('expanded');
        icon.textContent = 'more_down'; // Keeping your original icon

        // Calculate the week offset so the week view shows the selected date
        const today = new Date();
        const selected = selectedCalendarDate || today;

        // Find Sunday of today's week
        const startOfTodayWeek = new Date(today);
        startOfTodayWeek.setDate(today.getDate() - today.getDay());
        startOfTodayWeek.setHours(0, 0, 0, 0);

        // Find Sunday of the selected date's week
        const startOfSelectedWeek = new Date(selected);
        startOfSelectedWeek.setDate(selected.getDate() - selected.getDay());
        startOfSelectedWeek.setHours(0, 0, 0, 0);

        // Calculate the difference in weeks and update the offset
        const diffInDays = Math.round((startOfSelectedWeek - startOfTodayWeek) / (1000 * 60 * 60 * 24));
        storage.currentWeekOffset = diffInDays / 7;

        renderWeekView();
    } else {
        section.classList.remove('expanded');
        icon.textContent = 'more_up'; // Keeping your original icon

        // When collapsing, ensure the month grid matches the selected date
        if (selectedCalendarDate) {
            storage.currentMonth = selectedCalendarDate.getMonth();
            storage.currentYear = selectedCalendarDate.getFullYear();
        }

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

        const today = new Date();
        let dateToSelect;

        // Check if the month we just swiped to is the ACTUAL current month
        if (storage.currentMonth === today.getMonth() && storage.currentYear === today.getFullYear()) {
            dateToSelect = today; // Select today's date
        } else {
            dateToSelect = new Date(storage.currentYear, storage.currentMonth, 1); // Select the 1st
        }

        selectedCalendarDate = dateToSelect;
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

    // Check if we're changing an existing workout
    if (storage.changeWorkoutDate && storage.changeWorkoutOldId) {
        // Delete old workout
        const idx = storage.workouts.findIndex(w => w.id === storage.changeWorkoutOldId);
        if (idx >= 0) {
            storage.workouts.splice(idx, 1);
            storage.saveWorkouts();
        }

        // Use the change workout date
        storage.selectedDate = storage.changeWorkoutDate;

        // Clear the change workout state
        storage.changeWorkoutDate = null;
        storage.changeWorkoutOldId = null;
    } else {
        // Normal flow - check for existing entry
        const selectedDateStr = storage.selectedDate.toDateString();
        const existingEntry = storage.workouts.find(w =>
            new Date(w.date).toDateString() === selectedDateStr
        );

        if (existingEntry) {
            alert('Already logged for this day! Delete it first if you want to replace it.');
            return;
        }
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
    <div class="stats-compare">

        <!-- Header row -->
        <div class="debug-controls">
            <span class="material-symbols-outlined debug-btns" 
                    style="display:none; cursor:pointer;     border: 1px solid #ccc;" 
                    onclick="alert(\`${debugLog.replace(/`/g, '')}\`)"
                    title="Show Debug Log">bug_report</span>
            <span class="material-symbols-outlined debug-btns" 
                    style="display:none; cursor:pointer;     border: 1px solid #ccc;" 
                    onclick="cleanupDuplicates()"
                    title="Clean Up Duplicates">cleaning_services</span>
        </div>
        
        <div class="stats-col-header">
            <span class="material-symbols-outlined">calendar_month</span>
            ${monthNames[currentMonth]} ${currentYear}
        </div>
        <div class="stats-col-header">
            <span class="material-symbols-outlined">insights</span>
            All Time
        </div>

        <!-- Workouts -->
        <div class="stats-label">
            <span class="material-symbols-outlined">fitness_center</span>
            Workouts
        </div>
        <div class="stats-value">${monthWorkouts}</div>
        <div class="stats-value">${totalWorkouts}</div>

        <!-- Rest Days -->
        <div class="stats-label">
            <span class="material-symbols-outlined">hotel</span>
            Rest Days
        </div>
        <div class="stats-value">${monthRestDays}</div>
        <div class="stats-value">${totalRestDays}</div>

        <!-- Avg per Week -->
        <div class="stats-label">
            <span class="material-symbols-outlined">trending_up</span>
            Avg / Week
        </div>
        <div class="stats-value">${monthAvgPerWeek}</div>
        <div class="stats-value">${avgWorkoutsPerWeek}</div>

        <!-- Days Tracked -->
        <div class="stats-label">
            <span class="material-symbols-outlined">calendar_today</span>
            Days Tracked
        </div>
        <div class="stats-value">${thisMonthWorkouts.length}</div>
        <div class="stats-value">${storage.workouts.length}</div>

    </div>

`;

    const statsCompare = container.querySelector('.stats-compare');
    statsCompare.addEventListener('click', () => {

        // Hidden debug unlock
        let debugClickCount = 0;
        container.addEventListener('click', () => {
            debugClickCount++;
            if (debugClickCount === 7) {
                document.querySelectorAll('.debug-btns').forEach(btn => {
                    btn.style.display = 'inline-block';
                });
                debugClickCount = 0;
            }
        });
    });



    // Render the weekly chart
    setTimeout(() => renderWeeklyChart(), 100);

    // Render year heatmap
    setTimeout(() => renderYearHeatmap(), 200);

    // Restore graph type and show weight section if needed
    setTimeout(() => {
        const currentType = storage.currentGraphType;
        if (currentType === 'weight') {
            switchGraphType('weight');
        }
    }, 150);

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

    grid.innerHTML = '';
    grid.classList.add('one-line');

    // Show weekday header in week view too
    const header = document.getElementById('calendarWeekdayHeader');
    if (header) {
        header.style.display = 'grid';
    }

    // Render 7 days (Sun - Sat)
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

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

        // Render based on mode (no weekday inside cell)
        if (storage.calendarTextMode) {
            // Text mode: number + workout label
            dayDiv.innerHTML = `
                <div class="day-number">${date.getDate()}</div>
                ${workoutLabel ? `<div class="workout-label">${workoutLabel}</div>` : ''}
            `;
        } else {
            // Normal mode: just number
            dayDiv.innerHTML = `
                <div class="day-number">${date.getDate()}</div>
            `;
        }

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate Sunday of the new week
    const startOfNewWeek = new Date(today);
    startOfNewWeek.setDate(today.getDate() - today.getDay() + (storage.currentWeekOffset * 7));

    // Calculate Saturday of the new week
    const endOfNewWeek = new Date(startOfNewWeek);
    endOfNewWeek.setDate(startOfNewWeek.getDate() + 6);

    // Select Today if it's in this week, otherwise select Sunday
    if (today >= startOfNewWeek && today <= endOfNewWeek) {
        selectedCalendarDate = today;
    } else {
        selectedCalendarDate = startOfNewWeek;
    }

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
    if (Math.abs(dx) < minSwipeDistance) return;

    const slope = Math.abs(dy / dx);
    const maxAllowedSlope = Math.tan(30 * Math.PI / 180);
    if (slope > maxAllowedSlope) return;

    // Check if we are in Weekly View (Expanded) or Monthly View
    const isExpanded = document.getElementById('workoutDetailsSection').classList.contains('expanded');

    if (dx < 0) { // Swipe Left -> Next
        isExpanded ? changeWeek(1) : changeMonth(1);
    } else { // Swipe Right -> Previous
        isExpanded ? changeWeek(-1) : changeMonth(-1);
    }
}

// 2. Updated changeMonth with Auto-Select Logic
function changeMonth(delta) {
    storage.currentMonth += delta;
    if (storage.currentMonth > 11) {
        storage.currentMonth = 0;
        storage.currentYear++;
    } else if (storage.currentMonth < 0) {
        storage.currentMonth = 11;
        storage.currentYear--;
    }

    const today = new Date();
    // Select Today if it's the current month, otherwise the 1st
    if (storage.currentMonth === today.getMonth() && storage.currentYear === today.getFullYear()) {
        selectedCalendarDate = today;
    } else {
        selectedCalendarDate = new Date(storage.currentYear, storage.currentMonth, 1);
    }

    renderCalendar();
}

function changeWeek(delta) {
    storage.currentWeekOffset += delta;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate Sunday of the new week
    const startOfNewWeek = new Date(today);
    startOfNewWeek.setDate(today.getDate() - today.getDay() + (storage.currentWeekOffset * 7));

    // Calculate Saturday of the new week
    const endOfNewWeek = new Date(startOfNewWeek);
    endOfNewWeek.setDate(startOfNewWeek.getDate() + 6);

    // Select Today if it's in this week, otherwise select Sunday
    if (today >= startOfNewWeek && today <= endOfNewWeek) {
        selectedCalendarDate = today;
    } else {
        selectedCalendarDate = startOfNewWeek;
    }

    renderWeekView();
}

function handleSwipeDetails(startX, endX, startY, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const minSwipeDistance = 50;
    if (Math.abs(dx) < minSwipeDistance) return;

    const slope = Math.abs(dy / dx);
    const maxAllowedSlope = Math.tan(30 * Math.PI / 180);
    if (slope > maxAllowedSlope) return;

    // In BOTH views, swiping the details section moves day-by-day
    if (dx < 0) {
        moveSelection(1); // Next Day
    } else {
        moveSelection(-1); // Previous Day
    }
}

function moveSelection(days) {
    const currentDate = new Date(selectedCalendarDate || new Date());
    currentDate.setDate(currentDate.getDate() + days);
    currentDate.setHours(0, 0, 0, 0);

    const isExpanded = document.getElementById('workoutDetailsSection').classList.contains('expanded');

    if (isExpanded) {
        // Update week offset if we move out of the currently visible 7 days
        const today = new Date();
        const startVisible = new Date(today);
        startVisible.setDate(today.getDate() - today.getDay() + (storage.currentWeekOffset * 7));
        startVisible.setHours(0, 0, 0, 0);

        const endVisible = new Date(startVisible);
        endVisible.setDate(startVisible.getDate() + 6);

        if (currentDate < startVisible || currentDate > endVisible) {
            // Calculate how many weeks away the new date is
            const diffTime = currentDate - startVisible;
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            storage.currentWeekOffset += diffWeeks;
        }
        selectedCalendarDate = currentDate;
        renderWeekView();
    } else {
        // Normal Month View logic
        if (currentDate.getMonth() !== storage.currentMonth || currentDate.getFullYear() !== storage.currentYear) {
            storage.currentMonth = currentDate.getMonth();
            storage.currentYear = currentDate.getFullYear();
            renderCalendar();
        }
        selectedCalendarDate = currentDate;
        renderCalendar();
    }

    // Automatically trigger the click on the new date to refresh the details content
    const workout = storage.workouts.find(w =>
        new Date(w.date).toDateString() === currentDate.toDateString()
    );
    showWorkoutDetails(currentDate, workout);
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
        handleSwipeDetails(touchStartX, touchEndX, touchStartY, touchEndY);
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
        // Inside the forEach loop where custom workout cards are created:
        customTypes.forEach((custom, idx) => {
            const btn = document.createElement('button');
            btn.className = 'workout-card';
            btn.style.borderColor = custom.color;
            btn.style.color = custom.color;
            btn.innerHTML = `
                    <span class="material-symbols-outlined card-icon">fitness_center</span>
                    <span class="card-label">${custom.name}</span>
                    <div style=" display: flex; gap: 4px;">
                        <button onclick="event.stopPropagation(); renameCustomWorkoutType(${idx})" 
                                style="background: #4c6ef5; color: white; border: none; padding: 4px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer;">
                            <span class="material-symbols-outlined" style="font-size: 16px !important;">edit</span>
                        </button>
                        <button onclick="event.stopPropagation(); deleteCustomWorkoutType(${idx})" 
                                style="background: #ff6b6b; color: white; border: none; padding: 4px; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer;">
                            <span class="material-symbols-outlined" style="font-size: 16px !important;">close_small</span>
                        </button>
                    </div>
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

// Handle type selection
document.addEventListener('DOMContentLoaded', function () {
    const typeSelector = document.getElementById('customExerciseTypeSelector');
    if (typeSelector) {
        typeSelector.addEventListener('change', function () {
            const selectedType = this.value;
            if (!selectedType) {
                document.getElementById('customExerciseNameSelector').style.display = 'none';
                return;
            }
            loadExercisesForCustomType(selectedType);
        });
    }
});

function loadExercisesForCustomType(type) {
    const allExercises = new Set();

    // Get from workouts
    storage.workouts.forEach(w => {
        if (w.type === type && w.exercises) {
            w.exercises.forEach(ex => {
                if (ex.name) allExercises.add(ex.name);
            });
        }
    });

    // Get from templates
    if (storage.templates[type]) {
        storage.templates[type].forEach(template => {
            if (template.exercises) {
                template.exercises.forEach(ex => {
                    if (ex.name) allExercises.add(ex.name);
                });
            }
        });
    }

    // Get from defaults
    if (defaultTemplates[type]) {
        defaultTemplates[type].forEach(name => {
            allExercises.add(name);
        });
    }

    // Populate exercise selector
    const exerciseSelector = document.getElementById('customExerciseNameSelector');
    exerciseSelector.innerHTML = '<option value="">Select exercise...</option>';

    Array.from(allExercises).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        exerciseSelector.appendChild(option);
    });

    exerciseSelector.style.display = 'block';
}

function addSelectedCustomExercise() {
    const exerciseName = document.getElementById('customExerciseNameSelector').value;
    if (!exerciseName) {
        alert('Please select a workout type and exercise first!');
        return;
    }

    storage.customExercises.push(exerciseName);
    renderCustomExercises();

    // Reset selectors
    document.getElementById('customExerciseTypeSelector').value = '';
    document.getElementById('customExerciseNameSelector').style.display = 'none';
    document.getElementById('customExerciseNameSelector').value = '';
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
function renameCustomWorkoutType(idx) {
    const customType = storage.customWorkoutTypes[idx];
    const newName = prompt('Enter new workout name:', customType.name);
    
    if (newName === null) return; // User cancelled
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert('Workout name cannot be empty!');
        return;
    }
    
    // Update the name
    customType.name = trimmedName;
    storage.saveCustomWorkoutTypes();
    
    alert(`Workout renamed to "${trimmedName}"! ✏️`);
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
                <span class="material-symbols-outlined">key_visualizer</span>
                <h5 style="color: #6c757d;">${totalDays} workouts in ${currentHeatmapYear}</h5>
            </div>
            <div class="year-nav">
                <button onclick="changeHeatmapYear(-1)">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <span style="color: #6c757d; font-size: .83em;">${currentHeatmapYear}</span>
                <button onclick="changeHeatmapYear(1)" ${currentHeatmapYear >= new Date().getFullYear() ? 'disabled' : ''}>
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
        <div class="heatmap-container">
                    <div class="heatmap-months" id="heatmapMonths"></div>
            <div class="heatmap-grid" id="heatmapGrid"></div>

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

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// ===== WEIGHT TRACKING =====

function switchGraphType(type) {
    storage.currentGraphType = type;

    // Update button styles
    document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
        if (btn.dataset.type === type) {
            if (type === 'workouts') {
                btn.style.background = '#2da44e';
            } else {
                btn.style.background = '#4c6ef5';
            }
            btn.style.color = 'white';
            btn.classList.add('active');
        } else {
            btn.style.background = 'white';
            btn.style.color = '#6c757d';
            btn.classList.remove('active');
        }
    });

    // Show/hide weight logging section
    // const weightSection = document.getElementById('weightLoggingSection');
    // if (type === 'weight') {
    //     weightSection.style.display = 'block';

    //     // Set today's date as default
    //     const today = new Date();
    //     document.getElementById('weightDateInput').valueAsDate = today;

    //     renderWeightHistory();
    // } else {
    //     weightSection.style.display = 'none';
    // }

    // Update chart title
    document.getElementById('chartTitle').textContent =
        type === 'workouts' ? 'Weekly Progress' : 'Weight Progress';

    // Re-render the appropriate chart
    if (type === 'workouts') {
        renderWeeklyChart();
    } else {
        renderWeightChart();
    }
}

function logWeight() {
    const dateInput = document.getElementById('weightDateInput');
    const weightInput = document.getElementById('weightInput');
    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0) {
        alert('Please enter a valid weight!');
        return;
    }

    if (!dateInput.value) {
        alert('Please select a date!');
        return;
    }

    const selectedDate = new Date(dateInput.value);
    selectedDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    const dateStr = selectedDate.toDateString();

    // Check if weight already logged for this date
    const existingIndex = storage.weightLogs.findIndex(log =>
        new Date(log.date).toDateString() === dateStr
    );

    if (existingIndex >= 0) {
        storage.weightLogs[existingIndex].weight = weight;
        alert('Weight updated! 📊');
    } else {
        storage.weightLogs.push({
            date: selectedDate.toISOString(),
            weight: weight
        });
        alert('Weight logged! 📊');
    }

    storage.saveWeightLogs();
    weightInput.value = '';

    // Reset to today's date
    document.getElementById('weightDateInput').valueAsDate = new Date();

    renderWeightHistory();
    renderWeightChart();
}

function renderWeightHistory() {
    const container = document.getElementById('weightHistoryList');
    if (!container) return;

    if (storage.weightLogs.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d; font-size: 0.75rem;">No weight logged yet</div>';
        return;
    }

    // Sort by date descending (most recent first)
    const sortedLogs = [...storage.weightLogs].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    let html = '';
    sortedLogs.forEach((log, idx) => {
        const date = new Date(log.date);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const isEditing = storage.editingWeightIndex === idx;
        if (isEditing) {
            html += `
        <div style="display: flex; gap: 4px; align-items: center; padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 4px; flex-wrap: wrap;">
            <input type="date" id="editWeightDate-${idx}" value="${date.toISOString().split('T')[0]}" 
                style="flex: 1; min-width: 100px; padding: 6px 4px; border: 1px solid #e9ecef; border-radius: 6px; font-size: 0.75rem;">
            <input type="number" id="editWeight-${idx}" value="${log.weight}" step="0.1" 
                style="width: 60px; padding: 6px 4px; border: 1px solid #e9ecef; border-radius: 6px; font-size: 0.75rem;">
            
            <div style="display: flex; gap: 4px; margin-left: auto;">
                <button onclick="saveWeightEdit(${idx})" style="padding: 6px 8px; border: none; border-radius: 6px; background: #2da44e; color: white; cursor: pointer; display: flex; align-items: center;">
                    <span class="material-symbols-outlined" style="font-size: 16px !important;">check</span>
                </button>
                <button onclick="cancelWeightEdit()" style="padding: 6px 8px; border: none; border-radius: 6px; background: #ff6b6b; color: white; cursor: pointer; display: flex; align-items: center;">
                    <span class="material-symbols-outlined" style="font-size: 16px !important;">close</span>
                </button>
            </div>
        </div>
    `;
        } else {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #f1f3f5;">
                    <div style="flex: 1;">
                        <span style="font-size: 0.8125rem; font-weight: 600; color: #1a1d1f;">${log.weight} kg</span>
                        <span style="font-size: 0.75rem; color: #6c757d; margin-left: 8px;">${dateStr}</span>
                    </div>
                    <div style="display: flex; gap: 4px;">
                        <button onclick="editWeight(${idx})" style="padding: 4px; border: none; background: none; cursor: pointer; color: #6c757d; display: flex; align-items: center;">
                            <span class="material-symbols-outlined" style="font-size: 16px !important;">edit</span>
                        </button>
                        <button onclick="deleteWeight(${idx})" style="padding: 4px; border: none; background: none; cursor: pointer; color: #ff6b6b; display: flex; align-items: center;">
                            <span class="material-symbols-outlined" style="font-size: 16px !important;">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

function editWeight(idx) {
    storage.editingWeightIndex = idx;
    renderWeightHistory();
}

function cancelWeightEdit() {
    storage.editingWeightIndex = null;
    renderWeightHistory();
}

function saveWeightEdit(idx) {
    const dateInput = document.getElementById(`editWeightDate-${idx}`);
    const weightInput = document.getElementById(`editWeight-${idx}`);

    const weight = parseFloat(weightInput.value);
    if (!weight || weight <= 0) {
        alert('Please enter a valid weight!');
        return;
    }

    if (!dateInput.value) {
        alert('Please select a date!');
        return;
    }

    const selectedDate = new Date(dateInput.value);
    selectedDate.setHours(12, 0, 0, 0);

    // Update the log
    storage.weightLogs[idx].date = selectedDate.toISOString();
    storage.weightLogs[idx].weight = weight;

    storage.saveWeightLogs();
    storage.editingWeightIndex = null;

    renderWeightHistory();
    renderWeightChart();
}

function deleteWeight(idx) {
    if (!confirm('Delete this weight entry?')) return;

    storage.weightLogs.splice(idx, 1);
    storage.saveWeightLogs();

    renderWeightHistory();
    renderWeightChart();
}

function renderWeightChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;

    const sortedLogs = [...storage.weightLogs].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    if (sortedLogs.length === 0) {
        canvas.style.display = 'block';
        canvas.style.height = '200px';
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Segoe UI';
        ctx.fillStyle = '#6c757d';
        ctx.textAlign = 'center';
        ctx.fillText('No weight data yet', canvas.width / 2, 100);
        return;
    }

    // Prepare data
    const labels = sortedLogs.map(log => {
        const date = new Date(log.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const weights = sortedLogs.map(log => log.weight);

    // Destroy existing chart
    if (weeklyChart) {
        weeklyChart.destroy();
    }

    // Set dynamic width
    const wrapper = document.getElementById('chartWrapper');
    const minWidth = sortedLogs.length > 12 ? sortedLogs.length * 60 : wrapper.parentElement.offsetWidth;
    wrapper.style.width = Math.max(minWidth, wrapper.parentElement.offsetWidth) + 'px';

    // Create chart
    const ctx = canvas.getContext('2d');
    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: weights,
                borderColor: '#4c6ef5',
                backgroundColor: 'rgba(76, 110, 245, 0.2)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#4c6ef5',
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
                            return `Weight: ${context.parsed.y} kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function (value) {
                            return value + ' kg';
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

// ===== WEIGHT LOGGING FROM CALENDAR =====

function logWeightFromCalendar() {
    if (!selectedCalendarDate) return;

    const dateStr = selectedCalendarDate.toDateString();
    // Find the index so we can delete it if weight is 0
    const existingLogIndex = storage.weightLogs.findIndex(log =>
        new Date(log.date).toDateString() === dateStr
    );

    const existingLog = existingLogIndex > -1 ? storage.weightLogs[existingLogIndex] : null;
    const currentWeight = existingLog ? existingLog.weight : '';

    const promptText = existingLog
        ? `Update weight for ${selectedCalendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (current: ${currentWeight}kg). Enter 0 to delete:`
        : `Log weight for ${selectedCalendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (kg):`;

    const weight = prompt(promptText, currentWeight);

    if (weight === null) return; // User cancelled

    const parsedWeight = parseFloat(weight);

    // --- NEW LOGIC: DELETE IF 0 ---
    if (parsedWeight === 0) {
        if (existingLogIndex > -1) {
            storage.weightLogs.splice(existingLogIndex, 1);
            alert('Weight entry deleted! 🗑️');
        } else {
            return; // Nothing to delete
        }
    }
    // --- VALIDATION FOR NON-ZERO INPUT ---
    else if (isNaN(parsedWeight) || parsedWeight < 0) {
        alert('Please enter a valid weight!');
        return;
    }
    // --- UPDATE OR CREATE ---
    else {
        const logDate = new Date(selectedCalendarDate);
        logDate.setHours(12, 0, 0, 0);

        if (existingLog) {
            existingLog.weight = parsedWeight;
            alert('Weight updated! 📊');
        } else {
            storage.weightLogs.push({
                date: logDate.toISOString(),
                weight: parsedWeight
            });
            alert('Weight logged! 📊');
        }
    }

    // Save the changes to localStorage
    storage.saveWeightLogs();

    // Refresh display
    const workout = storage.workouts.find(w =>
        new Date(w.date).toDateString() === selectedCalendarDate.toDateString()
    );
    showWorkoutDetails(selectedCalendarDate, workout);

    // Refresh calendar to update the orange asterisk indicator
    if (storage.isDetailsExpanded) {
        renderWeekView();
    } else {
        renderCalendar();
    }
}

// ===== PERSONAL BEST CALCULATION =====
function calculatePersonalBest(exerciseIdx) {
    const currentExercise = storage.currentWorkout.exercises[exerciseIdx];
    const exerciseName = currentExercise.name.trim();

    if (!exerciseName || exerciseName === 'Exercise Name') {
        storage.currentPB = null;
        return;
    }

    const currentType = storage.currentWorkout.type;
    let bestWeight = null;
    let bestReps = 0;
    let bestSets = 0;
    let bestDate = null;

    // Search through all workouts of the same type
    storage.workouts.forEach(w => {
        if (w.type === currentType && w.exercises) {
            w.exercises.forEach(ex => {
                if (ex.name === exerciseName) {
                    const weight = ex.weight === 'BW' ? 'BW' : parseFloat(ex.weight) || 0;
                    const reps = parseInt(ex.reps) || 0;
                    const sets = parseInt(ex.sets) || 0;

                    // Determine if this is better than current best
                    let isBetter = false;

                    if (bestWeight === null) {
                        // First record found
                        isBetter = true;
                    } else if (weight === 'BW' && bestWeight === 'BW') {
                        // Both bodyweight - compare reps, then sets
                        if (reps > bestReps) {
                            isBetter = true;
                        } else if (reps === bestReps && sets > bestSets) {
                            isBetter = true;
                        }
                    } else if (weight === 'BW' && bestWeight !== 'BW') {
                        // Current is BW, best is weighted - skip
                        isBetter = false;
                    } else if (weight !== 'BW' && bestWeight === 'BW') {
                        // Current is weighted, best is BW - weighted wins
                        isBetter = true;
                    } else {
                        // Both weighted - compare weight, then reps, then sets
                        if (weight > bestWeight) {
                            isBetter = true;
                        } else if (weight === bestWeight && reps > bestReps) {
                            isBetter = true;
                        } else if (weight === bestWeight && reps === bestReps && sets > bestSets) {
                            isBetter = true;
                        }
                    }

                    if (isBetter) {
                        bestWeight = weight;
                        bestReps = reps;
                        bestSets = sets;
                        bestDate = new Date(w.date);
                    }
                }
            });
        }
    });

    // Store PB info for display
    if (bestWeight !== null) {
        storage.currentPB = {
            exerciseIdx: exerciseIdx,
            weight: bestWeight,
            reps: bestReps,
            sets: bestSets,
            date: bestDate
        };
    } else {
        storage.currentPB = null;
    }
}

function toggleSimplifiedView() {
    storage.isSimplifiedView = !storage.isSimplifiedView;
    
    // Update icon
    const btn = document.getElementById('simplifiedViewBtn');
    if (storage.isSimplifiedView) {
        btn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
    } else {
        btn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
    }
    
    // Refresh details
    if (selectedCalendarDate) {
        const workout = storage.workouts.find(w =>
            new Date(w.date).toDateString() === selectedCalendarDate.toDateString()
        );
        showWorkoutDetails(selectedCalendarDate, workout);
    }
}