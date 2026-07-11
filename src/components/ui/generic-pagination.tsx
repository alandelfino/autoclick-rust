import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select";

interface GenericPaginationProps {
    totalItems: number;
    activePage: number;
    totalPages: number;
    pageSize: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: string) => void;
}

const pageSizes = [
    { label: "10/page", value: "10" },
    { label: "20/page", value: "20" },
    { label: "50/page", value: "50" },
    { label: "100/page", value: "100" },
];

export function GenericPagination({
    totalItems,
    activePage,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: GenericPaginationProps) {
    return (
        <div className="flex items-center justify-end gap-2.5 shrink-0 py-4 px-4 border-t border-neutral-100 bg-white w-full">
            <span className="text-xs text-neutral-500 font-inter font-medium mr-2">Total {totalItems}</span>

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-100"
                disabled={activePage === 1}
                onClick={() => onPageChange(activePage - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <button
                type="button"
                className="h-7 min-w-7 px-2 flex items-center justify-center rounded border border-[#ff5a36] text-[#ff5a36] font-semibold text-xs hover:bg-[#ff5a36]/5 transition-colors cursor-pointer"
            >
                {activePage}
            </button>

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-100"
                disabled={activePage === totalPages}
                onClick={() => onPageChange(activePage + 1)}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <Select 
                value={pageSize} 
                onValueChange={(val) => { 
                    if (val) { 
                        onPageSizeChange(val); 
                        onPageChange(1); 
                    } 
                }} 
                items={pageSizes}
            >
                <SelectTrigger size="sm" className="w-fit text-xs text-neutral-600 bg-white border border-neutral-200 px-2 rounded-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-fit">
                    <SelectGroup>
                        {pageSizes.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
