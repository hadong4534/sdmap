"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import TabBar from "@/components/TabBar";

export default function My() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [prof, setProf] = useState(null);
  const [inqs, setInqs] = useState([]);
  const [showInq, setShowInq] = useState(false);
  const [iq, setIq] = useState({ subject: "", content: "" });
  const [imsg, setImsg] = useState("");
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      setProf(p);
      const { data: cs } = await supabase.from("cs_inquiries").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
      setInqs(cs || []);
    });
  }, [router]);
  async function logout() { await supabase.auth.signOut(); router.replace("/login"); }
  async function submitInquiry() {
    setImsg("");
    if (!iq.subject || !iq.content) return setImsg("제목과 내용을 입력해 주세요.");
    const { error } = await supabase.from("cs_inquiries").insert({ user_id: user.id, subject: iq.subject, content: iq.content, status: "open" });
    if (error) return setImsg("접수 실패: " + error.message);
    setIq({ subject: "", content: "" }); setShowInq(false); setImsg("문의가 접수됐어요. 답변이 달리면 여기서 확인할 수 있어요.");
    const { data: cs } = await supabase.from("cs_inquiries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setInqs(cs || []);
  }
  const m = user?.user_metadata || {};
  const name = prof?.name || m.name || m.full_name || m.nickname || (user?.email ? user.email.split("@")[0] : "회원");
  const menu = [["개인정보 설정", "/onboarding"], ["내 예약 / 계약", "/bookings"], ["찜한 업체", "/favorites"], ["비교함", "/compare"]];
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-brand-grad text-white px-6 pt-8 pb-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/25" />
          <div><div className="text-lg font-extrabold">{name}님</div><div className="text-xs opacity-90">{user?.email}</div></div>
        </div>
      </div>
      <main className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          {menu.map(([l, h]) => (<Link key={h} href={h} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-0 text-sm font-bold">{l}<span className="text-muted">›</span></Link>))}
        </div>
        <div className="bg-white border border-line rounded-2xl mt-3 p-5">
          <div className="flex items-center justify-between">
            <b className="text-sm text-ink">1:1 문의</b>
            <button onClick={() => setShowInq(!showInq)} className="h-9 px-4 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{showInq ? "닫기" : "문의하기"}</button>
          </div>
          {showInq && (
            <div className="mt-3 space-y-2">
              <input value={iq.subject} onChange={(e)=>setIq({ ...iq, subject: e.target.value })} placeholder="제목" className="w-full h-11 rounded-xl border border-line px-3 text-sm bg-white" />
              <textarea value={iq.content} onChange={(e)=>setIq({ ...iq, content: e.target.value })} placeholder="문의 내용을 적어주세요" rows={4} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm bg-white resize-none" />
              <button onClick={submitInquiry} className="w-full h-11 rounded-xl bg-brand-500 text-white text-sm font-bold">접수하기</button>
            </div>
          )}
          {imsg && <p className="mt-2 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{imsg}</p>}
          {inqs.length > 0 && (
            <div className="mt-3 space-y-2">
              {inqs.slice(0, 5).map((c) => (
                <div key={c.id} className="border border-line rounded-xl p-3">
                  <div className="flex items-center justify-between"><b className="text-[13px] text-ink">{c.subject}</b><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${(!c.status || c.status === "open") ? "bg-[#FFF1EC] text-[#E8663C]" : "bg-[#E8F8F3] text-[#1FA888]"}`}>{(!c.status || c.status === "open") ? "답변 대기" : "답변 완료"}</span></div>
                  {c.answer && <p className="text-[12.5px] text-body mt-1.5 bg-surface rounded-lg p-2.5"><b className="text-brand-700">답변</b> · {c.answer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        {["admin","manager","cs"].includes(prof?.role) && <Link href="/admin" className="block mt-3 text-center bg-ink text-white rounded-xl py-3 text-sm font-bold">직원 관리자 페이지 →</Link>}
        {prof?.role === "vendor" && <Link href="/vendor" className="block mt-3 text-center bg-brand-600 text-white rounded-xl py-3 text-sm font-bold">내 업체 대시보드 →</Link>}
        <button onClick={logout} className="w-full mt-3 border border-line rounded-xl py-3 text-sm font-bold text-muted">로그아웃</button>
      </main>
      <TabBar active="my" />
    </div>
  );
}
