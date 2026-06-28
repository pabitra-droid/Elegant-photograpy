document.addEventListener('DOMContentLoaded', () => {
    // API URL Base (empty because it's same origin)
    const API_BASE = '/api/admin';
    
    // State
    let state = {
        bookings: [],
        contacts: [],
        deleteTarget: null // { type: 'bookings'|'contacts', id: string }
    };

    // DOM Elements
    const elements = {
        totalBookings: document.getElementById('totalBookings'),
        pendingBookings: document.getElementById('pendingBookings'),
        totalContacts: document.getElementById('totalContacts'),
        thisMonth: document.getElementById('thisMonth'),
        bookingsBody: document.getElementById('bookingsBody'),
        contactsBody: document.getElementById('contactsBody'),
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        deleteModal: document.getElementById('deleteModal'),
        cancelDeleteBtn: document.getElementById('cancelDelete'),
        confirmDeleteBtn: document.getElementById('confirmDelete')
    };

    // Date Formatter
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Fetch Data
    const fetchData = async () => {
        try {
            const [resBookings, resContacts] = await Promise.all([
                fetch(`${API_BASE}/bookings`),
                fetch(`${API_BASE}/contacts`)
            ]);
            
            if (resBookings.ok) state.bookings = await resBookings.json();
            if (resContacts.ok) state.contacts = await resContacts.json();
            
            renderData();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Render Everything
    const renderData = () => {
        updateStats();
        renderBookings();
        renderContacts();
    };

    // Update Statistics
    const updateStats = () => {
        elements.totalBookings.textContent = state.bookings.length;
        elements.pendingBookings.textContent = state.bookings.filter(b => b.status === 'pending').length;
        elements.totalContacts.textContent = state.contacts.length;
        
        // Calculate this month's entries
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const isThisMonth = (item) => {
            const date = new Date(item.timestamp);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        };
        
        const newThisMonth = state.bookings.filter(isThisMonth).length + state.contacts.filter(isThisMonth).length;
        elements.thisMonth.textContent = newThisMonth;
    };

    // Render Bookings Table
    const renderBookings = () => {
        if (state.bookings.length === 0) {
            elements.bookingsBody.innerHTML = `<tr><td colspan="7" class="empty-state">No bookings found</td></tr>`;
            return;
        }

        elements.bookingsBody.innerHTML = state.bookings.map((booking, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${booking.name}</strong><br><small style="color:var(--text-muted)">${formatDate(booking.timestamp)}</small></td>
                <td>${booking.email}<br><small>${booking.phone}</small></td>
                <td style="text-transform: capitalize">${booking.service}</td>
                <td>${formatDate(booking.eventDate)}</td>
                <td>
                    <span class="status-badge badge-${booking.status}">${booking.status}</span>
                </td>
                <td>
                    <div class="action-btns">
                        <select class="status-select" onchange="window.updateBookingStatus('${booking.id}', this.value)">
                            <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="btn-icon btn-delete" onclick="window.promptDelete('bookings', '${booking.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // Render Contacts Table
    const renderContacts = () => {
        if (state.contacts.length === 0) {
            elements.contactsBody.innerHTML = `<tr><td colspan="7" class="empty-state">No contacts found</td></tr>`;
            return;
        }

        elements.contactsBody.innerHTML = state.contacts.map((contact, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${contact.name}</strong><br><small style="color:var(--text-muted)">${formatDate(contact.timestamp)}</small></td>
                <td>${contact.email}<br><small>${contact.phone}</small></td>
                <td style="text-transform: capitalize">${contact.service || 'General'}</td>
                <td>${formatDate(contact.eventDate)}</td>
                <td title="${contact.message}">${truncateText(contact.message)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-delete" onclick="window.promptDelete('contacts', '${contact.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    // Tab Switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Global Action Handlers (attached to window for inline onclick access)
    window.updateBookingStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE}/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    window.promptDelete = (type, id) => {
        state.deleteTarget = { type, id };
        elements.deleteModal.classList.add('active');
    };

    // Modal Actions
    const closeModal = () => {
        state.deleteTarget = null;
        elements.deleteModal.classList.remove('active');
    };

    elements.cancelDeleteBtn.addEventListener('click', closeModal);
    
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) closeModal();
    });

    elements.confirmDeleteBtn.addEventListener('click', async () => {
        if (!state.deleteTarget) return;
        
        const { type, id } = state.deleteTarget;
        try {
            const res = await fetch(`${API_BASE}/${type}/${id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                closeModal();
                fetchData();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item');
            closeModal();
        }
    });

    // Initialize
    fetchData();
    
    // Auto Refresh every 30 seconds
    setInterval(fetchData, 30000);
});
