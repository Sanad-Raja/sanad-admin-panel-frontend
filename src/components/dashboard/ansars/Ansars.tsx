import Pagination from "@/components/pagination/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { blockAnsar, deleteAnsar, getAllAnsars } from "@/helpers/apis/ansars";
import queryClient from "@/helpers/query.config";
import useDebounce from "@/hooks/useDebounce";
import { PAGE_SIZE, QUERY_KEY } from "@/lib/constans";
import type { IAnsar } from "@/types/ansars.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import SendNotification from "./SendNotification";

interface AnsarsProps {
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
        setActiveTab: React.Dispatch<React.SetStateAction<"campaigns" | "ansars">>;
    searchQuery: string;
    status: boolean | null;
    rangeDate: { from: Date; to: Date } | null;
    selectedRows: IAnsar[];
    setSelectedRows: React.Dispatch<React.SetStateAction<IAnsar[]>>;
    countryCode: string | null;
    invitedUserCount: number | undefined;
    campaignSharedCount: number | undefined;
    campaignDonatedCount: number | undefined;
    campaignCreatedCount: number | undefined;
}

const Ansars: React.FC<AnsarsProps> = ({
    setSearchQuery,
    setActiveTab,
    searchQuery,
    status,
    rangeDate,
    selectedRows,
    setSelectedRows,
    countryCode,
    invitedUserCount,
    campaignSharedCount,
    campaignDonatedCount,
    campaignCreatedCount,
}) => {
    const debouncedSearch = useDebounce(searchQuery, 1000);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [currentPage, setCurrentPage] = useState(1);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [ansar, setAnsar] = useState<IAnsar | null>(null);

    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [sendNotificationDialogOpen, setSendNotificationDialogOpen] =
        useState(false);

    // Sorting state
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        direction: true | false | null;
    }>({
        key: "",
        direction: null,
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

    const ansarsData = useQuery({
        queryKey: [
            QUERY_KEY.GET_ANSARS,
            currentPage,
            pageSize,
            debouncedSearch,
            sortConfig,
            status,
            rangeDate,
            countryCode,
            invitedUserCount,
            campaignSharedCount,
            campaignDonatedCount,
            campaignCreatedCount,
        ],
        queryFn: () =>
            getAllAnsars({
                page: currentPage,
                pageSize: Number(pageSize),
                searchText: debouncedSearch,
                sortBy: {
                    userName:
                        sortConfig.key === "name" ? sortConfig.direction : null,
                    phone:
                        sortConfig.key === "phone"
                            ? sortConfig.direction
                            : null,
                    invitedUserCount:
                        sortConfig.key === "invitedUsersCount"
                            ? sortConfig.direction
                            : null,
                    campaignCreatedCount:
                        sortConfig.key === "campaignsCreatedCount"
                            ? sortConfig.direction
                            : null,
                    campaignDonatedCount:
                        sortConfig.key === "campaignsDonatedCount"
                            ? sortConfig.direction
                            : null,
                    campaignSharedCount:
                        sortConfig.key === "sharedCount"
                            ? sortConfig.direction
                            : null,
                    createdAt:
                        sortConfig.key === "createdDateTime"
                            ? sortConfig.direction
                            : null,
                },
                blocked: status,
                createdAt: rangeDate
                    ? {
                          startDate: dayjs(rangeDate.from).format("MM/DD/YYYY"),
                          endDate: dayjs(rangeDate.to).format("MM/DD/YYYY"),
                      }
                    : undefined,
                countryCode: countryCode,
                invitedUserCount: invitedUserCount,
                campaignSharedCount: campaignSharedCount,
                campaignDonatedCount: campaignDonatedCount,
                campaignCreatedCount: campaignCreatedCount,
            }),
    });

    const totalItems = Number(ansarsData.data?.data?.total);

    const deleteAnsarsMutation = useMutation({
        mutationFn: async (userId: string) => deleteAnsar(userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GET_ANSARS],
            });
            toast.success("Ansars deleted successfully");
            setDeleteDialogOpen(false);
            setAnsar(null);
        },
        onError: (error) => {
            console.error("Error deleting ansars:", error);
        },
    });

    const handleDeleteConfirm = () => {
        try {
            if (ansar?.user?.id) {
                deleteAnsarsMutation.mutate(ansar.user.id);
            }
        } catch (error) {
            console.error("Error deleting ansars:", error);
        }
    };

    const blockAnsarsMutation = useMutation({
        mutationFn: async (userId: string) => blockAnsar(userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.GET_ANSARS],
            });
            toast.success(
                `Ansars ${ansar?.user?.isBlockedByAdmin ? "unblocked" : "blocked"} successfully`
            );
            setBlockDialogOpen(false);
            setAnsar(null);
        },
        onError: (error) => {
            console.error("Error blocking ansars:", error);
        },
    });

    const handleBlockConfirm = () => {
        try {
            if (ansar?.user?.id) {
                blockAnsarsMutation.mutate(ansar.user.id);
            }
        } catch (error) {
            console.error("Error blocking ansars:", error);
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

    const handleSelectAll = () => {
        if (selectedRows.length === ansarsData.data?.data?.users?.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(
                ansarsData.data?.data?.users?.map((ansar) => ansar) || []
            );
        }
    };

    const handleSelectRow = (ansar: IAnsar) => {
        if (selectedRows.includes(ansar)) {
            setSelectedRows(
                selectedRows.filter((rowAnsar) => rowAnsar !== ansar)
            );
        } else {
            setSelectedRows([...selectedRows, ansar]);
        }
    };

    return (
        <>
            {ansarsData.isLoading ? (
                <p>Loading...</p>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left">
                                        <Checkbox
                                            checked={
                                                selectedRows.length ===
                                                    ansarsData.data?.data?.users
                                                        ?.length &&
                                                ansarsData.data?.data?.users
                                                    .length > 0
                                            }
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </th>
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
                                            className="font-medium flex items-center hover:bg-transparent pl-0 cursor-default 
                                        "
                                        >
                                            Campaigns
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left">
                                        <Button
                                            variant="ghost"
                                            className="font-medium flex items-center hover:bg-transparent pl-0"
                                            onClick={() => requestSort("phone")}
                                        >
                                            Phone
                                            {getSortDirectionIcon("phone")}
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left">
                                        <Button
                                            variant="ghost"
                                            className="font-medium flex items-center hover:bg-transparent pl-0"
                                            onClick={() =>
                                                requestSort("invitedUsersCount")
                                            }
                                        >
                                            Invited Users Count
                                            {getSortDirectionIcon(
                                                "invitedUsersCount"
                                            )}
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left">
                                        <Button
                                            variant="ghost"
                                            className="font-medium flex items-center hover:bg-transparent pl-0"
                                            onClick={() =>
                                                requestSort(
                                                    "campaignsCreatedCount"
                                                )
                                            }
                                        >
                                            Campaigns Created Count
                                            {getSortDirectionIcon(
                                                "campaignsCreatedCount"
                                            )}
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left">
                                        <Button
                                            variant="ghost"
                                            className="font-medium flex items-center hover:bg-transparent pl-0"
                                            onClick={() =>
                                                requestSort(
                                                    "campaignsDonatedCount"
                                                )
                                            }
                                        >
                                            Campaigns Donated Count
                                            {getSortDirectionIcon(
                                                "campaignsDonatedCount"
                                            )}
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left">
                                        <Button
                                            variant="ghost"
                                            className="font-medium flex items-center hover:bg-transparent pl-0"
                                            onClick={() =>
                                                requestSort("sharedCount")
                                            }
                                        >
                                            Campaigns Shared Count
                                            {getSortDirectionIcon(
                                                "sharedCount"
                                            )}
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left">
                                        <Button
                                            variant="ghost"
                                            className="font-medium flex items-center hover:bg-transparent pl-0"
                                            onClick={() =>
                                                requestSort("createdDateTime")
                                            }
                                        >
                                            Created Date Time
                                            {getSortDirectionIcon(
                                                "createdDateTime"
                                            )}
                                        </Button>
                                    </th>
                                    <th className="p-3 text-left font-medium text-sm pl-0">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {ansarsData?.data?.data?.users?.map(
                                    (ansars) => (
                                        <tr
                                            key={ansars?.user?.id}
                                            className={`border-b hover:bg-muted/50 transition-colors ${
                                                ansars?.user?.isBlockedByAdmin
                                                    ? "bg-muted cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            <td className="p-3">
                                                <Checkbox
                                                    checked={selectedRows.includes(
                                                        ansars
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleSelectRow(ansars)
                                                    }
                                                />
                                            </td>
                                            <td className="p-3 font-mono text-sm text-nowrap">
                                                {ansars?.user?.id}
                                            </td>
                                            <td className="p-3 font-medium text-sm text-nowrap">
                                                {ansars?.user?.firstName ||
                                                ansars?.user?.lastName ? (
                                                    <>
                                                        {
                                                            ansars?.user
                                                                ?.firstName
                                                        }
                                                        &nbsp;&nbsp;
                                                        {ansars?.user?.lastName}
                                                    </>
                                                ) : (
                                                    "---"
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {ansars.campaigns?.length >
                                                0 ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                className={` text-xs h-8`}
                                                            >
                                                                Show Campaigns
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            {ansars.campaigns?.map(
                                                                (item) => (
                                                                    <DropdownMenuItem
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Badge
                                                                            onClick={() =>{
                                                                                setSearchQuery(
                                                                                    item
                                                                                        .id
                                                                                ) 
                                                                                setTimeout(() => {
                                                        setActiveTab("campaigns");
                                                    }, 1000);
                                                                            }}
                                                                            variant="outline"
                                                                            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                                                                        >
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </Badge>
                                                                    </DropdownMenuItem>
                                                                )
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    "---"
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {ansars?.user?.phone ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800"
                                                    >
                                                        {ansars?.user?.phone}
                                                    </Badge>
                                                ) : (
                                                    "---"
                                                )}
                                            </td>
                                            <td className="p-3 text-sm text-nowrap">
                                                {ansars?.invitedUserCount
                                                    ? ansars?.invitedUserCount
                                                    : "---"}
                                            </td>
                                            <td className="p-3 text-sm text-nowrap">
                                                {ansars?.campaignCreatedCount
                                                    ? ansars?.campaignCreatedCount
                                                    : "---"}
                                            </td>
                                            <td className="p-3 text-sm text-nowrap">
                                                {ansars?.campaignDonatedCount
                                                    ? ansars?.campaignDonatedCount
                                                    : "---"}
                                            </td>
                                            <td className="p-3 text-sm text-nowrap">
                                                {ansars?.campaignSharedCount
                                                    ? ansars?.campaignSharedCount
                                                    : "---"}
                                            </td>
                                            <td className="p-3 text-sm text-nowrap">
                                                {ansars?.user?.createdAt
                                                    ? dayjs(
                                                          ansars.user?.createdAt
                                                      ).format(
                                                          "MMM D, YYYY, h:mm A"
                                                      )
                                                    : "---"}
                                            </td>
                                            <td className="p-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setAnsar(
                                                                    ansars
                                                                );
                                                                setSendNotificationDialogOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            Send Notification
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setAnsar(
                                                                    ansars
                                                                );
                                                                setBlockDialogOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            {ansars?.user
                                                                ?.isBlockedByAdmin
                                                                ? "Unblock"
                                                                : "Block"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setAnsar(
                                                                    ansars
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
                </Card>
            )}

            {/* Pagination */}
            <Pagination
                totalItems={totalItems}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => setPageSize(size as number)}
            />

            {/* Send Notification Dialog */}
            {ansar && (
                <SendNotification
                    open={sendNotificationDialogOpen}
                    onOpenChange={setSendNotificationDialogOpen}
                    ansars={[ansar]}
                />
            )}

            {/* Block Confirmation Dialog */}
            <Dialog
                open={blockDialogOpen}
                onOpenChange={setBlockDialogOpen}
            >
                <DialogContent className="md:!max-w-md">
                    <DialogHeader>
                        <DialogTitle>This Cannot be undone.</DialogTitle>
                        <DialogDescription>
                            {`Are you sure you wanna ${ansar?.user?.isBlockedByAdmin ? "Unblock" : "Block"} Ansar “
                            ${ansar?.user?.firstName}${" "}
                            ${ansar?.user?.lastName === null ? "" : ansar?.user?.lastName}”,${" "}
                            ${ansar?.user?.phone === null ? "" : `${ansar?.user?.phone}? `}User will not be
                            able to use Sanad.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setBlockDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBlockConfirm}
                        >
                            {ansar?.user?.isBlockedByAdmin
                                ? "Unblock"
                                : "Block"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent className="md:!max-w-md">
                    <DialogHeader>
                        <DialogTitle>This Cannot be undone.</DialogTitle>
                        <DialogDescription>
                            Are you sure you wanna delete Ansar “
                            {ansar?.user?.firstName}{" "}
                            {ansar?.user?.lastName !== null &&
                                ansar?.user?.lastName}
                            ”,{" "}
                            {ansar?.user?.phone !== null && ansar?.user?.phone}?
                            User will loose all their data along with their
                            account.
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
    );
};

export default Ansars;
