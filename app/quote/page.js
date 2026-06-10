"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { RiskGauge } from "@/components/ui";
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
      else setRes(j.data);
    } catch { setErr("네트워크 오류가 발생했어요."); }
    setBusy(false);
  }
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const expected = res ? (res.total || 0) + (res.extraEstimate || 0) : 0;

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white border-b border-line"><div className="max-w-3xl mx-auto px-4 md:px-8 py-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-white bg-brand-grad px-2 py-0.5 rounded-md">AI</span>
          <span className="font-extrabold text-[20px]">견적서 AI 체크</span>
        </div></header>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
          {!res && <p className="text-[13px] text-muted mb-4 leading-relaxed">스드메·웨딩홀 견적서 사진을 올리면 <b className="text-ink">총 견적, 예상 추가금, 누락 의심 항목, 계약 전 질문</b>을 AI가 분석해드려요.</p>}

          <label className="block rounded-2xl border-2 border-dashed border-brand-200 bg-white p-6 text-center cursor-pointer">
            {preview ? <img src={preview} alt="견적서" className="max-h-56 mx-auto rounded-lg" /> : <><div className="flex justify-center"><Ico c="#7A5FE0" d={<><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></>} /></div><div className="font-extrabold text-ink mt-2">견적서 사진 / 캡처 올리기</div><div className="text-[12px] text-muted mt-1">탭하여 카메라 촬영 또는 파일 선택</div></>}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>

          {preview && !res && <button onClick={analyze} disabled={busy} className="w-full mt-3 h-12 rounded-xl bg-brand-grad text-white font-extrabold disabled:opacity-60">{busy ? "AI가 견적서를 읽고 있어요…" : "AI로 분석하기"}</button>}
          {err && <p className="mt-3 text-[13px] text-risk bg-[#FFF1EC] rounded-lg px-3 py-2">{err}</p>}

          {res && (
            <div className="mt-5 space-y-3">
              {/* 분석 완료 카드 */}
              <div className="rounded-2xl border border-safe/40 bg-[#EBFBF6] p-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-safe/15 flex items-center justify-center shrink-0">{I_ok}</span>
                <div className="min-w-0"><div className="font-extrabold text-ink">분석 완료</div><div className="text-[12px] text-muted truncate">{fname || "견적서"} · {today}</div></div>
              </div>

              {/* 종합 결과 카드 */}
              <div className="rounded-2xl border border-line bg-white p-5">
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
              <div className="rounded-2xl border border-line bg-white p-5">
                <div className="font-extrabold text-ink mb-3">추가금 위험도</div>
                <RiskGauge score={res.riskScore || 0} />
              </div>

              {/* 항목별 분석 */}
              {res.missingItems?.length > 0 && (
                <div className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-center gap-2 font-extrabold text-ink mb-3">{I_warn}<span>위험 · 누락/미포함 의심 ({res.missingItems.length})</span></div>
                  <div className="space-y-2">{res.missingItems.map((m,i)=>(<div key={i} className="border-l-[3px] border-risk bg-[#FFF1EC] rounded-r-lg px-3 py-2"><div className="text-[14px] font-bold text-ink">{m.name}</div><div className="text-[12.5px] text-muted mt-0.5">{m.reason}</div></div>))}</div>
                </div>
              )}
              {res.contractQuestions?.length > 0 && (
                <div className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-center gap-2 font-extrabold text-ink mb-3">{I_note}<span>주의 · 계약 전 확인 질문</span></div>
                  <div className="space-y-2">{res.contractQuestions.map((q,i)=>(<div key={i} className="border-l-[3px] border-warn2 bg-[#FFF8EC] rounded-r-lg px-3 py-2 text-[13.5px] text-body"><b className="text-[#C9821B]">Q{i+1}.</b> {q}</div>))}</div>
                </div>
              )}
              {res.includedItems?.length > 0 && (
                <div className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-center gap-2 font-extrabold text-ink mb-3">{I_ok}<span>안전 · 견적 포함 확인 ({res.includedItems.length})</span></div>
                  <div className="flex flex-wrap gap-1.5">{res.includedItems.map((m,i)=>(<span key={i} className="text-[12.5px] text-[#1E9E80] bg-[#EBFBF6] font-bold px-2.5 py-1 rounded-lg">{m}</span>))}</div>
                </div>
              )}

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
