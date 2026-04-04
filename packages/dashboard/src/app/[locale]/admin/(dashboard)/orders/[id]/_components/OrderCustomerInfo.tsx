"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@findeg/ui";
import { User, Phone, Mail, MapPin } from "lucide-react";

interface OrderCustomerInfoProps {
  order: any;
}

/**
 *
 */
export function OrderCustomerInfo({ order }: OrderCustomerInfoProps) {
  const address = order.shippingAddressSnapshot as any;
  const fullName = order.customerName || address?.fullName || "Guest Customer";
  const email = order.customerEmail || address?.email || "-";
  const phone = address?.phone || "-";

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center space-y-0 gap-2">
        <User className="w-4 h-4 text-primary" />
        <CardTitle className="text-sm font-bold uppercase tracking-wider">
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{fullName}</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{email}</span>
          </div>
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Phone className="w-3.5 h-3.5" />
              <a href={`tel:${phone}`} className="hover:text-primary hover:underline">
                {phone}
              </a>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="font-medium">Shipping Address</span>
              {address ? (
                <address className="not-italic text-muted-foreground mt-1 leading-relaxed">
                  {address.streetName && (
                    <span>
                      {address.streetName}
                      <br />
                    </span>
                  )}
                  {address.buildingNumber && (
                    <span>
                      Building {address.buildingNumber}
                      <br />
                    </span>
                  )}
                  {address.apartmentNumber && (
                    <span>
                      Apt {address.apartmentNumber}
                      <br />
                    </span>
                  )}
                  {address.districtName && <span>{address.districtName}, </span>}
                  {address.cityName && <span>{address.cityName}</span>}
                </address>
              ) : (
                <span className="text-muted-foreground italic">No address provided</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
