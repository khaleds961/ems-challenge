-- This file contains the SQL schema, it drops all tables and recreates them

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS timesheets;

CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo TEXT NULL,
    identty_card TEXT NULL,
    date_of_birth TEXT NOT NULL,
    cv TEXT NULL,
    job_title TEXT NOT NULL,
    department TEXT NOT NULL,
    salary REAL NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL
);

-- Create timesheets table
CREATE TABLE timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    summary TEXT NULL,
    employee_id INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
