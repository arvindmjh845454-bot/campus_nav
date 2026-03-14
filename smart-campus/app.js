/* ============================================================
   CampusNav — Main Application Logic
   ============================================================ */
(function () {
    'use strict';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ─── DOM REFS ───
    const searchInput = $('#searchInput'), searchResults = $('#searchResults'),
        quickFilters = $('#quickFilters'), themeToggle = $('#themeToggle'),
        menuBtn = $('#menuBtn'), closeMenuBtn = $('#closeMenuBtn'),
        sideMenu = $('#sideMenu'), sideMenuOverlay = $('#sideMenuOverlay'),
        bottomSheet = $('#bottomSheet'), sheetHandle = $('#sheetHandle'),
        accessibilityBtn = $('#accessibilityBtn'), accessibilityMenu = $('#accessibilityMenu'),
        eventBanner = $('#eventBanner'), eventClose = $('#eventClose'), eventAction = $('#eventAction');

    const sheetTabs = $$('.sheet-tab');
    const tabContents = { explore: $('#exploreTab'), navigate: $('#navigateTab'), events: $('#eventsTab') };
    const routeInfo = $('#routeInfo'), routeSteps = $('#routeSteps');

    // ─── STATE ───
    let currentFilter = 'all', markers = [], routeLine = null, sheetState = 'default';
    let savedPlaces = JSON.parse(localStorage.getItem('cn_saved') || '[]');
    let recentRoutes = JSON.parse(localStorage.getItem('cn_recent') || '[]');
    let userSchedule = JSON.parse(localStorage.getItem('cn_schedule') || 'null') || JSON.parse(JSON.stringify(SCHEDULE_DATA));
    let settings = JSON.parse(localStorage.getItem('cn_settings') || '{}');
    settings = Object.assign({ darkMode: true, animations: true, notifications: true, occupancy: true, routeHistory: true, mapStyle: 'default', wheelchair: false, sensory: false, contrast: false, largeText: false }, settings);

    function saveState() {
        localStorage.setItem('cn_saved', JSON.stringify(savedPlaces));
        localStorage.setItem('cn_recent', JSON.stringify(recentRoutes));
        localStorage.setItem('cn_schedule', JSON.stringify(userSchedule));
        localStorage.setItem('cn_settings', JSON.stringify(settings));
    }

    let userRole = 'member';
    try {
        const session = JSON.parse(sessionStorage.getItem('cn_session'));
        if (session && session.role === 'guest') userRole = 'guest';
    } catch(e) {}

    // ─── TOAST ───
    function showToast(msg) {
        const t = $('#toast'), m = $('#toastMessage');
        m.textContent = msg; t.classList.add('active');
        setTimeout(() => t.classList.remove('active'), 2500);
    }

    // ─── MAP ───
    const map = L.map('map', { center: CAMPUS_CENTER, zoom: CAMPUS_ZOOM, zoomControl: false, attributionControl: false });
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    
    const baseLayers = {
        default: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20 }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 })
    };
    
    // Default to satellite for a realistic feel if no setting is saved
    if (!localStorage.getItem('cn_settings')) {
        settings.mapStyle = 'satellite';
    }
    
    let currentTileLayer = baseLayers[settings.mapStyle] || baseLayers['satellite'];
    currentTileLayer.addTo(map);

    function getOccupancyLevel(loc) {
        if (loc.status !== 'open') return 'closed';
        const pct = (loc.occupancy / loc.capacity) * 100;
        return pct < 40 ? 'low' : pct < 70 ? 'mid' : 'high';
    }
    function getOccupancyLabel(l) { return { low: 'Low', mid: 'Moderate', high: 'Busy', closed: 'Closed' }[l] || ''; }
    function getOccupancyColor(l) { return { low: '#22c55e', mid: '#f59e0b', high: '#ef4444', closed: '#6b7280' }[l] || '#6b7280'; }

    function createMarkers(filter) {
        filter = filter || 'all';
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        const locs = filter === 'all' ? LOCATIONS : LOCATIONS.filter(l => l.type === filter);
        locs.forEach(loc => {
            const style = MARKER_STYLES[loc.type] || MARKER_STYLES.admin;
            const icon = L.divIcon({ className: '', html: `<div class="custom-marker ${style.class}"><i data-lucide="${style.icon}"></i></div>`, iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -42] });
            const marker = L.marker(loc.coords, { icon }).addTo(map);
            const level = getOccupancyLevel(loc), pct = Math.round((loc.occupancy / loc.capacity) * 100), color = getOccupancyColor(level);
            
            // Build rich metadata string
            let metaHtml = '';
            metaHtml += `<div class="marker-popup__occupancy"><div class="occupancy-bar"><div class="occupancy-bar__fill" style="width:${pct}%;background:${color}"></div></div><span class="occupancy-text" style="color:${color}">${pct}%</span></div>`;
            if(loc.courses) metaHtml += `<div class="marker-popup__detail"><i data-lucide="book" style="width:14px; margin-right:4px;"></i> <strong>Courses:</strong> ${loc.courses}</div>`;
            if(loc.labs) metaHtml += `<div class="marker-popup__detail"><i data-lucide="flask-conical" style="width:14px; margin-right:4px;"></i> <strong>Labs:</strong> ${loc.labs}</div>`;
            if(loc.facultyRooms) metaHtml += `<div class="marker-popup__detail"><i data-lucide="users" style="width:14px; margin-right:4px;"></i> <strong>Faculty:</strong> ${loc.facultyRooms}</div>`;
            if(loc.contact) metaHtml += `<div class="marker-popup__detail"><i data-lucide="phone" style="width:14px; margin-right:4px;"></i> <strong>Contact:</strong> ${loc.contact}</div>`;
            if(loc.capacityInfo) metaHtml += `<div class="marker-popup__detail"><i data-lucide="users" style="width:14px; margin-right:4px;"></i> <strong>Capacity:</strong> ${loc.capacityInfo}</div>`;
            if(loc.facilities) metaHtml += `<div class="marker-popup__detail"><i data-lucide="check-square" style="width:14px; margin-right:4px;"></i> <strong>Facilities:</strong> ${loc.facilities}</div>`;
            if(loc.warden) metaHtml += `<div class="marker-popup__detail"><i data-lucide="user-check" style="width:14px; margin-right:4px;"></i> <strong>Warden:</strong> ${loc.warden}</div>`;
            if(loc.timings) metaHtml += `<div class="marker-popup__detail"><i data-lucide="clock" style="width:14px; margin-right:4px;"></i> <strong>Timings:</strong> ${loc.timings}</div>`;
            if(loc.services) metaHtml += `<div class="marker-popup__detail"><i data-lucide="concierge-bell" style="width:14px; margin-right:4px;"></i> <strong>Services:</strong> ${loc.services}</div>`;
            if(loc.details) metaHtml += `<div class="marker-popup__detail"><i data-lucide="info" style="width:14px; margin-right:4px;"></i> <strong>Info:</strong> ${loc.details}</div>`;
            if(loc.emergencyContact) metaHtml += `<div class="marker-popup__detail"><i data-lucide="phone-call" style="width:14px; margin-right:4px; color:#d90429;"></i> <strong style="color:#d90429;">Emergency:</strong> ${loc.emergencyContact}</div>`;

            marker.bindPopup(`<div class="marker-popup"><h3 class="marker-popup__name">${loc.name}</h3><p class="marker-popup__type">${loc.type.charAt(0).toUpperCase() + loc.type.slice(1)} · ${loc.building}</p>${metaHtml}<div class="marker-popup__status" style="margin-top:8px;">${loc.statusText}</div><button class="marker-popup__nav-btn" onclick="window.__navigateTo('${loc.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg> Navigate Here</button></div>`, { closeButton: true, maxWidth: 300, minWidth: 250 });
            markers.push(marker);
            
            // Give loc a reference back to marker for popup manual trigger
            loc.__marker = marker;
        });
        requestAnimationFrame(() => lucide.createIcons());
    }

    window.__navigateTo = function (locationId) {
        const loc = LOCATIONS.find(l => l.id === locationId);
        if (!loc) return;
        map.closePopup();
        switchTab('navigate');
        showRouteDetails(loc);
        drawRoute(loc);
        setSheetState('expanded');
        // Save to recent
        if (settings.routeHistory) {
            recentRoutes = recentRoutes.filter(r => r.id !== loc.id);
            recentRoutes.unshift({ id: loc.id, timestamp: Date.now() });
            if (recentRoutes.length > 10) recentRoutes.pop();
            saveState();
        }
    };

    function drawRoute(location) {
        if (routeLine) map.removeLayer(routeLine);
        const start = CAMPUS_CENTER, end = location.coords;
        const mid = [(start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.001, (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 0.001];
        const points = [];
        for (let i = 0; i <= 30; i++) { const t = i / 30; points.push([(1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * mid[0] + t * t * end[0], (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * mid[1] + t * t * end[1]]); }
        routeLine = L.polyline(points, { color: '#9b2226', weight: 5, opacity: 0.8, dashArray: '12, 8', lineCap: 'round' }).addTo(map);
        const si = L.divIcon({ className: '', html: '<div style="width:16px;height:16px;border-radius:50%;background:#9b2226;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
        markers.push(L.marker(start, { icon: si }).addTo(map));
        map.fitBounds(routeLine.getBounds(), { padding: [80, 80] });
    }

    function showRouteDetails(loc) {
        const dist = Math.round(Math.random() * 200 + 100), time = Math.round(dist / 80) + 1;
        routeInfo.innerHTML = `<div class="route-info__header"><span class="route-info__destination">${loc.name}</span><span class="route-info__eta">${time} min</span></div><div class="route-info__meta"><span>📍 ${dist}m</span><span>🏢 ${loc.floor}</span><span>${loc.accessible ? '♿ Accessible' : '⚠️ Limited'}</span></div>`;
        const steps = loc.id === 'phy-lab' ? MOCK_ROUTE_STEPS : [{ text: '<strong>Start</strong> from your location' }, { text: `Head toward <strong>${loc.building}</strong>` }, { text: `Follow signs for <strong>${loc.type}</strong>` }, { text: `Enter <strong>${loc.building}</strong>` }, { text: `Go to <strong>${loc.floor}</strong>` }, { text: `<strong>Arrive</strong> at ${loc.name}` }];
        routeSteps.innerHTML = steps.map(s => `<div class="route-step"><div class="route-step__icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg></div><div class="route-step__text">${s.text}</div></div>`).join('');
    }

    // ─── POPULATE UI ───
    function populatePlaceGrid() {
        const g = $('#placeGrid');
        g.innerHTML = PLACE_CATEGORIES.map(c => `<div class="place-card" data-type="${c.type}"><div class="place-card__icon" style="background:${c.bg}"><i data-lucide="${c.icon}"></i></div><span class="place-card__label">${c.label}</span></div>`).join('');
        g.querySelectorAll('.place-card').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.type)));
    }

    function populateOccupancyList() {
        const list = $('#occupancyList');
        const top = LOCATIONS.filter(l => l.status === 'open').sort((a, b) => (b.occupancy / b.capacity) - (a.occupancy / a.capacity)).slice(0, 5);
        list.innerHTML = top.map(loc => { const lv = getOccupancyLevel(loc), pct = Math.round((loc.occupancy / loc.capacity) * 100); return `<div class="occupancy-item" data-id="${loc.id}"><div class="occupancy-item__info"><div class="occupancy-item__name">${loc.name}</div><div class="occupancy-item__status">${loc.building} · ${loc.room}</div></div><div class="occupancy-badge occupancy-badge--${lv}"><span class="occupancy-dot"></span>${pct}% · ${getOccupancyLabel(lv)}</div></div>`; }).join('');
        list.querySelectorAll('.occupancy-item').forEach(i => i.addEventListener('click', () => { const loc = LOCATIONS.find(l => l.id === i.dataset.id); if (loc) { map.setView(loc.coords, 18, { animate: true }); setTimeout(() => openMarkerPopup(loc.id), 400); } }));
    }

    function populateEventList() {
        $('#eventList').innerHTML = EVENTS.map(e => `<div class="event-card" data-location-id="${e.locationId}"><div class="event-card__time"><div class="event-card__time-hour">${e.time}</div><div class="event-card__time-period">${e.period}</div></div><div class="event-card__divider"></div><div class="event-card__info"><div class="event-card__name">${e.name}</div><div class="event-card__loc">${e.location} · ${e.duration}</div></div></div>`).join('');
        $$('#eventList .event-card').forEach(c => c.addEventListener('click', () => window.__navigateTo(c.dataset.locationId)));
    }

    function populateSuggestions() {
        $('#suggestionList').innerHTML = SUGGESTIONS.map(s => `<div class="suggestion-card" data-location-id="${s.locationId}"><div class="suggestion-card__icon"><i data-lucide="${s.icon}"></i></div><div class="suggestion-card__text">${s.text}</div></div>`).join('');
        $$('#suggestionList .suggestion-card').forEach(c => c.addEventListener('click', () => window.__navigateTo(c.dataset.locationId)));
    }

    // ─── SEARCH ───
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 2) { searchResults.classList.remove('active'); return; }
        const res = LOCATIONS.filter(l => l.name.toLowerCase().includes(q) || l.building.toLowerCase().includes(q) || l.type.includes(q) || l.room.toLowerCase().includes(q));
        searchResults.innerHTML = res.length === 0 ? '<div class="search-result-item"><div class="search-result-item__info"><h4>No results</h4><p>Try a building name or type</p></div></div>' : res.map(l => `<div class="search-result-item" data-id="${l.id}"><div class="search-result-item__icon" style="background:${BG_MAP[l.type]}"><i data-lucide="${MARKER_STYLES[l.type].icon}"></i></div><div class="search-result-item__info"><h4>${l.name}</h4><p>${l.building} · ${l.room}</p></div></div>`).join('');
        searchResults.classList.add('active');
        lucide.createIcons();
    });
    searchResults.addEventListener('click', e => { const i = e.target.closest('.search-result-item'); if (!i || !i.dataset.id) return; searchInput.value = ''; searchResults.classList.remove('active'); const loc = LOCATIONS.find(l => l.id === i.dataset.id); if (loc) { map.setView(loc.coords, 18, { animate: true }); setTimeout(() => openMarkerPopup(loc.id), 400); } });
    document.addEventListener('click', e => { if (!e.target.closest('#searchContainer') && !e.target.closest('#searchResults')) searchResults.classList.remove('active'); });

    // ─── FILTERS ───
    function setFilter(type) { currentFilter = type; $$('.filter-chip').forEach(c => c.classList.toggle('filter-chip--active', c.dataset.filter === type)); createMarkers(type); }
    quickFilters.addEventListener('click', e => { const c = e.target.closest('.filter-chip'); if (c) setFilter(c.dataset.filter); });

    // ─── TABS ───
    function switchTab(name) { sheetTabs.forEach(t => t.classList.toggle('sheet-tab--active', t.dataset.tab === name)); Object.entries(tabContents).forEach(([k, el]) => el.classList.toggle('sheet-content--hidden', k !== name)); }
    sheetTabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

    // ─── SHEET SWIPE ───
    function setSheetState(s) { sheetState = s; bottomSheet.classList.remove('expanded', 'collapsed'); if (s === 'expanded') bottomSheet.classList.add('expanded'); if (s === 'collapsed') bottomSheet.classList.add('collapsed'); }
    let touchStartY = 0, touchDiff = 0;
    sheetHandle.addEventListener('click', () => { if (sheetState === 'expanded') setSheetState('default'); else setSheetState('expanded'); });
    sheetHandle.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
    sheetHandle.addEventListener('touchmove', e => { touchDiff = e.touches[0].clientY - touchStartY; }, { passive: true });
    sheetHandle.addEventListener('touchend', () => { if (touchDiff < -40) setSheetState('expanded'); else if (touchDiff > 40) setSheetState(sheetState === 'expanded' ? 'default' : 'collapsed'); touchDiff = 0; });

    // ─── THEME ───
    function applyTheme(dark) {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        settings.darkMode = dark; 
        saveState();
        
        // Update Theme Toggle Icon
        const themeIcon = themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.setAttribute('data-lucide', dark ? 'moon' : 'sun');
            lucide.createIcons();
        }
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => { 
            applyTheme(!settings.darkMode); 
        });
    }

    // ─── SIDE MENU ───
    function openMenu() { sideMenu.classList.add('active'); sideMenuOverlay.classList.add('active'); }
    function closeMenu() { sideMenu.classList.remove('active'); sideMenuOverlay.classList.remove('active'); }
    menuBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    sideMenuOverlay.addEventListener('click', closeMenu);

    // ─── ACCESSIBILITY FAB ───
    accessibilityBtn.addEventListener('click', () => accessibilityMenu.classList.toggle('active'));
    document.addEventListener('click', e => { if (!e.target.closest('.accessibility-fab')) accessibilityMenu.classList.remove('active'); });

    // ─── EVENT BANNER ───
    eventClose.addEventListener('click', () => eventBanner.classList.add('hidden'));
    eventAction.addEventListener('click', () => { window.__navigateTo('phy-lab'); eventBanner.classList.add('hidden'); });

    function openMarkerPopup(id) { 
        const loc = LOCATIONS.find(l => l.id === id); 
        if (!loc) return; 
        
        // If marker is saved on loc, open it
        if (loc.__marker) {
            loc.__marker.openPopup();
        } else {
            // Fallback for marker matching
            markers.forEach(m => { 
                const p = m.getLatLng(); 
                if (Math.abs(p.lat - loc.coords[0]) < 0.0001 && Math.abs(p.lng - loc.coords[1]) < 0.0001) m.openPopup(); 
            }); 
        }
    }

    // ─── REAL-TIME SIM ───
    function simulateOccupancy() {
        if (!settings.occupancy) return;
        LOCATIONS.forEach(l => { if (l.status === 'open') { l.occupancy = Math.max(0, Math.min(l.capacity, l.occupancy + Math.round((Math.random() - 0.5) * l.capacity * 0.1))); } });
        populateOccupancyList(); lucide.createIcons();
    }

    // ═══════════════════════════════════════════
    // PANEL LOGIC
    // ═══════════════════════════════════════════

    function openPanel(id) { closeMenu(); $('#panel' + id.charAt(0).toUpperCase() + id.slice(1)).classList.add('active'); lucide.createIcons(); }
    function closePanel(id) { $('#panel' + id.charAt(0).toUpperCase() + id.slice(1)).classList.remove('active'); }

    // Side menu item clicks
    $$('.side-menu__item[data-panel]').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            openPanel(panel);
            if (panel === 'savedPlaces') renderSavedPlaces();
            if (panel === 'recentRoutes') renderRecentRoutes();
            if (panel === 'mySchedule') renderSchedule('mon');
            if (panel === 'accessibility') renderAccessibility();
            if (panel === 'settings') syncSettingsUI();
            if (panel === 'helpFeedback') renderFAQ();
            if (panel === 'peopleDirectory') renderPeopleDirectory();
            if (panel === 'buildingCategories') renderBuildingCategories();
            if (panel === 'campusEvents') renderCampusEvents();
            if (panel === 'emergencySafety') renderEmergency();
        });
    });

    // Back buttons
    ['SavedPlaces', 'RecentRoutes', 'MySchedule', 'Accessibility', 'Settings', 'HelpFeedback', 'PeopleDirectory', 'BuildingCategories', 'CampusEvents', 'EmergencySafety'].forEach(name => {
        const camel = name.charAt(0).toLowerCase() + name.slice(1);
        const btn = $('#back' + name);
        if (btn) btn.addEventListener('click', () => closePanel(camel));
    });

    // ─── 1. SAVED PLACES ───
    function renderSavedPlaces() {
        const empty = $('#savedPlacesEmpty'), list = $('#savedPlacesList');
        if (savedPlaces.length === 0) { empty.style.display = 'flex'; list.innerHTML = ''; return; }
        empty.style.display = 'none';
        list.innerHTML = savedPlaces.map(sp => {
            const loc = LOCATIONS.find(l => l.id === sp.id);
            if (!loc) return '';
            return `<div class="saved-item" data-id="${loc.id}"><div class="saved-item__icon" style="background:${BG_MAP[loc.type]}"><i data-lucide="${MARKER_STYLES[loc.type].icon}"></i></div><div class="saved-item__info"><div class="saved-item__name">${loc.name}</div><div class="saved-item__sub">${loc.building} · ${loc.room}</div></div><button class="saved-item__remove" data-remove="${loc.id}" aria-label="Remove"><i data-lucide="x"></i></button></div>`;
        }).join('');
        list.querySelectorAll('.saved-item').forEach(i => {
            i.addEventListener('click', e => { if (e.target.closest('.saved-item__remove')) return; closePanel('savedPlaces'); const loc = LOCATIONS.find(l => l.id === i.dataset.id); if (loc) { map.setView(loc.coords, 18, { animate: true }); setTimeout(() => openMarkerPopup(loc.id), 400); } });
        });
        list.querySelectorAll('.saved-item__remove').forEach(b => {
            b.addEventListener('click', e => { e.stopPropagation(); savedPlaces = savedPlaces.filter(s => s.id !== b.dataset.remove); saveState(); renderSavedPlaces(); showToast('Place removed'); });
        });
        lucide.createIcons();
    }

    // Add place modal
    $('#addSavedPlace').addEventListener('click', () => {
        const modal = $('#addPlaceModal'), list = $('#addPlaceList');
        const unsaved = LOCATIONS.filter(l => !savedPlaces.find(s => s.id === l.id));
        list.innerHTML = unsaved.map(l => `<div class="modal__list-item" data-id="${l.id}"><div class="modal__list-item__icon" style="background:${BG_MAP[l.type]}"><i data-lucide="${MARKER_STYLES[l.type].icon}"></i></div><div><h4>${l.name}</h4><p>${l.building} · ${l.room}</p></div></div>`).join('');
        list.querySelectorAll('.modal__list-item').forEach(i => {
            i.addEventListener('click', () => { savedPlaces.push({ id: i.dataset.id }); saveState(); modal.classList.remove('active'); renderSavedPlaces(); showToast('Place saved!'); });
        });
        modal.classList.add('active'); lucide.createIcons();
    });
    $('#cancelAddPlace').addEventListener('click', () => $('#addPlaceModal').classList.remove('active'));

    // ─── 2. RECENT ROUTES ───
    function renderRecentRoutes() {
        const empty = $('#recentRoutesEmpty'), list = $('#recentRoutesList');
        if (recentRoutes.length === 0) { empty.style.display = 'flex'; list.innerHTML = ''; return; }
        empty.style.display = 'none';
        list.innerHTML = recentRoutes.map(r => {
            const loc = LOCATIONS.find(l => l.id === r.id); if (!loc) return '';
            const d = new Date(r.timestamp); const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `<div class="recent-item" data-id="${loc.id}"><div class="recent-item__icon" style="background:${BG_MAP[loc.type]}"><i data-lucide="${MARKER_STYLES[loc.type].icon}"></i></div><div class="recent-item__info"><div class="recent-item__name">${loc.name}</div><div class="recent-item__sub">${loc.building} · ${timeStr}</div></div><button class="recent-item__action" data-id="${loc.id}" aria-label="Navigate"><i data-lucide="navigation"></i></button></div>`;
        }).join('');
        list.querySelectorAll('.recent-item').forEach(i => {
            i.addEventListener('click', e => { if (e.target.closest('.recent-item__action')) { closePanel('recentRoutes'); window.__navigateTo(i.dataset.id); return; } closePanel('recentRoutes'); const loc = LOCATIONS.find(l => l.id === i.dataset.id); if (loc) { map.setView(loc.coords, 18, { animate: true }); } });
        });
        lucide.createIcons();
    }
    $('#clearRecentRoutes').addEventListener('click', () => { recentRoutes = []; saveState(); renderRecentRoutes(); showToast('History cleared'); });

    // ─── 3. MY SCHEDULE ───
    let currentDay = 'mon';
    function renderSchedule(day) {
        currentDay = day;
        $$('.day-btn').forEach(b => b.classList.toggle('day-btn--active', b.dataset.day === day));
        const timeline = $('#scheduleTimeline');
        const dayEvents = userSchedule[day] || [];
        if (dayEvents.length === 0) { timeline.innerHTML = '<div class="panel__empty"><i data-lucide="calendar-x" class="panel__empty-icon"></i><p class="panel__empty-title">No classes on this day</p><p class="panel__empty-sub">Tap + to add an event.</p></div>'; lucide.createIcons(); return; }
        timeline.innerHTML = dayEvents.map((ev, i) => `<div class="schedule-block" data-loc="${ev.locationId}"><div class="schedule-block__time"><div class="schedule-block__time-start">${ev.start}</div><div class="schedule-block__time-end">${ev.end}</div></div><div class="schedule-block__info"><div class="schedule-block__name">${ev.name}</div><div class="schedule-block__loc">${ev.location}</div></div><button class="schedule-block__delete" data-day="${day}" data-idx="${i}" aria-label="Delete"><i data-lucide="trash-2"></i></button></div>`).join('');
        timeline.querySelectorAll('.schedule-block').forEach(b => {
            b.addEventListener('click', e => { if (e.target.closest('.schedule-block__delete')) return; closePanel('mySchedule'); window.__navigateTo(b.dataset.loc); });
        });
        timeline.querySelectorAll('.schedule-block__delete').forEach(b => {
            b.addEventListener('click', e => { e.stopPropagation(); userSchedule[b.dataset.day].splice(parseInt(b.dataset.idx), 1); saveState(); renderSchedule(currentDay); showToast('Event removed'); });
        });
        lucide.createIcons();
    }
    $$('.day-btn').forEach(b => b.addEventListener('click', () => renderSchedule(b.dataset.day)));

    // Add schedule event
    $('#addScheduleEvent').addEventListener('click', () => {
        const sel = $('#scheduleLocation');
        sel.innerHTML = LOCATIONS.map(l => `<option value="${l.id}">${l.name} — ${l.building}</option>`).join('');
        $('#scheduleDay').value = currentDay;
        $('#addScheduleModal').classList.add('active');
    });
    $('#cancelAddSchedule').addEventListener('click', () => $('#addScheduleModal').classList.remove('active'));
    $('#confirmAddSchedule').addEventListener('click', () => {
        const name = $('#scheduleEventName').value.trim(); if (!name) { showToast('Please enter event name'); return; }
        const locId = $('#scheduleLocation').value, loc = LOCATIONS.find(l => l.id === locId), day = $('#scheduleDay').value;
        const ev = { name, start: $('#scheduleStartTime').value, end: $('#scheduleEndTime').value, locationId: locId, location: loc ? `${loc.building}, ${loc.room}` : 'Campus' };
        if (!userSchedule[day]) userSchedule[day] = [];
        userSchedule[day].push(ev);
        userSchedule[day].sort((a, b) => a.start.localeCompare(b.start));
        saveState(); $('#addScheduleModal').classList.remove('active');
        renderSchedule(day); showToast('Event added!'); $('#scheduleEventName').value = '';
    });

    // ─── 4. ACCESSIBILITY ───
    function renderAccessibility() {
        $('#accWheelchair').checked = settings.wheelchair;
        $('#accSensory').checked = settings.sensory;
        $('#accContrast').checked = settings.contrast;
        $('#accLargeText').checked = settings.largeText;
        const fac = $('#accFacilities');
        const accessible = LOCATIONS.filter(l => l.accessible);
        fac.innerHTML = accessible.slice(0, 6).map(l => `<div class="acc-facility" data-id="${l.id}"><div class="acc-facility__icon"><i data-lucide="check-circle"></i></div><div><div class="acc-facility__name">${l.name}</div><div class="acc-facility__features">${l.building} · Elevator, Ramps Available</div></div></div>`).join('');
        fac.querySelectorAll('.acc-facility').forEach(f => f.addEventListener('click', () => { closePanel('accessibility'); const loc = LOCATIONS.find(l => l.id === f.dataset.id); if (loc) { map.setView(loc.coords, 18, { animate: true }); setTimeout(() => openMarkerPopup(loc.id), 400); } }));
        lucide.createIcons();
    }
    ['accWheelchair', 'accSensory', 'accContrast', 'accLargeText'].forEach(id => {
        const el = $('#' + id);
        el.addEventListener('change', () => {
            const key = { accWheelchair: 'wheelchair', accSensory: 'sensory', accContrast: 'contrast', accLargeText: 'largeText' }[id];
            settings[key] = el.checked; saveState();
            if (key === 'contrast') document.body.classList.toggle('high-contrast', el.checked);
            if (key === 'largeText') document.body.classList.toggle('large-text', el.checked);
            if (key === 'wheelchair') $('#wheelchairToggle').checked = el.checked;
            if (key === 'sensory') $('#sensoryToggle').checked = el.checked;
            showToast(el.checked ? 'Enabled' : 'Disabled');
        });
    });
    $('#reportAccessibility').addEventListener('click', () => { closePanel('accessibility'); openPanel('helpFeedback'); renderFAQ(); $('#feedbackCategory').value = 'accessibility'; showToast('Select "Accessibility Issue" and describe it'); });

    // ─── 5. SETTINGS ───
    function syncSettingsUI() {
        $('#settingDarkMode').checked = settings.darkMode;
        $('#settingAnimations').checked = settings.animations;
        $('#settingNotifications').checked = settings.notifications;
        $('#settingOccupancy').checked = settings.occupancy;
        $('#settingRouteHistory').checked = settings.routeHistory;
        $('#settingMapStyle').value = settings.mapStyle;
    }
    const settingHandlers = {
        settingDarkMode: v => applyTheme(v),
        settingAnimations: v => { settings.animations = v; document.body.style.setProperty('--transition-fast', v ? '0.18s cubic-bezier(0.4,0,0.2,1)' : '0s'); document.body.style.setProperty('--transition-smooth', v ? '0.35s cubic-bezier(0.4,0,0.2,1)' : '0s'); },
        settingNotifications: v => { settings.notifications = v; if (!v) eventBanner.classList.add('hidden'); },
        settingOccupancy: v => { settings.occupancy = v; },
        settingRouteHistory: v => { settings.routeHistory = v; }
    };
    Object.keys(settingHandlers).forEach(id => {
        $('#' + id).addEventListener('change', e => { settingHandlers[id](e.target.checked); saveState(); showToast(e.target.checked ? 'Enabled' : 'Disabled'); });
    });
    $('#settingMapStyle').addEventListener('change', e => { 
        settings.mapStyle = e.target.value; 
        saveState(); 
        
        // Update live tile layer
        if (currentTileLayer) map.removeLayer(currentTileLayer);
        currentTileLayer = baseLayers[settings.mapStyle] || baseLayers['default'];
        currentTileLayer.addTo(map);
        
        showToast('Map style: ' + e.target.value); 
    });
    $('#clearAllData').addEventListener('click', () => { if (confirm('Clear all saved data? This cannot be undone.')) { localStorage.clear(); savedPlaces = []; recentRoutes = []; userSchedule = JSON.parse(JSON.stringify(SCHEDULE_DATA)); saveState(); showToast('All data cleared'); syncSettingsUI(); } });

    // ─── 6. HELP & FEEDBACK ───
    function renderFAQ() {
        const list = $('#faqList');
        list.innerHTML = FAQ_DATA.map((f, i) => `<div class="faq-item" data-idx="${i}"><button class="faq-question">${f.q}<i data-lucide="chevron-down"></i></button><div class="faq-answer"><p>${f.a}</p></div></div>`).join('');
        list.querySelectorAll('.faq-item').forEach(item => {
            item.querySelector('.faq-question').addEventListener('click', () => { item.classList.toggle('active'); });
        });
        lucide.createIcons();
    }
    $('#submitFeedback').addEventListener('click', () => {
        const text = $('#feedbackText').value.trim();
        if (!text) { showToast('Please enter your feedback'); return; }
        showToast('Feedback submitted! Thank you 🎉');
        $('#feedbackText').value = ''; $('#feedbackEmail').value = '';
    });

    // Sync FAB toggles with accessibility panel
    $('#wheelchairToggle').addEventListener('change', e => { settings.wheelchair = e.target.checked; saveState(); });
    $('#sensoryToggle').addEventListener('change', e => { settings.sensory = e.target.checked; saveState(); });

    // ─── 7. PEOPLE DIRECTORY ───
    function renderPeopleDirectory(filter = '') {
        const list = $('#peoplePanelList'), q = filter.toLowerCase();
        const people = q ? PEOPLE_DIRECTORY.filter(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q)) : PEOPLE_DIRECTORY;
        list.innerHTML = people.map(p => `
            <div class="person-card" data-office="${p.office}">
                <div class="person-card__avatar"><i data-lucide="${p.icon || 'user'}"></i></div>
                <div class="person-card__info">
                    <div class="person-card__name">${p.name}</div>
                    <div class="person-card__role">${p.role}</div>
                    <div class="person-card__dept">${p.dept} · ${p.email}</div>
                </div>
                <div class="person-card__action"><i data-lucide="navigation"></i></div>
            </div>
        `).join('');
        list.querySelectorAll('.person-card').forEach(card => {
            card.addEventListener('click', () => { closePanel('peopleDirectory'); window.__navigateTo(card.dataset.office); });
        });
        lucide.createIcons();
    }
    $('#peoplePanelSearch').addEventListener('input', e => renderPeopleDirectory(e.target.value));

    // ─── 8. BUILDING CATEGORIES ───
    function renderBuildingCategories() {
        const grid = $('#categoryPanelGrid'), list = $('#categoryLocationList');
        grid.innerHTML = PLACE_CATEGORIES.map(c => `
            <div class="category-card-full" data-type="${c.type}" style="background:${c.bg}">
                <i data-lucide="${c.icon}"></i>
                <span>${c.label}</span>
            </div>
        `).join('');
        grid.querySelectorAll('.category-card-full').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                const locs = LOCATIONS.filter(l => l.type === type);
                list.innerHTML = `<h3 class="emergency-title" style="margin-top:1rem">${card.querySelector('span').innerText}</h3>` + locs.map(l => `
                    <div class="saved-item" onclick="window.__navigateTo('${l.id}'); document.getElementById('panelBuildingCategories').classList.remove('active')">
                        <div class="saved-item__icon" style="background:${BG_MAP[l.type]}"><i data-lucide="${MARKER_STYLES[l.type].icon}"></i></div>
                        <div class="saved-item__info">
                            <div class="saved-item__name">${l.name}</div>
                            <div class="saved-item__sub">${l.building} · ${l.room}</div>
                        </div>
                    </div>
                `).join('');
                lucide.createIcons();
            });
        });
        list.innerHTML = '';
        lucide.createIcons();
    }

    // ─── 9. CAMPUS EVENTS ───
    function renderCampusEvents() {
        const timeline = $('#campusEventsTimeline');
        // Combined list of fixed events and suggestions
        timeline.innerHTML = EVENTS.map(e => `
            <div class="event-item-full">
                <div class="event-card-full">
                    <div class="event-card-full__time">${e.time} ${e.period}</div>
                    <div class="event-card-full__name">${e.name}</div>
                    <div class="event-card-full__loc"><i data-lucide="map-pin"></i> ${e.location}</div>
                    <button class="sheet-tab" style="padding:8px 16px; margin-top:8px" onclick="window.__navigateTo('${e.locationId}'); document.getElementById('panelCampusEvents').classList.remove('active')">Navigate Here</button>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

    // ─── 10. EMERGENCY & SAFETY ───
    function renderEmergency() {
        // Emergency panel doesn't need dynamic rendering yet, but we'll hook up any specialized logic here
        $('#safetyShareLocation').addEventListener('change', e => {
            if (e.target.checked) showToast('Live location sharing enabled with security');
            else showToast('Location sharing disabled');
        });
    }

    // ─── GPS LOCATION ───
    let userMarker = null;

    function initGPS() {
        const gpsBtn = $('#gpsBtn');
        if (!("geolocation" in navigator)) {
            if (gpsBtn) gpsBtn.style.display = 'none';
            return;
        }

        if (gpsBtn) {
            gpsBtn.addEventListener('click', () => {
                // To simulate a location on the mock campus:
                const demoLat = CAMPUS_CENTER[0] + (Math.random() - 0.5) * 0.002;
                const demoLng = CAMPUS_CENTER[1] + (Math.random() - 0.5) * 0.002;
                
                updateUserLocation([demoLat, demoLng]);
                map.setView([demoLat, demoLng], 18, { animate: true });
                showToast('Location updated');
            });
        }
    }

    function updateUserLocation(coords) {
        if (!userMarker) {
            const userIcon = L.divIcon({ 
                className: '', 
                html: '<div style="width:18px;height:18px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.6);"></div>', 
                iconSize: [24, 24], 
                iconAnchor: [12, 12] 
            });
            userMarker = L.marker(coords, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
            userMarker.setLatLng(coords);
        }
    }
    
    // Auto-locate on first load
    setTimeout(() => {
        const demoLat = CAMPUS_CENTER[0] + (Math.random() - 0.5) * 0.002;
        const demoLng = CAMPUS_CENTER[1] + (Math.random() - 0.5) * 0.002;
        updateUserLocation([demoLat, demoLng]);
    }, 1000);

    initGPS();

    // ─── APPLY STORED SETTINGS ───
    function applyStoredSettings() {
        applyTheme(settings.darkMode);
        if (settings.contrast) document.body.classList.add('high-contrast');
        if (settings.largeText) document.body.classList.add('large-text');
        if (settings.wheelchair) $('#wheelchairToggle').checked = true;
        if (settings.sensory) $('#sensoryToggle').checked = true;
    }

    // ─── INIT ───
    function init() {
        if (userRole === 'guest') {
            // Hide guest restricted UI
            const restrictPanels = ['mySchedule', 'settings', 'peopleDirectory'];
            restrictPanels.forEach(panel => {
                const btn = document.querySelector(`[data-panel="${panel}"]`);
                if (btn && btn.parentElement) btn.parentElement.style.display = 'none';
            });
            // Hide events tab (schedule)
            const eventsTabBtn = document.querySelector('.sheet-tab[data-target="events"]');
            if(eventsTabBtn) eventsTabBtn.style.display = 'none';
        }

        // Check for dashboard-initiated navigation
        const navTarget = localStorage.getItem('cn_nav_target');
        if (navTarget) {
            localStorage.removeItem('cn_nav_target');
            setTimeout(() => {
                if (window.__navigateTo) window.__navigateTo(navTarget);
                closeMenu();
                const activePanel = $('.panel.active');
                if (activePanel) activePanel.classList.remove('active');
            }, 800);
        }

        // Initialize Theme UI on load
        applyTheme(settings.darkMode);

        // Notification Toggle & Logic
        const nBtn = $('#notificationBtn'), nPanel = $('#notificationPanel'), 
              nClose = $('#closeNotifications'), nDot = $('.notification-dot');

        if (nBtn && nPanel) {
            nBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = nPanel.classList.contains('active');
                
                // Toggle panel
                nPanel.classList.toggle('active');
                
                // If opening, hide the dot
                if (!isOpen && nDot) {
                    nDot.style.opacity = '0';
                    nDot.style.pointerEvents = 'none';
                }
            });
        }

        if (nClose) {
            nClose.addEventListener('click', (e) => {
                e.stopPropagation();
                nPanel.classList.remove('active');
            });
        }
        
        // Close notification panel when clicking outside
        document.addEventListener('click', (e) => {
            if (nPanel && nPanel.classList.contains('active') && !e.target.closest('#notificationPanel') && !e.target.closest('#notificationBtn')) {
                nPanel.classList.remove('active');
            }
        });

        // Simulating a "Welcome" notification on first arrival
        if (!localStorage.getItem('cn_init_visited')) {
            showToast('Welcome to Smart Campus! 🎓');
            setTimeout(() => {
                if (nDot) nDot.style.display = 'block';
            }, 3000);
            localStorage.setItem('cn_init_visited', 'true');
        }

        // Force realistic satellite map for this phase
        settings.mapStyle = 'satellite';
        saveState();
        
        // Update live tile layer to match
        if (currentTileLayer) map.removeLayer(currentTileLayer);
        currentTileLayer = baseLayers['satellite'];
        currentTileLayer.addTo(map);

        applyStoredSettings();
        createMarkers();
        populatePlaceGrid();
        populateOccupancyList();
        populateEventList();
        populateSuggestions();
        lucide.createIcons();
        setInterval(simulateOccupancy, 8000);
        setTimeout(() => { if (settings.notifications) eventBanner.style.animation = 'slideDown 0.5s ease-out forwards'; }, 1500);
    }

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
