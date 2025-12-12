// Ansars Types

import { z } from "zod";
import type { ICampaign } from "./campaign.types";

export const notificationSchema = z.object({
    message: z.string().min(1, { message: "Message is required" }).max(500),
})

export type NotificationField = z.infer<typeof notificationSchema>
export interface IAnsarsRequest {
    searchText?: string | null; // userName, phone, region
    blocked?: boolean | null;
    countryCode?: string | null;
    sortBy?: {
        userName?: boolean | null;
        phone?: boolean | null;
        invitedUserCount?: boolean | null;
        campaignCreatedCount?: boolean | null;
        campaignDonatedCount?: boolean | null;
        campaignSharedCount?: boolean | null;
        // Region: boolean | null,
        // email: boolean | null,
        createdAt?: boolean | null;
    } | null;
    invitedUserCount?: number | null;
    campaignCreatedCount?: number | null;
    campaignDonatedCount?: number | null;
    campaignSharedCount?: number | null;
    createdAt?: {
        startDate?: string | null;
        endDate?: string | null;
    } | null;
    pageSize?: number;
    page?: number;
}

export interface IAnsar {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        phoneHash: string;
        paymentDetails: string;
        fcmToken: string;
        sendNotification: boolean;
        createdBy: string | null;
        blockedUserIds: { id: string, message: string }[];
        blockedByUserIds: string[];
        isBlockedByAdmin: boolean;
        reportedCampaigns: { campaignId: string, message: string }[];
        createdAt: string;
        updatedAt: string;
    };
    campaigns: ICampaign[];
    invitedUserCount: number;
    campaignCreatedCount: number;
    campaignDonatedCount: number;
    campaignSharedCount: number;
}

export interface IAnsarsResponse {
    users: IAnsar[];
    total: number;
}

