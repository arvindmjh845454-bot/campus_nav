/* ============================================================
   CampusNav — Mock Campus Data
   ============================================================ */

const CAMPUS_CENTER = [28.5450, 77.1926]; // IIT Delhi Coordinates
const CAMPUS_ZOOM = 16;

// ─── Building / Location Data ───
const LOCATIONS = [
  // Departments
  { id: 'dept-cse', name: 'Computer Science Department', type: 'department', building: 'Bharti Building', room: 'Block II', coords: [28.5458, 77.1915], occupancy: 72, capacity: 150, status: 'open', statusText: 'Open · High activity', accessible: true, icon: 'cpu', floor: 'All Floors', courses: 'B.Tech, M.Tech, PhD in CSE', labs: 'AI Lab, Programming Lab, Networks Lab', facultyRooms: 'Rooms 201-215', contact: 'cse.office@iitd.ac.in | 011-2659-1291' },
  { id: 'dept-chem', name: 'Department of Chemistry', type: 'department', building: 'Block VI', room: 'Block VI', coords: [28.5435, 77.1935], occupancy: 45, capacity: 200, status: 'open', statusText: 'Open · Practical exams ongoing', accessible: true, icon: 'flask-conical', floor: 'All Floors', courses: 'B.Tech, M.Sc, PhD in Chemistry', labs: 'Organic Lab, Physical Chem Lab', facultyRooms: 'Block VI, 1st Floor', contact: 'chem.office@iitd.ac.in | 011-2659-1501' },
  { id: 'dept-phy', name: 'Physics Department', type: 'department', building: 'Block V', room: 'Block V', coords: [28.5440, 77.1940], occupancy: 60, capacity: 250, status: 'open', statusText: 'Open', accessible: true, icon: 'atom', floor: 'All Floors', courses: 'B.Tech (Engg Physics), M.Sc, PhD', labs: 'Optics Lab, Quantum Lab', facultyRooms: 'Block V, 2nd Floor', contact: 'physics@iitd.ac.in | 011-2659-1331' },
  { id: 'dept-ee', name: 'Electrical Engineering', type: 'department', building: 'Block II', room: 'Block II', coords: [28.5450, 77.1920], occupancy: 80, capacity: 300, status: 'open', statusText: 'Open', accessible: true, icon: 'zap', floor: 'All Floors', courses: 'B.Tech (EE), M.Tech, PhD', labs: 'Electronics Lab, Precessing Lab', facultyRooms: 'Block II, 1st Floor', contact: 'ee@iitd.ac.in | 011-2659-1071' },
  // Classrooms
  { id: 'lh-complex', name: 'Lecture Hall Complex', type: 'classroom', building: 'LHC', room: 'Rooms 101-401', coords: [28.5451, 77.1905], occupancy: 180, capacity: 500, status: 'open', statusText: 'Open · Classes in session', accessible: true, icon: 'book-open', floor: 'All Floors' },
  { id: 'dogra-hall', name: 'Dogra Hall', type: 'classroom', building: 'Main Building', room: 'Auditorium', coords: [28.5445, 77.1930], occupancy: 0, capacity: 500, status: 'closed', statusText: 'Closed · Event at 4 PM', accessible: true, icon: 'book-open', floor: '1st Floor' },
  // Admin
  { id: 'main-bldg', name: 'Main Building (Admin Block)', type: 'admin', building: 'Main Building', room: 'Director Office', coords: [28.5444, 77.1928], occupancy: 35, capacity: 120, status: 'open', statusText: 'Open · Regular hours', accessible: true, icon: 'building-2', floor: 'Ground Floor' },
  { id: 'dean-office', name: 'Dean Academics', type: 'admin', building: 'Main Building', room: 'Room 201', coords: [28.5442, 77.1925], occupancy: 2, capacity: 10, status: 'open', statusText: 'Open', accessible: true, icon: 'building-2', floor: '2nd Floor' },
  // Library
  { id: 'central-lib', name: 'Central Library', type: 'library', building: 'Central Library', room: 'All Floors', coords: [28.5460, 77.1910], occupancy: 85, capacity: 300, status: 'open', statusText: 'Open · Quiet study', accessible: true, icon: 'library', floor: 'Ground - 3rd Floor' },
  { id: 'reading-room', name: 'Rendezvous Reading Room', type: 'library', building: 'Central Library', room: '3rd Floor, East', coords: [28.5459, 77.1908], occupancy: 52, capacity: 80, status: 'open', statusText: 'Open · Moderate occupancy', accessible: true, icon: 'library', floor: '3rd Floor' },
  // Hostels
  { id: 'hostel-boys-1', name: 'Kumaon Hostel (Boys)', type: 'hostel', building: 'Kumaon', room: 'Rooms 1-200', coords: [28.5480, 77.1850], occupancy: 250, capacity: 300, status: 'open', statusText: 'Open', accessible: true, icon: 'home', floor: 'All Floors', capacityInfo: '300 Students', facilities: 'WiFi, Mess, Night Canteen, Laundry, TV Room', warden: 'Prof. A. K. Nandi' },
  { id: 'hostel-boys-2', name: 'Vindhyachal Hostel (Boys)', type: 'hostel', building: 'Vindhyachal', room: 'Rooms 1-250', coords: [28.5490, 77.1860], occupancy: 180, capacity: 350, status: 'open', statusText: 'Open', accessible: true, icon: 'home', floor: 'All Floors', capacityInfo: '350 Students', facilities: 'WiFi, Mess, Gym, Laundry', warden: 'Prof. R. P. Sharma' },
  { id: 'hostel-girls-1', name: 'Himadri Hostel (Girls)', type: 'hostel', building: 'Himadri', room: 'Rooms 1-150', coords: [28.5410, 77.1950], occupancy: 120, capacity: 180, status: 'open', statusText: 'Open', accessible: true, icon: 'home', floor: 'All Floors', capacityInfo: '180 Students', facilities: 'WiFi, Mess, Recreation Room, Laundry', warden: 'Prof. N. Gupta' },
  { id: 'hostel-girls-2', name: 'Kailash Hostel (Girls)', type: 'hostel', building: 'Kailash', room: 'Rooms 1-200', coords: [28.5420, 77.1960], occupancy: 150, capacity: 250, status: 'open', statusText: 'Open', accessible: true, icon: 'home', floor: 'All Floors', capacityInfo: '250 Students', facilities: 'WiFi, Mess, Dance Room, Laundry', warden: 'Prof. S. Kumari' },
  // Food & Hangouts
  { id: 'sac-food', name: 'SAC Food Court', type: 'hangout', building: 'SAC', room: 'Food Court', coords: [28.5420, 77.1880], occupancy: 145, capacity: 200, status: 'open', statusText: 'Open · Lunch rush expected soon', accessible: true, icon: 'coffee', floor: 'Ground Floor', timings: '8:00 AM - 2:00 AM', services: 'Snacks, Meals, Beverages' },
  { id: 'mascot-corner', name: 'Mascot Corner', type: 'hangout', building: 'Near LHC', room: '', coords: [28.5455, 77.1900], occupancy: 30, capacity: 50, status: 'open', statusText: 'Open', accessible: true, icon: 'coffee', floor: 'Open Area', timings: '9:00 AM - 8:00 PM', services: 'Juice, Shakes, Quick Bites' },
  { id: 'amu-tea-stall', name: 'Amul Parlour & Tea Stall', type: 'hangout', building: 'Library Avenue', room: '', coords: [28.5465, 77.1915], occupancy: 15, capacity: 30, status: 'open', statusText: 'Open', accessible: true, icon: 'coffee', floor: 'Open Area', timings: '24 x 7', services: 'Tea, Snacks, Beverages' },
  { id: 'student-lounge', name: 'Student Lounge', type: 'hangout', building: 'SAC', room: 'Lounge Area', coords: [28.5422, 77.1883], occupancy: 20, capacity: 40, status: 'open', statusText: 'Open', accessible: true, icon: 'sofa', floor: 'Ground Floor', timings: '24 x 7', services: 'Sitting area, TT Table, Carrom' },
  // Sports
  { id: 'sports-ground-1', name: 'Main Sports Ground', type: 'sports', building: 'Sports Complex', room: 'Field', coords: [28.5430, 77.1870], occupancy: 40, capacity: 500, status: 'open', statusText: 'Open · Football Match at 5 PM', accessible: true, icon: 'dumbbell', floor: 'Outdoors' },
  { id: 'gymnasium', name: 'SAC Gym', type: 'sports', building: 'SAC', room: 'Level 1', coords: [28.5425, 77.1885], occupancy: 15, capacity: 50, status: 'open', statusText: 'Open', accessible: true, icon: 'dumbbell', floor: '1st Floor' },
  // Emergency / Safety
  { id: 'hospital', name: 'IITD Medical Center', type: 'emergency', building: 'Hospital', room: 'OPD & Emergency', coords: [28.5470, 77.1890], occupancy: 12, capacity: 50, status: 'open', statusText: 'Open · 24x7 Emergency', accessible: true, icon: 'shield-alert', floor: 'Ground Floor', details: 'All basic medical facilities and ambulance available.', emergencyContact: '+91-11-2659-6666' },
  { id: 'security-hq', name: 'Main Security Office', type: 'emergency', building: 'Near Main Gate', room: 'HQ', coords: [28.5435, 77.1955], occupancy: 5, capacity: 20, status: 'open', statusText: 'Open · 24x7', accessible: true, icon: 'shield-alert', floor: 'Ground Floor', details: 'Security command center and lost & found.', emergencyContact: '+91-11-2659-1000' },
  // Visitor Guide
  { id: 'main-gate', name: 'Main Entrance Gate', type: 'visitor', building: 'Main Gate', room: '', coords: [28.5430, 77.1960], occupancy: 0, capacity: 100, status: 'open', statusText: 'Open 24x7', accessible: true, icon: 'map', floor: 'Ground', details: 'Entry point for all visitors. Please carry valid Govt ID.' },
  { id: 'visitor-parking', name: 'Visitor Parking Area', type: 'visitor', building: 'Parking Sector', room: '', coords: [28.5432, 77.1950], occupancy: 15, capacity: 50, status: 'open', statusText: 'Open · Spaces available', accessible: true, icon: 'map', floor: 'Outdoors', details: 'Paid parking facility for guests and visitors.' },
  { id: 'guest-house', name: 'Main Guest House', type: 'visitor', building: 'Guest House', room: 'Reception', coords: [28.5450, 77.1970], occupancy: 20, capacity: 80, status: 'open', statusText: 'Open', accessible: true, icon: 'map', floor: 'All Floors', details: 'Accommodation for official institute guests and parents.' },
  // Restrooms
  { id: 'mens-restroom', name: "Men's Restroom", type: 'restroom', building: 'LHC', room: 'Near Entrance', coords: [28.5452, 77.1906], occupancy: 5, capacity: 15, status: 'open', statusText: 'Open', accessible: true, icon: 'bath', floor: 'Ground Floor' },
  { id: 'womens-restroom', name: "Women's Restroom", type: 'restroom', building: 'Central Library', room: 'East Wing', coords: [28.5461, 77.1911], occupancy: 3, capacity: 15, status: 'open', statusText: 'Open', accessible: true, icon: 'bath', floor: 'Ground Floor' }
];

