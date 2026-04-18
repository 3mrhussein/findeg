"use client";

import { useState } from "react";
import { ListAccessCard } from "@app/[locale]/(storefront)/school/_components/ListAccessCard";
import { CodeEntryDialog } from "@app/[locale]/(storefront)/school/_components/CodeEntryDialog";
import { AccessRequestDialog } from "@app/[locale]/(storefront)/school/_components/AccessRequestDialog";
import { useRouter } from "@i18n/navigation";
import { AccessState } from "@features/school/application/interfaces/ISchoolAccessService";

interface SchoolProfileClientProps {
  schoolName: string;
  initialLists: any[];
}

/**
 * SchoolProfileClient
 *
 * Client-side component for managing school profile interactivity.
 * Handles dialog state and list actions.
 */
export function SchoolProfileClient({ schoolName, initialLists }: SchoolProfileClientProps) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [activeList, setActiveList] = useState<any | null>(null);
  const [activeDialog, setActiveDialog] = useState<"code" | "request" | null>(null);

  /**
   *
   */
  const handleAction = (list: any, action: "enter_code" | "request_access" | "view_list") => {
    if (action === "view_list") {
      router.push(`/lists/${list.slug}`);
      return;
    }

    setActiveList(list);
    setActiveDialog(action === "enter_code" ? "code" : "request");
  };

  /**
   *
   */
  const handleSuccess = () => {
    // Refresh the data to reflect granted/pending state
    router.refresh();

    // Optimistically update the list state if possible, though router.refresh()
    // is preferred for accuracy from server.
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lists.map((list) => (
          <ListAccessCard
            key={list.id}
            list={list}
            accessState={list.accessState}
            onAction={(action) => handleAction(list, action)}
          />
        ))}
      </div>

      {activeList && (
        <>
          <CodeEntryDialog
            isOpen={activeDialog === "code"}
            onClose={() => setActiveDialog(null)}
            listId={activeList.id}
            listTitle={activeList.grade}
            onSuccess={handleSuccess}
          />
          <AccessRequestDialog
            isOpen={activeDialog === "request"}
            onClose={() => setActiveDialog(null)}
            listId={activeList.id}
            schoolName={schoolName}
            listTitle={activeList.grade}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
}
