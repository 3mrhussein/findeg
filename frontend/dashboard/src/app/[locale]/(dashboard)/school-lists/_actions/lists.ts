'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireStaffAction } from '@lib/auth-guard';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createAdministrationServices } from '@findeg/backend/features/administration';
import type { SupplyListItemInput } from '@findeg/backend/features/administration';
import { toListActor } from '../_lib/toListActor';

export interface ActionState<T = unknown> {
  status: 'idle' | 'success' | 'error';
  message?: string;
  data?: T;
}

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: 'You do not have permission to manage School Supply Lists.',
  'invalid-input':
    'Check the form values: required fields cannot be empty, and quantities must be between 1 and 999.',
  'not-found': 'This School Supply List no longer exists.',
  'partner-school-not-found': 'This Business Partner was not found or has no school profile.',
  'partner-status-not-allowed':
    'Drafting and editing lists is not allowed for closed Business Partners.',
  'item-not-found': 'The requested list item was not found.',
  'not-draft': 'Only drafts can be edited.',
  'invalid-transition': 'Cannot perform this status transition.',
  'empty-list': 'Cannot publish an empty list. Add at least one item first.',
  'default-unavailable':
    'Every item must have an active default product variant before publication.',
  'default-ineligible': 'One or more items have an ineligible default variant.',
  'slot-taken': 'Another published list already occupies this academic year and grade slot.',
};

function formatError(error: string): string {
  return ERROR_MESSAGES[error] ?? error;
}

function refreshList(listId?: number) {
  revalidatePath('/[locale]/school-lists', 'page');
  if (listId) {
    revalidatePath(`/[locale]/school-lists/${listId}`, 'page');
  }
  updateTag('school-lists');
}

/** Create a new School Supply List draft for a Partner School. */
export async function createDraftAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState<{ id: number }>> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'create School Supply List draft',
    );
    const actor = toListActor(session);

    const businessPartnerId = Number(formData.get('businessPartnerId'));
    const grade = String(formData.get('grade') ?? '').trim();
    const academicYear = String(formData.get('academicYear') ?? '').trim();
    const titleEn = String(formData.get('titleEn') ?? '').trim();
    const titleAr = String(formData.get('titleAr') ?? '').trim();
    const descriptionEn = String(formData.get('descriptionEn') ?? '').trim();
    const descriptionAr = String(formData.get('descriptionAr') ?? '').trim();

    if (!businessPartnerId || !grade || !academicYear || (!titleEn && !titleAr)) {
      return {
        status: 'error',
        message: 'Partner, Grade, Academic Year, and at least one Title are required.',
      };
    }

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.createDraft(actor, {
      businessPartnerId,
      grade,
      academicYear,
      localizedTitle: {
        en: titleEn || undefined,
        ar: titleAr || undefined,
      },
      localizedDescription:
        descriptionEn || descriptionAr
          ? {
              en: descriptionEn || undefined,
              ar: descriptionAr || undefined,
            }
          : null,
    });

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(result.data.id);
    return { status: 'success', data: { id: result.data.id } };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Update draft list header metadata. */
export async function updateDraftAction(
  listId: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'edit School Supply List draft',
    );
    const actor = toListActor(session);

    const grade = String(formData.get('grade') ?? '').trim();
    const academicYear = String(formData.get('academicYear') ?? '').trim();
    const titleEn = String(formData.get('titleEn') ?? '').trim();
    const titleAr = String(formData.get('titleAr') ?? '').trim();
    const descriptionEn = String(formData.get('descriptionEn') ?? '').trim();
    const descriptionAr = String(formData.get('descriptionAr') ?? '').trim();

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.updateDraft(actor, listId, {
      grade: grade || undefined,
      academicYear: academicYear || undefined,
      localizedTitle:
        titleEn || titleAr
          ? {
              en: titleEn || undefined,
              ar: titleAr || undefined,
            }
          : undefined,
      localizedDescription:
        descriptionEn || descriptionAr
          ? {
              en: descriptionEn || undefined,
              ar: descriptionAr || undefined,
            }
          : null,
    });

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(listId);
    return { status: 'success' };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Add an item to a list draft (Exact Item or Specification). */
