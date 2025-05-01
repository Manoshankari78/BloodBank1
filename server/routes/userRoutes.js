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

    res.status(200).json({ message: 'Donor logged in successfully.' });
  } catch (error) {
    console.error('Error logging in donor:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Recipient Registration
router.post('/register/recipient', async (req, res) => {
  const { name, age, gender, blood_group_required, hospital_name, phone_number, password } = req.body;

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
      'INSERT INTO Recipient (Name, Age, Gender, Blood_Group_Required, Hospital_Name, Phone_Number, Password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, age, gender, blood_group_required, hospital_name, phone_number, hashedPassword]
    );

    res.status(201).json({ message: 'Recipient registered successfully.' });
  } catch (error) {
    console.error('Error registering recipient:', error);
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

    res.status(200).json({ message: 'Recipient logged in successfully.' });
  } catch (error) {
    console.error('Error logging in recipient:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
