const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Validation Functions
const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
function validatePhoneNumber(phone) {
  return /^\d{10}$/.test(phone);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateAge(age, minAge) {
  const numAge = parseInt(age, 10);
  return !isNaN(numAge) && numAge >= minAge;
}

function validateBloodGroup(blood_group) {
  return validBloodGroups.includes(blood_group);
}

// Donor Registration
router.post('/register/donor', async (req, res) => {
  const { name, age, gender, blood_group, phone_number, email, address, health_status, password } = req.body;

  try {
    if (!validateAge(age, 18)) {
      return res.status(400).json({ message: 'Donor must be 18 or older.' });
    }
    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits.' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!validateBloodGroup(blood_group)) {
      return res.status(400).json({ message: 'Invalid blood group.' });
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender.' });
    }
    if (!name || !address || !health_status || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const [existingDonor] = await db.promise().query('SELECT * FROM Donor WHERE Email = ?', [email]);
    if (existingDonor.length > 0) {
      return res.status(400).json({ message: 'Donor already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      'INSERT INTO Donor (Name, Age, Gender, Blood_Group, Phone_Number, Email, Address, Health_Status, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, age, gender, blood_group, phone_number, email, address, health_status, hashedPassword]
    );

    res.status(201).json({ message: 'Donor registered successfully.' });
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Recipient Registration
router.post('/register/recipient', async (req, res) => {
  const { name, age, gender, phone_number, hospital_name, password } = req.body;

  try {
    if (!validateAge(age, 1)) {
      return res.status(400).json({ message: 'Age must be a positive number.' });
    }
    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits.' });
    }
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender.' });
    }
    if (!name || !hospital_name || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const [existingRecipient] = await db.promise().query('SELECT * FROM Recipient WHERE Phone_Number = ?', [phone_number]);
    if (existingRecipient.length > 0) {
      return res.status(400).json({ message: 'Recipient already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      'INSERT INTO Recipient (Name, Age, Gender, Phone_Number, Hospital_Name, Password) VALUES (?, ?, ?, ?, ?, ?)',
      [name, age, gender, phone_number, hospital_name, hashedPassword]
    );

    res.status(201).json({ message: 'Recipient registered successfully.' });
  } catch (error) {
    console.error('Error registering recipient:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Donor Login
router.post('/login/donor', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    const [donors] = await db.promise().query('SELECT * FROM Donor WHERE Email = ?', [email]);
    if (donors.length === 0) {
      return res.status(400).json({ message: 'Donor not found.' });
    }

    const donor = donors[0];
    const isMatch = await bcrypt.compare(password, donor.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({ message: 'Donor logged in successfully.', id: donor.Donor_ID });
  } catch (error) {
    console.error('Error logging in donor:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Recipient Login
router.post('/login/recipient', async (req, res) => {
  const { phone_number, password } = req.body;

  try {
    if (!validatePhoneNumber(phone_number)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    const [recipients] = await db.promise().query('SELECT * FROM Recipient WHERE Phone_Number = ?', [phone_number]);
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'Recipient not found.' });
    }

    const recipient = recipients[0];
    const isMatch = await bcrypt.compare(password, recipient.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({ message: 'Recipient logged in successfully.', id: recipient.Recipient_ID });
  } catch (error) {
    console.error('Error logging in recipient:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Schedule Donation
router.post('/donations', async (req, res) => {
  const { donor_id, blood_group, quantity, donation_date, location } = req.body;

  try {
    if (!validateBloodGroup(blood_group)) {
      return res.status(400).json({ message: 'Invalid blood group.' });
    }
    const today = new Date().toISOString().split('T')[0];
    if (donation_date <= today) {
      return res.status(400).json({ message: 'Donation date must be in the future.' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }
    if (!location) {
      return res.status(400).json({ message: 'Location is required.' });
    }

    const [donors] = await db.promise().query('SELECT * FROM Donor WHERE Donor_ID = ?', [donor_id]);
    if (donors.length === 0) {
      return res.status(400).json({ message: 'Donor not found.' });
    }

    await db.promise().query(
      'INSERT INTO Donation (Donor_ID, Blood_Group, Quantity, Donation_Date, Location) VALUES (?, ?, ?, ?, ?)',
      [donor_id, blood_group, quantity, donation_date, location]
    );

    await db.promise().query(
      'INSERT INTO Blood_Inventory (Blood_Group, Quantity, Expiry_Date) VALUES (?, ?, DATE_ADD(?, INTERVAL 42 DAY)) ON DUPLICATE KEY UPDATE Quantity = Quantity + ?',
      [blood_group, quantity, donation_date, quantity]
    );

    res.status(201).json({ message: 'Donation scheduled successfully.' });
  } catch (error) {
    console.error('Error scheduling donation:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Request Blood (Modified to Handle Urgency and Notifications)
router.post('/requests', async (req, res) => {
  const { recipient_id, blood_group, quantity, urgency = false } = req.body;

  try {
    if (!validateBloodGroup(blood_group)) {
      return res.status(400).json({ message: 'Invalid blood group.' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const [recipients] = await db.promise().query('SELECT * FROM Recipient WHERE Recipient_ID = ?', [recipient_id]);
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'Recipient not found.' });
    }

    const [inventory] = await db.promise().query('SELECT Quantity FROM Blood_Inventory WHERE Blood_Group = ?', [blood_group]);
    const available = inventory.length > 0 ? inventory[0].Quantity : 0;
    const status = available >= quantity ? 'Approved' : 'Pending';

    const [requestResult] = await db.promise().query(
      'INSERT INTO Blood_Request (Recipient_ID, Blood_Group, Quantity, Urgency, Status) VALUES (?, ?, ?, ?, ?)',
      [recipient_id, blood_group, quantity, urgency, status]
    );
    const requestId = requestResult.insertId;

    if (status === 'Approved') {
      await db.promise().query(
        'UPDATE Blood_Inventory SET Quantity = Quantity - ? WHERE Blood_Group = ?',
        [quantity, blood_group]
      );
    }

    // Generate Notifications for Urgent Requests
    if (urgency) {
      const [donors] = await db.promise().query('SELECT Donor_ID FROM Donor WHERE Blood_Group = ?', [blood_group]);
      if (donors.length > 0) {
        const message = `Urgent: ${quantity} units of ${blood_group} blood needed by a recipient.`;
        const notificationPromises = donors.map(donor =>
          db.promise().query(
            'INSERT INTO Notifications (Donor_ID, Request_ID, Message) VALUES (?, ?, ?)',
            [donor.Donor_ID, requestId, message]
          )
        );
        await Promise.all(notificationPromises);
      }
    }

    res.status(201).json({ message: `Blood request ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error('Error requesting blood:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Search Inventory
router.get('/inventory', async (req, res) => {
  const { blood_group } = req.query;

  try {
    if (!validateBloodGroup(blood_group)) {
      return res.status(400).json({ message: 'Invalid blood group.' });
    }

    const [inventory] = await db.promise().query('SELECT Quantity FROM Blood_Inventory WHERE Blood_Group = ?', [blood_group]);
    const quantity = inventory.length > 0 ? inventory[0].Quantity : 0;
    res.status(200).json({ blood_group, quantity });
  } catch (error) {
    console.error('Error searching inventory:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get Donor Profile
router.get('/donor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [donors] = await db.promise().query('SELECT Blood_Group AS blood_group FROM Donor WHERE Donor_ID = ?', [id]);
    if (donors.length === 0) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    res.status(200).json(donors[0]);
  } catch (error) {
    console.error('Error fetching donor:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Fetch Notifications for a Donor
router.get('/notifications/:donor_id', async (req, res) => {
  const { donor_id } = req.params;

  try {
    const [notifications] = await db.promise().query(
      'SELECT Notification_ID, Request_ID, Message, Is_Read, Created_At FROM Notifications WHERE Donor_ID = ? ORDER BY Created_At DESC',
      [donor_id]
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Mark Notification as Read
router.put('/notifications/:notification_id/read', async (req, res) => {
  const { notification_id } = req.params;

  try {
    await db.promise().query('UPDATE Notifications SET Is_Read = TRUE WHERE Notification_ID = ?', [notification_id]);
    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;