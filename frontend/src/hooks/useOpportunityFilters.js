import { useState, useCallback, useMemo } from 'react';

export const useOpportunityFilters = () => {
  const [filters, setFilters] = useState({
    type: null,
    format: null,
    search: '',
    salaryMin: null,
    salaryMax: null,
    city: null,
    tagIds: [],
    page: 1,
    limit: 10
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Сбрасываем страницу при изменении фильтров
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      type: null,
      format: null,
      search: '',
      salaryMin: null,
      salaryMax: null,
      city: null,
      tagIds: [],
      page: 1,
      limit: 10
    });
  }, []);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    setPage
  };
};