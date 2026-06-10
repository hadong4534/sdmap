"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { RiskGauge, VendorListItem } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
const won = (n) => (n || 0).toLocaleString() + "원";

function Ico({ d, c }) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>; }
const I_warn = <Ico c="#FF8A65" d={<><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></>} />;
const I_note = <Ico c="#E0922A" d={<><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>} />;
const I_ok = <Ico c="#41C7A7" d={<><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></>} />;

export default function Quote() {
  const [preview, setPreview] = useState("");
  const [fname, setFname] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState("");
  const [cat, setCat] = useState("");
  const [market, setMarket] = useState(null); // { avg, alts }
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  async function loadHistory(uid) {
    const { data } = await supabase.from("quote_analyses").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10);
    setHistory(data || []);
  }
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => { const u = data?.user ?? null; setUser(u); if (u) loadHistory(u.id); });
  }, []);

  function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setFname(f.name);
    const rd = new FileReader();
    rd.onload = () => { setPreview(rd.result); setRes(null); setErr(""); };
    rd.readAsDataURL(f);
  }
  async function analyze() {
    if (!preview) return; setBusy(true); setErr(""); setRes(null);
    try {
      const r = await fetch("/api/ai/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: preview }) });
      const j = await r.json();
      if (!r.ok || j.error) setErr(j.error || "분석에 실패했어요. 잠시 후 다시 시도해 주세요.");
      else {
        setRes(j.data);
        if (user) {
          const d = j.data;
          await supabase.from("quote_analyses").insert({
            user_id: user.id, vendor_name: d.vendorName || null, total: d.total || 0, extra_estimate: d.extraEstimate || 0,
            risk_score: d.riskScore || 0, included_items: d.includedItems || [], missing_items: d.missingItems || [],
            contract_questions: d.contractQuestions || [], summary: d.summary || null,
          });
          loadHistory(user.id);
        }
      }
    } catch { setErr("네트워크 오류가 발생했어요."); }
    setBusy(false);
  }
  async function pickCat(k) {
    setCat(k);
    if (!supabase) return;
    const { data: vs } = await supabase.from("vendors").select("*").eq("status", "active").eq("category", k);
    if (!vs || vs.length === 0) { setMarket({ avg: 0, alts: [] }); return; }
    const avg = Math.round(vs.reduce((a, v) => a + (v.estimated_final_price || 0), 0) / vs.length);
    const alts = [...vs].sort((a, b) => (a.estimated_final_price || 0) - (b.estimated_final_price || 0)).slice(0, 3);
    setMarket({ avg, alts });
  }

  function openSaved(h) {
    setRes({ vendorName: h.vendor_name, total: h.total, extraEstimate: h.extra_estimate, riskScore: h.risk_score, includedItems: h.included_items || [], missingItems: h.missing_items || [], contractQuestions: h.contract_questions || [], summary: h.summary });
    setPreview(""); setFname(h.vendor_name || "저장된 분석"); setCat(""); setMarket(null);
    window.scrollTo({ top: 0 });
  }
  async function delSaved(id) {
    await supabase.from("quote_analyses").delete().eq("id", id);
    if (user) loadHistory(user.id);
  }

  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const expected = res ? (res.total || 0) + (res.extraEstimate || 0) : 0;

  return (
    <div className="min-h-screen bg-aurora md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-white bg-brand-grad px-2 py-0.5 rounded-md">AI</span>
          <span className="font-extrabold text-[20px]">견적서 AI 체크</span>
        </div></header>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
          {!res && <p className="text-[13px] text-muted mb-4 leading-relaxed">스드메·웨딩홀 견적서 사진을 올리면 <b className="text-ink">총 견적, 예상 추가금, 누락 의심 항목, 계약 전 질문</b>을 AI가 분석해드려요. <Link href="/methodology" className="text-brand-600 font-bold underline underline-offset-2">어떻게 분석하나요?</Link></p>}

          <label className="block rounded-[22px] border-2 border-dashed border-brand-300 bg-white/80 backdrop-blur p-7 text-center cursor-pointer shadow-[0_8px_24px_rgba(139,111,232,0.10)] press">
            {preview ? <img src={preview} alt="견적서" className="max-h-56 mx-auto rounded-lg" /> : <><div className="flex justify-center"><Ico c="#7A5FE0" d={<><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></>} /></div><div className="font-extrabold text-ink mt-2">견적서 사진 / 캡처 올리기</div><div className="text-[12px] text-muted mt-1">탭하여 카메라 촬영 또는 파일 선택</div></>}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>

          {preview && !res && <button onClick={analyze} disabled={busy} className="w-full mt-3 h-12 rounded-xl text-white font-extrabold disabled:opacity-60 shadow-[0_12px_30px_rgba(122,95,224,0.4)]" style={{ background: "linear-gradient(110deg,#7A5FE0,#9D7BEE)" }} data-x="">{busy ? "AI가 견적서를 읽고 있어요…" : "AI로 분석하기"}</button>}
          {err && <p className="mt-3 text-[13px] text-risk bg-[#FFF1EC] rounded-lg px-3 py-2">{err}</p>}

          {!res && history.length > 0 && (
            <div className="mt-6">
              <div className="font-extrabold text-ink text-[15px] mb-2.5">내 분석 이력 <span className="text-muted text-[12px] font-bold">{history.length}건</span></div>
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-3.5 flex items-center gap-3">
                    <button onClick={() => openSaved(h)} className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <b className="text-[14px] text-ink truncate">{h.vendor_name || "견적서 분석"}</b>
                        <span className={`shrink-0 text-[10.5px] font-extrabold px-1.5 py-0.5 rounded ${h.risk_score >= 70 ? "bg-[#FFF1EC] text-[#E8663C]" : h.risk_score >= 45 ? "bg-[#FFF6E8] text-[#C9821B]" : "bg-[#E8F8F3] text-[#1FA888]"}`}>위험 {h.risk_score}</span>
                      </div>
                      <div className="text-[12px] text-muted mt-0.5">총 {won(h.total)} · 예상 추가 +{won(h.extra_estimate)} · {new Date(h.created_at).toLocaleDateString("ko-KR")}</div>
                    </button>
                    <button onClick={() => delSaved(h.id)} className="shrink-0 text-muted text-lg px-1">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!res && !user && <p className="mt-4 text-[12px] text-muted text-center">로그인하면 분석 결과가 자동 저장돼 언제든 다시 볼 수 있어요.</p>}

          {res && (
            <div className="mt-5 space-y-3">
              {/* 분석 완료 카드 */}
              <div className="rounded-2xl border border-safe/40 bg-[#EBFBF6] p-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-safe/15 flex items-center justify-center shrink-0">{I_ok}</span>
                <div className="min-w-0"><div className="font-extrabold text-ink">분석 완료</div><div className="text-[12px] text-muted truncate">{fname || "견적서"} · {today}</div></div>
              </div>

              {/* 종합 결과 카드 */}
              <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5">
                <div className="text-[13px] text-muted font-bold">{res.vendorName || "견적 종합 결과"}</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface p-3"><div className="text-[11px] text-muted font-bold">표기 총 견적</div><div className="text-[19px] font-extrabold text-ink mt-0.5">{won(res.total)}</div></div>
                  <div className="rounded-xl bg-[#FFF1EC] p-3"><div className="text-[11px] text-risk font-bold">예상 추가금</div><div className="text-[19px] font-extrabold text-risk mt-0.5">+{won(res.extraEstimate)}</div></div>
                </div>
                <div className="mt-3 rounded-xl bg-brand-50 p-3 flex items-end justify-between">
                  <div><div className="text-[11px] text-brand-700 font-bold">예상 최종가</div><div className="text-[24px] font-extrabold text-brand-700 mt-0.5">{won(expected)}</div></div>
                </div>
                {res.summary && <p className="text-[13px] text-body mt-3 leading-relaxed">{res.summary}</p>}
              </div>

              {/* 추가금 위험도 */}
              <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5">
                <div className="font-extrabold text-ink mb-3">추가금 위험도</div>
                <RiskGauge score={res.riskScore || 0} />
              </div>

              {/* 항목별 분석 */}
              {res.missingItems?.length > 0 && (
                <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5">
                  <div className="flex items-center gap-2 font-extrabold text-ink mb-3">{I_warn}<span>위험 · 누락/미포함 의심 ({res.missingItems.length})</span></div>
                  <div className="space-y-2">{res.missingItems.map((m,i)=>(<div key={i} className="border-l-[3px] border-risk bg-[#FFF1EC] rounded-r-lg px-3 py-2"><div className="text-[14px] font-bold text-ink">{m.name}</div><div className="text-[12.5px] text-muted mt-0.5">{m.reason}</div></div>))}</div>
                </div>
              )}
              {res.contractQuestions?.length > 0 && (
                <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5">
                  <div className="flex items-center gap-2 font-extrabold text-ink mb-3">{I_note}<span>주의 · 계약 전 확인 질문</span></div>
                  <div className="space-y-2">{res.contractQuestions.map((q,i)=>(<div key={i} className="border-l-[3px] border-warn2 bg-[#FFF8EC] rounded-r-lg px-3 py-2 text-[13.5px] text-body"><b className="text-[#C9821B]">Q{i+1}.</b> {q}</div>))}</div>
                </div>
              )}
              {res.includedItems?.length > 0 && (
                <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5">
                  <div className="flex items-center gap-2 font-extrabold text-ink mb-3">{I_ok}<span>안전 · 견적 포함 확인 ({res.includedItems.length})</span></div>
                  <div className="flex flex-wrap gap-1.5">{res.includedItems.map((m,i)=>(<span key={i} className="text-[12.5px] text-[#1E9E80] bg-[#EBFBF6] font-bold px-2.5 py-1 rounded-lg">{m}</span>))}</div>
                </div>
              )}

              {/* 시장 평균 비교 + 대안 업체 */}
              <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5">
                <div className="font-extrabold text-ink">스드맵 등록 업체와 비교해보기</div>
                <p className="text-[12.5px] text-muted mt-1">이 견적은 어떤 항목인가요?</p>
                <div className="flex gap-2 mt-3">
                  {[["studio","스튜디오"],["dress","드레스"],["makeup","메이크업"],["hall","웨딩홀"]].map(([k,l]) => (
                    <button key={k} onClick={() => pickCat(k)} className={`flex-1 h-10 rounded-xl text-[13px] font-bold border ${cat === k ? "bg-brand-500 text-white border-brand-500" : "bg-white text-body border-line"}`}>{l}</button>
                  ))}
                </div>
                {cat && market && (market.alts.length > 0 ? (
                  <div className="mt-4">
                    <div className="rounded-xl bg-surface p-3.5 flex items-center justify-between">
                      <span className="text-[13px] text-muted font-bold">스드맵 평균 예상 최종가</span>
                      <span className="font-extrabold text-ink">{won(market.avg)}</span>
                    </div>
                    <div className={`mt-2 rounded-xl p-3.5 flex items-center justify-between ${expected > market.avg ? "bg-[#FFF1EC]" : "bg-[#EBFBF6]"}`}>
                      <span className={`text-[13px] font-bold ${expected > market.avg ? "text-risk" : "text-[#1E9E80]"}`}>이 견적의 예상 최종가</span>
                      <span className={`font-extrabold ${expected > market.avg ? "text-risk" : "text-[#1E9E80]"}`}>{won(expected)} ({expected > market.avg ? "+" : "−"}{won(Math.abs(expected - market.avg))})</span>
                    </div>
                    <p className="text-[12px] text-muted mt-2">{expected > market.avg ? "평균보다 높게 보여요. 아래 대안 업체와 비교해 보세요." : "평균보다 합리적인 편이에요. 그래도 미포함 항목은 꼭 확인하세요."}</p>
                    <div className="mt-3 space-y-2.5">
                      {market.alts.map((v) => <VendorListItem key={v.id} v={v} />)}
                    </div>
                    <Link href={`/search?cat=${cat}`} className="block mt-3 h-11 leading-[44px] text-center rounded-xl bg-brand-50 text-brand-700 font-bold text-[13px]">이 카테고리 전체 보기 →</Link>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted mt-3">이 카테고리에 등록된 업체가 아직 없어요.</p>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={()=>window.print()} className="flex-1 h-12 rounded-xl border border-brand-200 bg-white text-brand-700 font-extrabold text-[14px]">분석 리포트 저장</button>
                <button onClick={()=>{setRes(null);setPreview("");setFname("");}} className="flex-1 h-12 rounded-xl bg-brand-grad text-white font-extrabold text-[14px]">다른 견적서 분석</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <TabBar active="quote" />
    </div>
  );
}
