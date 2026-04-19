import { useState, useMemo, useEffect } from "react";

/**
 * Custom hook for handling pagination logic.
 *
 * @template T - The type of data items.
 * @param {T[]} data - The full array of data to paginate.
 * @param {number} itemsPerPage - The number of items to display per page.
 * @returns {object} An object containing pagination state and helper functions.
 */
export const usePagination = <T>(data: T[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage]);

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  /**
   *
   */
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  /**
   *
   */
  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Adjust current page if it becomes invalid due to data changes
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(1);
  }

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    nextPage,
    prevPage,
    currentPageData,
  };
};
