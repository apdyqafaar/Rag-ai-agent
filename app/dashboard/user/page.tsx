"use client"

import { useState } from "react"
import { useGetDocuments } from "@/lib/hooks/document/useDocument"
import { DocumentList } from "@/lib/types/document.types"
import UserDocsComponents from "@/components/dashboard/UserDocsComponents"

const UserPage = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"processing" | "failed" | "completed" | "uploading" | "">("")

  const { data, isLoading } = useGetDocuments({
    page,
    limit,
    search: search?.trim(),
    status: status?.trim(),
  })

  const docs = data as unknown as DocumentList

  return (
    <div className="h-auto space-y-10 ">
      <UserDocsComponents
        data={docs?.documents ?? []}
        isLoading={isLoading}
        page={docs?.page ?? page}
        totalPages={docs?.totalPages ?? 1}
        total={docs?.total ?? 0}
        setPage={setPage}
        setLimit={setLimit}
        setSearch={setSearch}
        setStatus={setStatus}
      />
    </div>
  )
}

export default UserPage