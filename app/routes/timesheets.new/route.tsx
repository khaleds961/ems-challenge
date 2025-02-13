import { useLoaderData, Form, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get('summary');

  const errors: Record<string, string> = {};


  //validation
  if(!start_time) errors.start_time = 'Start time is Required.'
  if(!end_time) errors.end_time = 'End time is Required.'
  if (new Date(start_time) >= new Date(end_time)) {
    errors.time = "End time should be greater than Start Time";
  }
  
  if (Object.keys(errors).length > 0) {
    return errors;
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time,summary) VALUES (?, ?, ?,?)",
    [employee_id, start_time, end_time,summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const errors = useActionData<Record<string, string>>();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">Create New Timesheet</h1>
        
        <Form method="post" className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label htmlFor="employee_id" className="block text-gray-600 font-medium mb-1">
              Select Employee
            </label>
            <select
              name="employee_id"
              id="employee_id"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-300"
            >
              <option value="" disabled>Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time Input */}
          <div>
            <label htmlFor="start_time" className="block text-gray-600 font-medium mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              name="start_time"
              id="start_time"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
            {errors?.start_time && (
                <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
              )}
            {errors?.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time}</p>
              )}
          </div>

          {/* End Time Input */}
          <div>
            <label htmlFor="end_time" className="block text-gray-600 font-medium mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              name="end_time"
              id="end_time"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
            {errors?.end_time && (
                <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
              )}
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className="block text-gray-600 font-medium mb-1">
              Summary
            </label>
            <input
              type="text"
              name="summary"
              id="summary"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 focus:border-blue-500 focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Create Timesheet
          </button>
        </Form>

        {/* Navigation Links */}
        <hr className="my-6 border-gray-300" />
        <div className="flex justify-between">
          <a href="/timesheets" className="text-blue-500 hover:underline">
            View Timesheets
          </a>
          <a href="/employees" className="text-blue-500 hover:underline">
            View Employees
          </a>
        </div>
      </div>
    </div>
  );
}
