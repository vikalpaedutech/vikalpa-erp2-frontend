import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getCallingTypes,
} from "../services/calling.service";


const useCallingTypes = () => {
    const [callingTypes, setCallingTypes] =
        useState([]);

    const [pagination, setPagination] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(null);


    const fetchCallingTypes =
        useCallback(async (params = {}) => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getCallingTypes(
                        params
                    );

                setCallingTypes(
                    response.data?.callingTypes ||
                    []
                );

                setPagination(
                    response.data?.pagination ||
                    null
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch calling types"
                );
            } finally {
                setLoading(false);
            }
        }, []);


    useEffect(() => {
        fetchCallingTypes({
            page: 1,
            limit: 20,
        });
    }, [fetchCallingTypes]);


    return {
        callingTypes,
        pagination,
        loading,
        error,
        fetchCallingTypes,
    };
};


export default useCallingTypes;