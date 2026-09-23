// import { useCallback, useEffect, useState } from "react";
// import { getStudents } from "../services/student.service";

// const useStudents = () => {
//     const [students, setStudents] = useState([]);
//     const [pagination, setPagination] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const fetchStudents = useCallback(async (params = {}) => {
//         try {
//             setLoading(true);
//             setError(null);

//             const response = await getStudents(params);

//             setStudents(response.data?.students || []);
//             setPagination(response.data?.pagination || null);
//         } catch (err) {
//             setError(
//                 err.response?.data?.message ||
//                 "Failed to fetch students"
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchStudents();
//     }, [fetchStudents]);

//     return {
//         students,
//         pagination,
//         loading,
//         error,
//         fetchStudents,
//     };
// };

// export default useStudents;









// FILE PATH: frontend/src/features/students/hooks/useStudents.js

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getStudents } from "../services/student.service";

const useStudents = () => {
    const { isAdmin } = useAuth();

    const [students, setStudents] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudents = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            const response = await getStudents(params);

            setStudents(
                response.data?.students || []
            );

            setPagination(
                response.data?.pagination || null
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to fetch students"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        /*
         * ADMIN
         * Admin can see all students immediately.
         */
        if (isAdmin) {
            fetchStudents();
        }
    }, [isAdmin, fetchStudents]);

    return {
        students,
        pagination,
        loading,
        error,
        fetchStudents,
    };
};

export default useStudents;