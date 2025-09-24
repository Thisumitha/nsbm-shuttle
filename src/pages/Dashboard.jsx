import React, { useState, useEffect } from 'react';

// Main Dashboard component that handles all state and view switching
const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('arrivals'); // 'arrivals' or 'departures'
  const [headers, setHeaders] = useState([]);

  // Fetch data from the Google Sheet published as a CSV
  useEffect(() => {
    const fetchBusData = async () => {
      setLoading(true);
      setError(null);
      
      const sheetCsvUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOCNTuhTVjDh6OcGoKiToV6xq0DYt_prUvxo1zbDzyfaCnpJccUQNIHs7y6XN1fEiNAPpFsKNywmyq/pub?gid=0&single=true&output=csv";

      try {
        const response = await fetch(sheetCsvUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const text = await response.text();

        // Split the text into rows, handling different line endings
        const rows = text.split(/\r?\n/).map((row) => row.split(","));
        
        // Use the first row as headers, trimming whitespace
        const parsedHeaders = rows[0].map((h) => h.trim());
        setHeaders(parsedHeaders);
        
        // Map the remaining rows to objects using the headers
        const data = rows.slice(1).map((row) =>
          parsedHeaders.reduce((acc, header, i) => {
            acc[header] = row[i] ? row[i].trim() : "";
            return acc;
          }, {})
        );

        // Filter the data into arrivals and departures based on the 'Time' column
        const arrivals = data.filter((d) => d['Time'] && d['Time'].toUpperCase().includes("AM"));
        const departures = data.filter((d) => d['Time'] && d['Time'].toUpperCase().includes("PM"));

        setBusData({ arrivals, departures });

      } catch (err) {
        setError("Failed to fetch bus data. Please check the spreadsheet URL and CORS settings. " + err.message);
        console.error("Error fetching bus data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, []); // The empty dependency array ensures this runs once on mount

  const filterBuses = (buses) => {
    if (!busData || !searchTerm || !buses) {
      return buses;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    // Check if any of the bus's values include the search term
    return buses.filter(bus =>
      Object.values(bus).some(value =>
        value.toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  };

  const filteredArrivals = busData ? filterBuses(busData.arrivals) : [];
  const filteredDepartures = busData ? filterBuses(busData.departures) : [];

  const renderTable = (data, title) => (
    <div className="bg-white p-8 rounded-2xl shadow-xl mb-10 border-t-4 border-emerald-500">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-sm">
          <thead className="bg-emerald-100">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4 text-left text-sm font-bold text-emerald-800 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((bus, index) => (
                <tr key={index} className="hover:bg-emerald-50 transition-colors duration-200 ease-in-out">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {/* Check if the header is 'Driver Contact' to make it a clickable link */}
                      {header === 'Driver Contact' ? (
                        <a href={`tel:${bus[header]?.replace(/\s/g, '')}`} className="text-emerald-600 font-medium">{bus[header]}</a>
                      ) : (
                        <p className="text-gray-900">{bus[header]}</p>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500 italic">No results found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-stone-50 text-gray-800 font-sans min-h-screen">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
        .bg-nsbm-header {
            background-image: linear-gradient(to right, #059669, #15803d);
        }
        .shadow-3xl {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #059669;
          animation: spin 1s ease infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>

      {/* Header Section */}
      <header className="bg-nsbm-header text-white py-12 shadow-3xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">NSBM Green University Bus Timetable</h1>
          <p className="mt-4 text-base md:text-lg italic opacity-90 drop-shadow-md">25.2 group community resource</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Introduction Section */}
        <section className="bg-white p-8 rounded-2xl shadow-xl mb-10 border-t-4 border-emerald-500">
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            Welcome to the unofficial NSBM Green University bus timetable. This schedule is a community-driven resource based on common bus routes and times. Please note that these times are subject to change due to traffic, road conditions, and other factors. It is always best to arrive early and check with the official university transport office for the most up-to-date information.
          </p>
        </section>

        {/* Search Functionality */}
        <section className="mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
            <input
              type="text"
              id="searchInput"
              placeholder="Search by bus type, time, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all duration-300"
            />
          </div>
        </section>
        
        {/* Navigation Buttons for Arrivals and Departures */}
        <section className="flex justify-center mb-10 space-x-4">
          <button
            onClick={() => setActiveView('arrivals')}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
              activeView === 'arrivals'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 shadow-md hover:bg-emerald-50'
            }`}
          >
            Morning Arrivals
          </button>
          <button
            onClick={() => setActiveView('departures')}
            className={`px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
              activeView === 'departures'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 shadow-md hover:bg-emerald-50'
            }`}
          >
            Evening Departures
          </button>
        </section>

        {/* Bus Timetable Sections */}
        <section>
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
              <p className="ml-4 text-xl font-medium text-gray-500">Loading data...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          {busData && (
            <>
              {activeView === 'arrivals' && renderTable(filteredArrivals, "Morning Arrivals to NSBM")}
              {activeView === 'departures' && renderTable(filteredDepartures, "Evening Departures from NSBM")}
            </>
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs md:text-sm leading-relaxed opacity-80">
            Disclaimer: The times listed are unofficial estimates and are subject to change without prior notice. For the most current and official schedule, please contact the university's transport office directly.
          </p>
          <div className="mt-6 text-sm">
            <p>Official Contact:</p>
            <p className="mt-1">Email: <a href="mailto:transport@nsbm.lk" className="underline hover:text-emerald-400 transition-colors">transport@nsbm.lk</a></p>
            <p>Phone: <a href="tel:+94115445000" className="underline hover:text-emerald-400 transition-colors">+94 11 544 5000</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