export async function addItemAction(
  listId: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'add item to School Supply List',
    );
    const actor = toListActor(session);

    const labelEn = String(formData.get('labelEn') ?? '').trim();
    const labelAr = String(formData.get('labelAr') ?? '').trim();
    const quantity = Number(formData.get('quantity') || 1);
    const required = formData.get('required') === 'true' || formData.get('required') === 'on';
    const exactItem = formData.get('exactItem') === 'true';
    const variantIdRaw = formData.get('variantId');
    const variantId = variantIdRaw && Number(variantIdRaw) > 0 ? Number(variantIdRaw) : null;
    const noteEn = String(formData.get('noteEn') ?? '').trim();
    const noteAr = String(formData.get('noteAr') ?? '').trim();

    const categoryIdRaw = formData.get('categoryId');
    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
    const attributesRaw = formData.get('attributes');
    let attributes: Record<string, string> = {};
    if (attributesRaw && typeof attributesRaw === 'string') {
      try {
        attributes = JSON.parse(attributesRaw);
      } catch {
        attributes = {};
      }
    }

    if (!labelEn && !labelAr) {
      return { status: 'error', message: 'Item label is required.' };
    }

    const itemInput: SupplyListItemInput = {
      localizedLabel: {
        en: labelEn || undefined,
        ar: labelAr || undefined,
      },
      localizedNote:
        noteEn || noteAr
          ? {
              en: noteEn || undefined,
              ar: noteAr || undefined,
            }
          : null,
      quantity,
      required,
      exactItem,
      variantId,
      specification:
        !exactItem && categoryId
          ? {
              categoryId,
              attributes,
            }
          : null,
    };

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.addItem(actor, listId, itemInput);

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(listId);
    return { status: 'success' };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Update an item in a list draft. */
export async function updateItemAction(
  listId: number,
  itemId: number,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'update item in School Supply List',
    );
    const actor = toListActor(session);

    const labelEn = String(formData.get('labelEn') ?? '').trim();
    const labelAr = String(formData.get('labelAr') ?? '').trim();
    const quantity = Number(formData.get('quantity') || 1);
    const required = formData.get('required') === 'true' || formData.get('required') === 'on';
    const exactItem = formData.get('exactItem') === 'true';
    const variantIdRaw = formData.get('variantId');
    const variantId = variantIdRaw && Number(variantIdRaw) > 0 ? Number(variantIdRaw) : null;
    const noteEn = String(formData.get('noteEn') ?? '').trim();
    const noteAr = String(formData.get('noteAr') ?? '').trim();

    const categoryIdRaw = formData.get('categoryId');
    const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
    const attributesRaw = formData.get('attributes');
    let attributes: Record<string, string> = {};
    if (attributesRaw && typeof attributesRaw === 'string') {
      try {
        attributes = JSON.parse(attributesRaw);
      } catch {
        attributes = {};
      }
    }

    const patch: Partial<SupplyListItemInput> = {
      localizedLabel:
        labelEn || labelAr
          ? {
              en: labelEn || undefined,
              ar: labelAr || undefined,
            }
          : undefined,
      localizedNote:
        noteEn || noteAr
          ? {
              en: noteEn || undefined,
              ar: noteAr || undefined,
            }
          : null,
      quantity,
      required,
      exactItem,
      variantId,
      specification:
        !exactItem && categoryId
          ? {
              categoryId,
              attributes,
            }
          : null,
    };

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.updateItem(actor, listId, itemId, patch);

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(listId);
    return { status: 'success' };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Remove an item from a list draft. */
export async function removeItemAction(listId: number, itemId: number): Promise<ActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'remove item from School Supply List',
    );
    const actor = toListActor(session);

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.removeItem(actor, listId, itemId);

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(listId);
    return { status: 'success' };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Reorder items in a list draft. */
export async function reorderItemsAction(listId: number, itemIds: number[]): Promise<ActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'reorder items in School Supply List',
    );
    const actor = toListActor(session);

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.reorderItems(actor, listId, itemIds);

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(listId);
    return { status: 'success' };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Publish a list draft. Refuses publication if items lack active defaults or partner is closed/suspended. */
export async function publishListAction(listId: number): Promise<ActionState> {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'publish School Supply List',
    );
    const actor = toListActor(session);

    const { schoolSupplyLists } = createAdministrationServices();
    const result = await schoolSupplyLists.publish(actor, listId);

    if (!result.success) {
      return { status: 'error', message: formatError(result.error) };
    }

    refreshList(listId);
    return { status: 'success' };
  } catch {
    return { status: 'error', message: formatError('forbidden') };
  }
}

/** Get specification attribute options for a category. */
export async function getCategoryOptionsAction(categoryId: number) {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'get category specification options',
    );
    const actor = toListActor(session);
    const { schoolSupplyLists } = createAdministrationServices();
    return await schoolSupplyLists.listSpecificationOptions(actor, categoryId);
  } catch {
    return { success: false as const, error: 'forbidden' as const };
  }
}

/** Get variant candidates for a category. */
export async function getCategoryVariantsAction(categoryId: number) {
  try {
    const session = await requireStaffAction(
      PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
      'get category variant candidates',
    );
    const actor = toListActor(session);
    const { schoolSupplyLists } = createAdministrationServices();
    return await schoolSupplyLists.listVariantCandidates(actor, categoryId);
  } catch {
    return { success: false as const, error: 'forbidden' as const };
  }
}
