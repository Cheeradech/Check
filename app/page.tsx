"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  User,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getItemsByDate,
  addItem,
  updateItem,
  deleteItem,
  clearItemsByDate,
} from "./actions";

interface Item {
  id: string;
  checked: boolean;
  name: string;
  price: number;
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [, startTransition] = useTransition();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on date change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getItemsByDate(selectedDate).then(async (res) => {
      if (isMounted) {
        const fetchedItems = res.success && res.items ? res.items : [];
        if (fetchedItems.length === 0) {
          // Auto-create one empty row so user always has somewhere to type
          const newRes = await addItem(selectedDate, "", 0);
          if (isMounted) {
            setItems(newRes.success && newRes.item ? [newRes.item] : []);
          }
        } else {
          setItems(fetchedItems);
        }
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [selectedDate]);

  const handleAddItem = () => {
    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [...prev, { id: tempId, checked: false, name: "", price: 0 }]);
    startTransition(async () => {
      const res = await addItem(selectedDate, "", 0);
      if (res.success && res.item) {
        setItems((prev) => prev.map((i) => (i.id === tempId ? res.item : i)));
      } else {
        setItems((prev) => prev.filter((i) => i.id !== tempId));
      }
    });
  };

  const handleUpdateName = (id: string, name: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
    if (!id.startsWith("temp-")) startTransition(() => { updateItem(id, { name }); });
  };

  const handleUpdatePrice = (id: string, price: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, price } : i)));
    if (!id.startsWith("temp-")) startTransition(() => { updateItem(id, { price }); });
  };

  const handleToggleCheck = (id: string, checked: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked } : i)));
    if (!id.startsWith("temp-")) startTransition(() => { updateItem(id, { checked }); });
  };

  const handleRemoveItem = (id: string) => {
    const backup = [...items];
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (!id.startsWith("temp-")) {
      startTransition(async () => {
        const res = await deleteItem(id);
        if (!res.success) setItems(backup);
      });
    }
  };

  const handleClearAll = () => {
    const backup = [...items];
    setItems([]);
    setOpenModal(false);
    startTransition(async () => {
      const res = await clearItemsByDate(selectedDate);
      if (!res.success) setItems(backup);
    });
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const changeDate = (days: number) => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const ny = d.getFullYear();
    const nm = String(d.getMonth() + 1).padStart(2, "0");
    const nd = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${ny}-${nm}-${nd}`);
  };

  const total = items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const isToday = selectedDate === getTodayString();

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-slate-800 font-sans selection:bg-purple-200 flex flex-col items-center">

      {/* ── Navbar ─────────────────────────────── */}
      <nav className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 text-[#1A1D2E]">
          <ShoppingBag size={20} className="text-[#6D28D9]" strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight">Listy</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-[#6D28D9]">My Lists</button>
          <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <User size={15} />
          </button>
        </div>
      </nav>

      {/* ── Main ──────────────────────────────── */}
      <main className="w-full max-w-2xl mx-auto px-4 pb-24 flex-1 flex flex-col gap-4">

        {/* Date bar */}
        <div className="bg-white rounded-2xl px-2 py-1.5 shadow-sm border border-slate-100 flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 text-slate-400 hover:text-[#6D28D9] hover:bg-purple-50 rounded-xl transition-colors active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Calendar trigger – click opens native date picker */}
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="flex items-center gap-2 relative px-2 py-1 rounded-xl hover:bg-purple-50 transition-colors"
          >
            <div className="bg-purple-100 text-[#6D28D9] p-1.5 rounded-lg">
              <CalendarIcon size={15} />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {isToday ? "วันนี้" : formatDateDisplay(selectedDate)}
            </span>
            {/* Hidden but clickable date input */}
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              style={{ colorScheme: "light" }}
            />
          </button>

          <button
            onClick={() => changeDate(1)}
            className="p-2 text-slate-400 hover:text-[#6D28D9] hover:bg-purple-50 rounded-xl transition-colors active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Page header */}
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1D2E] tracking-tight leading-tight">
              Shopping List
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">รายการสั่งซื้อของคุณ</p>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            disabled={items.length === 0}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors pb-1 ${
              items.length === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-400 hover:text-red-400"
            }`}
          >
            <Trash2 size={13} />
            ล้างทั้งหมด
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5 flex-1">
          {isLoading ? (
            <div className="text-center py-10 text-slate-400 text-sm animate-pulse">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_3px_12px_rgba(0,0,0,0.07)] relative"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleCheck(item.id, !item.checked)}
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ${
                      item.checked
                        ? "bg-[#6D28D9] text-white shadow-sm shadow-purple-300"
                        : "border-2 border-slate-200 hover:border-[#6D28D9]"
                    }`}
                  >
                    {item.checked && <Check size={13} strokeWidth={3} />}
                  </button>

                  {/* Name */}
                  <input
                    type="text"
                    placeholder="ชื่อสินค้า..."
                    value={item.name}
                    className={`flex-1 bg-transparent border-none p-0 focus:ring-0 text-base outline-none transition-all min-w-0 ${
                      item.checked ? "line-through text-slate-400" : "text-slate-700"
                    }`}
                    onChange={(e) => handleUpdateName(item.id, e.target.value)}
                  />

                  {/* Price */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-colors shrink-0 ${
                      item.checked
                        ? "bg-slate-50"
                        : "bg-slate-100 focus-within:bg-purple-50"
                    }`}
                  >
                    <span className="text-slate-400 text-xs font-medium">฿</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={item.price === 0 && item.name === "" ? "" : item.price}
                      className={`w-16 bg-transparent border-none p-0 text-right focus:ring-0 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        item.checked ? "text-slate-400" : "text-slate-700 font-semibold"
                      }`}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        handleUpdatePrice(item.id, isNaN(val) ? 0 : Math.round(val * 100) / 100);
                      }}
                    />
                  </div>

                  {/* Delete – always visible on touch, hover on desktop */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="shrink-0 w-7 h-7 rounded-full border border-transparent text-slate-300 hover:text-red-400 hover:border-red-200 hover:bg-red-50 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all focus:opacity-100"
                    title="ลบรายการนี้"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Add row */}
              <button
                onClick={handleAddItem}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-dashed border-slate-200 text-slate-400 hover:bg-white hover:border-purple-300 hover:text-[#6D28D9] transition-all focus:outline-none active:scale-[0.99]"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">เพิ่มรายการใหม่</span>
              </button>
            </>
          )}
        </div>

        {/* Total card */}
        <div className="mt-2 bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-sm font-bold text-[#1A1D2E]">ยอดรวมทั้งหมด</p>
            <p className="text-xs text-slate-400 font-medium">เฉพาะรายการที่เลือก</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-slate-400 text-sm font-bold">฿</span>
            <span className="text-2xl font-bold text-[#6D28D9] tracking-tight">
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </main>

      {/* ── Clear Modal ───────────────────────── */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setOpenModal(false)}
          />
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10">
            <h2 className="text-base font-bold text-center text-[#1A1D2E] mb-1.5">
              ล้างรายการทั้งหมด?
            </h2>
            <p className="text-center text-slate-500 text-sm mb-6">
              รายการในวันที่ {formatDateDisplay(selectedDate)}{" "}
              จะถูกลบและไม่สามารถกู้คืนได้
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleClearAll}
                className="w-full bg-[#1A1D2E] hover:bg-black text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                ยืนยันการลบ
              </button>
              <button
                onClick={() => setOpenModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
