"use client";

import { useMemo, useState } from "react";
import type { CheckoutPrefillData } from "@features/order/application/queries/checkout-prefill";

export type PaymentMethod = "cod" | "card";
export type CheckoutField = "fullName" | "guestEmail" | "phone" | "city" | "area" | "street";
export type CheckoutValidationError =
  | "fullName_required"
  | "email_invalid"
  | "phone_invalid"
  | "city_required"
  | "area_required"
  | "street_required";

export interface CheckoutFormValues {
  fullName: string;
  guestEmail: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
}

interface UseCheckoutFormParams {
  cartItemsCount: number;
  initialValues?: CheckoutPrefillData | null;
}

type CheckoutValidationState = Partial<Record<CheckoutField, CheckoutValidationError>>;

/**
 * Encapsulates checkout form state, payment state, and validation logic.
 */
export function useCheckoutForm({ cartItemsCount, initialValues }: UseCheckoutFormParams) {
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    fullName: initialValues?.fullName ?? "",
    guestEmail: initialValues?.guestEmail ?? "",
    phone: initialValues?.phone ?? "",
    city: initialValues?.city ?? "",
    area: initialValues?.area ?? "",
    street: initialValues?.street ?? "",
    building: initialValues?.building ?? "",
    floor: initialValues?.floor ?? "",
    apartment: initialValues?.apartment ?? "",
    notes: initialValues?.notes ?? "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const validationErrors = useMemo<CheckoutValidationState>(() => {
    const errors: CheckoutValidationState = {};

    if (formValues.fullName.trim().length < 2) errors.fullName = "fullName_required";
    if (!formValues.guestEmail.trim().includes("@")) errors.guestEmail = "email_invalid";
    if (formValues.phone.trim().length < 11) errors.phone = "phone_invalid";
    if (formValues.city.trim().length < 2) errors.city = "city_required";
    if (formValues.area.trim().length < 2) errors.area = "area_required";
    if (formValues.street.trim().length < 2) errors.street = "street_required";

    return errors;
  }, [formValues]);

  const canSubmit = useMemo(() => {
    return cartItemsCount > 0 && Object.keys(validationErrors).length === 0;
  }, [cartItemsCount, validationErrors]);

  /**
   * Updates a single form field while preserving the remaining state.
   */
  function setField<K extends keyof CheckoutFormValues>(field: K, value: CheckoutFormValues[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /**
   * Marks a field as touched so validation can be shown.
   */
  function touchField(field: CheckoutField) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  }

  /**
   * Enables form-wide validation messages.
   */
  function revealAllErrors() {
    setShowAllErrors(true);
  }

  /**
   * Returns active validation error for a field when visible.
   */
  function getFieldError(field: CheckoutField): CheckoutValidationError | null {
    const error = validationErrors[field];
    if (!error) return null;
    if (showAllErrors || touched[field]) return error;
    return null;
  }

  return {
    formValues,
    paymentMethod,
    setPaymentMethod,
    canSubmit,
    setField,
    touchField,
    revealAllErrors,
    getFieldError,
  };
}
