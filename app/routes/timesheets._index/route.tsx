import { Form, Link, redirect, useFetcher, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { getDB } from "~/db/getDB";
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'

import '@schedule-x/theme-default/dist/index.css'

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    "SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );

  return { timesheetsAndEmployees };
}

export async function action({ request }) {
  const formData = await request.formData();
  const timesheetId = formData.get("timesheetId");

  if (!timesheetId) {
    throw new Error("Invalid timesheet ID");
  }
  const db = await getDB();
  await db.run("DELETE FROM timesheets WHERE id = ?", [timesheetId]);
  return;
}

export default function TimesheetsPage() {
  const plugins = [createEventsServicePlugin()]
  const { timesheetsAndEmployees } = useLoaderData();
  const [view, setView] = useState("table");
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // filtering
  const filteredTimesheets = timesheetsAndEmployees.filter((timesheet) => {
    return (
      (timesheet.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
      .replace(",", "");
  };

  const calendar = useNextCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: timesheetsAndEmployees.map((timesheet) => (
      {
        'id': timesheet.id,
        'title': timesheet.full_name,
        start: formatDateTime(timesheet.start_time),
        end: formatDateTime(timesheet.end_time)
      }
    )),
  }, plugins)

  useEffect(() => {
    calendar?.eventsService?.getAll()
  }, [])

  const deleteTimeSheet = (timesheetId) => {
    if (!confirm("Are you sure you want to delete this timesheet?")) {
      return;
    }

    fetcher.submit(
      { timesheetId },
      { method: "post", action: "/timesheets" }
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg my-10 border border-gray-200">

      <div className="flex space-x-3 my-3">
        <Link
          to="/timesheets/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition"
        >
          ➕
          New Timesheet
        </Link>
        <Link
          to="/employees"
          className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition"
        >
          👥
          Employees
        </Link>
      </div>


      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Timesheets</h2>
      <div className="flex justify-end mb-4 space-x-2">
        <button
          type="button"
          onClick={() => setView("table")}
          className={`cursor-pointer px-4 py-2 rounded-lg transition ${view === "table" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 "}`}
        >
          Table View
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`cursor-pointer px-4 py-2 rounded-lg transition ${view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}
        >
          Calendar View
        </button>
      </div>

      {view === "table" ? (
        <div className="overflow-x-auto bg-gray-50 rounded-lg shadow">

          {/* Search Bar and Filter */}
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search timesheets..."
              className="border p-2 rounded-lg w-1/2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="border p-2 rounded-lg"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {Array.from(
                new Map(timesheetsAndEmployees.map((t) => [t.employee_id, t])) // Map ensures unique employee_id
                  .values()
              ).map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {employee.full_name}
                </option>
              ))}
            </select>

          </div>

          <table className="w-full border border-gray-200">
            <thead className="bg-blue-100">
              <tr className="text-gray-700">
                <th className="border border-gray-300 px-4 py-3">Timesheet ID</th>
                <th className="border border-gray-300 px-4 py-3">Employee</th>
                <th className="border border-gray-300 px-4 py-3">Start Time</th>
                <th className="border border-gray-300 px-4 py-3">End Time</th>
                <th className="border border-gray-300 px-4 py-3">Summary</th>
                <th className="border border-gray-300 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredTimesheets.map((timesheet) => (
                <tr key={timesheet.id} className="text-center hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{timesheet.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{timesheet.full_name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(timesheet.start_time).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(timesheet.end_time).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{timesheet.summary}</td>
                  <td className="flex flex-col md:flex-row border border-gray-300 px-4 py-2 space-y-2 md:space-y-0 md:space-x-2">

                    <Link to={`/timesheets/edit/${timesheet.id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-1 py-1 rounded-lg">✏️</Link>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded-lg cursor-pointer"
                      onClick={() => deleteTimeSheet(timesheet.id)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-700">
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      )}

      <hr className="my-6" />

    </div>
  );
}
