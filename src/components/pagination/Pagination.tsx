import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

interface PaginationProps {
    totalItems: string | number;
    selectedItems?: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    pageSize: string | number;
    onPageSizeChange: (size: string | number) => void;
    pageSizeOptions?: Array<string | number>;
    className?: string;
}
export default function Pagination({
    totalItems = 0,
    selectedItems = 0,
    currentPage = 1,
    onPageChange,
    pageSize = 10,
    onPageSizeChange,
    pageSizeOptions = ["10", "20", "50"],
    className = "",
}: PaginationProps) {
    const [totalPages, setTotalPages] = useState(1);

    // Calculate total pages when items or page size changes
    useEffect(() => {
        const calculatedTotalPages = Math.max(
            1,
            Math.ceil(Number(totalItems) / Number(pageSize))
        );
        setTotalPages(calculatedTotalPages);

        // If current page is greater than total pages, go to last page
        if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
            onPageChange(calculatedTotalPages);
        }
    }, [totalItems, pageSize, currentPage, onPageChange]);

    return (
        <div
            className={`flex items-center justify-between md:p-4 md:pb-0 py-4 ${className}`}
        >
            {selectedItems > 0 && (
                <div className="text-xs text-muted-foreground text-nowrap">
                    {selectedItems} of {totalItems} Rows Selected
                </div>
            )}

            {!selectedItems && <div />}

            <div className="flex items-center md:justify-end justify-center space-x-6 w-full">
                <div className="hidden md:flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={onPageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSizeOptions[0]} />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem
                                    key={size}
                                    value={size.toString()}
                                >
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </p>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                onPageChange(Math.max(currentPage - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                onPageChange(
                                    Math.min(currentPage + 1, totalPages)
                                )
                            }
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPageChange(totalPages)}
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            className="h-8 w-8"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
