import { computeOccurrences, type Draft, type PriceDetail } from '@/data/orders';
import { getPartner } from '@/data/partners';
import { getPlan, isSubActive, subRemaining, type Subscription } from '@/data/plans';
import { voucherDiscount, type Voucher } from '@/data/rewards';

export type Quote = PriceDetail & {
  occurrences: string[];
  payable: number; // sebelum voucher
  total: number; // yang harus dibayar
};

/** Hitung harga pesanan: tarif x jumlah pengingat, dikurangi kuota paket & voucher */
export function quoteDraft(draft: Draft, subscription: Subscription | null, voucher?: Voucher): Quote {
  const occurrences =
    draft.date ? computeOccurrences(draft.date, draft.repeat, draft.repeatDays, draft.repeatWeeks) : [];
  const sessions = Math.max(occurrences.length, 1);
  const rate = draft.partnerId ? getPartner(draft.partnerId).rate : 0;
  const planCovers =
    isSubActive(subscription) && !!draft.serviceId && getPlan(subscription.planId).services.includes(draft.serviceId);
  const coveredByPlan = planCovers ? Math.min(subRemaining(subscription), sessions) : 0;
  const payable = (sessions - coveredByPlan) * rate;
  const discount = voucher ? voucherDiscount(voucher, payable) : 0;
  return {
    rate,
    sessions,
    coveredByPlan,
    discount,
    voucherTitle: voucher?.title,
    occurrences,
    payable,
    total: payable - discount,
  };
}
