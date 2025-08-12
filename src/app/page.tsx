"use client";

import { useEffect, useState } from "react";

async function fetchAdvocates(search = "") {
  const url = search ? `/api/advocates?search=${encodeURIComponent(search)}` : "/api/advocates";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.data;
}

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setError(null);

    if (debouncedSearch.trim() === "") {
      // Initial load or reset search
      setInitialLoading(true);
      setSearchLoading(false);

      fetchAdvocates()
        .then((data) => setAdvocates(data))
        .catch((err) => setError(err.message || "Something went wrong"))
        .finally(() => setInitialLoading(false));
    } else {
      // Searching — do NOT block UI with big spinner, just show small inline indicator
      setSearchLoading(true);

      fetchAdvocates(debouncedSearch)
        .then((data) => setAdvocates(data))
        .catch((err) => setError(err.message || "Something went wrong"))
        .finally(() => setSearchLoading(false));
    }
  }, [debouncedSearch]);

  return (
    <main>
      <h1 className="p-6 text-xl sm:text-2xl font-bold text-white p-4 bg-solace-header">
        Solace Advocates
      </h1>

      <div className="p-6 mt-4 flex flex-col sm:flex-row sm:items-center gap-2 relative">
        <input
          type="text"
          placeholder="Search advocates..."
          className="border px-3 py-2 rounded w-full sm:w-auto"
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          aria-label="Search advocates"
        />
        <button
          className="px-4 py-2 rounded w-full sm:w-auto text-white bg-solace-button"
          onClick={() => setSearchTerm("")}
          disabled={initialLoading}
        >
          Reset
        </button>

        {/* Small inline spinner for search loading */}
        {searchLoading && !initialLoading && (
          <div
            className="spinner absolute right-0 top-0 mt-3 mr-4"
            role="status"
            aria-label="Searching"
            style={{ width: 20, height: 20 }}
          ></div>
        )}
      </div>

      {initialLoading && (
        <div className="p-4 flex justify-center items-center gap-2">
          <div className="spinner" role="status" aria-label="Loading"></div>
          <span>Loading advocates...</span>
        </div>
      )}

      {error && <p className="text-red-600 p-4">{error}</p>}

      <div className="p-6 mt-6 overflow-x-auto">
        <table className="mt-6 border-collapse w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 border">First Name</th>
              <th className="p-2 border">Last Name</th>
              <th className="p-2 border">City</th>
              <th className="p-2 border">Degree</th>
              <th className="p-2 border">Specialties</th>
              <th className="p-2 border">Years of Experience</th>
              <th className="p-2 border">Phone Number</th>
            </tr>
          </thead>

          <tbody>
            {!initialLoading && !error && advocates.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No results found
                </td>
              </tr>
            )}

            {!initialLoading && !error &&
              advocates.map((adv, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border">{adv.firstName}</td>
                  <td className="p-2 border">{adv.lastName}</td>
                  <td className="p-2 border">{adv.city}</td>
                  <td className="p-2 border">{adv.degree}</td>
                  <td className="p-2 border">{adv.specialties.join(", ")}</td>
                  <td className="p-2 border">{adv.yearsOfExperience}</td>
                  <td className="p-2 border">{adv.phoneNumber}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
