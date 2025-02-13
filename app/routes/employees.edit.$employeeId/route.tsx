import { useLoaderData, Form, Link, useParams, useActionData, redirect } from "react-router-dom";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.resolve("public/uploads");

export async function loader({ params }: { params: { employeeId: string } }) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);

  if (!employee) {
    throw new Response("Employee Not Found", { status: 404 });
  }

  return { employee };
}

export const action = async ({ request, params }: { request: Request, params: { employeeId: string } }) => {
  const formData = await request.formData();
  
  const database = await getDB();
  const employee = await database.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);

  const full_name = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const date_of_birth = formData.get("date_of_birth")?.toString().trim();
  const job_title = formData.get("job_title")?.toString().trim();
  const department = formData.get("department")?.toString().trim();
  const salary = parseFloat(formData.get("salary")?.toString().trim() || "0");
  const start_date = formData.get("start_date")?.toString().trim();
  const end_date = formData.get("end_date")?.toString().trim();

  const photo = formData.get("photo") as File;
  const identty_card = formData.get("identty_card") as File;

  const errors: Record<string, string> = {};

  // Validation
  if (!full_name) errors.full_name = "Full Name is required.";
  if (!email) errors.email = "Email is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!date_of_birth) errors.date_of_birth = "Date of Birth is required.";
  if (!job_title) errors.job_title = "Job title is required.";
  if (!department) errors.department = "Department is required.";
  if (!salary || salary < 800) errors.salary = "Salary must be at least $800.";
  if (!start_date) errors.start_date = "Start date is required.";

  const dob = new Date(date_of_birth);
  if (new Date().getFullYear() - dob.getFullYear() < 18) {
    errors.date_of_birth = "Employee must be at least 18 years old.";
  }

  let photoPath = employee.photo; 
  let identityPath = employee.identty_card;

  // Handle image upload
  if (photo && photo.size > 0) {
    const allowedImageTypes = ["image/jpeg", "image/png"];
    if (!allowedImageTypes.includes(photo.type)) {
      errors.photo = "Profile image must be a JPG or PNG.";
    } else {
      photoPath = `/uploads/${Date.now()}_${photo.name}`;
      const imageBuffer = Buffer.from(await photo.arrayBuffer());
      await fs.writeFile(path.join(UPLOADS_DIR, path.basename(photoPath)), imageBuffer);
    }
  }

  // Handle PDF upload
  if (identty_card && identty_card.size > 0) {
    if (identty_card.type !== "application/pdf") {
      errors.identty_card = "Identity file must be a PDF.";
    } else {
      identityPath = `/uploads/${Date.now()}_${identty_card.name}`;
      const fileBuffer = Buffer.from(await identty_card.arrayBuffer());
      await fs.writeFile(path.join(UPLOADS_DIR, path.basename(identityPath)), fileBuffer);
    }
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  const db = await getDB();

  await db.run(
    `UPDATE employees SET full_name = ?, email = ?, phone = ?, date_of_birth = ?, job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ?, photo = ?, identty_card = ? WHERE id = ?`,
    [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photoPath, identityPath, params.employeeId]
  );

  return redirect(`/employees/${params.employeeId}`);
};

export default function EditEmployeePage() {
  const { employee } = useLoaderData() as { employee: any };
  const errors = useActionData<Record<string, string>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (errors) {
      setIsSubmitting(false);
    }
  }, [errors]);

  const fields = [
    { label: "Full Name", value: "full_name" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Date Of Birth", value: "date_of_birth" },
    { label: "Job Title", value: "job_title" },
    { label: "Department", value: "department" },
    { label: "Salary", value: "salary" },
    { label: "Start Date", value: "start_date" },
    { label: "End Date", value: "end_date" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">✏️ Edit Employee</h1>

        <Form method="post" encType="multipart/form-data" className="space-y-4" onSubmit={() => setIsSubmitting(true)}>

          {fields.map(({ label, value }) => (
            <div key={value}>
              <label className="block text-gray-700 font-medium">{label}</label>
              <input
                type={value.includes("date") ? "date" : "text"}
                name={value}
                defaultValue={employee[value]}
                className="w-full px-4 py-2 border rounded-lg shadow-sm"
              />
              {errors?.[value] && <p className="text-red-500 text-sm mt-1">{errors[value]}</p>}
            </div>
          ))}


          {/* Existing Image */}
          {employee.photo && (
            <div>
              <p className="text-gray-700 font-medium">Uploaded Image:</p>
              <img src={employee.photo} alt="Profile" className="mt-2 w-32 h-32 object-cover rounded-lg" />
            </div>
          )}

          {/* Image Upload */}
          <label className="block text-gray-700 font-medium">Profile Image</label>
          <input type="file" name="photo" accept="image/jpeg, image/png" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
          {errors?.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}

          {/* Existing Identity PDF */}
          {employee.identty_card && (
            <div>
              <p className="text-gray-700 font-medium">Uploaded PDF:</p>
              <iframe src={employee.identty_card} title="Identity Document" className="mt-2 w-full h-64 rounded-lg border" />
              <a href={employee.identty_card} download className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Download PDF</a>
            </div>
          )}

          {/* Identity Upload */}
          <label className="block text-gray-700 font-medium">Identity Document (PDF)</label>
          <input type="file" name="identty_card" accept="application/pdf" className="w-full px-4 py-2 border rounded-lg shadow-sm" />
          {errors?.identty_card && <p className="text-red-500 text-sm mt-1">{errors.identty_card}</p>}

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center">
            {isSubmitting ? "Updating..." : "✅ Update Employee"}
          </button>
        </Form>

        <div className="mt-6 flex justify-between">
          <Link to="/employees" className="text-blue-600 hover:underline font-medium">🔙 Back to Employees</Link>
        </div>
      </div>
    </div>
  );
}
