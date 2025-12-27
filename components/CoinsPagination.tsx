"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildPageNumbers, ELLIPSIS } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const CoinsPagination = ({
  currentPage,
  totalPages,
  hasMorePages,
}: Pagination) => {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/coins?page=${page}`);
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const isLastPage = !hasMorePages || currentPage === totalPages;

  return (
    <div>
      <Pagination id="coins-pagination">
        <PaginationContent className="pagination-content">
          <PaginationItem className="pagination-control prev">
            <PaginationPrevious
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={
                currentPage === 1 ? "control-disabled" : "control-button"
              }
            />
          </PaginationItem>

          <div className="pagination-pages">
            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                {
                  pageNumber === ELLIPSIS ? (
                    <span className="ellipsis">..</span>
                  ) : (
                      <PaginationLink
                        onClick={() =>
                          handlePageChange(pageNumber)
                        }
                        className={cn(
                          'page-link', {
                            'page-link-active': currentPage === pageNumber,
                          }
                        )}
                      >
                        {pageNumber}  
                      </PaginationLink>
                  )
                }
              </PaginationItem>
            ))}

          </div>


          <PaginationItem className="pagination-control next">
            <PaginationNext
              onClick={() =>
                !isLastPage && handlePageChange(currentPage + 1)
              }
              className={
                isLastPage ? "control-disabled" : "control-button"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CoinsPagination;
