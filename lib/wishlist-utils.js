import { formatIdrDisplay, formatRelativeTime } from 'lib/gift-vault-utils';

export const WISHLIST_CATEGORY_LABELS = {
    want: 'Want',
    need: 'Need',
    hobby: 'Hobby',
    gift: 'Gift'
};

export const WISHLIST_CATEGORY_CHIP_CLASS = {
    want: 'border-[#F6D9D6] bg-[#FDEBEA] text-[#D4625A]',
    need: 'border-[#D4E4F6] bg-[#EAF2FF] text-blue-600',
    hobby: 'border-[#E8D4B0] bg-[#FFF8EE] text-[#B07A2A]',
    gift: 'border-[#F6D9D6] bg-[#FDEBEA] text-[#D4625A]'
};

export function getWishlistCategoryLabel(category) {
    return WISHLIST_CATEGORY_LABELS[category] || category || '';
}

export function getWishlistCategoryChipClass(category) {
    return WISHLIST_CATEGORY_CHIP_CLASS[category] || WISHLIST_CATEGORY_CHIP_CLASS.want;
}

export function getWishlistTimeLabel(item) {
    return formatRelativeTime(item.createdAt) || '';
}
