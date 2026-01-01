import { ArrowDown, ArrowUp, MoreHorizontal, Info } from "lucide-react";
import React, { useState } from "react";

import Pagination from "@/components/pagination/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    deleteCampaign,
    getAllCampaigns,
    updateCampaignStatus,
} from "@/helpers/apis/campaigns";
import queryClient from "@/helpers/query.config";
import { PAGE_SIZE, QUERY_KEY, campaignStatusOptions } from "@/lib/constans";
import { statusColors } from "@/lib/utils";
import type {
    CampaignStatus,
    CampaignType,
    ICampaign,
    IUpdateCampaignStatusRequest,
} from "@/types/campaign.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import CreateCampaignForm from "./CreateCampaignForm";
import dayjs from "dayjs";
import NotificationDialog from "./NotificationDialog";

interface CampaignsProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    setActiveTab: React.Dispatch<React.SetStateAction<"campaigns" | "ansars">>;
    searchAnsar: string;
    searchKnownDuration: string;
    searchAmountRequested: string;
    searchAmountRaised: string;
    searchDuration: string;
    searchStatus: string;
    searchType: string;
    rangeDate: { from: Date; to: Date } | null;
}

const Campaigns: React.FC<CampaignsProps> = ({
    searchQuery,
    setSearchQuery,
    setActiveTab,
    searchAnsar,
    searchKnownDuration,
    searchAmountRequested,
    searchAmountRaised,
    searchDuration,
    searchStatus,
    searchType,
    rangeDate,
}) => {
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<ICampaign | null>(
        null
    );

    const [editDialogVisible, setEditDialogVisible] = useState<{
        visible: boolean;
        data: ICampaign | null;
    }>({
        visible: false,
        data: null,
    });

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: true | false | null;
    }>({
        key: "",
        direction: null,
    });

    const [notificationDialogVisible, setNotificationDialogVisible] = useState<{
        visible: boolean;
        data: ICampaign | null;
    }>({
        visible: false,
        data: null,
    });

    // Handle sorting
    const requestSort = (key: string) => {
        let direction: true | false | null = true;

        if (sortConfig.key === key) {
            if (sortConfig.direction === true) {
                direction = false;
            } else if (sortConfig.direction === false) {
                direction = null;
            }
        }

        setSortConfig({ key, direction });
    };

    const campaigns = useQuery({
        queryKey: [
            QUERY_KEY.GET_CAMPAIGNS,
            pageSize,
            currentPage,
            searchQuery,
            searchAnsar,
            searchKnownDuration,
            sortConfig,
            searchAmountRequested,
            searchAmountRaised,
            searchDuration,
            searchStatus,
            searchType,
            rangeDate,
        ],
        queryFn: () =>
            getAllCampaigns({
                page: currentPage,
                pageSize: Number(pageSize),
                searchText: searchQuery,
                sortBy: {
                    campaignName:
                        sortConfig.key === "name" ? sortConfig.direction : null,
                    createdBy:
                        sortConfig.key === "createdBy"
                            ? sortConfig.direction
                            : null,
                    status:
                        sortConfig.key === "status"
                            ? sortConfig.direction
                            : null,
                    endDate:
                        sortConfig.key === "endDate"
                            ? sortConfig.direction
                            : null,
                    amountRequsted:
                        sortConfig.key === "amountRequested"
                            ? sortConfig.direction
                            : null,
                    knownDuration:
                        sortConfig.key === "knownDuration"
                            ? sortConfig.direction
                            : null,
                    campaignDuration:
                        sortConfig.key === "campaignDuration"
                            ? sortConfig.direction
                            : null,
                    type:
                        sortConfig.key === "type" ? sortConfig.direction : null,
                    amountRaised:
                        sortConfig.key === "amountRaised"
                            ? sortConfig.direction
                            : null,
                    createdAt:
                        sortConfig.key === "createdDate"
                            ? sortConfig.direction
                            : null,
                },
                ansarName: searchAnsar,
                knownDuration: searchKnownDuration,
                amountRequested: searchAmountRequested
                    ? Number(searchAmountRequested)
                    : undefined,
                campaignDuration: searchDuration
                    ? Number(searchDuration)
                    : undefined,
                amountRaised: searchAmountRaised
                    ? Number(searchAmountRaised)
                    : undefined,
                status:
                    searchStatus === "" || searchStatus === "all"
                        ? undefined
                        : ([searchStatus] as CampaignStatus[]),
                type:
                    searchType === "" || searchType === "all"
                        ? undefined
                        : ([searchType] as CampaignType[]),
                createdAt: rangeDate
                    ? {
                        startDate: dayjs(rangeDate.from).format("MM/DD/YYYY"),
                        endDate: dayjs(rangeDate.to).format("MM/DD/YYYY"),
                    }
                    : undefined,
            }),
    });

    const totalItems = Number(campaigns.data?.data?.total);

    const updateStatusMutation = useMutation({
        mutationFn: async (data: IUpdateCampaignStatusRequest) => {
            return await updateCampaignStatus(data);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GET_CAMPAIGNS],
            });
            toast.success("Campaign updated successfully");
        },
        onError: (error) => {
            console.error("Error updating campaign:", error);
        },
    });

    const handleStatusChange = (
        campaignId: string,
        newStatus: CampaignStatus
    ) => {
        try {
            const data: IUpdateCampaignStatusRequest = {
                campaignId,
                status: newStatus,
            };
            updateStatusMutation.mutate(data);
        } catch (error) {
            console.error("Error updating campaign status:", error);
        }
    };

    const deleteCampaignMutation = useMutation({
        mutationFn: async (campaignId: string) => deleteCampaign(campaignId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GET_CAMPAIGNS],
            });
            toast.success("Campaign deleted successfully");
            setDeleteDialogOpen(false);
            setCampaignToDelete(null);
        },
        onError: (error) => {
            console.error("Error deleting campaign:", error);
        },
    });

    const handleDeleteConfirm = () => {
        try {
            if (campaignToDelete?.id) {
                deleteCampaignMutation.mutate(campaignToDelete.id);
            }
        } catch (error) {
            console.error("Error deleting campaign:", error);
        }
    };

    // Get sort direction icon
    const getSortDirectionIcon = (key: string) => {
        if (sortConfig.key !== key) {
            return null;
        }

        if (sortConfig.direction === true) {
            return <ArrowUp className="ml-1 h-4 w-4" />;
        }

        if (sortConfig.direction === false) {
            return <ArrowDown className="ml-1 h-4 w-4" />;
        }

        return null;
    };

    return !campaigns?.data?.data?.campaigns ? (
        <p>Loading...</p>
    ) : campaigns?.data?.data?.campaigns &&
        campaigns.data?.data?.campaigns?.length > 0 ? (
        <>
            {campaigns.isLoading ? <p>Loading...</p> : <Card className="overflow-hidden p-0 h-full">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0 cursor-default"
                                    >
                                        ID
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() => requestSort("name")}
                                    >
                                        Name
                                        {getSortDirectionIcon("name")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() => requestSort("createdBy")}
                                    >
                                        Created By Ansar
                                        {getSortDirectionIcon("createdBy")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() => requestSort("status")}
                                    >
                                        Status
                                        {getSortDirectionIcon("status")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() => requestSort("endDate")}
                                    >
                                        End Date
                                        {getSortDirectionIcon("endDate")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() =>
                                            requestSort("amountRequested")
                                        }
                                    >
                                        Amount Requested
                                        {getSortDirectionIcon(
                                            "amountRequested"
                                        )}
                                    </Button>
                                </th>
                                <th className="p-3 text-left max-w-[200px]">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() =>
                                            requestSort("knownDuration")
                                        }
                                    >
                                        Known Duration
                                        {getSortDirectionIcon("knownDuration")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() =>
                                            requestSort("campaignDuration")
                                        }
                                    >
                                        Campaign Duration
                                        {getSortDirectionIcon(
                                            "campaignDuration"
                                        )}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() => requestSort("type")}
                                    >
                                        Type
                                        {getSortDirectionIcon("type")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() =>
                                            requestSort("amountRaised")
                                        }
                                    >
                                        Amount Raised
                                        {getSortDirectionIcon("amountRaised")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left max-w-[200px]">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0 cursor-default"
                                    >
                                        Description
                                    </Button>
                                </th>
                                <th className="p-3 text-left">
                                    <Button
                                        variant="ghost"
                                        className="font-medium flex items-center hover:bg-transparent pl-0"
                                        onClick={() =>
                                            requestSort("createdDate")
                                        }
                                    >
                                        Created Date
                                        {getSortDirectionIcon("createdDate")}
                                    </Button>
                                </th>
                                <th className="p-3 text-left font-medium text-sm pl-0">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns?.data?.data?.campaigns?.map(
                                (campaign) => (
                                    <tr
                                        key={campaign?.id}
                                        className="border-b hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="p-3 font-mono text-sm text-nowrap">
                                            {campaign?.id}
                                        </td>
                                        <td className="p-3 font-medium text-sm text-nowrap">
                                            {campaign?.title
                                                ? campaign?.title
                                                : "---"}
                                        </td>
                                        <td className="p-3">
                                            {campaign?.createdByUserName ? (
                                                <Badge
                                                    onClick={() => {
                                                        setSearchQuery(campaign?.createdBy);
                                                        setTimeout(() => {
                                                            setActiveTab("ansars");
                                                        }, 1000);
                                                    }}
                                                    variant="outline"
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                                                >
                                                    {
                                                        campaign?.createdByUserName
                                                    }
                                                </Badge>
                                            ) : (
                                                "---"
                                            )}
                                        </td>
                                        <td className="p-3 flex items-center gap-2">
                                            {campaign?.status ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className={`${statusColors(campaign?.status)} text-white text-xs h-8 hover:text-white`}
                                                        >
                                                            {campaign?.status}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        {campaignStatusOptions.map(
                                                            (status) => (
                                                                <DropdownMenuItem
                                                                    key={
                                                                        status.value
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            campaign?.id,
                                                                            status.value as CampaignStatus
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </DropdownMenuItem>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                "---"
                                            )}
                                            {campaign?.familiarDuration ===
                                                "I don't know them personally" && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="cursor-help">
                                                                    <Info className="h-5 w-5 text-red-500" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    I don't know
                                                                    them personally
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                        </td>
                                        <td className="p-3 text-sm text-nowrap">
                                            {campaign?.endDate
                                                ? dayjs(
                                                    campaign?.endDate
                                                ).format(
                                                    "MMM D, YYYY, h:mm A"
                                                )
                                                : "---"}
                                        </td>
                                        <td className="p-3 text-sm text-nowrap">
                                            {campaign?.totalAmount
                                                ? `$ ${campaign?.totalAmount}`
                                                : "---"}
                                        </td>
                                        <td
                                            className="p-3 text-sm text-nowrap"
                                            title={
                                                campaign?.familiarDuration &&
                                                campaign?.familiarDuration
                                            }
                                        >
                                            {campaign?.familiarDuration
                                                ? campaign?.familiarDuration
                                                : "---"}
                                        </td>
                                        <td className="p-3 text-sm text-nowrap">
                                            {campaign?.duration
                                                ? `${campaign?.duration} days`
                                                : "---"}
                                        </td>
                                        <td className="p-3 text-sm text-nowrap">
                                            {campaign?.type
                                                ? campaign?.type
                                                : "---"}
                                        </td>
                                        <td className="p-3 text-sm text-nowrap">
                                            {campaign?.amountRaised
                                                ? `$ ${campaign?.amountRaised}`
                                                : "---"}
                                        </td>
                                        <td
                                            className="p-3 text-sm text-nowrap max-w-[200px] truncate"
                                            title={
                                                campaign?.description &&
                                                campaign?.description
                                            }
                                        >
                                            {campaign?.description
                                                ? campaign?.description
                                                : "---"}
                                        </td>
                                        <td className="p-3 text-sm text-nowrap">
                                            {campaign.createdAt
                                                ? dayjs(
                                                    campaign?.createdAt
                                                ).format(
                                                    "MMM D, YYYY, h:mm A"
                                                )
                                                : "---"}
                                        </td>
                                        <td className="p-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setNotificationDialogVisible(
                                                                {
                                                                    data: campaign,
                                                                    visible:
                                                                        true,
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Send Notification
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setEditDialogVisible(
                                                                {
                                                                    data: campaign,
                                                                    visible:
                                                                        true,
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setCampaignToDelete(
                                                                campaign
                                                            );
                                                            setDeleteDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>}

            {/* Pagination */}
            <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => setPageSize(size as number)}
            />

            {/* Edit Campaign */}
            <CreateCampaignForm
                visible={editDialogVisible.visible}
                setVisible={(visible) =>
                    setEditDialogVisible({ ...editDialogVisible, visible })
                }
                data={editDialogVisible.data || undefined}
            />

            <NotificationDialog
                visible={notificationDialogVisible.visible}
                setVisible={(visible) =>
                    setNotificationDialogVisible({ ...notificationDialogVisible, visible })
                }
                data={notificationDialogVisible.data || undefined}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent className="md:!max-w-md">
                    <DialogHeader>
                        <DialogTitle>This Cannot be undone.</DialogTitle>
                        <DialogDescription>
                            Are you sure you wanna delete Campaign "
                            {campaignToDelete?.title}"
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    ) : (
        <div>
            <Card className="gap-0">
                <CardHeader className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-2xl text-center w-full font-bold">
                            No Campaigns Found
                        </CardTitle>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};

export default Campaigns;
