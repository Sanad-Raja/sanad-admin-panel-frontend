
import type { ApiResponse } from "@/types/apiResponse";
import type { ICampaignSettings, ICreateCampaignSettingsRequest, IUpdateCampaignSettingsRequest } from "@/types/campaignSettings.types";
import { ApiGet, ApiPost, ApiPut } from "../api-helper";

/* <----- Get Campaign Settings -----> */
export const getCampaignSettings = async () => {
    try {
        const result = await ApiGet<ApiResponse<ICampaignSettings>>(
            "/campaign-settings",
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Create Campaign Settings -----> */
export const createCampaignSettings = async (data: ICreateCampaignSettingsRequest) => {
    try {
        const result = await ApiPost<ApiResponse<ICampaignSettings>>(
            "/campaign-settings",
            data,
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Update Campaign Settings -----> */
export const updateCampaignSettings = async (data: IUpdateCampaignSettingsRequest) => {
    try {
        const result = await ApiPut<ApiResponse<ICampaignSettings>>(
            "/campaign-settings",
            data,
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
