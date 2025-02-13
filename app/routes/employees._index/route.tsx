import { useState } from "react";
import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees ORDER BY id DESC;");
  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterField, setFilterField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // search
  const filteredEmployees = employees.filter((employee) =>
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //sorting
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
  
    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    } else {
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });
  
  // pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        {/* Navigation Links */}
        <div className="my-8 flex justify-end space-x-4">
          <a
            href="/employees/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Add New Employee
          </a>
          <a
            href="/timesheets/"
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
          >
            ⏳ View Timesheets
          </a>

        </div>
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Employees</h1>

        {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search by Employee Name..."
          className="w-full p-2 mb-4 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* sort and filter */}
        <div className="flex justify-between mb-4">
          <select
            className="p-2 border rounded-md"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="job_title">Sort By Job Title</option>
            <option value="email">Sort By Email</option>
            <option value="full_name">Sort by Name</option>
          </select>
          <button
            className="p-2 bg-gray-300 rounded-md"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "⬆️ Ascending" : "⬇️ Descending"}
          </button>
        </div>
        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Full Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Job Title</th>
                <th className="py-3 px-6 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {paginatedEmployees.map((employee: any, index: number) => (
                <tr
                  key={employee.id}
                  className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
                >
                  <td className="py-3 px-6">{employee.id}</td>
                  <td className="py-3 px-6">{employee.full_name}</td>
                  <td className="py-3 px-6">{employee.email}</td>
                  <td className="py-3 px-6">{employee.job_title}</td>
                  <td className="py-3 px-6 flex space-x-3">
                    {/* View Button */}
                    <a
                      href={`/employees/${employee.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-1 rounded-lg text-sm"
                    >
                      👁
                    </a>

                    {/* Edit Button */}
                    <a
                      href={`/employees/edit/${employee.id}`}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-1 py-1 rounded-lg text-sm"
                    >
                      ✏️
                    </a>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* ⏩ Pagination */}
          <div className="flex justify-between mt-4">
            <button
              className="p-2 bg-gray-300 rounded-md"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ⬅️ Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="p-2 bg-gray-300 rounded-md"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
