import { useCallback, useEffect, useState } from "react";

import {
    getCallLogs,
} from "../services/calling.service";


const useCallLogs = (initialParams = {}) => {
    const [callLogs, setCallLogs] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const fetchCallLogs = useCallback(
        async (params = {}) => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getCallLogs({
                        ...initialParams,
                        ...params,
                    });

                setCallLogs(
                    response.data?.callLogs || []
                );

                setPagination(
                    response.data?.pagination || null
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch call logs"
                );
            } finally {
                setLoading(false);
            }
        },
        [initialParams]
    );


    useEffect(() => {
        fetchCallLogs();
    }, [fetchCallLogs]);


    return {
        callLogs,
        pagination,
        loading,
        error,
        fetchCallLogs,
    };
};


export default useCallLogs;