"use client";

import { useEffect, useState } from "react";
import Fuse from "fuse.js";

export default function Home() {
  const [advocates, setAdvocates] = useState([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/advocates")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAdvocates(advocates);
      return;
    }

    const fuse = new Fuse(advocates, {
      keys: ["firstName", "lastName", "city", "degree", "specialties", "yearsOfExperience"],
      threshold: 0.3 // smaller = more strict, bigger = fuzzier
    });

    const results = fuse.search(searchTerm).map(r => r.item);
    setFilteredAdvocates(results);
  }, [searchTerm, advocates]);

  return (
    <main>
      {loading && (
        <div className="flex justify-center items-center h-screen">
          <div className="spinner" role="status" aria-label="Loading"></div>
        </div>
      )}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
          <h1 className="p-6 text-xl sm:text-2xl font-bold text-white p-4 bg-solace-header">
            Solace Advocates
          </h1>

          <div className="p-6 mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              placeholder="Search advocates..."
              className="border px-3 py-2 rounded w-full sm:w-auto"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <button
              className="px-4 py-2 rounded w-full sm:w-auto text-white bg-solace-button"
              onClick={() => setSearchTerm("")}
            >
              Reset
            </button>
          </div>
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
                {filteredAdvocates.length ? (
                  filteredAdvocates.map((adv, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border">{adv.firstName}</td>
                      <td className="p-2 border">{adv.lastName}</td>
                      <td className="p-2 border">{adv.city}</td>
                      <td className="p-2 border">{adv.degree}</td>
                      <td className="p-2 border">{adv.specialties.join(", ")}</td>
                      <td className="p-2 border">{adv.yearsOfExperience}</td>
                      <td className="p-2 border">{adv.phoneNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
