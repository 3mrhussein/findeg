"use client";

import { Input } from "@ui";
import { Label } from "@ui";

/**
 *
 */
export function ShippingForm({
  formValues,
  setField,
  touchField,
  toFieldErrorMessage,
  getFieldError,
  t,
}: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t("Pages.Checkout.FullName")}</Label>
        <Input
          id="fullName"
          placeholder={t("Pages.Checkout.PlaceholderFullName")}
          value={formValues.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          onBlur={() => touchField("fullName")}
          autoComplete="name"
          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          required
        />
        {toFieldErrorMessage(getFieldError("fullName")) && (
          <p className="text-xs text-destructive font-medium">
            {toFieldErrorMessage(getFieldError("fullName"))}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("Pages.Checkout.EmailRequired")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("Pages.Checkout.PlaceholderEmail")}
          value={formValues.guestEmail}
          onChange={(e) => setField("guestEmail", e.target.value)}
          onBlur={() => touchField("guestEmail")}
          autoComplete="email"
          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          required
        />
        {toFieldErrorMessage(getFieldError("guestEmail")) && (
          <p className="text-xs text-destructive font-medium">
            {toFieldErrorMessage(getFieldError("guestEmail"))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">{t("Pages.Checkout.Phone")}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t("Pages.Checkout.PlaceholderPhone")}
            value={formValues.phone}
            onChange={(e) => setField("phone", e.target.value)}
            onBlur={() => touchField("phone")}
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9+\\-\\s]{11,}"
            minLength={11}
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            required
          />
          {toFieldErrorMessage(getFieldError("phone")) && (
            <p className="text-xs text-destructive font-medium">
              {toFieldErrorMessage(getFieldError("phone"))}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("Pages.Checkout.City")}</Label>
          <Input
            id="city"
            placeholder={t("Pages.Checkout.PlaceholderCity")}
            value={formValues.city}
            onChange={(e) => setField("city", e.target.value)}
            onBlur={() => touchField("city")}
            autoComplete="address-level2"
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            required
          />
          {toFieldErrorMessage(getFieldError("city")) && (
            <p className="text-xs text-destructive font-medium">
              {toFieldErrorMessage(getFieldError("city"))}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="area">{t("Pages.Checkout.Area")}</Label>
          <Input
            id="area"
            placeholder={t("Pages.Checkout.PlaceholderArea")}
            value={formValues.area}
            onChange={(e) => setField("area", e.target.value)}
            onBlur={() => touchField("area")}
            autoComplete="address-level1"
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            required
          />
          {toFieldErrorMessage(getFieldError("area")) && (
            <p className="text-xs text-destructive font-medium">
              {toFieldErrorMessage(getFieldError("area"))}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">{t("Pages.Checkout.Street")}</Label>
          <Input
            id="street"
            placeholder={t("Pages.Checkout.PlaceholderStreet")}
            value={formValues.street}
            onChange={(e) => setField("street", e.target.value)}
            onBlur={() => touchField("street")}
            autoComplete="street-address"
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            required
          />
          {toFieldErrorMessage(getFieldError("street")) && (
            <p className="text-xs text-destructive font-medium">
              {toFieldErrorMessage(getFieldError("street"))}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="building">{t("Pages.Checkout.BuildingOptional")}</Label>
          <Input
            id="building"
            placeholder={t("Pages.Checkout.PlaceholderBuilding")}
            value={formValues.building}
            onChange={(e) => setField("building", e.target.value)}
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="floor">{t("Pages.Checkout.FloorOptional")}</Label>
          <Input
            id="floor"
            placeholder={t("Pages.Checkout.PlaceholderFloor")}
            value={formValues.floor}
            onChange={(e) => setField("floor", e.target.value)}
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apartment">{t("Pages.Checkout.ApartmentOptional")}</Label>
          <Input
            id="apartment"
            placeholder={t("Pages.Checkout.PlaceholderApartment")}
            value={formValues.apartment}
            onChange={(e) => setField("apartment", e.target.value)}
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("Pages.Checkout.DeliveryNotesOptional")}</Label>
        <Input
          id="notes"
          placeholder={t("Pages.Checkout.PlaceholderNotes")}
          value={formValues.notes}
          onChange={(e) => setField("notes", e.target.value)}
          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
      </div>
    </div>
  );
}
