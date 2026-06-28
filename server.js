const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Helpers
const readData = (filename) => {
    try {
        const dataPath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(dataPath)) {
            fs.writeFileSync(dataPath, '[]');
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (err) {
        console.error('Error reading data:', err);
        return [];
    }
};

const writeData = (filename, data) => {
    try {
        fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing data:', err);
        return false;
    }
};

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Routes
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, phone, service, eventDate, message } = req.body;
        const contacts = readData('contacts.json');
        
        const newContact = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            status: 'new',
            name, email, phone, service, eventDate, message
        };
        
        contacts.push(newContact);
        writeData('contacts.json', contacts);
        
        res.status(201).json({ success: true, message: 'Thank you! We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/booking', (req, res) => {
    try {
        const { name, email, phone, service, package, eventDate, message } = req.body;
        const bookings = readData('bookings.json');
        
        const newBooking = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            status: 'pending',
            name, email, phone, service, package, eventDate, message
        };
        
        bookings.push(newBooking);
        writeData('bookings.json', bookings);
        
        res.status(201).json({ success: true, message: 'Booking request received!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/admin/contacts', (req, res) => {
    try {
        const contacts = readData('contacts.json');
        contacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/admin/bookings', (req, res) => {
    try {
        const bookings = readData('bookings.json');
        bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/admin/contacts/:id', (req, res) => {
    try {
        const contacts = readData('contacts.json');
        const filtered = contacts.filter(c => c.id !== req.params.id);
        writeData('contacts.json', filtered);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/api/admin/bookings/:id', (req, res) => {
    try {
        const bookings = readData('bookings.json');
        const filtered = bookings.filter(b => b.id !== req.params.id);
        writeData('bookings.json', filtered);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.patch('/api/admin/bookings/:id', (req, res) => {
    try {
        const { status } = req.body;
        const bookings = readData('bookings.json');
        const index = bookings.findIndex(b => b.id === req.params.id);
        
        if (index !== -1) {
            bookings[index].status = status;
            writeData('bookings.json', bookings);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Booking not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/admin', (req, res) => {
    res.redirect('/admin.html');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🌟 Elegant Photography Server`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🎨 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
});
