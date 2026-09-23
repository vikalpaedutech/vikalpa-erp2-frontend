import apiClient from "../../../api/apiClient";


const BASE_URL =
  "/academic-management/class-interactions";


/*
|--------------------------------------------------------------------------
| CREATE
|--------------------------------------------------------------------------
*/

export const createClassInteraction =
  async (
    data
  ) => {

    const response =
      await apiClient.post(
        BASE_URL,
        data
      );

    return response.data;

  };


/*
|--------------------------------------------------------------------------
| GET CENTERS
|--------------------------------------------------------------------------
*/

export const getClassInteractionCenters =
  async () => {

    const response =
      await apiClient.get(
        `${BASE_URL}/centers`
      );

    return response.data;

  };


/*
|--------------------------------------------------------------------------
| GET CLASS INTERACTIONS
|--------------------------------------------------------------------------
*/

export const getClassInteractions =
  async (
    params = {}
  ) => {

    const response =
      await apiClient.get(
        BASE_URL,
        {
          params,
        }
      );

    return response.data;

  };


/*
|--------------------------------------------------------------------------
| GET REPORT
|--------------------------------------------------------------------------
*/

export const getClassInteractionReport =
  async (
    params = {}
  ) => {

    const response =
      await apiClient.get(
        `${BASE_URL}/report`,
        {
          params,
        }
      );

    return response.data;

  };


/*
|--------------------------------------------------------------------------
| EXPORT REPORT
|--------------------------------------------------------------------------
*/

export const exportClassInteractionReport =
  async (
    params = {}
  ) => {

    const response =
      await apiClient.get(
        `${BASE_URL}/report/export`,
        {
          params,

          responseType:
            "blob",
        }
      );

    return response;

  };