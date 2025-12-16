import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useSuperAdmin() {
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [checking, setChecking] = useState<boolean>(true);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Set a timeout to prevent infinite loading
        timeoutRef.current = setTimeout(() => {
            console.log('[useSuperAdmin] Loading timeout - setting loading to false');
            setLoading(false);
            setChecking(false);
            setIsSuperAdmin(false);
        }, 5000); // 5 second timeout

        const checkSuperAdmin = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsSuperAdmin(false);
                    return;
                }

                // Check if user has a super_admin role in admin_roles table
                // We assume 'role' column contains the role name, e.g., 'super_admin'
                const { data, error } = await supabase
                    .from('admin_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .eq('role', 'super_admin')
                    .single();

                if (error || !data) {
                    setIsSuperAdmin(false);
                } else {
                    setIsSuperAdmin(true);
                }

                // Clear timeout if we got here successfully
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            } catch (error) {
                console.error('Error checking super admin status:', error);
                setIsSuperAdmin(false);
            } finally {
                setLoading(false);
                setChecking(false);
            }
        };

        checkSuperAdmin();

        // Cleanup timeout on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { isSuperAdmin, loading: checking };
}
