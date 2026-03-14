/* ============================================================
   WordPress Dashboard Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const staffGrid = document.getElementById('staffGrid');
    const dashTitle = document.getElementById('dashTitle');
    const menuItems = document.querySelectorAll('.wp-menu__item');
    const searchInput = document.getElementById('dashSearch');
    const navModal = document.getElementById('navModal');
    const navTargetName = document.getElementById('navTargetName');
    const userDisplayName = document.getElementById('userDisplayName');
    const userAvatar = document.getElementById('userAvatar');

    let currentSection = 'overview';

    // ─── AUTH & SESSION ───
    const session = JSON.parse(sessionStorage.getItem('cn_session') || '{}');
    if (session.name) {
        userDisplayName.textContent = session.name;
        userAvatar.textContent = session.name.charAt(0);
    }

    // ─── RENDERING ───
    function renderStaff(filterType = 'all', searchTerm = '') {
        let staff = PEOPLE_DIRECTORY;
        
        // Filter by section
        if (filterType !== 'all' && filterType !== 'overview') {
            staff = staff.filter(p => {
                const role = p.role.toLowerCase();
                if (filterType === 'faculty' && (role.includes('teacher') || role.includes('prof'))) return true;
                if (filterType === 'hod' && role.includes('hod')) return true;
                if (filterType === 'warden' && role.includes('warden')) return true;
                if (filterType === 'students' && role.includes('student')) return true;
                if (filterType === 'security' && role.includes('security')) return true;
                if (filterType === 'admin' && role.includes('admin')) return true;
                return false;
            });
        }

        // Search
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            staff = staff.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.role.toLowerCase().includes(q) || 
                p.dept.toLowerCase().includes(q)
            );
        }

        staffGrid.innerHTML = staff.map(p => `
            <div class="wp-card">
                <div class="wp-card__header">
                    <div class="wp-card__icon"><i data-lucide="${p.icon || 'user'}"></i></div>
                    <div>
                        <div class="wp-card__title">${p.name}</div>
                        <div class="wp-card__subtitle">${p.role}</div>
                    </div>
                </div>
                <div class="wp-card__info">
                    <div class="wp-card__row"><i data-lucide="building-2"></i> ${p.dept}</div>
                    <div class="wp-card__row"><i data-lucide="mail"></i> ${p.email}</div>
                    <div class="wp-card__row"><i data-lucide="phone"></i> ${p.phone}</div>
                </div>
                <div class="wp-card__actions">
                    <button class="wp-btn wp-btn--secondary" onclick="window.location.href='mailto:${p.email}'">
                        <i data-lucide="mail"></i> Email
                    </button>
                    <button class="wp-btn wp-btn--primary" onclick="initiateNav('${p.name}', '${p.office}')">
                        <i data-lucide="map-pin"></i> Navigate
                    </button>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

    // ─── NAVIGATION BRIDGE ───
    window.initiateNav = (name, officeId) => {
        navTargetName.textContent = name;
        navModal.classList.add('active');
        
        // Save target to localStorage for app.js to pick up
        localStorage.setItem('cn_nav_target', officeId);
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    };

    // ─── EVENT LISTENERS ───
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.classList.contains('wp-menu__item--map')) return;
            
            menuItems.forEach(i => i.classList.remove('wp-menu__item--active'));
            item.classList.add('wp-menu__item--active');
            
            currentSection = item.dataset.section;
            dashTitle.textContent = item.querySelector('span').textContent;
            renderStaff(currentSection, searchInput.value);
        });
    });

    searchInput.addEventListener('input', (e) => {
        renderStaff(currentSection, e.target.value);
    });

    // Initial render
    renderStaff();
});
