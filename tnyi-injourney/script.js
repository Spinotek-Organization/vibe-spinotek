document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & State ---
    const CONFIG = {
        minWordsPerQuestion: 300, // strict requirement
        bodOptions: [
            "PT Aviasi Pariwisata Indonesia (Persero)",
            "PT Angkasa Pura I",
            "PT Angkasa Pura II",
            "PT Hotel Indonesia Natour",
            "PT Taman Wisata Candi",
            "PT Sarinah",
            "ITDC"
        ],
        storageKey: 'tnyi_injourney_draft_v1',
        totalSteps: 5
    };

    let state = {
        step: 1,
        identity: {
            fullName: '',
            position: '',
            directorate: '',
            bod: ''
        },
        answers: {
            // Structure: 'q1.1': { s: '', t: '', a: '', r: '' }
            'q1.1': { s: '', t: '', a: '', r: '' },
            'q1.2': { s: '', t: '', a: '', r: '' },
            'q2.1': { s: '', t: '', a: '', r: '' },
            'q2.2': { s: '', t: '', a: '', r: '' },
            'q3.1': { s: '', t: '', a: '', r: '' },
            'q3.2': { s: '', t: '', a: '', r: '' }
        },
        files: []
    };

    // --- DOM Elements ---
    const ui = {
        app: document.getElementById('app'),
        progressBar: document.getElementById('progress-bar'),
        progressStepInfo: document.getElementById('progress-step-info'),
        saveIndicator: document.getElementById('save-indicator'),
        contentArea: document.getElementById('content-area'),
        toast: document.getElementById('toast'),
        modal: document.getElementById('review-modal')
    };

    // --- Initialization ---
    function init() {
        loadState();
        render();
        setupGlobalListeners();
        showToast("Welcome back! Your draft has been loaded.", "info");
    }

    // --- State Management ---
    function loadState() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
            } catch (e) {
                console.error("Failed to load save", e);
            }
        }
    }

    function saveState() {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
        showSaveIndicator();
    }

    const debounceSave = debounce(() => {
        saveState();
    }, 1000);

    function showSaveIndicator() {
        ui.saveIndicator.classList.remove('opacity-0');
        ui.saveIndicator.classList.add('opacity-100');
        setTimeout(() => {
            ui.saveIndicator.classList.remove('opacity-100');
            ui.saveIndicator.classList.add('opacity-0');
        }, 2000);
    }

    // --- Global Listeners ---
    function setupGlobalListeners() {
        console.log("Global listeners initialized.");
        // Place for any app-wide event listeners (e.g., global modal close on escape)
    }

    // --- Navigation & Validation ---
    window.nextStep = function() {
        if (validateCurrentStep()) {
            if (state.step < CONFIG.totalSteps) {
                state.step++;
                render();
                saveState();
                window.scrollTo(0, 0);
            }
        }
    };

    window.prevStep = function() {
        if (state.step > 1) {
            state.step--;
            render();
            window.scrollTo(0, 0);
        }
    };

    function validateCurrentStep() {
        if (state.step === 1) {
            const { fullName, position, directorate, bod } = state.identity;
            if (!fullName || !position || !directorate || !bod) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data Belum Lengkap',
                    text: 'Mohon lengkapi semua data identitas sebelum melanjutkan.',
                    confirmButtonColor: '#005eb8'
                });
                return false;
            }
            return true;
        }

        if (state.step >= 2 && state.step <= 4) {
            // Check word counts for the questions on this page
            const questions = getQuestionsForStep(state.step);
            for (let qKey of questions) {
                const ans = state.answers[qKey];
                const totalWords = countWords(ans.s) + countWords(ans.t) + countWords(ans.a) + countWords(ans.r);
                if (totalWords < CONFIG.minWordsPerQuestion) {
                     Swal.fire({
                        icon: 'info',
                        title: 'Target Belum Tercapai',
                        html: `Jawaban untuk pertanyaan ini belum mencapai minimal <b>${CONFIG.minWordsPerQuestion} kata</b> (Saat ini: ${totalWords}).<br><br>Mohon lengkapi menggunakan metode STAR.`,
                        confirmButtonColor: '#005eb8'
                    });
                    return false;
                }
            }
            return true;
        }

        return true;
    }

    // --- Rendering ---
    function render() {
        renderWizard();
        renderContent();
    }

    // --- Navigation Helper ---
    window.goToStep = function(targetStep) {
        // Can only navigate to previous steps or the current step
        if (targetStep < state.step) {
            state.step = targetStep;
            render();
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    function renderWizard() {
        const wizardContainer = document.getElementById('wizard-container');
        if (!wizardContainer) return;

        wizardContainer.innerHTML = `
            <div class="relative py-4">
                <!-- Background Line -->
                <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-0 shadow-inner"></div>
                
                <!-- Active Progress Line with Animation -->
                <div class="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-[#EC3E32] via-[#F48F1F] to-[#009E97] rounded-full transition-all duration-700 ease-out -z-0 animate-gradient-flow shadow-[0_0_10px_rgba(0,158,151,0.3)]" style="width: ${((state.step - 1) / (CONFIG.totalSteps - 1)) * 100}%"></div>
                
                <!-- Steps -->
                <div class="flex items-center justify-between relative z-10 px-4 md:px-0">
                    ${Array.from({length: CONFIG.totalSteps}).map((_, i) => {
                        const stepNum = i + 1;
                        const isActive = stepNum === state.step;
                        const isCompleted = stepNum < state.step;
                        
                        // Interaction classes
                        let cursorClass = isCompleted ? "cursor-pointer hover:scale-110" : "cursor-default";
                        let clickHandler = isCompleted ? `onclick="goToStep(${stepNum})"` : "";
                        
                        // Circle Styles - Softer Professional Look
                        let circleBase = "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-[3px] transition-all duration-300 transform bg-white shadow-lg relative z-20";
                        let circleStateIndex = "";
                        let labelColor = "";

                        if (isActive) {
                            // Active: Subtle Glow, Branding Color, slightly larger
                            circleStateIndex = "border-[#009E97] text-[#009E97] scale-105 shadow-[0_0_20px_rgba(0,158,151,0.25)]"; 
                            labelColor = "text-[#009E97] font-bold";
                        } else if (isCompleted) {
                            // Completed: Solid Branding Color, Checkmark
                            circleStateIndex = "border-[#80A93F] bg-[#80A93F] text-white hover:bg-[#729c34] hover:shadow-md";
                            labelColor = "text-[#80A93F] font-semibold";
                        } else {
                            // Future: Subtle Gray
                            circleStateIndex = "border-gray-100 text-gray-300 bg-gray-50";
                            labelColor = "text-gray-400 font-medium";
                        }

                        return `
                            <div class="flex flex-col items-center group relative min-w-[100px]" ${clickHandler}>
                                <div class="${circleBase} ${circleStateIndex} ${cursorClass}">
                                    ${isCompleted ? '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>' : stepNum}
                                </div>
                                <span class="absolute top-16 text-[10px] uppercase tracking-widest transition-all duration-300 ${labelColor} whitespace-nowrap bg-white/95 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 backdrop-blur-sm z-10">
                                    ${getStepLabel(stepNum)}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    function getStepLabel(step) {
        if(step === 1) return "Identitas";
        if(step === 2) return "Foundation";
        if(step === 3) return "Change";
        if(step === 4) return "Future";
        if(step === 5) return "Submit";
        return "";
    }

    function renderContent() {
        ui.contentArea.innerHTML = ''; // Clear current
        
        let html = '';
        if (state.step === 1) {
            html = renderStep1();
        } else if (state.step >= 2 && state.step <= 4) {
            html = renderQuestionsStep(state.step);
        } else if (state.step === 5) {
            html = renderStep5();
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'fade-enter-active';
        wrapper.innerHTML = html;
        ui.contentArea.appendChild(wrapper);

        // Re-attach listeners for new inputs
        attachInputListeners();
    }

    function renderStep1() {
        return `
            <div class="max-w-2xl mx-auto space-y-8">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Identitas & Klasifikasi</h2>
                    <p class="text-gray-500">Lengkapi data diri profesional Anda untuk memulai penyusunan portofolio.</p>
                </div>

                <div class="glass-panel shadow-md p-8 rounded-2xl space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                        <input type="text" data-model="identity.fullName" value="${state.identity.fullName}" 
                            class="glass-input w-full px-4 py-3 rounded-xl focus:outline-none" placeholder="Masukkan nama lengkap beserta gelar">
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Jabatan Saat Ini</label>
                            <input type="text" data-model="identity.position" value="${state.identity.position}"
                                class="glass-input w-full px-4 py-3 rounded-xl focus:outline-none" placeholder="Vice President of...">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Direktorat / Unit</label>
                            <input type="text" data-model="identity.directorate" value="${state.identity.directorate}"
                                class="glass-input w-full px-4 py-3 rounded-xl focus:outline-none" placeholder="Human Capital...">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">BOD Member Terkait / Entitas</label>
                        <div class="relative">
                            <select data-model="identity.bod" class="glass-input w-full px-4 py-3 rounded-xl focus:outline-none appearance-none cursor-pointer">
                                <option value="" disabled ${!state.identity.bod ? 'selected' : ''}>Pilih Entitas...</option>
                                ${CONFIG.bodOptions.map(opt => `<option value="${opt}" ${state.identity.bod === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                            <div class="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">Data ini digunakan untuk filtering otomatis pada tahap penjurian.</p>
                    </div>
                </div>

                <div class="flex justify-end pt-4">
                    <button onclick="nextStep()" class="bg-[#005eb8] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-[#004e9a] transition-all transform hover:-translate-y-1">
                        Lanjutkan ke Section 1
                    </button>
                </div>
            </div>
        `;
    }

    function renderQuestionsStep(step) {
        // Logic to determine which questions to show
        const map = {
            2: { title: "Section 1: The Foundation", questions: [
                { id: 'q1.1', title: '1.1 The Strategic Imperative', desc: 'Describe a time you identified a strategic need...' },
                { id: 'q1.2', title: '1.2 Value Alignment', desc: 'How have you aligned your team with core values...' }
            ]},
            3: { title: "Section 2: Driving Change", questions: [
                { id: 'q2.1', title: '2.1 Navigating Complexity', desc: 'Share a complex challenge where you...' },
                { id: 'q2.2', title: '2.2 Impact Measurement', desc: 'How do you measure the impact of your initiatives...' }
            ]},
            4: { title: "Section 3: Future & Legacy", questions: [
                { id: 'q3.1', title: '3.1 Anticipating Disruption', desc: 'How do you prepare your unit for disruption...' },
                { id: 'q3.2', title: '3.2 Legacy & Institutionalization', desc: 'What legacy are you building...' }
            ]}
        };

        const data = map[step];

        return `
            <div class="max-w-4xl mx-auto space-y-8">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-1">${data.title}</h2>
                        <p class="text-gray-500">Jawab pertanyaan menggunakan metode STAR (Situation, Task, Action, Result).</p>
                    </div>
                     <div class="text-right">
                        <span class="text-sm font-medium text-gray-400">Target: Min. ${CONFIG.minWordsPerQuestion} words/question</span>
                    </div>
                </div>

                ${data.questions.map(q => renderStarInput(q)).join('')}

                <div class="flex justify-between pt-8 pb-12">
                    <button onclick="prevStep()" class="px-6 py-3 text-gray-500 hover:text-gray-800 font-medium transition-colors">
                        Kembali
                    </button>
                    <button onclick="nextStep()" class="bg-[#005eb8] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-[#004e9a] transition-all transform hover:-translate-y-1">
                        ${step === 4 ? 'Lanjut ke Submission' : 'Lanjut ke Section Berikutnya'}
                    </button>
                </div>
            </div>
        `;
    }

    function renderStarInput(q) {
        const val = state.answers[q.id];
        const currentWords = countWords(val.s) + countWords(val.t) + countWords(val.a) + countWords(val.r);
        const progress = Math.min((currentWords / CONFIG.minWordsPerQuestion) * 100, 100);
        const color = progress >= 100 ? 'bg-green-500' : 'bg-yellow-500';

        return `
            <div class="glass-panel shadow-md p-6 md:p-8 rounded-2xl mb-8">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${q.title}</h3>
                        <p class="text-gray-600 mt-1">${q.desc}</p>
                    </div>
                    <button onclick="toggleExample('${q.id}')" class="text-[#005eb8] text-sm font-medium hover:underline flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Lihat Contoh
                    </button>
                </div>

                <div id="example-${q.id}" class="hidden bg-blue-50 p-4 rounded-xl mb-6 text-sm text-gray-700 border border-blue-100">
                    <strong>Contoh Jawaban STAR:</strong><br>
                    <span class="font-semibold text-blue-800">Situation:</span> Krisis penurunan engagement tim...<br>
                    <span class="font-semibold text-blue-800">Task:</span> Memulihkan kepercayaan dan produktivitas...<br>
                    <span class="font-semibold text-blue-800">Action:</span> Mengadakan sesi 1-on-1, merombak workflow...<br>
                    <span class="font-semibold text-blue-800">Result:</span> Kenaikan skor engagement 20% dalam 3 bulan.
                </div>

                <div class="space-y-6">
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#EC3E32]"></span>
                            <label class="text-xs font-bold text-[#EC3E32] uppercase tracking-wider">Situation</label>
                        </div>
                        <textarea data-q="${q.id}" data-part="s" 
                            class="glass-input w-full p-4 rounded-xl min-h-[120px] text-sm focus:outline-none resize-none border-l-4 border-l-[#EC3E32] focus:border-[#EC3E32]" 
                            placeholder="Jelaskan konteks atau tantangan yang dihadapi...">${val.s}</textarea>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#F48F1F]"></span>
                            <label class="text-xs font-bold text-[#F48F1F] uppercase tracking-wider">Task</label>
                        </div>
                        <textarea data-q="${q.id}" data-part="t" 
                            class="glass-input w-full p-4 rounded-xl min-h-[120px] text-sm focus:outline-none resize-none border-l-4 border-l-[#F48F1F] focus:border-[#F48F1F]" 
                            placeholder="Apa tanggung jawab atau peran Anda dalam situasi tersebut?">${val.t}</textarea>
                    </div>
                    <div class="space-y-2">
                         <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#009E97]"></span>
                            <label class="text-xs font-bold text-[#009E97] uppercase tracking-wider">Action</label>
                        </div>
                        <textarea data-q="${q.id}" data-part="a" 
                            class="glass-input w-full p-4 rounded-xl min-h-[120px] text-sm focus:outline-none resize-none border-l-4 border-l-[#009E97] focus:border-[#009E97]" 
                            placeholder="Langkah konkret apa yang Anda lakukan?">${val.a}</textarea>
                    </div>
                    <div class="space-y-2">
                         <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#80A93F]"></span>
                            <label class="text-xs font-bold text-[#80A93F] uppercase tracking-wider">Result</label>
                        </div>
                        <textarea data-q="${q.id}" data-part="r" 
                            class="glass-input w-full p-4 rounded-xl min-h-[120px] text-sm focus:outline-none resize-none border-l-4 border-l-[#80A93F] focus:border-[#80A93F]" 
                            placeholder="Apa hasil nyata yang dicapai? (Kualitatif/Kuantitatif)">${val.r}</textarea>
                    </div>
                </div>

                <div class="mt-4 flex items-center justify-between">
                    <div class="flex-1 mr-4">
                        <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full ${color} transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <span class="text-xs font-bold ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}">
                        ${currentWords} / ${CONFIG.minWordsPerQuestion} words
                    </span>
                </div>
            </div>
        `;
    }

    function renderStep5() {
        return `
            <div class="max-w-2xl mx-auto space-y-8 text-center animate-fade-in">
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Evidence & Submission</h2>
                    <p class="text-gray-500">Sertakan dokumen pendukung untuk memperkuat portofolio Anda.</p>
                </div>

                <div class="glass-panel shadow-md p-10 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#005eb8] transition-colors cursor-pointer group" ondragover="event.preventDefault()" ondrop="handleDrop(event)">
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <div class="w-16 h-16 bg-blue-50 text-[#005eb8] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700">Drag & Drop file PDF di sini</p>
                            <p class="text-sm text-gray-500">atau klik untuk memilih (Max. 2 file)</p>
                        </div>
                        <input type="file" id="file-input" class="hidden" accept=".pdf" multiple onchange="handleFiles(this.files)">
                        <button onclick="document.getElementById('file-input').click()" class="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Pilih File
                        </button>
                    </div>
                </div>

                <div id="file-list" class="space-y-3 text-left">
                    ${renderFileList()}
                </div>

                <div class="pt-8">
                     <button onclick="prevStep()" class="px-6 py-3 text-gray-500 hover:text-gray-800 font-medium mr-4">
                        Kembali
                    </button>
                    <button onclick="submitPortfolio()" class="bg-[#005eb8] text-white px-10 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                        Simpan & Submit Portofolio
                    </button>
                </div>
            </div>
        `;
    }

    // --- Helpers & Logic ---
    window.toggleExample = function(id) {
        document.getElementById(`example-${id}`).classList.toggle('hidden');
    };

    window.countWords = function(str) {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    function attachInputListeners() {
        // Identity Inputs
        document.querySelectorAll('input[data-model], select[data-model]').forEach(el => {
            el.addEventListener('input', (e) => {
                const parts = e.target.dataset.model.split('.');
                state[parts[0]][parts[1]] = e.target.value;
                debounceSave();
            });
        });

        // STAR Textareas
        document.querySelectorAll('textarea[data-q]').forEach(el => {
            // Remove the 'input' listener that was calling render()
            // We only save to state on input
             el.addEventListener('input', (e) => {
                const qId = e.target.dataset.q;
                const part = e.target.dataset.part;
                state.answers[qId][part] = e.target.value;
                debounceSave();
                
                // --- OPTIMIZED UPDATE WITHOUT RE-RENDER ---
                // 1. Calculate new word count for this question
                const ans = state.answers[qId];
                const totalWords = countWords(ans.s) + countWords(ans.t) + countWords(ans.a) + countWords(ans.r);
                
                // 2. Find the progress bar elements for THIS question card
                // We assume the textarea is inside the card
                const card = el.closest('.glass-panel');
                if (card) {
                    const barContainer = card.querySelector('.rounded-full.overflow-hidden');
                    const bar = barContainer ? barContainer.firstElementChild : null;
                    const textLabel = card.querySelector('span.text-xs.font-bold');

                    if (bar && textLabel) {
                         const progress = Math.min((totalWords / CONFIG.minWordsPerQuestion) * 100, 100);
                         const isComplete = progress >= 100;
                         
                         // Update Width
                         bar.style.width = `${progress}%`;
                         
                         // Update Color
                         if (isComplete) {
                             bar.classList.remove('bg-yellow-500');
                             bar.classList.add('bg-green-500');
                             // Update border color
                             card.classList.remove('border-[#c5a96f]');
                             card.classList.add('border-green-500');
                             
                             textLabel.classList.remove('text-gray-400');
                             textLabel.classList.add('text-green-600');
                         } else {
                             bar.classList.remove('bg-green-500');
                             bar.classList.add('bg-yellow-500');
                             
                             card.classList.remove('border-green-500');
                             card.classList.add('border-[#c5a96f]');

                             textLabel.classList.remove('text-green-600');
                             textLabel.classList.add('text-gray-400');
                         }

                         // Update Text
                         textLabel.innerText = `${totalWords} / ${CONFIG.minWordsPerQuestion} words`;
                    }
                }
            });
            // Removed the old .oninput override
        });
    }

    // --- File Handling ---
    window.handleFiles = function(files) {
        if (state.files.length + files.length > 2) {
             Swal.fire({
                icon: 'error',
                title: 'Batas Maksimum',
                text: 'Maksimal 2 file PDF yang diperbolehkan.',
                confirmButtonColor: '#005eb8'
            });
            return;
        }
        Array.from(files).forEach(f => {
            if (f.type === 'application/pdf') {
                state.files.push({ name: f.name, size: (f.size/1024/1024).toFixed(2) + ' MB' });
            } else {
                 Swal.fire({
                    icon: 'error',
                    title: 'Format Salah',
                    text: 'Hanya file PDF yang diperbolehkan.',
                    confirmButtonColor: '#005eb8'
                });
            }
        });
        saveState();
        render(); // re-render needed to show files
    }
    
    window.handleDrop = function(e) {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    }
    
    function renderFileList() {
        return state.files.map((f, i) => `
            <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div class="flex items-center gap-3">
                    <div class="text-red-500"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2H9z"></path></svg></div>
                    <div class="text-sm">
                        <p class="font-medium text-gray-700">${f.name}</p>
                        <p class="text-xs text-gray-500">${f.size}</p>
                    </div>
                </div>
                <button onclick="removeFile(${i})" class="text-gray-400 hover:text-red-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `).join('');
    }

    window.removeFile = function(index) {
        state.files.splice(index, 1);
        saveState();
        render();
    }

    // --- Submission ---
    window.submitPortfolio = function() {
       // Show Modal Logic - using SweetAlert for reviewing
       const summaryContent = `
           <div class="text-left text-sm space-y-2 bg-gray-50 p-4 rounded-lg">
               <div><strong>Nama:</strong> ${state.identity.fullName}</div>
               <div><strong>Posisi:</strong> ${state.identity.position}</div>
               <div><strong>Unit:</strong> ${state.identity.directorate}</div>
               <div><strong>Entitas:</strong> ${state.identity.bod}</div>
           </div>
       `;
       
       Swal.fire({
           title: 'Review Submission',
           html: `Pastikan data Anda sudah benar.<br>${summaryContent}<br><span class="text-xs text-gray-500">Legacy Anda adalah bagian dari masa depan InJourney.</span>`,
           icon: 'question',
           showCancelButton: true,
           confirmButtonColor: '#005eb8',
           cancelButtonColor: '#d33',
           confirmButtonText: 'Ya, Submit Portofolio',
           cancelButtonText: 'Batal'
       }).then((result) => {
           if (result.isConfirmed) {
                // Success Flow with formatting
                ui.contentArea.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
                        <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-4">Terima kasih, Leaders!</h2>
                        <p class="text-lg text-gray-600 max-w-lg mx-auto">Portofolio Anda telah tersimpan. Legacy Anda adalah bagian dari masa depan InJourney.</p>
                        <p class="text-sm text-gray-400 mt-8">Redirecting in 5 seconds...</p>
                    </div>
                `;
                
                // Clear local storage
                localStorage.removeItem(CONFIG.storageKey);
                
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
           }
       });
    };

    function showToast(msg, type='info') {
        const toast = ui.toast;
        toast.innerText = msg;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    // Utility
    function getQuestionsForStep(step) {
        if(step===2) return ['q1.1', 'q1.2'];
        if(step===3) return ['q2.1', 'q2.2'];
        if(step===4) return ['q3.1', 'q3.2'];
        return [];
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Start
    init();
});
