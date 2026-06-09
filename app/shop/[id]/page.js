"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });

export default function Shop() {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sel, setSel] = useState(null);
  const [date, setDate] = useState("");
  const [user, setUser] = useState(null);
  const [fav, setFav] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase || !id) return;
    supabase.from("vendors").select("*").eq("id", id).maybeSingle().then(({ data }) => setVendor(data));
    supabase.from("products").select("*").eq("vendor_id", id).order("price").then(({ data }) => { setProducts(data || []); if (data && data[0]) setSel(data[0].id); });
    supabase.from("reviews").select("*").eq("vendor_id", id).order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null; setUser(u);
      if (u) { const { data: f } = await supabase.from("favorites").select("vendor_id").eq("user_id", u.id).eq("vendor_id", id).maybeSingle(); setFav(!!f); }
    });
  }, [id]);

  async function toggleFav() {
    if (!user) return router.push("/login");
    if (fav) { await supabase.from("favorites").delete().eq("user_id", user.id).eq("vendor_id", id); setFav(false); }
    else { await supabase.from("favorites").insert({ user_id: user.id, vendor_id: id }); setFav(true); }
  }

  async function book() {
    setMsg("");
    if (!user) return router.push("/login");
    if (!sel) return setMsg("상품을 선택해 주세요.");
    if (!date) return setMsg("희망 날짜를 선택해 주세요.");
    const product = products.find((p) => p.id === sel);
    const { data: prof } = await supabase.from("profiles").select("name, phone").eq("id", user.id).maybeSingle();
    setBusy(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id, vendor_id: id, product_id: sel, booking_date: date,
      status: product.instant_bookable ? "confirmed" : "requested",
      amount: product.price,
      customer_name: prof?.name || user.user_metadata?.name || "고객",
      customer_phone: prof?.phone || "",
    });
    setBusy(false);
    if (error) return setMsg("예약 실패: " + error.message);
    router.push("/bookings");
  }

  if (!vendor) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  const product = products.find((p) => p.id === sel);

  return (
    <div className="min-h-screen bg-surface pb-28">
      <div className="relative h-60" style={bg(vendor.thumbnail_url || CAT_IMG[vendor.category])}>
        <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-brand-700 text-xl">‹</button>
        <button onClick={toggleFav} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-brand-500 text-lg">{fav ? "♥" : "♡"}</button>
      </div>
      <div className="max-w-2xl mx-auto px-5 -mt-4 relative">
        <div className="bg-white rounded-2xl border border-line p-5">
          <h1 className="text-xl font-extrabold">{vendor.name}</h1>
          <div className="text-[13px] text-muted mt-1">★ {vendor.rating} · 후기 {vendor.review_count} · {vendor.region} · {CATS[vendor.category]}</div>
          {vendor.description && <p className="text-sm text-body mt-3">{vendor.description}</p>}
        </div>

        <h2 className="font-extrabold mt-6 mb-2">상품 선택</h2>
        <div className="space-y-2">
          {products.map((p) => (
            <button key={p.id} onClick={() => setSel(p.id)} className={`w-full text-left bg-white border rounded-xl p-4 flex justify-between items-center ${sel === p.id ? "border-brand-500 ring-2 ring-brand-100" : "border-line"}`}>
              <div><div className="font-bold text-sm">{p.name} {p.instant_bookable && <span className="text-[10px] text-ok font-bold">즉시예약</span>}</div><div className="text-xs text-muted mt-0.5">{p.includes}</div></div>
              <div className="font-extrabold text-brand-700 whitespace-nowrap ml-3">{won(p.price)}</div>
            </button>
          ))}
          {products.length === 0 && <p className="text-muted text-sm">등록된 상품이 없어요.</p>}
        </div>

        <h2 className="font-extrabold mt-6 mb-2">희망 날짜</h2>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 rounded-xl border border-line px-3.5 text-sm bg-white" />

        <h2 className="font-extrabold mt-6 mb-2">리뷰 {reviews.length}</h2>
        <div className="space-y-2">
          {reviews.map((r) => (<div key={r.id} className="bg-white border border-line rounded-xl p-3"><div className="text-warn font-extrabold text-[13px]">{"★".repeat(r.rating)}</div><p className="text-sm text-body mt-1">{r.content}</p></div>))}
          {reviews.length === 0 && <p className="text-muted text-sm">아직 리뷰가 없어요.</p>}
        </div>
        {msg && <p className="text-[13px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2 mt-4">{msg}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="text-sm"><span className="text-muted">정찰가</span><div className="font-extrabold text-brand-700">{won(product?.price)}</div></div>
          <button onClick={book} disabled={busy} className="flex-1 h-12 rounded-xl bg-brand-grad text-white font-extrabold disabled:opacity-60">{busy ? "처리 중..." : (product?.instant_bookable ? "즉시 예약하기" : "예약 요청하기")}</button>
        </div>
      </div>
    </div>
  );
}
