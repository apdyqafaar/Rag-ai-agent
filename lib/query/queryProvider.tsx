"use client"

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import React, { useState } from "react"
import { getQueryClient } from "./client"

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient]=useState(()=>getQueryClient())
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default QueryProvider