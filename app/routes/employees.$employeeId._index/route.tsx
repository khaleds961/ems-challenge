import { spawn } from "child_process";
import { useLoaderData, Link, useParams } from "react-router-dom";
import { getDB } from "~/db/getDB";

export async function loader({ params }: { params: { employeeId: string } }) {

  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);
  console.log({ employee });

  if (!employee) {
    throw new Response("Employee Not Found", { status: 404 });
  }

  return { employee };
}

export default function EmployeePage() {
  const { employee } = useLoaderData() as { employee: any };
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          👤 Employee Details
        </h1>


        {/* Employee Details */}
        <div className="space-y-4">
          <div>
            <img src={employee.photo ?? '/uploads/no.jpeg'} alt="Profile" className="mt-2 w-32 h-32 object-cover rounded-lg" />
          </div>

          <div>
            {employee.identty_card ?
              <>
                <iframe src={employee.identty_card} title="Identity Document" className="mt-2 h-40 rounded-lg border" />
                <a href={employee.identty_card} download className="mt-2 inline-block px-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Download</a>
              </>
              : 
              <span className="text-white bg-red-600 p-2">No Identity Card Uploaded</span>
              }
          </div>

          {[
            { label: "Full Name", value: employee.full_name },
            { label: "Email", value: employee.email },
            { label: "Phone", value: employee.phone },
            { label: "Date of Birth", value: employee.date_of_birth },
            { label: "Job Title", value: employee.job_title },
            { label: "Department", value: employee.department },
            { label: "Salary", value: `$${employee.salary}` },
            { label: "Start Date", value: employee.start_date },
            { label: "End Date", value: employee.end_date || "Still Employed" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between bg-gray-50 px-4 py-2 rounded-lg">
              <span className="font-medium text-gray-700">{label}:</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <Link to="/employees" className="text-blue-600 hover:underline font-medium">
            🔙 Back to Employees
          </Link>
          <Link to={`/employees/edit/${employee.id}`} className="text-yellow-600 hover:underline font-medium">
            ✏️ Edit Employee
          </Link>
        </div>
      </div>
    </div>
  );
}
