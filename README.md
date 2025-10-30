# Blood Donation Management System

A comprehensive web application designed to streamline blood donation and request processes, connecting donors, recipients, and administrators in an efficient blood management ecosystem.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Blood Donation Management System is a full-stack web application that facilitates blood donation management through three distinct user roles: donors, recipients, and administrators. The system enables efficient scheduling of donations, processing of blood requests, real-time inventory management, and urgent request notifications.

## ✨ Features

### 👤 Donor Features
- User registration and authentication
- Schedule blood donations
- View complete donation history
- Receive and respond to urgent blood requests matching their blood group
- Search available blood inventory
- Real-time notification system

### 🏥 Recipient Features
- User registration and authentication
- Submit blood requests with urgency levels
- Track request status and history
- View available blood inventory

### 🔧 Admin Features
- Secure admin authentication
- Comprehensive blood inventory management
- Update blood quantities and expiry dates
- Approve or reject blood requests
- Monitor donor responses to urgent requests
- Dashboard for system oversight

### 🔔 Notification System
- Automatic notifications for urgent blood requests
- Blood group matching for targeted notifications
- Read/unread status tracking

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database management

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **JavaScript** - Interactivity

### Dependencies
```json
{
  "express": "^4.x.x",
  "mysql2": "^3.x.x",
  "bcrypt": "^5.x.x",
  "node-fetch": "^2.x.x",
  "dotenv": "^16.x.x"
}
```

## 📦 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)
- **Git** (optional) - [Download](https://git-scm.com/)
- **MySQL Workbench** or MySQL CLI for database management

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone [<repository-url>](https://github.com/Manoshankari78/BloodBank1.git)
cd BloodBank1
```

Or download and extract the project files to your desired location.

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Database Setup

#### Start MySQL Server
Ensure your MySQL server is running on your system.

#### Create Database
Connect to MySQL and create the database:

```bash
mysql -u <username> -p
```

```sql
CREATE DATABASE blood_donation;
```

#### Create Tables
Run the schema file to create all necessary tables:

```bash
mysql -u <username> -p blood_donation < database/schema.sql
```

Or manually execute the SQL commands from `database/schema.sql` in your MySQL client.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=blood_donation
PORT=3000
```

Replace the placeholders with your actual MySQL credentials.

### Register Admin User

Before accessing admin features, create an admin account:

1. **Create `register-admin.js`** in the root directory:

```javascript
const fetch = require('node-fetch');

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
```

2. **Start the server** in one terminal:

```bash
node server/app.js
```

3. **Run the script** in another terminal:

```bash
node register-admin.js
```

4. **Verify** the admin was created:

```sql
SELECT * FROM Admin;
```

## 🎮 Usage

### Start the Server

```bash
node server/app.js
```

Expected output:
```
🚀 Server is running at http://localhost:3000
✅ Connected to MySQL Database
```

### Access the Application

1. **Homepage**: Navigate to `http://localhost:3000`
2. **Register**: Go to `http://localhost:3000/register.html`
   - Choose Donor or Recipient
   - Fill out the registration form
3. **Login**: Go to `http://localhost:3000/login.html`
   - **Donors**: Use email and password
   - **Recipients**: Use phone number and password
   - **Admin**: Use username `admin` and password `admin123`

### Dashboard Features

#### Donor Dashboard
- View urgent blood request notifications
- Accept or decline urgent requests
- Schedule new donations
- View donation history
- Search blood inventory

#### Recipient Dashboard
- Submit blood requests (standard or urgent)
- Track request status
- View request history

#### Admin Dashboard
- Manage blood inventory (quantities and expiry dates)
- Approve or reject pending requests
- View donor responses to urgent requests
- Monitor system statistics

## 📊 Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `Donor` | Stores donor profiles and contact information |
| `Recipient` | Stores recipient profiles and contact information |
| `Admin` | Stores admin credentials (hashed passwords) |
| `Blood_Inventory` | Tracks available blood units by blood group |
| `Blood_Request` | Records all blood requests with status tracking |
| `Donation` | Logs scheduled and completed donations |
| `Notifications` | Manages urgent request notifications for donors |
| `Donor_Response` | Records donor responses to urgent requests |

## 🧪 Testing

### Test Donor Functionality
1. Register as a donor
2. Schedule a donation
3. Verify donation appears in history
4. Respond to an urgent request
5. Check notification status updates

### Test Recipient Functionality
1. Register as a recipient
2. Submit a blood request
3. Mark request as urgent
4. Verify request appears in history

### Test Admin Functionality
1. Login as admin
2. Update blood inventory quantities
3. Approve/reject blood requests
4. Verify database reflects changes
5. Check donor response logs

## 🔧 Troubleshooting

### Server Won't Start
- Verify `.env` file has correct database credentials
- Ensure MySQL server is running
- Confirm `blood_donation` database exists

### "Admin already exists" Error
```sql
DELETE FROM Admin WHERE Username = 'admin';
```
Then rerun `register-admin.js`

### "Table doesn't exist" Error
- Ensure `schema.sql` was executed successfully
- Verify all tables were created: `SHOW TABLES;`

### "fetch is not a function" Error
- Install node-fetch v2: `npm install node-fetch@2`
- Verify Node.js version compatibility

### Database Connection Issues
- Check MySQL service status
- Verify port 3306 is not blocked
- Test credentials with MySQL CLI

## 🔮 Future Enhancements

- [ ] **JWT Authentication** - Implement token-based authentication for enhanced security
- [ ] **Email/SMS Notifications** - Integrate Twilio/SendGrid for real-time alerts
- [ ] **Blood Bank Locations** - Add geolocation features for nearby donation centers
- [ ] **Analytics Dashboard** - Comprehensive reporting and data visualization
- [ ] **Mobile App** - React Native mobile application
- [ ] **API Documentation** - Swagger/OpenAPI documentation
- [ ] **Docker Support** - Containerization for easy deployment
- [ ] **CI/CD Pipeline** - Automated testing and deployment
- [ ] **Multi-language Support** - Internationalization (i18n)

## 📁 Project Structure

```
blood-donation-management-system/
├── database/
│   └── schema.sql              # Database schema
├── public/
│   ├── assets/
│   │   └── css/
│   │       └── styles.css      # Custom styles
│   ├── dashboard.html          # User dashboard
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   └── index.html              # Homepage
├── server/
│   ├── routes/
│   │   └── userRoutes.js       # API routes
│   ├── app.js                  # Express server
│   └── db.js                   # Database connection
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
└── README.md                   # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Built with ❤️ for the community

---

**Made with ❤️ by Manoshankari**
