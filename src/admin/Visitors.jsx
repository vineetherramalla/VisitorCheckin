import { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, ChevronLeft, ChevronRight, Trash2, X, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { getVisitors, deleteVisitor } from '../services/api';
import { getAdminUser } from '../services/auth';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [showFilters, setShowFilters] = useState(false);

  const adminUser = getAdminUser();

  const purposeOptions = [
    'All',
    'Business Meeting',
    'Interview',
    'Delivery',
    'Maintenance',
    'Personal Visit',
    'Other',
  ];

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [visitors, searchTerm, purposeFilter, dateRange, sortOrder]);

  /**
   * Fetch visitors from API
   */
  const fetchVisitors = async () => {
    setLoading(true);
    const result = await getVisitors();
    setLoading(false);

    if (result.success) {
      if (Array.isArray(result.data)) {
        setVisitors(result.data);
      } else if (result.data?.results && Array.isArray(result.data.results)) {
        setVisitors(result.data.results);
      } else {
        setVisitors([]);
      }
    }
  };

  /**
   * Apply search and filters
   */
  const applyFilters = () => {
    let filtered = [...visitors];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          (v.name || v.full_name || '').toLowerCase().includes(search) ||
          v.email.toLowerCase().includes(search) ||
          (v.phone || v.phone_number || '').includes(search)
      );
    }

    // Purpose filter
    if (purposeFilter && purposeFilter !== 'All') {
      filtered = filtered.filter((v) => v.purpose === purposeFilter);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter((v) => {
        const visitDate = new Date(v.checkin_time || v.entry_time).toISOString().split('T')[0];
        return visitDate >= dateRange.start;
      });
    }
    if (dateRange.end) {
      filtered = filtered.filter((v) => {
        const visitDate = new Date(v.checkin_time || v.entry_time).toISOString().split('T')[0];
        return visitDate <= dateRange.end;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.checkin_time || a.entry_time);
      const dateB = new Date(b.checkin_time || b.entry_time);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredVisitors(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  /**
   * Handle visitor deletion
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visitor record?')) {
      return;
    }

    const result = await deleteVisitor(id);
    if (result.success) {
      setVisitors(visitors.filter((v) => v.id !== id));
    } else {
      alert('Failed to delete visitor. Please try again.');
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setPurposeFilter('');
    setDateRange({ start: '', end: '' });
  };

  /**
   * Export to CSV
   */
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Purpose', 'Message', 'Check-in Time'];
    const csvData = filteredVisitors.map((v) => [
      v.name || v.full_name,
      v.email,
      v.phone || v.phone_number,
      v.purpose,
      v.message || v.additional_details || '',
      ` ${new Date(v.checkin_time || v.entry_time).toLocaleString()}`,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVisitors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 transition-all duration-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden mr-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredVisitors.length} {filteredVisitors.length === 1 ? 'visitor' : 'visitors'} found
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{adminUser?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{adminUser?.email || 'admin@example.com'}</p>
              </div>
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {(adminUser?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-11 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${showFilters
                    ? 'bg-primary-50 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Filters</span>
                </button>

                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Export</span>
                </button>

                <button
                  onClick={fetchVisitors}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-medium">Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Purpose Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                    <select
                      value={purposeFilter}
                      onChange={(e) => setPurposeFilter(e.target.value)}
                      className="input-field"
                    >
                      {purposeOptions.map((option) => (
                        <option key={option} value={option === 'All' ? '' : option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="mt-4 flex items-center space-x-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sort by: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Visitors Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading visitors...</p>
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No visitors found</h3>
                <p className="text-gray-600">
                  {searchTerm || purposeFilter || dateRange.start || dateRange.end
                    ? 'Try adjusting your filters'
                    : 'No visitor records available yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="table-header">Name</th>
                        <th className="table-header">Email</th>
                        <th className="table-header">Phone</th>
                        <th className="table-header">Purpose</th>
                        <th className="table-header">Check-in Time</th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentItems.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="table-cell">
                            <div className="font-medium text-gray-900">{visitor.name || visitor.full_name}</div>
                            {(visitor.message || visitor.additional_details) && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                {visitor.message || visitor.additional_details}
                              </div>
                            )}
                          </td>
                          <td className="table-cell text-gray-600">{visitor.email}</td>
                          <td className="table-cell text-gray-600">{visitor.phone || visitor.phone_number}</td>
                          <td className="table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {visitor.purpose}
                            </span>
                          </td>
                          <td className="table-cell text-gray-600">
                            {new Date(visitor.checkin_time || visitor.entry_time).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => handleDelete(visitor.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Delete visitor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVisitors.length)} of{' '}
                      {filteredVisitors.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${currentPage === pageNumber
                                ? 'bg-primary-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return (
                            <span key={pageNumber} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {import.meta.env.VITE_COMPANY_NAME || 'SRIA INFOTECH PVT LTD'}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Visitors;
