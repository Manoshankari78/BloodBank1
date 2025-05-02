CREATE DATABASE IF NOT EXISTS blood_donation;
USE blood_donation;

-- Donors Table
CREATE TABLE Donor (
  Donor_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Age INT NOT NULL,
  Gender ENUM('Male', 'Female', 'Other') NOT NULL,
  Blood_Group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  Phone_Number VARCHAR(15) NOT NULL,
  Email VARCHAR(100) UNIQUE NOT NULL,
  Address TEXT NOT NULL,
  Health_Status VARCHAR(50) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipients Table
CREATE TABLE Recipient (
  Recipient_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Age INT NOT NULL,
  Gender ENUM('Male', 'Female', 'Other') NOT NULL,
  Phone_Number VARCHAR(15) UNIQUE NOT NULL,
  Hospital_Name VARCHAR(100) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Table
CREATE TABLE Admin (
  Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) UNIQUE NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blood Inventory Table
CREATE TABLE Blood_Inventory (
  Inventory_ID INT AUTO_INCREMENT PRIMARY KEY,
  Blood_Group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  Quantity INT NOT NULL DEFAULT 0,
  Expiry_Date DATE NOT NULL,
  Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (Blood_Group)
);

-- Blood Requests Table
CREATE TABLE Blood_Request (
  Request_ID INT AUTO_INCREMENT PRIMARY KEY,
  Recipient_ID INT,
  Blood_Group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  Quantity INT NOT NULL,
  Urgency BOOLEAN DEFAULT FALSE,
  Status ENUM('Pending', 'Approved', 'Fulfilled', 'Rejected') DEFAULT 'Pending',
  Request_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Recipient_ID) REFERENCES Recipient(Recipient_ID)
);

-- Donations Table
CREATE TABLE Donation (
  Donation_ID INT AUTO_INCREMENT PRIMARY KEY,
  Donor_ID INT,
  Blood_Group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  Quantity INT NOT NULL,
  Donation_Date DATE NOT NULL,
  Location VARCHAR(255),
  FOREIGN KEY (Donor_ID) REFERENCES Donor(Donor_ID)
);

-- Notifications Table
CREATE TABLE Notifications (
  Notification_ID INT AUTO_INCREMENT PRIMARY KEY,
  Donor_ID INT,
  Request_ID INT,
  Message TEXT NOT NULL,
  Is_Read BOOLEAN DEFAULT FALSE,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Donor_ID) REFERENCES Donor(Donor_ID),
  FOREIGN KEY (Request_ID) REFERENCES Blood_Request(Request_ID)
);

-- Donor Responses Table
CREATE TABLE Donor_Response (
  Response_ID INT AUTO_INCREMENT PRIMARY KEY,
  Donor_ID INT,
  Request_ID INT,
  Status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
  Response_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Donor_ID) REFERENCES Donor(Donor_ID),
  FOREIGN KEY (Request_ID) REFERENCES Blood_Request(Request_ID),
  UNIQUE (Donor_ID, Request_ID)
);