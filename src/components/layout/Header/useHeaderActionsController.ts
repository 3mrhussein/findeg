"use client";

import { useRouter } from "@/i18n/routing";

interface UseHeaderActionsControllerParams {
  onLogout: () => void;
}

interface UseHeaderActionsControllerResult {
  onGoToSchoolLists: () => void;
  onGoToAuth: () => void;
  onLogoutClick: () => void;
}

export function useHeaderActionsController({
  onLogout,
}: UseHeaderActionsControllerParams): UseHeaderActionsControllerResult {
  const router = useRouter();

  const onGoToSchoolLists = () => {
    router.push("/school-lists");
  };

  const onGoToAuth = () => {
    router.push("/registration");
  };

  const onLogoutClick = () => {
    onLogout();
  };

  return {
    onGoToSchoolLists,
    onGoToAuth,
    onLogoutClick,
  };
}
