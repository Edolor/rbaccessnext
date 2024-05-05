"use client";
import React, { useRef } from 'react';
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";

const studentToken = {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50aWQiOiJmYmFhMDU0OS05YTJhLTQwZmEtYTAyNi01MDIyMWYyOGRiZDciLCJmaXJzdE5hbWUiOiJqb2huIiwibGFzdE5hbWUiOiJzdGFtb3MiLCJ1cGRhdGVkQXQiOiIyMDI0LTA0LTI0VDE2OjE4OjA5LjM3OFoiLCJhY2NvdW50VHlwZSI6IlNUVURFTlQiLCJpYXQiOjE3MTQ5MTY0MzgsImV4cCI6MTcxNDkzMDgzOH0.7XIWJ7bqQWEhLEKDsHr0MQgnVEKVaRCl4IhfQh67HFw"
};

const teacherToken = {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50aWQiOiIwNDUwMWU1Ni0wODE0LTQyNjctYmI4Yy03Nzk2YmZjOGQ5MTIiLCJmaXJzdE5hbWUiOiJVbml2ZXJzYWwiLCJsYXN0TmFtZSI6Ikh1bWFuIiwidXBkYXRlZEF0IjoiMjAyNC0wNC0yNFQxNjoxOToxNy45MDlaIiwiYWNjb3VudFR5cGUiOiJURUFDSEVSIiwiaWF0IjoxNzE0OTE2NjE0LCJleHAiOjE3MTQ5MzEwMTR9.emIvZBIdrRK2W_9UGnsJtbIdlpbMLse6_fYMUrkRPgw"
};

function LoginPage() {
    const router = useRouter(); // Defining our router 

    // Defining our refs
    const studentRef = useRef<HTMLInputElement>(null);
    const teacherRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (studentRef.current?.checked) { // Student role is selected
            // Setting in Cookies
            setCookie("authTokens", JSON.stringify(studentToken), {
                maxAge: 60 * 60 * 3, // 1 week
                path: "/",
                sameSite: "strict",
            });

            // Push to Student Dashboard
            router.push("/student");
        } else if (teacherRef.current?.checked) { // Teacher role is selected
            // Setting in Cookies
            setCookie("authTokens", JSON.stringify(teacherToken), {
                maxAge: 60 * 60 * 3, // 1 week
                path: "/",
                sameSite: "strict",
            });

            // Push to Teacher Dashboard
            router.push("/teacher");
        }
    }

    return (
        <>
            <h1>Login Page</h1>

            <form method="post" onSubmit={handleSubmit}>
                <label htmlFor="student">Student</label>
                <input type="radio" name="role" id="student" ref={studentRef} />
                <br />

                <label htmlFor="teacher">Teacher</label>
                <input type="radio" name="role" id="teacher" ref={teacherRef} />
                <br />

                <button type="submit" className='bg-black p-4'>Login</button>
            </form>
        </>
    )
}

export default LoginPage