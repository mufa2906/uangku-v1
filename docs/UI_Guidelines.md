# UI Guidelines — Uangku (Mobile-First)

## Prinsip
- **Mobile-first** (375–430px): navigasi jempol, fokus 1 tugas per layar.
- **Kecepatan input:** Form “Tambah Transaksi” ≤ 5 field, default cerdas (tanggal=hari ini, type tersimpan dari terakhir).
- **Konsistensi:** gunakan shadcn/ui komponen dasar.

## Design System
- Warna Utama: #3B82F6; Netral: #F3F4F6
- Font: Inter
- Radius: 1rem (2xl)
- Elevation: shadow-sm di card & FAB
- Icon: lucide-react

## Komponen (shadcn/ui)
- Button, Input, Select, Dialog/Sheet (untuk form tambah), Card, Tabs, NavigationMenu/Custom bottom nav

## Layout
- **Bottom Nav (4 tab):** Dashboard, Transactions, Categories, Profile
- **FAB “+”** kanan bawah → buka Sheet/Dialog tambah transaksi
- **Dashboard:** 3 ringkasan (Income, Expense, Net), Bar chart 7 hari, latest 5 transaksi
- **Transactions:** list virtualized (opsional), filter by date/type/category, infinite scroll
- **Categories:** grid/list + add/edit/delete

## Empty States
- Dashboard: “Belum ada transaksi. Tambah sekarang.”
- Categories: “Belum ada kategori. Tambah kategori pertama.”

## Aksesibilitas
- Kontras AA, font min 14px, hit target min 44px, aria-label untuk ikon-only.

## Contoh Struktur Komponen
- `components/shells/AppBottomNav.tsx`
- `components/transactions/TransactionFormSheet.tsx`
- `components/charts/WeeklyBar.tsx`
