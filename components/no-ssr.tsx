"use client";

import { useEffect, useState } from "react";

interface NoSSRProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component that only renders its children on the client side
 * Prevents hydration mismatches for components that rely on browser APIs
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