// ─── People Directory ───
const PEOPLE_DIRECTORY = [
  { id: 'p1', name: 'Prof. S.K. Gupta', role: 'HOD (Computer Science)', dept: 'Academic Affairs', email: 'hod.cse@university.edu', phone: '9876543210', office: 'dept-cse', icon: 'graduation-cap' },
  { id: 'p2', name: 'Dr. Anjali Rao', role: 'Senior Teacher', dept: 'Mathematics', email: 'anjali.r@university.edu', phone: '9876543211', office: 'lh-complex', icon: 'book-user' },
  { id: 'p3', name: 'Mr. Karan Singh', role: 'Chief Warden', dept: 'Hostel Board', email: 'warden.b1@university.edu', phone: '9876543212', office: 'hostel-boys-1', icon: 'key' },
  { id: 'p4', name: 'Simran Kaur', role: 'Student Rep', dept: 'Student Union', email: 'student.rep@university.edu', phone: '9876543213', office: 'sac-food', icon: 'user' },
  { id: 'p5', name: 'Chief Inspector Om', role: 'Security Head', dept: 'Safety & Security', email: 'security.hq@university.edu', phone: '9876543214', office: 'security-hq', icon: 'shield-check' },
  { id: 'p6', name: 'Ms. Rekha Sharma', role: 'Campus Admin', dept: 'Administration', email: 'admin.desk@university.edu', phone: '9876543215', office: 'main-bldg', icon: 'user-cog' },
  { id: 'p7', name: 'Dr. Vikram Patel', role: 'Head of Physics', dept: 'Academic Affairs', email: 'vikram.p@university.edu', phone: '9876543216', office: 'dept-phy', icon: 'atom' },
  { id: 'p8', name: 'Prof. Meera Gupta', role: 'Chemistry HOD', dept: 'Academic Affairs', email: 'meera.g@university.edu', phone: '9876543217', office: 'dept-chem', icon: 'flask-conical' },
  { id: 'p9', name: 'Mr. Rohit Verma', role: 'IT Support Head', dept: 'IT Services', email: 'it.head@university.edu', phone: '9876543218', office: 'dept-cse', icon: 'cpu' },
  { id: 'p10', name: 'Ms. Deepa Iyer', role: 'Facility Manager', dept: 'Maintenance', email: 'deepa.i@university.edu', phone: '9876543219', office: 'main-bldg', icon: 'hammer' }
];

