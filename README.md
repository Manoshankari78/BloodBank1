Blood Donation Management System
Overview
The Blood Donation Management System is a web application designed to streamline blood donation and request processes. It allows donors to schedule donations, recipients to request blood, and admins to manage blood inventory and approve requests. The system includes features like urgent request notifications, donation/request history, and admin functionality for inventory and request management.
Features

Donor Features:
Register and log in as a donor.
Schedule blood donations.
View donation history.
Respond to urgent blood requests (accept/decline).
Search for available blood in the inventory.


Recipient Features:
Register and log in as a recipient.
Request blood (with optional urgency).
View request history.


Admin Features:
Log in as an admin.
Manage blood inventory (view, update quantities, and expiry dates).
Approve or reject blood requests.
View donor responses to urgent requests.


Notifications:
Donors receive notifications for urgent blood requests matching their blood group.
Notifications can be marked as read.



Technologies Used

Backend: Node.js, Express.js
Database: MySQL
Frontend: HTML, CSS, JavaScript, Tailwind CSS
Dependencies:
express: Web framework for Node.js.
mysql2: MySQL client for Node.js.
bcrypt: Password hashing.
node-fetch: For making HTTP requests (used in scripts).
dotenv: For environment variable management.



Prerequisites
Before setting up the project, ensure you have the following installed:

Node.js (v14 or higher): Download
MySQL: Download
VS Code (recommended for development): Download
A MySQL client (e.g., MySQL Workbench or the MySQL CLI) to manage the database.

Project Structure
blood-donation-management-system/
├── database/
│   └── schema.sql          # Database schema for creating tables
├── public/
│   ├── assets/
│   │   └── css/
│   │       └── styles.css  # Custom CSS styles
│   ├── dashboard.html      # User dashboard (donor, recipient, admin)
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   └── index.html          # Homepage
├── server/
│   ├── routes/
│   │   └── userRoutes.js   # API routes for user actions
│   ├── app.js              # Main server file
│   └── db.js               # Database connection setup
├── .env                    # Environment variables (e.g., database credentials)
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation

Setup Instructions
1. Clone the Repository
If you have the project in a Git repository, clone it:
git clone <repository-url>
cd blood-donation-management-system

If you’re not using Git, ensure your project files are in D:\blood-donation-management-system.
2. Install Dependencies
Install the required Node.js packages:
npm install

This will install express, mysql2, bcrypt, node-fetch, and other dependencies listed in package.json.
3. Set Up the MySQL Database

Start MySQL: Ensure your MySQL server is running.
Create the Database:
Connect to MySQL:mysql -u <username> -p

Enter your password.
Create the database:CREATE DATABASE blood_donation;




Create Tables:
Run the schema.sql file to create the necessary tables:mysql -u <username> -p blood_donation < database/schema.sql


Alternatively, copy the contents of schema.sql and run them in your MySQL client.



4. Configure Environment Variables
Create a .env file in the root directory with the following content:
DB_HOST=localhost
DB_USER=<your-mysql-username>
DB_PASSWORD=<your-mysql-password>
DB_NAME=blood_donation
PORT=3000

Replace <your-mysql-username> and <your-mysql-password> with your MySQL credentials.
5. Register an Admin User
Before using the admin functionality, you need to register an admin user.

Create a Script:
Create a file named register-admin.js in the root directory with the following content:const fetch = require('node-fetch');

async function registerAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/users/register/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error registering admin:', error);
  }
}

registerAdmin();




Run the Script:
Start the server in one terminal:node server/app.js


In another terminal, run the script:node register-admin.js


You should see:{ message: 'Admin registered successfully.' }




Verify in Database:
Check the Admin table:SELECT * FROM Admin;





6. Start the Server
Run the server:
node server/app.js

You should see:
🚀 Server is running at http://localhost:3000
✅ Connected to MySQL Database

Usage
1. Access the Application

Open your browser and go to http://localhost:3000.
You’ll see the homepage (index.html) with options to register or log in.

2. Register Users

Navigate to http://localhost:3000/register.html.
Register as a Donor or Recipient by filling out the form.

3. Log In

Go to http://localhost:3000/login.html.
Log in as:
Donor: Use the email and password you registered with.
Recipient: Use the phone number and password you registered with.
Admin: Use username: admin and password: admin123 (or the credentials you set).



4. Dashboard Features

Donor Dashboard:
View notifications for urgent blood requests.
Respond to urgent requests (accept/decline).
Schedule a donation.
View donation history.
Search for available blood.


Recipient Dashboard:
Request blood (with optional urgency).
View request history.


Admin Dashboard:
Manage blood inventory (update quantities and expiry dates).
Approve or reject pending blood requests.
View donor responses to urgent requests.



Testing

Donor:
Register and log in as a donor.
Schedule a donation and verify it appears in the donation history.
Respond to an urgent request and check the updated notification status.


Recipient:
Register and log in as a recipient.
Submit a blood request and verify it appears in the request history.


Admin:
Log in as an admin.
Update blood inventory and check the database.
Approve/reject a blood request and verify the status updates.



Database Schema
The database schema (database/schema.sql) includes the following tables:

Donor: Stores donor information.
Recipient: Stores recipient information.
Admin: Stores admin credentials.
Blood_Inventory: Tracks available blood by blood group.
Blood_Request: Stores blood requests from recipients.
Donation: Stores scheduled donations by donors.
Notifications: Stores notifications for donors.
Donor_Response: Tracks donor responses to urgent requests.

Troubleshooting

Server Fails to Start:
Check your .env file for correct database credentials.
Ensure MySQL is running and the blood_donation database exists.


"Admin already exists":
Delete the existing admin user:DELETE FROM Admin WHERE Username = 'admin';


Rerun register-admin.js.


"Table doesn't exist":
Ensure you ran schema.sql to create all tables.


"fetch is not a function":
Ensure node-fetch is installed (npm install node-fetch@2).
Verify the script uses the correct import for your Node.js version.



Future Enhancements

JWT Authentication: Add token-based authentication to secure API endpoints.
Email/SMS Notifications: Send notifications via email or SMS for urgent requests.
Deployment: Deploy the application to a platform like Render or Heroku.

Contributing
Feel free to fork this project, submit issues, or create pull requests. Contributions are welcome!
License
This project is licensed under the MIT License.
