"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";


const field = "w-full h-12 rounded-xl border border-line px-3.5 text-sm bg-white outline-none focus:border-brand-400";

export default function Partner() {
  const [f, setF] = useState({ business_name: "", category: "studio", region: "서울", contact_name: "", contact_phone: "", contact_email: "", message: "" });
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState("");
  const [cats, setCats] = useState([["studio","스튜디오"],["dress","드레스"],["makeup","메이크업"],["hall","웨딩홀"]]);
  useEffect(() => {
    if (!supabase) return;
    supabase.from("categories").select("key,label,status").neq("status", "hidden").order("sort").then(({ data }) => {
      if (data?.length) setCats(data.map((c) => [c.key, c.label + (c.status === "coming" ? " (신규 모집)" : "")]));
    });
  }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit() {
    setMsg("");
    if (!f.business_name || !f.contact_name || !f.contact_phone) return setMsg("업체명·담당자명·연락처는 필수예요.");
    const { error } = await supabase.from("vendor_applications").insert({ ...f, status: "pending" });
    if (error) return setMsg("접수 실패: " + error.message);
    setDone(true);
  }

  return (
    <main className="min-h-[100dvh] bg-aurora">
      <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-3"><Link href="/login" className="text-xl text-muted">‹</Link><b className="text-lg">입점 신청</b></div></header>
      <div className="max-w-xl mx-auto px-5 py-6">
        {done ? (
          <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-8 text-center">
            <div className="text-[17px] font-extrabold text-ink">신청이 접수됐어요</div>
            <p className="text-[13.5px] text-muted mt-2 leading-relaxed">입점 담당자가 확인 후 영업일 기준 2~3일 내<br />남겨주신 연락처로 안내드릴게요.</p>
            <Link href="/home" className="inline-block mt-5 h-11 leading-[44px] px-6 rounded-xl bg-brand-500 text-white text-sm font-bold">홈으로</Link>
          </div>
        ) : (
          <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5 space-y-3">
            <p className="text-[13px] text-muted leading-relaxed">스드맵은 가격이 투명한 업체를 우선 노출해요. 기준가·포함 항목을 공개할수록 더 많은 예비부부에게 추천됩니다.</p>
            <input className={field} placeholder="업체명 *" value={f.business_name} onChange={set("business_name")} />
            <div className="flex gap-2">
              <select className={field} value={f.category} onChange={set("category")}>{cats.map(([k,l]) => <option key={k} value={k}>{l}</option>)}</select>
              <input className={field} placeholder="지역 (예: 서울 강남)" value={f.region} onChange={set("region")} />
            </div>
            <input className={field} placeholder="담당자명 *" value={f.contact_name} onChange={set("contact_name")} />
            <input className={field} placeholder="연락처 *" value={f.contact_phone} onChange={set("contact_phone")} />
            <input className={field} placeholder="이메일" value={f.contact_email} onChange={set("contact_email")} />
            <textarea className="w-full rounded-xl border border-line px-3.5 py-3 text-sm bg-white outline-none focus:border-brand-400 resize-none" rows={4} placeholder="소개·문의 내용" value={f.message} onChange={set("message")} />
            {msg && <p className="text-[12px] text-[#E8663C] bg-[#FFF1EC] rounded-lg px-3 py-2">{msg}</p>}
            <button onClick={submit} className="w-full h-12 rounded-xl bg-brand-500 text-white font-bold text-sm">입점 신청하기</button>
          </div>
        )}
      </div>
    </main>
  );
}
