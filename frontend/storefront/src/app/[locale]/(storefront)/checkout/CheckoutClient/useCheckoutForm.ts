import { useState } from "react";

export type CheckoutValidationError =
  | "fullName_required"
  | "email_invalid"
  | "phone_invalid"
  | "city_required"
  | "area_required"
  | "street_required";

export interface CheckoutFormValues {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
  guestEmail: string;
}

export function useCheckoutForm({
  cartItemsCount,
  initialValues,
}: {
  cartItemsCount?: number;
  initialValues?: Partial<CheckoutFormValues>;
}) {
  const [formValues, setFormValues] = useState<CheckoutFormValues>({
    fullName: initialValues?.fullName || "",
    phone: initialValues?.phone || "",
    city: initialValues?.city || "",
    area: initialValues?.area || "",
    street: initialValues?.street || "",
    building: initialValues?.building || "",
    floor: initialValues?.floor || "",
    apartment: initialValues?.apartment || "",
    notes: initialValues?.notes || "",
    guestEmail: initialValues?.guestEmail || "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof CheckoutFormValues, boolean>>
  >({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const errors: Partial<Record<keyof CheckoutFormValues, CheckoutValidationError>> = {};
  if (!formValues.fullName?.trim()) errors.fullName = "fullName_required";
  if (!formValues.phone?.trim()) errors.phone = "phone_invalid";
  if (!formValues.city?.trim()) errors.city = "city_required";
  if (!formValues.area?.trim()) errors.area = "area_required";
  if (!formValues.street?.trim()) errors.street = "street_required";

  const canSubmit = Object.keys(errors).length === 0;

  const setField = (field: keyof CheckoutFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const touchField = (field: keyof CheckoutFormValues) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const revealAllErrors = () => setShowAllErrors(true);

  const getFieldError = (field: keyof CheckoutFormValues): CheckoutValidationError | null => {
    if (showAllErrors || touchedFields[field]) {
      return errors[field] || null;
    }
    return null;
  };

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