// ─── Events / Schedule Data ───
const EVENTS = [
  { id: 'evt-1', name: 'Physics 101', locationId: 'lh-complex', location: 'LHC, Room 204', time: '09:30', period: 'AM', duration: '1h 30m' },
  { id: 'evt-2', name: 'Data Structures Lab', locationId: 'csc', location: 'Bharti Building, Lab 3', time: '11:00', period: 'AM', duration: '2h' },
  { id: 'evt-3', name: 'English Literature', locationId: 'lh-complex', location: 'LHC, Room 105', time: '02:00', period: 'PM', duration: '1h' },
  { id: 'evt-4', name: 'Rendezvous Prep', locationId: 'dogra-hall', location: 'Dogra Hall', time: '04:00', period: 'PM', duration: '2h' },
  { id: 'evt-5', name: 'AI/ML Workshop', locationId: 'csc', location: 'Bharti Building, Lab 1', time: '06:00', period: 'PM', duration: '1h 30m' }
];

const SUGGESTIONS = [
  { id: 'sug-1', icon: 'coffee', text: '<strong>Hungry?</strong> SAC Food Court is 2 min away with <strong>low occupancy</strong>.', locationId: 'sac' },
  { id: 'sug-2', icon: 'library', text: '<strong>Need to study?</strong> Rendezvous Reading Room has space — only 52/80 seats taken.', locationId: 'reading-room' },
  { id: 'sug-3', icon: 'flask-conical', text: '<strong>Free period?</strong> CSC is almost empty — great for practicals.', locationId: 'csc' }
];

