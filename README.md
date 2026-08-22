# Odoo_hackthon_NIMT
OUR FIRST HACKATHON IN FIRST YEAR.</br>
100% AI</br>
1:MOHAMMAD RAZA NIZAMI </br>
2:MD REHAN </br>
3:SYED YASIN AHMAD</br>
4:RHYTHM
# 🏢 Our Hackathon Project: A Simple HRMS

Hey there! Welcome to our project repository. We built a **Human Resource Management System (HRMS)** designed to take the headache out of everyday workplace operations.

Instead of juggling clunky spreadsheets, paper leave forms, and scattered emails, our platform brings everything—onboarding, profiles, attendance tracking, leave requests, and payroll—into one clean, secure dashboard.

## 🔗 Quick Links
* **See it live:** file:///C:/Users/raza_/Downloads/front.html

---

## 👥 Who is this for? (Role-Based Access)
We designed the app with two distinct user experiences in mind, keeping data secure and permissions clear:

1. **👑 Admin / HR Officers:** The power users. They can manage the employee roster, approve or reject time-off requests, look at company-wide attendance, update salary structures, and see high-level analytics.
2. **👤 Employees:** The team members. They get a private dashboard to view their profile, check in/out for the day, see their own attendance history, request leave, and securely view their salary slips.

---

## 🛠️ What We Built (Features)

### 🔐 1. Smart Auth & Onboarding
* **Sign Up:** Users can register using their Employee ID, email, a secure password, and their designated role. 
* **Security & Verification:** We built in password strength validation and an email verification step to make sure only authorized team members get in.
* **Sign In:** Simple login workflow. If you mess up your password, you get a clear error message. If you get it right, you're immediately routed to your specific dashboard.

### 📊 2. Custom Dashboards
* **For Employees:** A clean grid featuring quick-access cards to check their profile, look at their attendance, submit a leave request, or securely log out. It also shows a small feed of recent activity.
* **For Admins:** A macro view of the company showing the full employee directory, comprehensive attendance logs, and a dynamic queue of pending leave requests waiting for a decision.

### 👤 3. Profile Management
* Everyone gets a comprehensive digital profile displaying personal details, job roles, salary breakdown, relevant documents, and a profile picture.
* **Permissions:** Employees can update minor things like their phone number, home address, or profile picture. Admins have absolute override power to edit any field if needed.

### ⏱️ 4. Attendance & Check-Ins
* Features both daily and weekly log views.
* Employees get a simple, accessible button to **Check-In** and **Check-Out** each day.
* Every day is tracked with a specific status tag: `Present`, `Absent`, `Half-day`, or `Leave`. Employees can only see their own tracking history, while HR can audit everyone.

### 🌴 5. Hassle-Free Leave Management
* **Applying:** Employees can pick a leave type (`Paid`, `Sick`, `Unpaid`), select their dates on a calendar, add a brief note explaining why they need the time off, and submit it.
* **Approving:** Admins see these requests instantly. They can hit approve or reject, type out some feedback comments, and the changes reflect instantly on the employee's side.

### 💰 6. Payroll & Reporting
* **Data Integrity:** Salary details are 100% read-only for regular employees so nobody can alter their own pay.
* **Admin Controls:** Admins can adjust the baseline salary structure and ensure numbers are accurate.
* **Extras:** The system generates automated email notifications and visual reports like downloadable attendance sheets and salary slips.

---

## 💻 The Tech Stack
*We put this together using:*
* **Frontend:** [e.g., React / Next.js / Tailwind CSS]
* **Backend:** [e.g., Node.js / FastAPI / Express]
* **Database:** [e.g., MongoDB / PostgreSQL]
* **Auth:** [e.g., JWT / Firebase / Clerk]

---

## 🏃‍♂️ How to Run it Locally

Want to test it out on your own machine? Follow these quick steps:

### Prerequisites
Make sure you have Node.js (or Python, depending on your setup) and git installed.

### Setup Steps
1. **Clone this repo:**
   ```bash
   git clone https://github.com
   cd your-repo-name
   ```
2. **Install the dependencies:**
   ```bash
   npm install   # or pip install -r requirements.txt
   ```
3. **Set up your environment variables:**
   Create a `.env` file in the root directory and add your keys (never commit these to GitHub!):
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_secret_key
   ```
4. **Fire up the development server:**
   ```bash
   npm run dev   # or python main.py
   ```

---

## 🧠 What We Learned & Hurdles We Faced
* **The Permission Puzzle:** Building the backend middleware to strictly separate what an Employee can see versus what an Admin can see was tricky, but we successfully locked down the data boundaries.
* **Real-time State Changes:** Getting the employee dashboard to update the absolute moment an HR officer approves a leave request—without making the user manually refresh the entire webpage—took some creative coding!

## 🚀 Next Steps (If we had more time)
* [ ] Add **Geolocation/Biometric tracking** to the check-in feature so people can't "proxy check-in" for their friends.
* [ ] Build an automated tax-bracket calculator into the payroll engine.
* [ ] Create visual charts analyzing team-by-team burnout risks based on who hasn't taken leave in a while.

---
<p align="center">Built with a lot of hardwork and hurry by Your Team </p>
