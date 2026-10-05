const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function formatPrice(value: number) {
  return `${fcfa.format(value)} FCFA`;
}

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};
