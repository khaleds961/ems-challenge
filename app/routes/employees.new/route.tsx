import { Form, redirect, type ActionFunction, useActionData } from "react-router";
import { useEffect, useState } from "react";
import { getDB } from "~/db/getDB";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.resolve("public/uploads");

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const date_of_birth = formData.get("date_of_birth")?.toString().trim();
  const job_title = formData.get("job_title")?.toString().trim();
  const department = formData.get("department")?.toString().trim();
  const salary = parseFloat(formData.get("salary")?.toString().trim() || "0");
  const start_date = formData.get("start_date")?.toString().trim();
  const end_date = formData.get("end_date")?.toString().trim();

  // files uploads
  const photo = formData.get("photo") as File;
  const identty_card = formData.get("identty_card") as File;

  const errors: Record<string, string> = {};

  // required fields
  if (!full_name) errors.full_name = "Full Name is required.";
  if (!email) errors.email = "Email is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!date_of_birth) errors.date_of_birth = "Date of Birth is required.";
  if (!job_title) errors.job_title = "Job title is required.";
  if (!department) errors.department = "Department is required.";
  if (!salary) errors.salary = "Salary is required.";
  if (!start_date) errors.start_date = "Start date is required.";

  //phone validity
  if(isNaN(phone) || phone?.length != 8) errors.phone = 'It should be a number with 8 digits.'

  // age is over 18
  const dob = new Date(date_of_birth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  if (age < 18) errors.date_of_birth = "Employee must be at least 18 years old.";

  // min salary is 800
  if (salary < 800) errors.salary = "Salary must be at least $800.";
  console.log([new Date(start_date),new Date(end_date)]);
  
  //end date should be greate than start date
  if (new Date(start_date) >= new Date(end_date)) {    
    errors.end_date = "End date should be greater than Start date";
  }
  // files validations
  if (photo) {
    const allowedImageTypes = ["image/jpeg", "image/png"];
    if (!allowedImageTypes.includes(photo.type)) {
      errors.photo = "Profile image must be a JPG or PNG.";
    }
  }

  if (identty_card) {
    if (identty_card.type !== "application/pdf") {
      errors.identty_card = "Identity file must be a PDF.";
    }
  }

  // return errors if any
  if (Object.keys(errors).length > 0) {
    return errors;
  }

   // Save Files to Disk
   let photoPath = null;
   let identityPath = null;
 
   if (photo) {
     photoPath = `/uploads/${Date.now()}_${photo.name}`;
     const imageBuffer = Buffer.from(await photo.arrayBuffer());
     await fs.writeFile(path.join(UPLOADS_DIR, path.basename(photoPath)), imageBuffer);
   }
 
   if (identty_card) {
     identityPath = `/uploads/${Date.now()}_${identty_card.name}`;
     const fileBuffer = Buffer.from(await identty_card.arrayBuffer());
     await fs.writeFile(path.join(UPLOADS_DIR, path.basename(identityPath)), fileBuffer);
   }

  const db = await getDB();
  await db.run(
    `INSERT INTO employees 
      (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date,photo, identty_card) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
    [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photoPath, identityPath]
  );

  return redirect("/employees");
};

export default function NewEmployeePage() {
  const errors = useActionData<Record<string, string>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (errors) {
      setIsSubmitting(false);
    }
  }, [errors]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          ➕ Create New Employee
        </h1>

        <Form method="post" encType="multipart/form-data" className="space-y-4" onSubmit={() => setIsSubmitting(true)}>
          {[
            { label: "Full Name", name: "full_name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Date of Birth", name: "date_of_birth", type: "date" },
            { label: "Job Title", name: "job_title", type: "text" },
            { label: "Department", name: "department", type: "text" },
            { label: "Salary (Min $800)", name: "salary", type: "number" },
            { label: "Start Date", name: "start_date", type: "date" },
            { label: "End Date", name: "end_date", type: "date", optional: true },
          ].map(({ label, name, type, optional }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-gray-700 font-medium">
                {label} {!optional && <span className="text-red-500">*</span>}
              </label>
              <input
                type={type}
                name={name}
                id={name}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 ${errors?.[name] ? "border-red-500" : ""
                  }`}
              />
              {errors?.[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}


          <div>
            <label htmlFor="photo" className="block text-gray-700 font-medium">
              Profile Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="photo"
              id="photo"
              accept="image/jpeg, image/png"
              className="w-full px-4 py-2 border rounded-lg shadow-sm"
            />
            {errors?.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          </div>

          {/* Identity PDF Upload */}
          <div>
            <label htmlFor="identty_card" className="block text-gray-700 font-medium">
              Identity Document (PDF) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="identty_card"
              id="identty_card"
              accept="application/pdf"
              className="w-full px-4 py-2 border rounded-lg shadow-sm"
            />
            {errors?.identty_card && <p className="text-red-500 text-sm mt-1">{errors.identty_card}</p>}
          </div>

          {/* Submit Button with Loader */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "✅ Create Employee"
            )}
          </button>
        </Form>

        {/* Navigation Links */}
        <div className="mt-6 flex justify-between">
          <a href="/employees" className="text-blue-600 hover:underline font-medium">
            🔙 Back to Employees
          </a>
          <a href="/timesheets" className="text-green-600 hover:underline font-medium">
            ⏳ View Timesheets
          </a>
        </div>
      </div>
    </div>
  );
}
