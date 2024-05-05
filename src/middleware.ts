import { deleteCookie, hasCookie } from "cookies-next";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

export type UserEnumTypes = "STUDENT" | "TEACHER" | "ADMIN"; // Add more User Roles at will

export type Tokens = { // Actual Token Type
    access: string;
    refresh?: string;
}

export type UserType = { // Payload when decrypted from JWT
    accountType: UserEnumTypes;
    accountid: string;
    exp: number;
    firstName?: string;
    iat: number;
    lastName?: string;
    updatedAt: string;
}

const loginUrls = [ // Re-route after USER is authenticated
    "/login",
    // Add routes that should not be accessible when logged in here
];

const studentUrls = [ // URLS meant for students only
    "/student",
    // Add more protected routes here
];

const teacherUrls = [ // URLS meant for teachers only
    "/teacher",
    // Add more protected routes here
];

const protectedRoutes = [...studentUrls, ...teacherUrls]; // Add all protected URLS here

export default function middleware(req: NextRequest) {
    const res = NextResponse.next();
    let isAuthenticated = false;
    let userType: UserEnumTypes = "STUDENT"; // Default
    const BASE_FRONTEND_URL = req.nextUrl.origin;
    const CURRENT_URL_PATHNAME = req.nextUrl.pathname;

    // First page a user will see(Redirected to) when they login based on role
    const DASHBOARDS = {
        student: "/student",
        teacher: "/teacher",
        // Can and might be a dashboard page or any other
    }

    // Checking that cookie exists and handling it
    if (hasCookie("authTokens", { cookies })) {
        let authTokens = req.cookies.get('authTokens')?.value // Get cookies using Key(authTokens)
        
        if (authTokens && authTokens !== null && authTokens !== "{}") { // Checking for empty cookies
            const tokens = JSON.parse(authTokens) as Tokens; // Casting to actual Token Type
            const accessToken = tokens?.access; // Getting the access token

            if (accessToken) {
                // Decoding Payload from access Token
                const data = jwtDecode(accessToken) as UserType;

                // Checking for Token expiry
                const isExpired = dayjs.unix(data.exp as number).diff(dayjs()) < 1;

                // If token is not expired set (isAuthenticated to True)
                if (!isExpired) {
                    userType = data.accountType as UserEnumTypes;
                    isAuthenticated = true;  
                } else {
                    // Logout user if Token has expired 
                    // (Deleted three times because I have trust issues)
                    req.cookies.delete("authTokens");
                    deleteCookie("authTokens");
                    cookies().delete("authTokens");
                }
            }
        }
    }

    // Check if the current path has a matching route
    /**
     * E.g
     * currentRoute == "/student/remarks"
     */
    const hasRoute = (routes: Array<string>, currentPath: string) => {
        let isValid = false;

        routes.map(route => {
            if (currentPath.includes(route)) {
                isValid = true;
            }
        });

        return isValid;
    }

    // Builds URL to be returned
    const buildUrl = (route: string) => {
        const absoluteURL = new URL(route, BASE_FRONTEND_URL);
        return absoluteURL.toString();
    }

    // IF USER IS UNATHENTICATED AND TRIES TO access a PROTECTED ROUTE (REDIRECTION)
    if (!isAuthenticated && hasRoute(protectedRoutes, CURRENT_URL_PATHNAME)) {
        return NextResponse.redirect(buildUrl("/login")); // SWAP FOR YOUR BASE LOGIN URL
    }

    // Access control based on user type for protected routes:
    // - Check if the user is authenticated
    // - Check if the current path matches the protected routes
    // - Redirect based on user type:
    //   - If userType is STUDENT and the current path is not in studentUrls, redirect to student dashboard
    //   - If userType is TEACHER and the current path is not in teacherUrls, redirect to teacher dashboard
    if (isAuthenticated && hasRoute(protectedRoutes, CURRENT_URL_PATHNAME)) {
        switch (userType) {
            case "TEACHER":
                if (!hasRoute(teacherUrls, CURRENT_URL_PATHNAME)) {
                    return NextResponse.redirect(buildUrl(DASHBOARDS.teacher));
                }
                break;
            case "STUDENT":
                if (!hasRoute(studentUrls, CURRENT_URL_PATHNAME)) {
                    return NextResponse.redirect(buildUrl(DASHBOARDS.student));
                }
                break;

            // Add more -CASES- as you need
            default: // Random fallback if all cases fail (DO AS YOU WISH)
                return NextResponse.redirect(buildUrl(DASHBOARDS.student));
        }
    }

    // BLocking access to Login URLS when authenticated
    if (isAuthenticated && hasRoute(loginUrls, CURRENT_URL_PATHNAME)) {
        if (userType === "STUDENT") {
            return NextResponse.redirect(buildUrl(DASHBOARDS.student));
        } else if (userType === "TEACHER" ) {
            return NextResponse.redirect(buildUrl(DASHBOARDS.teacher));
        }

        // ADD MORE TYPES AS YOU WISH
    }

    return res;
}