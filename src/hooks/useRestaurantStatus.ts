import { useState, useEffect } from 'react';

interface DateStatus {
  date: string; // YYYY-MM-DD format
  is_closed: boolean;
  reason?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseRestaurantStatusProps {
  startDate?: string;
  endDate?: string;
}

interface UseRestaurantStatusReturn {
  dateStatuses: Record<string, DateStatus>;
  loading: boolean;
  error: string | null;
  updateDateStatus: (date: string, isClosed: boolean, reason?: string) => Promise<void>;
  refreshStatuses: () => Promise<void>;
  isDateClosed: (date: string) => boolean;
}

export function useRestaurantStatus({ 
  startDate, 
  endDate 
}: UseRestaurantStatusProps = {}): UseRestaurantStatusReturn {
  const [dateStatuses, setDateStatuses] = useState<Record<string, DateStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurant status data
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/admin/restaurant-status';
      const params = new URLSearchParams();
      
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: DateStatus[] = await response.json();
      
      // Convert array to object for easier lookup
      const statusMap: Record<string, DateStatus> = {};
      data.forEach((status) => {
        statusMap[status.date] = status;
      });
      
      setDateStatuses(statusMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Error fetching restaurant statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update a specific date's status
  const updateDateStatus = async (date: string, isClosed: boolean, reason?: string) => {
    try {
      setError(null);

      const response = await fetch('/api/admin/restaurant-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          is_closed: isClosed,
          reason: reason || (isClosed ? 'Fermé manuellement' : null),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
      }

      const updatedStatus: DateStatus = await response.json();
      
      // Update local state
      setDateStatuses(prev => ({
        ...prev,
        [date]: updatedStatus,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Error updating restaurant status:', err);
      throw err; // Re-throw to allow component to handle
    }
  };

  // Check if a specific date is closed
  const isDateClosed = (date: string): boolean => {
    return dateStatuses[date]?.is_closed || false;
  };

  // Refresh data
  const refreshStatuses = async () => {
    await fetchStatuses();
  };

  // Load data on mount and when date range changes
  useEffect(() => {
    fetchStatuses();
  }, [startDate, endDate]);

  return {
    dateStatuses,
    loading,
    error,
    updateDateStatus,
    refreshStatuses,
    isDateClosed,
  };
}
