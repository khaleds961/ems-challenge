import { useLoaderData, Link, useParams } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }: { params: { timesheetId: string } }) {
  const db = await getDB();
  const timesheet = await db.get(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id 
     FROM timesheets 
     JOIN employees ON timesheets.employee_id = employees.id 
     WHERE timesheets.id = ?`,
    [params.timesheetId]
  );

  if (!timesheet) {
    throw new Response("Timesheet Not Found", { status: 404 });
  }

  return { timesheet };
}

export default function TimesheetPage() {
  const { timesheet } = useLoaderData() as { employee: any };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          TimeSheet Details (#{timesheet.id})
        </h1>


        {/* Timesheet Details */}
        <div className="space-y-4">

          {[
            { label: "Full Name", value: timesheet.full_name },
            { label: "Start Time", value: timesheet.start_time },
            { label: "End Time", value: timesheet.end_time },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between bg-gray-50 px-4 py-2 rounded-lg">
              <span className="font-medium text-gray-700">{label}:</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
          <Link
            to="/timesheets"
            className="bg-gray-100 text-blue-600 px-4 py-2 rounded-md shadow hover:bg-gray-200 transition font-medium flex items-center gap-2"
          >
            🔙 Back to Timesheets
          </Link>

          <Link
            to={`/timesheets/edit/${timesheet.id}`}
            className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md shadow hover:bg-yellow-200 transition font-medium flex items-center gap-2"
          >
            ✏️ Edit Timesheet
          </Link>

          <Link
            to={`/employees/${timesheet.employee_id}`}
            target="_blank"
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md shadow hover:bg-blue-200 transition font-medium flex items-center gap-2"
          >
             Employee Details
          </Link>
        </div>

      </div>
    </div>
  )
}
