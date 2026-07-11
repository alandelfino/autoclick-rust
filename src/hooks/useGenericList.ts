import { useState, useMemo } from "react";

interface UseGenericListOptions<T> {
    items: T[];
    searchFields?: (keyof T)[];
    customSearch?: (item: T, term: string) => boolean;
    customSort?: (a: T, b: T, sortBy: string) => number;
    defaultSort?: string;
    defaultPageSize?: number;
}

export function useGenericList<T>({
    items,
    searchFields,
    customSearch,
    customSort,
    defaultSort = "recentes",
    defaultPageSize = 50,
}: UseGenericListOptions<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortValue, setSortValue] = useState(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(String(defaultPageSize));

    // 1. Filter
    const filteredItems = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return items;

        if (customSearch) {
            return items.filter((item) => customSearch(item, term));
        }

        if (searchFields && searchFields.length > 0) {
            return items.filter((item) =>
                searchFields.some((field) => {
                    const val = item[field];
                    return val != null && String(val).toLowerCase().includes(term);
                })
            );
        }

        // Fallback: search all fields
        return items.filter((item) =>
            Object.values(item as any).some((val) =>
                val != null && String(val).toLowerCase().includes(term)
            )
        );
    }, [items, searchTerm, searchFields, customSearch]);

    // 2. Sort
    const sortedItems = useMemo(() => {
        const sorted = [...filteredItems];
        if (customSort) {
            return sorted.sort((a, b) => customSort(a, b, sortValue));
        }

        // Default basic alphabetical sorting by name if "name" exists
        return sorted.sort((a: any, b: any) => {
            const nameA = String(a.name || "").toLowerCase();
            const nameB = String(b.name || "").toLowerCase();

            if (sortValue === "name-asc") {
                return nameA.localeCompare(nameB);
            } else if (sortValue === "name-desc") {
                return nameB.localeCompare(nameA);
            }
            // Default: insertion/ID order
            return 0;
        });
    }, [filteredItems, sortValue, customSort]);

    // 3. Paginate
    const totalItems = sortedItems.length;
    const itemsPerPage = Number(pageSize);
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    // Adjust current page if it is out of bounds
    const activePage = Math.min(currentPage, totalPages) || 1;

    const paginatedItems = useMemo(() => {
        const start = (activePage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedItems.slice(start, end);
    }, [sortedItems, activePage, itemsPerPage]);

    return {
        searchTerm,
        setSearchTerm,
        sortValue,
        setSortValue,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        activePage,
        paginatedItems,
    };
}
