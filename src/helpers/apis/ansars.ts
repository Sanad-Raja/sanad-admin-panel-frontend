// Ansars API

import type { IAnsarsRequest, IAnsarsResponse } from "@/types/ansars.types";
import type { ApiResponse } from "@/types/apiResponse";
import { ApiDelete, ApiPost, ApiPut } from "../api-helper";

/* <----- Get All Ansars -----> */
export const getAllAnsars = async ({ page, pageSize, searchText, sortBy, blocked, createdAt, countryCode, campaignCreatedCount, campaignDonatedCount, campaignSharedCount, invitedUserCount }: IAnsarsRequest) => {
    try {
        const result = await ApiPost<ApiResponse<IAnsarsResponse>>(
            "/user/admin/get-all",
            {
                page,
                pageSize,
                searchText,
                sortBy,
                blocked,
                createdAt,
                countryCode,
                campaignCreatedCount,
                campaignDonatedCount,
                campaignSharedCount,
                invitedUserCount
            }
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Delete Ansar -----> */
export const deleteAnsar = async (userId: string) => {
    try {
        const result = await ApiDelete<ApiResponse<string>>(
            `/user/admin/delete/${userId}`
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Block Ansar -----> */
export const blockAnsar = async (userId: string) => {
    try {
        const result = await ApiPut<ApiResponse<string>>(
            `/user/admin/block/${userId}`,
            {}
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/* <----- Send Notification -----> */
export const sendNotification = async (userIds: string[], message: string) => {
    try {
        const result = await ApiPost<ApiResponse<string>>(
            `/user/admin/send-notification`,
            {
                userIds: userIds,
                message
            }
        );
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}