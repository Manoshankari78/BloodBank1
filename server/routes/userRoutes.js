const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// Donor Registration
router.post('/register/donor', async (req, res) => {
  const { name, age, gender, blood_group, phone_number, email, address, health_status, password } = req.body;

  try {
    // Check if donor already exists
    const [existingDonor] = await db.promise().query('SELECT * FROM Donor WHERE Email = ?', [email]);
    if (existingDonor.length > 0) {
      return res.status(400).json({ message: 'Donor already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new donor
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
    // Check if recipient already exists
    const [existingRecipient] = await db.promise().query('SELECT * FROM Recipient WHERE Phone_Number = ?', [phone_number]);
    if (existingRecipient.length > 0) {
      return res.status(400).json({ message: 'Recipient already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new recipient
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
    // Find donor by email
    const [donors] = await db.promise().query('SELECT * FROM Donor WHERE Email = ?', [email]);
    if (donors.length === 0) {
      return res.status(400).json({ message: 'Donor not found.' });
    }

    const donor = donors[0];

    // Compare passwords
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
    // Find recipient by phone number
    const [recipients] = await db.promise().query('SELECT * FROM Recipient WHERE Phone_Number = ?', [phone_number]);
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'Recipient not found.' });
    }

    const recipient = recipients[0];

    // Compare passwords
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
    // Verify donor exists
    const [donors] = await db.promise().query('SELECT * FROM Donor WHERE Donor_ID = ?', [donor_id]);
    if (donors.length === 0) {
      return res.status(400).json({ message: 'Donor not found.' });
    }

    // Insert donation
    await db.promise().query(
      'INSERT INTO Donation (Donor_ID, Blood_Group, Quantity, Donation_Date, Location) VALUES (?, ?, ?, ?, ?)',
      [donor_id, blood_group, quantity, donation_date, location]
    );

    // Update inventory
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

// Request Blood
router.post('/requests', async (req, res) => {
  const { recipient_id, blood_group, quantity } = req.body;

  try {
    // Verify recipient exists
    const [recipients] = await db.promise().query('SELECT * FROM Recipient WHERE Recipient_ID = ?', [recipient_id]);
    if (recipients.length === 0) {
      return res.status(400).json({ message: 'Recipient not found.' });
    }

    // Check inventory
    const [inventory] = await db.promise().query('SELECT Quantity FROM Blood_Inventory WHERE Blood_Group = ?', [blood_group]);
    const available = inventory.length > 0 ? inventory[0].Quantity : 0;
    const status = available >= quantity ? 'Approved' : 'Pending';

    // Insert request
    await db.promise().query(
      'INSERT INTO Blood_Request (Recipient_ID, Blood_Group, Quantity, Status) VALUES (?, ?, ?, ?)',
      [recipient_id, blood_group, quantity, status]
    );

    // Update inventory if approved
    if (status === 'Approved') {
      await db.promise().query(
        'UPDATE Blood_Inventory SET Quantity = Quantity - ? WHERE Blood_Group = ?',
        [quantity, blood_group]
      );
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
module.exports = router;