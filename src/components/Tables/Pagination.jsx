import React, { useEffect } from "react";

const Pagination = ({
  range,
  setPage,
  page,
  data,
  total,
  field = "Entries",
}) => {
  useEffect(() => {
    if (data.length < 1 && page !== 1) {
      setPage(page - 1);
    }
  }, [data, page, setPage]);

  return (
    <div className="my-2 flex justify-between items-center">
      <div>
        Total: {total} {field}
      </div>
      <div>
        <button
          className={`border-2 border-gray-300 px-4 py-1 rounded-md ${
            page === 1 && "text-gray-300"
          }`}
          disabled={page === 1}
          onClick={() => setPage((prev) => (prev - 1 < 1 ? prev : prev - 1))}
        >
          Prev
        </button>
        <span className="mx-4 cursor-default">
          {page}/{range.length}
        </span>
        <button
          className={`border-2 border-gray-300 px-4 py-1 rounded-md ${
            page === range.length && "text-gray-300"
          }`}
          disabled={page === range.length}
          onClick={() =>
            setPage((prev) => (prev + 1 > range.length ? prev : prev + 1))
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