const MOCK_ROUTE_STEPS = [
  { icon: 'circle-dot', text: '<strong>Start</strong> from your current location' },
  { icon: 'move-right', text: 'Head <strong>east</strong> along the main pathway for 50m' },
  { icon: 'corner-down-right', text: 'Turn <strong>right</strong> at the main road' },
  { icon: 'move-right', text: 'Continue straight past the Main Building — 80m' },
  { icon: 'door-open', text: 'Enter <strong>LHC</strong> through the main entrance' },
  { icon: 'stairs', text: 'Take <strong>stairs/elevator</strong> to the 2nd floor' },
  { icon: 'map-pin', text: '<strong>Arrive</strong> at Room 204 — on your left' }
];

const PLACE_CATEGORIES = [
  { type: 'department', label: 'Departments', icon: 'building', bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
  { type: 'hostel', label: 'Hostels', icon: 'home', bg: 'linear-gradient(135deg, #92400e, #d97706)' },
  { type: 'hangout', label: 'Food & Hangouts', icon: 'coffee', bg: 'linear-gradient(135deg, #78350f, #b45309)' },
  { type: 'classroom', label: 'Classrooms', icon: 'book-open', bg: 'linear-gradient(135deg, #9b2226, #dc2626)' },
  { type: 'library', label: 'Library', icon: 'library', bg: 'linear-gradient(135deg, #065f46, #10b981)' },
  { type: 'admin', label: 'Administration', icon: 'building-2', bg: 'linear-gradient(135deg, #374151, #6b7280)' },
  { type: 'sports', label: 'Sports', icon: 'dumbbell', bg: 'linear-gradient(135deg, #7f1d1d, #ef4444)' },
  { type: 'visitor', label: 'Visitor Guide', icon: 'map', bg: 'linear-gradient(135deg, #1e40af, #60a5fa)' },
  { type: 'emergency', label: 'Emergency', icon: 'shield-alert', bg: 'linear-gradient(135deg, #991b1b, #f87171)' },
  { type: 'restroom', label: 'Restrooms', icon: 'bath', bg: 'linear-gradient(135deg, #5b21b6, #8b5cf6)' }
];

const MARKER_STYLES = {
  department: { class: 'marker-department', icon: 'building' },
  hostel: { class: 'marker-hostel', icon: 'home' },
  hangout: { class: 'marker-hangout', icon: 'coffee' },
  classroom: { class: 'marker-classroom', icon: 'book-open' },
  library: { class: 'marker-library', icon: 'library' },
  admin: { class: 'marker-admin', icon: 'building-2' },
  sports: { class: 'marker-sports', icon: 'dumbbell' },
  visitor: { class: 'marker-visitor', icon: 'map' },
  emergency: { class: 'marker-emergency', icon: 'shield-alert' },
  restroom: { class: 'marker-restroom', icon: 'bath' }
};

const BG_MAP = {
  department: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  hostel: 'linear-gradient(135deg, #92400e, #d97706)',
  hangout: 'linear-gradient(135deg, #78350f, #b45309)',
  classroom: 'linear-gradient(135deg, #9b2226, #dc2626)',
  library: 'linear-gradient(135deg, #065f46, #10b981)',
  admin: 'linear-gradient(135deg, #374151, #6b7280)',
  sports: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
  visitor: 'linear-gradient(135deg, #1e40af, #60a5fa)',
  emergency: 'linear-gradient(135deg, #991b1b, #f87171)',
  restroom: 'linear-gradient(135deg, #5b21b6, #8b5cf6)'
};

// ─── Schedule Data (per day) ───
const SCHEDULE_DATA = {
  mon: [
    { name: 'Mathematics', start: '09:00', end: '10:00', locationId: 'lh-complex', location: 'LHC, Room 102' },
    { name: 'Physics 101', start: '10:30', end: '12:00', locationId: 'lh-complex', location: 'LHC, Room 204' },
    { name: 'English Literature', start: '14:00', end: '15:00', locationId: 'lh-complex', location: 'LHC, Room 105' }
  ],
  tue: [
    { name: 'Data Structures', start: '09:00', end: '11:00', locationId: 'csc', location: 'Bharti Building, Lab 3' },
    { name: 'Chemistry', start: '11:30', end: '13:00', locationId: 'chem-dept', location: 'Block VI, Lab 108' },
    { name: 'Sports', start: '16:00', end: '17:30', locationId: 'sports-board', location: 'SAC, Sports Arena' }
  ],
  wed: [
    { name: 'Mathematics', start: '09:00', end: '10:00', locationId: 'lh-complex', location: 'LHC, Room 102' },
    { name: 'AI/ML Workshop', start: '11:00', end: '13:00', locationId: 'csc', location: 'Bharti Building, Lab 1' },
    { name: 'Library Study Hour', start: '14:00', end: '16:00', locationId: 'reading-room', location: 'Central Library, 3rd Floor East' }
  ],
  thu: [
    { name: 'Physics Lab', start: '09:00', end: '11:00', locationId: 'lh-complex', location: 'LHC, Room 204' },
    { name: 'English Literature', start: '11:30', end: '12:30', locationId: 'lh-complex', location: 'LHC, Room 105' },
    { name: 'Cultural Fest Rehearsal', start: '16:00', end: '18:00', locationId: 'dogra-hall', location: 'Dogra Hall' }
  ],
  fri: [
    { name: 'Data Structures', start: '09:00', end: '11:00', locationId: 'csc', location: 'Bharti Building, Lab 3' },
    { name: 'Mathematics', start: '11:30', end: '12:30', locationId: 'lh-complex', location: 'LHC, Room 102' }
  ],
  sat: [
    { name: 'Sports Practice', start: '08:00', end: '10:00', locationId: 'sports-board', location: 'SAC, Sports Arena' }
  ]
};

// ─── FAQ Data ───
const FAQ_DATA = [
  { q: 'How do I navigate to a specific room?', a: 'Use the search bar at the top to type a room number, building name, or facility type. Then tap the result and press "Navigate Here" to get step-by-step directions.' },
  { q: 'How does real-time occupancy work?', a: 'Occupancy data is updated every few seconds using campus sensors. The badges show Low (green), Moderate (yellow), or Busy (red) status for each facility.' },
  { q: 'Can I get wheelchair-accessible routes?', a: 'Yes! Tap the accessibility button (♿) on the right side of the map, or go to Menu → Accessibility to enable wheelchair-friendly routing that avoids stairs.' },
  { q: 'How do I save a favorite place?', a: 'Go to Menu → Saved Places and tap the + button to add locations. You can also save places directly from the map marker popup.' },
  { q: 'Does it work offline?', a: 'Basic map tiles may be cached, but real-time features like occupancy and event suggestions require an internet connection.' },
  { q: 'How do I report a map error?', a: 'Go to Menu → Help & Feedback → Send Feedback, select "Map / Data Error" as the category, and describe the issue.' }
];

// ─── Important Routes ───
const IMPORTANT_ROUTES = [
  { id: 'route-gate-admin', name: 'Main Gate to Admin Block', from: 'main-gate', to: 'main-bldg', duration: '5 mins', distance: '400m', type: 'walking' },
  { id: 'route-lib-hostel', name: 'Library to Boys Hostels', from: 'central-lib', to: 'hostel-boys-1', duration: '12 mins', distance: '1.2km', type: 'walking' },
  { id: 'route-lhc-sac', name: 'LHC to Food Court (SAC)', from: 'lh-complex', to: 'sac-food', duration: '7 mins', distance: '600m', type: 'walking' },
  { id: 'route-admin-hospital', name: 'Admin Block to Hospital', from: 'main-bldg', to: 'hospital', duration: '8 mins', distance: '700m', type: 'walking' }
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Welcome back!', desc: 'Explore the new realistic map graphics.', icon: 'info', type: 'info', time: 'Just now' },
  { id: 'n2', title: 'Occupancy Update', desc: 'LHC is currently at 85% capacity.', icon: 'zap', type: 'warn', time: '5m ago' },
  { id: 'n3', title: 'New Event', desc: 'Physics 101 starts in 15 minutes at LHC.', icon: 'calendar', type: 'event', time: '12m ago' },
  { id: 'n4', title: 'Security Alert', desc: 'Main gate entry rules updated for guests.', icon: 'shield-alert', type: 'danger', time: '1h ago' }
];
