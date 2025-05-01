CREATE DATABASE IF NOT EXISTS blood_donation;
USE blood_donation;

CREATE TABLE Donor (
  Donor_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100),
  Age INT,
  Gender VARCHAR(10),
  Blood_Group VARCHAR(5),
  Phone_Number VARCHAR(15),
  Email VARCHAR(100),
  Address TEXT,
  Health_Status VARCHAR(50)
);

CREATE TABLE Recipient (
  Recipient_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100),
  Age INT,
  Gender VARCHAR(10),
  Blood_Group_Required VARCHAR(5),
  Hospital_Name VARCHAR(100),
  Phone_Number VARCHAR(15),
  Quantity_Required INT
);
