import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getCallingDetails,
} from "../services/calling.service";


const useCallingDetails = () => {
    const [callingDetails, setCallingDetails] =
        useState([]);

    const [pagination, setPagination] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    const fetchCallingDetails =
        useCallback(async (params = {}) => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getCallingDetails(
                        params
                    );

                setCallingDetails(
                    response.data?.callingDetails ||
                    []
                );

                setPagination(
                    response.data?.pagination ||
                    null
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch calling details"
                );
            } finally {
                setLoading(false);
            }
        }, []);


    useEffect(() => {
        fetchCallingDetails({
            page: 1,
            limit: 20,
        });
    }, [fetchCallingDetails]);


    return {
        callingDetails,
        pagination,
        loading,
        error,
        fetchCallingDetails,
    };
};


export default useCallingDetails;