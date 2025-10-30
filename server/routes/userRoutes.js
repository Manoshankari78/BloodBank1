const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

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

// Admin Registration (Optional: For initial setup)
router.post('/register/admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const [existingAdmin] = await db.promise().query('SELECT * FROM Admin WHERE Username = ?', [username]);
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      'INSERT INTO Admin (Username, Password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (error) {
    console.error('Error registering admin:', error);
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

// Admin Login
router.post('/login/admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const [admins] = await db.promise().query('SELECT * FROM Admin WHERE Username = ?', [username]);
    if (admins.length === 0) {
      return res.status(400).json({ message: 'Admin not found.' });
    }

    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    res.status(200).json({ message: 'Admin logged in successfully.', id: admin.Admin_ID });
  } catch (error) {
    console.error('Error logging in admin:', error);
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

// Request Blood
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
      'SELECT n.Notification_ID, n.Request_ID, n.Message, n.Is_Read, n.Created_At, br.Urgency ' +
      'FROM Notifications n ' +
      'JOIN Blood_Request br ON n.Request_ID = br.Request_ID ' +
      'WHERE n.Donor_ID = ? ORDER BY n.Created_At DESC',
      [donor_id]
    );

    // Fetch donor responses to check if they have already responded
    const [responses] = await db.promise().query(
      'SELECT Request_ID, Status FROM Donor_Response WHERE Donor_ID = ?',
      [donor_id]
    );
    const responseMap = responses.reduce((map, response) => {
      map[response.Request_ID] = response.Status;
      return map;
    }, {});

    const notificationsWithResponse = notifications.map(notification => ({
      ...notification,
      hasResponded: !!responseMap[notification.Request_ID],
      responseStatus: responseMap[notification.Request_ID] || null
    }));

    res.status(200).json(notificationsWithResponse);
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

// Donor Respond to Urgent Request
router.post('/respond/:donor_id/:request_id', async (req, res) => {
  const { donor_id, request_id } = req.params;
  const { status } = req.body; // 'Accepted' or 'Declined'

  try {
    if (!['Accepted', 'Declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid response status.' });
    }

    const [donor] = await db.promise().query('SELECT * FROM Donor WHERE Donor_ID = ?', [donor_id]);
    if (donor.length === 0) {
      return res.status(404).json({ message: 'Donor not found.' });
    }

    const [request] = await db.promise().query('SELECT * FROM Blood_Request WHERE Request_ID = ?', [request_id]);
    if (request.length === 0) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Check if donor has already responded
    const [existingResponse] = await db.promise().query(
      'SELECT * FROM Donor_Response WHERE Donor_ID = ? AND Request_ID = ?',
      [donor_id, request_id]
    );
    if (existingResponse.length > 0) {
      return res.status(400).json({ message: 'You have already responded to this request.' });
    }

    await db.promise().query(
      'INSERT INTO Donor_Response (Donor_ID, Request_ID, Status) VALUES (?, ?, ?)',
      [donor_id, request_id, status]
    );

    // If the donor accepts, we can optionally schedule a donation (simplified here)
    if (status === 'Accepted') {
      const donationDate = new Date().toISOString().split('T')[0]; // Today for simplicity
      await db.promise().query(
        'INSERT INTO Donation (Donor_ID, Blood_Group, Quantity, Donation_Date, Location) VALUES (?, ?, ?, ?, ?)',
        [donor_id, donor[0].Blood_Group, 1, donationDate, 'Hospital (via urgent request)']
      );
      await db.promise().query(
        'INSERT INTO Blood_Inventory (Blood_Group, Quantity, Expiry_Date) VALUES (?, ?, DATE_ADD(?, INTERVAL 42 DAY)) ON DUPLICATE KEY UPDATE Quantity = Quantity + ?',
        [donor[0].Blood_Group, 1, donationDate, 1]
      );

      // Check if the request can now be fulfilled
      const [inventory] = await db.promise().query('SELECT Quantity FROM Blood_Inventory WHERE Blood_Group = ?', [request[0].Blood_Group]);
      const available = inventory.length > 0 ? inventory[0].Quantity : 0;
      if (available >= request[0].Quantity && request[0].Status === 'Pending') {
        await db.promise().query('UPDATE Blood_Request SET Status = "Approved" WHERE Request_ID = ?', [request_id]);
        await db.promise().query(
          'UPDATE Blood_Inventory SET Quantity = Quantity - ? WHERE Blood_Group = ?',
          [request[0].Quantity, request[0].Blood_Group]
        );
      }
    }

    res.status(200).json({ message: `Response ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Fetch Donation History for a Donor
router.get('/donations/:donor_id', async (req, res) => {
  const { donor_id } = req.params;

  try {
    const [donations] = await db.promise().query(
      'SELECT Donation_ID, Blood_Group, Quantity, Donation_Date, Location ' +
      'FROM Donation WHERE Donor_ID = ? ORDER BY Donation_Date DESC',
      [donor_id]
    );
    res.status(200).json(donations);
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Fetch Request History for a Recipient
router.get('/requests/:recipient_id', async (req, res) => {
  const { recipient_id } = req.params;

  try {
    const [requests] = await db.promise().query(
      'SELECT Request_ID, Blood_Group, Quantity, Urgency, Status, Request_Date ' +
      'FROM Blood_Request WHERE Recipient_ID = ? ORDER BY Request_Date DESC',
      [recipient_id]
    );
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching request history:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Admin: Get All Blood Inventory
router.get('/admin/inventory', async (req, res) => {
  try {
    const [inventory] = await db.promise().query(
      'SELECT Inventory_ID, Blood_Group, Quantity, Expiry_Date, Updated_At FROM Blood_Inventory ORDER BY Blood_Group'
    );
    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Admin: Update Blood Inventory
router.put('/admin/inventory/:inventory_id', async (req, res) => {
  const { inventory_id } = req.params;
  const { quantity, expiry_date } = req.body;

  try {
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be non-negative.' });
    }

    const [inventory] = await db.promise().query('SELECT * FROM Blood_Inventory WHERE Inventory_ID = ?', [inventory_id]);
    if (inventory.length === 0) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    await db.promise().query(
      'UPDATE Blood_Inventory SET Quantity = ?, Expiry_Date = ?, Updated_At = NOW() WHERE Inventory_ID = ?',
      [quantity, expiry_date, inventory_id]
    );

    res.status(200).json({ message: 'Inventory updated successfully.' });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Admin: Get All Pending Blood Requests with Donor Responses
router.get('/admin/requests', async (req, res) => {
  try {
    const [requests] = await db.promise().query(
      'SELECT br.Request_ID, br.Recipient_ID, br.Blood_Group, br.Quantity, br.Urgency, br.Status, br.Request_Date, ' +
      'r.Name AS Recipient_Name, r.Hospital_Name, ' +
      'GROUP_CONCAT(dr.Donor_ID, ":", dr.Status SEPARATOR ";") AS Donor_Responses ' +
      'FROM Blood_Request br ' +
      'JOIN Recipient r ON br.Recipient_ID = r.Recipient_ID ' +
      'LEFT JOIN Donor_Response dr ON br.Request_ID = dr.Request_ID ' +
      'WHERE br.Status IN ("Pending", "Approved") ' +
      'GROUP BY br.Request_ID ' +
      'ORDER BY br.Request_Date DESC'
    );

    const formattedRequests = requests.map(request => {
      const donorResponses = request.Donor_Responses
        ? request.Donor_Responses.split(';').map(response => {
            const [donorId, status] = response.split(':');
            return { donor_id: parseInt(donorId), status };
          })
        : [];
      return { ...request, Donor_Responses: donorResponses };
    });

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Admin: Approve or Reject Blood Request
router.put('/admin/requests/:request_id', async (req, res) => {
  const { request_id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  try {
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    const [request] = await db.promise().query('SELECT * FROM Blood_Request WHERE Request_ID = ?', [request_id]);
    if (request.length === 0) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request[0].Status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not in a pending state.' });
    }

    if (action === 'approve') {
      const [inventory] = await db.promise().query('SELECT Quantity FROM Blood_Inventory WHERE Blood_Group = ?', [request[0].Blood_Group]);
      const available = inventory.length > 0 ? inventory[0].Quantity : 0;
      if (available < request[0].Quantity) {
        return res.status(400).json({ message: 'Insufficient blood in inventory.' });
      }

      await db.promise().query('UPDATE Blood_Request SET Status = "Approved" WHERE Request_ID = ?', [request_id]);
      await db.promise().query(
        'UPDATE Blood_Inventory SET Quantity = Quantity - ? WHERE Blood_Group = ?',
        [request[0].Quantity, request[0].Blood_Group]
      );
    } else {
      await db.promise().query('UPDATE Blood_Request SET Status = "Rejected" WHERE Request_ID = ?', [request_id]);
    }

    res.status(200).json({ message: `Request ${action}d successfully.` });
  } catch (error) {
    console.error(`Error ${action}ing request:`, error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
