document.addEventListener('DOMContentLoaded', () => {
    
    // --- MOCK DATA ---
    const ENTITIES = [
        "PT Aviasi Pariwisata Indonesia (Persero)", "PT Angkasa Pura I", "PT Angkasa Pura II",
        "PT Hotel Indonesia Natour", "PT Taman Wisata Candi", "PT Sarinah", "ITDC"
    ];

    // Mock Names for realism
    const NAMES = [
        "Budi Santoso", "Siti Aminah", "Eko Prasetyo", "Dewi Lestari", "Agus Setiawan", 
        "Rina Kartika", "Doni Firmansyah", "Maya Indah", "Hendra Gunawan", "Fajar Nugraha",
        "Nina Herawati", "Reza Pratama", "Diana Sari", "Ari Wibowo", "Wulan Dari",
        "Toni Haryanto", "Lia Marlina", "Rudi Hartono", "Putri Utami", "Bambang Pamungkas", "Sarah Azhari"
    ];

    // Generate 21 Candidates (3 per entity)
    const CANDIDATES = [];
    let idCounter = 1;
    ENTITIES.forEach((ent, idx) => {
        for(let i=0; i<3; i++) {
            const name = NAMES[(idx * 3 + i) % NAMES.length];
            
            // Local Avatar Logic (Cyclic 1-5)
            // We adding 'idx' to mix it up per entity so they don't all look the same order
            const avatarNum = ((idx * 3 + i) % 5) + 1;

            CANDIDATES.push({
                id: idCounter++,
                name: name,
                position: `Senior Leader at ${ent.split(' ')[1] || 'InJourney'}`, 
                entity: ent,
                // Local assets from public/assets/avatar
                photo: `/assets/avatar/avatar-${avatarNum}.png`,
                blueprint: "Blueprint_Mock.pdf",
                voteCount: Math.floor(Math.random() * 100) 
            });
        }
    });

    const CONFIG = {
        minWordsPerQuestion: 300,
        totalSteps: 5
    };

    // --- STATE ---
    let state = {
        user: null, 
        directorStep: 1,
        directorData: {
            identity: {},
            answers: {
                'q1.1': { s: '', t: '', a: '', r: '' },
                'q1.2': { s: '', t: '', a: '', r: '' },
                'q2.1': { s: '', t: '', a: '', r: '' },
                'q2.2': { s: '', t: '', a: '', r: '' },
                'q3.1': { s: '', t: '', a: '', r: '' },
                'q3.2': { s: '', t: '', a: '', r: '' }
            },
            files: []
        },
        hasVoted: false
    };

    // --- DOM ---
    const pages = {
        login: document.getElementById('page-login'),
        director: document.getElementById('page-director'),
        employee: document.getElementById('page-employee'),
        admin: document.getElementById('page-admin')
    };

    const forms = {
        login: document.getElementById('login-form')
    };

    // --- INIT ---
    function init() {
        // Check session
        const session = sessionStorage.getItem('tnyi_user_v2');
        if(session) {
            state.user = JSON.parse(session);
            routeUser();
        } else {
            showPage('login');
        }
    }

    // --- AUTH ---
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Basic validation
        if(password.length < 3) {
            Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Password mismatch.' });
            return;
        }

        // Simulate Loading
        Swal.fire({
            title: 'Authenticating...',
            text: 'Verifying credentials with Corporate LDAP',
            timer: 1500,
            background: '#0f172a', /* Dark theme match */
            color: '#fff',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        }).then(() => {
            login(email);
        });
    });

    function login(email) {
        let role = 'employee';
        let entity = ENTITIES[0]; // Default
        let name = "User Simulation";

        if (email.includes('director')) {
            role = 'director';
            name = "Bpk. Direktur Utama";
        } else if (email.includes('admin')) {
            role = 'admin';
            name = "System Administrator";
        } else {
            // Employee simulation
            name = "John Doe";
            // Random entity based on email length to be consistent
            const entIdx = email.length % ENTITIES.length;
            entity = ENTITIES[entIdx];
        }

        state.user = { email, name, role, entity };
        sessionStorage.setItem('tnyi_user_v2', JSON.stringify(state.user));
        
        updateNavbar();
        routeUser();
        
        Swal.fire({
            icon: 'success',
            title: `Welcome, ${name}`,
            text: 'Portal access granted.',
            background: '#0f172a',
            color: '#fff',
            timer: 1500,
            showConfirmButton: false
        });
    }

    window.logout = function() {
        sessionStorage.removeItem('tnyi_user_v2');
        window.location.reload();
    };

    function updateNavbar() {
        if(state.user) {
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('nav-username').innerText = state.user.name;
            document.getElementById('nav-role').innerText = state.user.role.toUpperCase();
        }
    }

    function routeUser() {
        updateNavbar();
        if (state.user.role === 'director') {
            showPage('director');
            renderDirectorStep(); // Init director flow
        } else if (state.user.role === 'employee') {
            showPage('employee');
            renderEmployeeDashboard();
        } else if (state.user.role === 'admin') {
            showPage('admin');
            renderAdminDashboard();
        }
    }

    function showPage(pageName) {
        Object.values(pages).forEach(p => p.classList.remove('active-section'));
        pages[pageName].classList.add('active-section');
    }

    // --- DIRECTOR FLOW ---
    // Reuse logic from previous tasks but simplified for this file
    function renderDirectorStep() {
        const container = document.getElementById('director-content-area');
        const step = state.directorStep;
        
        // Update Progress
        const pct = ((step-1)/(CONFIG.totalSteps-1))*100;
        document.getElementById('director-progress-bar').style.width = `${pct}%`;
        document.getElementById('director-step-info').innerText = `Step ${step} of 5`;

        // Render
        if (step === 1) {
            container.innerHTML = renderDirectorIdentity();
        } else if (step >= 2 && step <= 4) {
            container.innerHTML = renderDirectorQuestions(step);
            attachDirectorListeners();
        } else {
            container.innerHTML = renderDirectorSubmit();
        }
    }

    function renderDirectorIdentity() {
        // Just a summary since we logged in
        return `
            <div class="glass-panel p-8 rounded-2xl space-y-4 animate-fade-in">
                <h3 class="font-bold text-xl mb-4">Konfirmasi Identitas</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><label class="text-gray-500">Nama</label><div class="font-semibold">${state.user.name}</div></div>
                    <div><label class="text-gray-500">NIK</label><div class="font-semibold">1122334455</div></div>
                    <div><label class="text-gray-500">Role</label><div class="font-semibold">Direksi/Senior Leader</div></div>
                </div>
                <div class="pt-6">
                    <button onclick="directorNext()" class="bg-[#005eb8] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#004e9a]">
                        Mulai Penyusunan Portofolio
                    </button>
                </div>
            </div>
        `;
    }

    function renderDirectorQuestions(step) {
         const map = {
            2: { title: "Section 1: The Foundation", questions: ['q1.1', 'q1.2'] },
            3: { title: "Section 2: Driving Change", questions: ['q2.1', 'q2.2'] },
            4: { title: "Section 3: Future & Legacy", questions: ['q3.1', 'q3.2'] }
        };
        const active = map[step];
        
        return `
            <div class="space-y-8 animate-fade-in">
                <h3 class="text-2xl font-bold">${active.title}</h3>
                ${active.questions.map(qid => `
                    <div class="glass-panel p-6 rounded-2xl">
                        <div class="mb-4">
                            <h4 class="font-bold text-lg">${qid.toUpperCase()} Title Placeholder</h4>
                            <p class="text-sm text-gray-500">Deskripsi pertanyaan...</p>
                        </div>
                        <div class="grid grid-cols-1 gap-6">
                            ${['s','t','a','r'].map(part => {
                                const config = {
                                    s: { label: 'Situation', color: '#EC3E32', desc: 'Jelaskan konteks atau tantangan yang dihadapi...' },
                                    t: { label: 'Task', color: '#F48F1F', desc: 'Apa tanggung jawab atau peran Anda?' },
                                    a: { label: 'Action', color: '#009E97', desc: 'Langkah konkret apa yang Anda lakukan?' },
                                    r: { label: 'Result', color: '#80A93F', desc: 'Apa hasil nyata yang dicapai?' }
                                }[part];
                                return `
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <span class="w-2 h-2 rounded-full" style="background-color: ${config.color}"></span>
                                        <label class="text-xs font-bold uppercase tracking-wider" style="color: ${config.color}">${config.label}</label>
                                    </div>
                                    <textarea data-q="${qid}" data-part="${part}" 
                                        class="glass-input w-full p-4 rounded-xl text-sm focus:outline-none resize-none transition-all" 
                                        rows="4" 
                                        placeholder="${config.desc}">${state.directorData.answers[qid][part]}</textarea>
                                </div>
                            `}).join('')}
                        </div>
                         <div class="mt-2 text-right text-xs font-bold text-gray-400 word-count-${qid}">0 words</div>
                    </div>
                `).join('')}
                <div class="flex justify-between pt-4">
                    <button onclick="directorPrev()" class="text-gray-500">Back</button>
                    <button onclick="directorNext()" class="bg-[#005eb8] text-white px-8 py-3 rounded-full font-bold shadow-lg">Next</button>
                </div>
            </div>
        `;
    }

    function renderDirectorSubmit() {
        return `
            <div class="text-center animate-fade-in py-10">
                <h3 class="text-2xl font-bold mb-4">Final Submission</h3>
                <p class="mb-8">Upload Supporting Documents (PDF Only)</p>
                <div class="border-2 border-dashed border-gray-300 p-10 rounded-xl mb-8 cursor-pointer hover:border-[#005eb8]">
                    <i class="fa-solid fa-cloud-arrow-up text-4xl text-[#005eb8] mb-4"></i>
                    <p>Drag & Drop here</p>
                </div>
                 <div class="flex justify-between pt-4">
                    <button onclick="directorPrev()" class="text-gray-500">Back</button>
                    <button onclick="submitPortfolioFinal()" class="bg-gradient-to-r from-[#005eb8] to-[#c5a96f] text-white px-10 py-3 rounded-full font-bold shadow-lg">Submit Final</button>
                </div>
            </div>
        `;
    }

    function attachDirectorListeners() {
        document.querySelectorAll('textarea').forEach(el => {
            el.addEventListener('input', (e) => {
                const qid = e.target.dataset.q;
                const part = e.target.dataset.part;
                state.directorData.answers[qid][part] = e.target.value;
                
                // Simple word count update
                const total = ['s','t','a','r'].reduce((acc, p) => acc + countWords(state.directorData.answers[qid][p]), 0);
                document.querySelector(`.word-count-${qid}`).innerText = `${total} / 300 words`;
            });
        });
    }

    window.directorNext = function() {
        if(state.directorStep < 5) {
             state.directorStep++;
             renderDirectorStep();
             window.scrollTo(0,0);
        }
    };

    window.directorPrev = function() {
        if(state.directorStep > 1) {
             state.directorStep--;
             renderDirectorStep();
        }
    };

    window.submitPortfolioFinal = function() {
        Swal.fire({
            title: 'Submitted!',
            text: 'Legacy Anda adalah bagian dari masa depan InJourney.',
            icon: 'success'
        }).then(() => location.reload());
    };

    // --- EMPLOYEE FLOW ---
    function renderEmployeeDashboard() {
        document.getElementById('employee-entity-badge').innerText = state.user.entity;
        
        // Filter Candidates
        const relevantCandidates = CANDIDATES.filter(c => c.entity === state.user.entity);
        const grid = document.getElementById('candidate-grid');
        
        if (relevantCandidates.length === 0) {
            grid.innerHTML = `<div class="col-span-3 text-center text-gray-500">Belum ada kandidat untuk entitas ini.</div>`;
            return;
        }

        grid.innerHTML = relevantCandidates.map(c => `
            <div class="glass-panel rounded-2xl overflow-hidden candidate-card flex flex-col">
                <div class="h-96 bg-gray-200 relative overflow-hidden group">
                    <img src="${c.photo}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div class="absolute bottom-4 left-4 text-white">
                        <h3 class="font-bold text-lg">${c.name}</h3>
                        <p class="text-xs opacity-90">${c.position}</p>
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col space-y-4">
                    <p class="text-sm text-gray-600 line-clamp-3">Visi: Mewujudkan budaya kolaboratif yang adaptif terhadap disrupsi global...</p>
                    
                    <div class="mt-auto grid grid-cols-2 gap-3">
                        <button onclick="viewBlueprint(${c.id})" class="px-4 py-2 border border-[#005eb8] text-[#005eb8] rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                            <i class="fa-regular fa-file-pdf mr-2"></i>Blueprint
                        </button>
                        <button ${state.hasVoted ? 'disabled' : `onclick="castVote(${c.id})"`} class="px-4 py-2 bg-[#EC3E32] text-white rounded-lg text-sm font-bold shadow-md hover:bg-[#c92a1f] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            ${state.hasVoted ? 'Voted' : 'Vote'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.viewBlueprint = function(id) {
        Swal.fire({
            title: 'Culture Blueprint',
            text: 'PDF Preview Mockup for Candidate ' + id,
            icon: 'info',
            confirmButtonText: 'Tutup'
        });
    };

    window.castVote = function(id) {
        Swal.fire({
            title: 'Konfirmasi Pilihan',
            text: 'Apakah Anda yakin memilih kandidat ini? Pilihan tidak dapat diubah.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#DC3429',
            confirmButtonText: 'Ya, Saya Yakin!'
        }).then((result) => {
            if (result.isConfirmed) {
                state.hasVoted = true;
                
                Swal.fire({
                    title: 'Vote Berhasil!',
                    text: 'Terima kasih telah berpartisipasi.',
                    icon: 'success',
                    timer: 2000
                });
                
                renderEmployeeDashboard(); // Re-render to disable buttons
            }
        });
    };

    // --- ADMIN FLOW ---
    function renderAdminDashboard() {
        const container = document.getElementById('results-container');
        container.innerHTML = CANDIDATES.map(c => `
             <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-gray-800">${c.name}</span>
                    <span class="text-sm text-gray-500">${c.entity}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div class="bg-[#005eb8] h-full" style="width: ${Math.min(c.voteCount, 100)}%"></div>
                </div>
                <div class="text-right text-xs mt-1 font-bold text-[#005eb8]">${c.voteCount} Votes</div>
             </div>
        `).join('');
    }

    // --- UTILS ---
    function countWords(str) {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    init();
});
