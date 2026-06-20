import { content } from "@/content";
import { buildWhatsappDirectLink } from "@/lib/whatsapp";
import type { TenantConfig } from "@/lib/tenant";

export type ResolvedContact = {
  showWhatsApp: boolean;
  whatsappHref: string;
  instagramHref: string;
  phoneDisplay: string;
  phoneHref: string;
  emailDisplay: string;
  emailHref: string;
};

type ContactInput = Pick<
  TenantConfig,
  | "whatsapp_enabled"
  | "whatsapp_number"
  | "whatsapp_link"
  | "contact_phone"
  | "contact_email"
  | "instagram_link"
>;

export function resolveContactLinks(tenant: ContactInput): ResolvedContact {
  return {
    showWhatsApp: tenant.whatsapp_enabled,
    whatsappHref:
      buildWhatsappDirectLink(tenant.whatsapp_number, tenant.contact_phone) ??
      tenant.whatsapp_link ??
      content.contact.whatsappCommunity,
    instagramHref: tenant.instagram_link || content.contact.instagram,
    phoneDisplay: tenant.contact_phone || content.contact.phone,
    phoneHref: tenant.contact_phone
      ? `tel:${tenant.contact_phone.replace(/\s/g, "")}`
      : content.contact.phoneHref,
    emailDisplay: tenant.contact_email || content.contact.email,
    emailHref: tenant.contact_email
      ? `mailto:${tenant.contact_email}`
      : content.contact.emailHref,
  };
}
