// Campaigns API

import type { ApiResponse } from "@/types/apiResponse";
import type { ICampaignRequest, ICampaignResponse, IUpdateCampaignStatusRequest } from "@/types/campaign.types";
import { ApiDelete, ApiPost, ApiPostFormData, ApiPut, ApiPutFormData } from "../api-helper";


/* <----- Get All Campaigns -----> */
export const getAllCampaigns = async ({ page, pageSize, searchText, sortBy, ansarName, amountRequested, amountRaised, campaignDuration, status, type, createdAt, knownDuration }: ICampaignRequest) => {
    try {
        const result = await ApiPost<ApiResponse<ICampaignResponse>>(
            "/campaign/admin/get-all",
            { page, pageSize, searchText, sortBy, ansarName, amountRequested, amountRaised, campaignDuration, status, type, createdAt, knownDuration },
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Create Campaign -----> */
export const createCampaign = async (data: FormData) => {
    try {
        const result = await ApiPostFormData<ApiResponse<ICampaignResponse>>(
            "/campaign/create",
            data,
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Update Campaign -----> */
export const updateCampaign = async (data: FormData) => {
    try {
        const result = await ApiPutFormData<ApiResponse<ICampaignResponse>>(
            "/campaign/admin/update",
            data,
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Update Campaign Status -----> */
export const updateCampaignStatus = async (data: IUpdateCampaignStatusRequest) => {
    try {
        const result = await ApiPut<ApiResponse<ICampaignResponse>>(
            "/campaign/admin/update",
            data,
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


/* <----- Delete Campaign -----> */
export const deleteCampaign = async (campaignId: string) => {
    try {
        const result = await ApiDelete<ApiResponse<string>>(
            `/campaign/delete/${campaignId}`,
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Send Notification -----> */
export const sendCampaignNotification = async (campaignId: string, message: string) => {
    try {
        const result = await ApiPost<ApiResponse<string>>(
            `/campaign/admin/send-notification`,
            {
                campaignId,
                message
            }
        );
        return result;
    } catch (error) {
        throw error;
    }
}