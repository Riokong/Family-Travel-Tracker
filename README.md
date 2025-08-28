# 🌍 Family Travel Tracker

A family-friendly web app to track countries visited by each member.  
Built with **Node.js, Express, PostgreSQL, and EJS**.

---

## ✨ Features
- 👨‍👩‍👧 Manage multiple family members with custom colors  
- 📍 Add countries visited (case-insensitive matching, with fallback search)  
- 🗺️ Interactive SVG world map with highlighted visited countries  
- 🚦 Prevents duplicate entries (per user)  
- 🎨 Simple, clean UI with color-coded tabs for each member  

---

## 📂 Project Structure
Family-Travel-Tracker/
│── public/ # Static files (CSS, images)
│ └── styles/ # Stylesheets
│── views/ # EJS templates (index.ejs, new.ejs)
│── index.js # Express server
│── countries.csv
│── package.json
│── queries.sql # Country codes & names
│── .gitignore
│── README.md

yaml
Copy code

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/Riokong/Family-Travel-Tracker.git
cd Family-Travel-Tracker
2. Install dependencies
bash
Copy code
npm install
3. Configure environment variables
Create a .env file in the project root:

env
Copy code
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=world
DB_PASSWORD=yourpassword
DB_PORT=5432
(Make sure .env is in .gitignore so your credentials are not pushed.)

4. Set up the database
Open psql (or your SQL client) and run:

sql
Copy code
-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'teal'
);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
  country_code TEXT PRIMARY KEY,
  country_name TEXT NOT NULL
);

-- Visited countries
CREATE TABLE IF NOT EXISTS visited_countries (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL REFERENCES countries(country_code) ON DELETE CASCADE,
  PRIMARY KEY (user_id, country_code)
);

Then import the countries.csv into the Countries table:


5. Run the server
bash
Copy code
npm start
Visit http://localhost:3000 in your browser 🎉