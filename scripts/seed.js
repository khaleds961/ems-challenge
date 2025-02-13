import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: 'John Doe',
    email: 'johnDoe@gmail.com',
    phone: '70102030',
    date_of_birth: '1990-01-01',
    photo: null,
    identty_card: null,
    cv: null,
    job_title: 'Backend Developer',
    department: 'It',
    salary: 50000,
    start_date: '2024-01-01',
    end_date: '2025-01-01',
  },
  {
    full_name: 'Jane Smith',
    email: 'janeSmith@gmail.com',
    phone: '70200203',
    date_of_birth: '1994-01-01',
    photo: null,
    identty_card: null,
    cv: null,
    job_title: 'HR',
    department: 'Human Ressource',
    salary: 60000,
    start_date: '2024-02-01',
    end_date: null
  },
  {
    full_name: 'Alice Johnson',
    email: 'aliceJohnson@gmail.com',
    phone: '70400203',
    date_of_birth: '2000-01-01',
    photo: null,
    identty_card: null,
    cv: null,
    job_title: 'Front End Developer',
    department: 'IT',
    salary: 70000,
    start_date: '2023-02-01',
    end_date: '2025-02-01',
  },
];

const timesheets = [
  {
    employee_id: 1,
    start_time: '2025-02-09 08:00:00',
    end_time: '2025-02-09 17:00:00',
    summary: null
  },
  {
    employee_id: 1,
    start_time: '2025-02-10 08:00:00',
    end_time: '2025-02-10 17:00:00',
    summary: 'All tasks DONE',
  },
  {
    employee_id: 1,
    start_time: '2025-02-11 08:00:00',
    end_time: '2025-02-11 17:00:00',
    summary: 'All tasks DONE',
  },
  {
    employee_id: 2,
    start_time: '2025-02-11 12:00:00',
    end_time: '2025-02-11 17:00:00',
    summary: null
  },
  {
    employee_id: 3,
    start_time: '2025-02-12 07:00:00',
    end_time: '2025-02-12 16:00:00',
    summary: null
  },
];

const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});

